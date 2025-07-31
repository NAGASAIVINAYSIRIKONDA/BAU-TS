import { useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useDepartments } from "@/hooks/useDepartments";
import { useUserRole } from "@/hooks/useUserRole";

interface BAUTaskSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
  selectedMember: string;
  onMemberChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

export function BAUTaskSearch({ 
  searchTerm, 
  onSearchChange, 
  selectedDepartment, 
  onDepartmentChange,
  selectedMember,
  onMemberChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilters
}: BAUTaskSearchProps) {
  const { departments } = useDepartments();
  const { teamMembers } = useTeamMembers();
  const { role, department: userDepartment, isTeamLead } = useUserRole();

  // Filter departments based on user role and selected member
  const availableDepartments = useMemo(() => {
    // If a specific member is selected, only show their department
    if (selectedMember && selectedMember !== "all") {
      const selectedMemberData = teamMembers.find(member => member.id === selectedMember);
      if (selectedMemberData?.department) {
        return departments.filter(dept => dept.name === selectedMemberData.department);
      }
    }
    
    // Otherwise, filter based on user role
    if (isTeamLead && userDepartment) {
      // Team leads only see their department
      return departments.filter(dept => dept.name === userDepartment);
    }
    // Admin and HR see all departments
    return departments;
  }, [departments, isTeamLead, userDepartment, selectedMember, teamMembers]);

  // Filter team members based on selected department and user role
  const availableMembers = useMemo(() => {
    let filteredMembers = teamMembers.filter(member => !member.isPendingInvitation);
    
    if (selectedDepartment && selectedDepartment !== "all") {
      filteredMembers = filteredMembers.filter(member => member.department === selectedDepartment);
    } else if (isTeamLead && userDepartment) {
      // If no department selected but user is team lead, filter by their department
      filteredMembers = filteredMembers.filter(member => member.department === userDepartment);
    }
    
    return filteredMembers;
  }, [teamMembers, selectedDepartment, isTeamLead, userDepartment]);

  const hasFilters = searchTerm || 
                    (selectedDepartment && selectedDepartment !== "all") || 
                    (selectedMember && selectedMember !== "all") || 
                    (statusFilter && statusFilter !== "all");

  return (
    <Card className="card-elevated">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tasks by name, description, template..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Department Filter */}
            <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {availableDepartments.map((dept) => (
                  <SelectItem key={dept.name} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Team Member Filter */}
            <Select value={selectedMember} onValueChange={onMemberChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                {availableMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.display_name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {hasFilters && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}