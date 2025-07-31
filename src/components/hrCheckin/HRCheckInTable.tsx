
import { useState, useEffect } from "react";
import { HRCheckin, CheckinFollowupTask, DepartmentOption, TeamMemberOption } from "@/types/hrCheckin";
import { CheckInFilters } from "./CheckInFilters";
import { HRCheckInTableStates } from "./HRCheckInTableStates";
import { HRCheckInTableContent } from "./HRCheckInTableContent";
import { HRCheckInTableModals } from "./HRCheckInTableModals";
import { hrCheckinService } from "@/hooks/hrCheckins/hrCheckinService";

interface CheckInFiltersType {
  department: string;
  search: string;
}

interface HRCheckInTableProps {
  checkins: HRCheckin[];
  departments: DepartmentOption[];
  loading: boolean;
  onDeleteCheckin?: (checkinId: string) => Promise<void>;
  onTaskStatusChange?: (taskId: string, status: 'Done' | 'Not Done', checkinId: string) => void;
}

export function HRCheckInTable({ 
  checkins, 
  departments,
  loading, 
  onDeleteCheckin,
  onTaskStatusChange 
}: HRCheckInTableProps) {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCheckin, setSelectedCheckin] = useState<HRCheckin | null>(null);
  const [followupTasks, setFollowupTasks] = useState<CheckinFollowupTask[]>([]);
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState<CheckInFiltersType>({
    department: "all",
    search: ""
  });

  // Fetch task counts for all checkins
  useEffect(() => {
    const fetchTaskCounts = async () => {
      const counts: Record<string, number> = {};
      
      for (const checkin of checkins) {
        try {
          const tasks = await hrCheckinService.getFollowupTasks(checkin.id);
          counts[checkin.id] = tasks.length;
        } catch (error) {
          console.error(`Error fetching tasks for checkin ${checkin.id}:`, error);
          counts[checkin.id] = 0;
        }
      }
      
      setTaskCounts(counts);
    };

    if (checkins.length > 0) {
      fetchTaskCounts();
    }
  }, [checkins]);

  const handleViewCheckin = async (checkin: HRCheckin) => {
    setSelectedCheckin(checkin);
    try {
      const tasks = await hrCheckinService.getFollowupTasks(checkin.id);
      setFollowupTasks(tasks);
    } catch (error) {
      console.error('Error fetching followup tasks:', error);
      setFollowupTasks([]);
    }
    setViewModalOpen(true);
  };

  const handleDeleteCheckin = (checkin: HRCheckin) => {
    setSelectedCheckin(checkin);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCheckin || !onDeleteCheckin) return;
    
    setIsDeleting(true);
    try {
      await onDeleteCheckin(selectedCheckin.id);
      setDeleteDialogOpen(false);
      setSelectedCheckin(null);
    } catch (error) {
      console.error('Error deleting check-in:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter checkins based on search only (department filtering is handled at query level)
  const filteredCheckins = checkins.filter(checkin => {
    if (filters.search && !checkin.notes?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <CheckInFilters 
        filters={filters}
        onFiltersChange={setFilters}
        departments={departments}
      />
      
      <HRCheckInTableStates loading={loading} isEmpty={filteredCheckins.length === 0}>
        <HRCheckInTableContent
          checkins={filteredCheckins}
          taskCounts={taskCounts}
          onViewCheckin={handleViewCheckin}
          onDeleteCheckin={onDeleteCheckin ? handleDeleteCheckin : undefined}
        />
      </HRCheckInTableStates>

      <HRCheckInTableModals
        selectedCheckin={selectedCheckin}
        followupTasks={followupTasks}
        viewModalOpen={viewModalOpen}
        deleteDialogOpen={deleteDialogOpen}
        isDeleting={isDeleting}
        onViewModalChange={setViewModalOpen}
        onDeleteDialogChange={setDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
        onTaskStatusChange={onTaskStatusChange}
      />
    </>
  );
}
