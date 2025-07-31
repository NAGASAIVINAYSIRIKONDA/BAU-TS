
import { HRCheckInFormFields } from "./HRCheckInFormFields";
import { DepartmentOverview } from "./DepartmentOverview";
import { MemberBAUSummaryComponent } from "./MemberBAUSummary";
import { DepartmentBAUSummary } from "./DepartmentBAUSummary";
import { FollowUpTaskManager } from "./FollowUpTaskManager";
import { CheckinFollowupTask, DepartmentOption, TeamMemberOption } from "@/types/hrCheckin";

interface HRCheckInModalContentProps {
  formData: {
    type: 'individual' | 'department';
    department: string;
    memberId: string;
    status: 'Normal' | 'Needs Support';
    notes: string;
    followUpTasks: Array<{ description: string; assignedTo?: string }>;
    checkin_date: string;
  };
  setFormData: (data: any) => void;
  departments: DepartmentOption[];
  teamMembers: TeamMemberOption[];
  departmentBAUSummary: any;
  pendingTasks: CheckinFollowupTask[];
  onDepartmentChange: (department: string) => void;
  onTaskStatusChange: (taskId: string, status: 'Done' | 'Not Done') => void;
  currentCheckinId: string | null;
  queuedTaskUpdates?: Array<{ taskId: string; status: 'Done' | 'Not Done' }>;
}

export function HRCheckInModalContent({
  formData,
  setFormData,
  departments,
  teamMembers,
  departmentBAUSummary,
  pendingTasks,
  onDepartmentChange,
  onTaskStatusChange,
  currentCheckinId,
  queuedTaskUpdates = []
}: HRCheckInModalContentProps) {
  // Filter team members by department for the DepartmentOverview
  const departmentMembers = teamMembers.filter(member => member.department === formData.department);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Form Fields and Follow-up Tasks */}
      <div className="space-y-6">
        <HRCheckInFormFields
          formData={{
            department: formData.department,
            checkin_date: formData.checkin_date,
            notes: formData.notes
          }}
          departments={departments}
          onFormDataChange={(updates) => setFormData({ ...formData, ...updates })}
          onDepartmentChange={onDepartmentChange}
        />

        <FollowUpTaskManager
          pendingTasks={pendingTasks}
          newTasks={formData.followUpTasks}
          onNewTasksChange={(tasks) => setFormData({ ...formData, followUpTasks: tasks })}
          onTaskStatusChange={onTaskStatusChange}
          currentCheckinId={currentCheckinId}
          queuedTaskUpdates={queuedTaskUpdates}
          teamMembers={teamMembers}
        />
      </div>

      {/* Right Column: Department/Member Overview and BAU Summary */}
      <div className="space-y-6">
        {formData.type === 'department' && formData.department && (
          <DepartmentOverview 
            summary={departmentBAUSummary} 
            teamMembers={departmentMembers}
          />
        )}

        {formData.type === 'individual' && formData.memberId && (
          <MemberBAUSummaryComponent 
            summary={null}
            memberName={teamMembers.find(tm => tm.id === formData.memberId)?.display_name || ''}
          />
        )}
      </div>
    </div>
  );
}
