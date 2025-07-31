
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppRole, CreateTeamMemberData } from "@/types/teamMember";

interface Department {
  id: string;
  name: string;
}

interface TeamMemberFormFieldsProps {
  formData: CreateTeamMemberData & { isActive?: boolean };
  departments: Department[];
  roleOptions: { value: AppRole; label: string }[];
  isEdit: boolean;
  onUpdateFormData: (updates: Partial<CreateTeamMemberData & { isActive?: boolean }>) => void;
}

export function TeamMemberFormFields({ 
  formData, 
  departments, 
  roleOptions, 
  isEdit, 
  onUpdateFormData 
}: TeamMemberFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => onUpdateFormData({ firstName: e.target.value })}
            placeholder="Enter first name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => onUpdateFormData({ lastName: e.target.value })}
            placeholder="Enter last name"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onUpdateFormData({ email: e.target.value })}
          placeholder="Enter email address"
          required
          disabled={isEdit}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select 
          value={formData.role} 
          onValueChange={(value: AppRole) => onUpdateFormData({ role: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Select 
          value={formData.department} 
          onValueChange={(value) => onUpdateFormData({ department: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.name}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">Position (Optional)</Label>
        <Input
          id="position"
          value={formData.position}
          onChange={(e) => onUpdateFormData({ position: e.target.value })}
          placeholder="Enter position/title"
        />
      </div>
    </>
  );
}
