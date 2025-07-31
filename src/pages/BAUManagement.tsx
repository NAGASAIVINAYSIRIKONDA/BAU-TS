
import { useState, useMemo } from "react";
import { BAUTaskStats } from "@/components/bauTask/BAUTaskStats";
import { BAUTaskList } from "@/components/bauTask/BAUTaskList";
import { BAUTaskSearch } from "@/components/bauTask/BAUTaskSearch";
import { MonthSelector } from "@/components/bauTask/MonthSelector";
import { useBAUTasks } from "@/hooks/useBAUTasks";
import { format } from "date-fns";

export function BAUManagement() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedMember, setSelectedMember] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const {
    tasks,
    availableMonths,
    loading,
    stats,
    updateTask,
    submitProgress,
    updateProgress,
    deleteTask,
    refreshTasks
  } = useBAUTasks(selectedDate);

  // Filter tasks based on search criteria
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search term filter
      const matchesSearch = !searchTerm || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.bau_templates?.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Department filter
      const matchesDepartment = selectedDepartment === "all" || 
        task.profiles?.department === selectedDepartment;

      // Team member filter
      const matchesMember = selectedMember === "all" || 
        task.assigned_to === selectedMember;

      // Status filter
      const matchesStatus = statusFilter === "all" || 
        task.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesMember && matchesStatus;
    });
  }, [tasks, searchTerm, selectedDepartment, selectedMember, statusFilter]);

  const handleUpdateStatus = async (taskId: string, status: string) => {
    return await updateTask(taskId, { status });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedDepartment("all");
    setSelectedMember("all");
    setStatusFilter("all");
  };

  const isCurrentMonth = format(selectedDate, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">BAU Management</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage Business As Usual tasks with automated monthly generation
          {!isCurrentMonth && ` - Viewing ${format(selectedDate, 'MMMM yyyy')}`}
        </p>
      </div>

      {/* Combined Month Selector & Auto-Generation */}
      <MonthSelector 
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        availableMonths={availableMonths}
        onTasksGenerated={refreshTasks}
      />

      {/* Historical Data Notice */}
      {!isCurrentMonth && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <span className="font-medium">Historical Data View</span>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            You are viewing historical data for {format(selectedDate, 'MMMM yyyy')}. 
            Task generation and real-time updates are only available for the current month.
          </p>
        </div>
      )}

      {/* Search and Filters */}
      <BAUTaskSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        selectedMember={selectedMember}
        onMemberChange={setSelectedMember}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClearFilters={handleClearFilters}
      />

      {/* Stats Cards */}
      <BAUTaskStats
        activeTasks={stats.activeTasks}
        completedTasks={stats.completedTasks}
        overallProgress={stats.overallProgress}
        completionRate={stats.completionRate}
      />

      {/* Tasks List */}
      <BAUTaskList
        tasks={filteredTasks}
        loading={loading}
        onUpdateStatus={handleUpdateStatus}
        onSubmitProgress={submitProgress}
        onUpdateProgress={updateProgress}
        onDeleteTask={deleteTask}
      />
    </div>
  );
}
