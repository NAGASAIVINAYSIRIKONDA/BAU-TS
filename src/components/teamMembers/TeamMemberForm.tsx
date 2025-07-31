
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { TeamMember, CreateTeamMemberData } from "@/types/teamMember";
import { useTeamMemberForm } from "@/hooks/teamMembers/useTeamMemberForm";
import { TeamMemberFormFields } from "./TeamMemberFormFields";
import { TeamMemberActiveToggle } from "./TeamMemberActiveToggle";

interface TeamMemberFormProps {
  onSubmit: (memberData: CreateTeamMemberData & { isActive?: boolean }) => Promise<boolean>;
  isEdit?: boolean;
  teamMember?: TeamMember;
  trigger?: React.ReactNode;
}

export function TeamMemberForm({ onSubmit, isEdit = false, teamMember, trigger }: TeamMemberFormProps) {
  const [open, setOpen] = useState(false);
  const {
    departments,
    formData,
    roleOptions,
    resetForm,
    updateFormData,
    initializeFormData,
  } = useTeamMemberForm(isEdit, teamMember);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(formData);
    if (success) {
      setOpen(false);
      if (!isEdit) {
        resetForm();
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && teamMember) {
      initializeFormData(teamMember);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Team Member" : "Invite New Team Member"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TeamMemberFormFields
            formData={formData}
            departments={departments}
            roleOptions={roleOptions}
            isEdit={isEdit}
            onUpdateFormData={updateFormData}
          />

          {isEdit && (
            <TeamMemberActiveToggle
              isActive={formData.isActive ?? true}
              teamMember={teamMember}
              onToggle={(checked) => updateFormData({ isActive: checked })}
            />
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {isEdit ? "Update Member" : "Send Invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
