
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HRCheckInModal } from "@/components/hrCheckin/HRCheckInModal";
import { HRCheckInTable } from "@/components/hrCheckin/HRCheckInTable";
import { TasksTab } from "@/components/hrCheckin/TasksTab";
import { useHRCheckins } from "@/hooks/useHRCheckins";
import { CreateHRCheckinData } from "@/types/hrCheckin";

export function HRCheckIn() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    checkins,
    departments,
    teamMembers,
    stats,
    selectedDepartment,
    departmentBAUSummary,
    pendingTasks,
    loading,
    createCheckin,
    updateTaskStatus,
    deleteCheckin,
    onDepartmentChange,
    isCreating,
    error
  } = useHRCheckins();

  const handleCreateCheckin = async (data: CreateHRCheckinData): Promise<string> => {
    const result = await createCheckin(data);
    return result.id;
  };

  const handleTaskStatusChange = async (taskId: string, status: 'Done' | 'Not Done', checkinId: string) => {
    await updateTaskStatus(taskId, status, checkinId);
  };

  const handleDeleteCheckin = async (checkinId: string) => {
    await deleteCheckin(checkinId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">HR Check-In</h1>
          <p className="text-muted-foreground mt-1">Employee wellness and regular check-in management</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Check-In
        </Button>
      </div>

      <Tabs defaultValue="checkins" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="checkins">Check-Ins</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="checkins" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-elevated">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                <MessageSquare className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                <Clock className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Follow-up tasks</p>
              </CardContent>
            </Card>
          </div>

          {/* Check-ins Table */}
          <HRCheckInTable 
            checkins={checkins} 
            departments={departments}
            loading={loading}
            onDeleteCheckin={handleDeleteCheckin}
            onTaskStatusChange={handleTaskStatusChange}
          />
        </TabsContent>
        
        <TabsContent value="tasks">
          <TasksTab 
            onTaskStatusChange={handleTaskStatusChange} 
            onTaskAssignmentChange={async (taskId, assignedTo) => {
              try {
                const { hrCheckinService } = await import("@/hooks/hrCheckins/hrCheckinService");
                await hrCheckinService.updateTaskAssignment(taskId, assignedTo);
              } catch (error) {
                console.error('Error updating task assignment:', error);
                throw error;
              }
            }}
            teamMembers={teamMembers}
          />
        </TabsContent>
      </Tabs>

      {/* Check-in Modal */}
      <HRCheckInModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        departments={departments}
        teamMembers={teamMembers}
        departmentBAUSummary={departmentBAUSummary}
        pendingTasks={pendingTasks}
        onSubmit={handleCreateCheckin}
        onDepartmentChange={onDepartmentChange}
        onTaskStatusChange={handleTaskStatusChange}
        isSubmitting={isCreating}
      />
    </div>
  );
}
