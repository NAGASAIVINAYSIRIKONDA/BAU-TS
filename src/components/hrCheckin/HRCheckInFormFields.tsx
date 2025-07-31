
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DepartmentOption } from "@/types/hrCheckin";

interface HRCheckInFormFieldsProps {
  formData: {
    department: string;
    checkin_date: string;
    notes: string;
  };
  departments: DepartmentOption[];
  onFormDataChange: (updates: Partial<{ department: string; checkin_date: string; notes: string }>) => void;
  onDepartmentChange: (department: string) => void;
}

export function HRCheckInFormFields({
  formData,
  departments,
  onFormDataChange,
  onDepartmentChange
}: HRCheckInFormFieldsProps) {
  const handleDepartmentChange = (department: string) => {
    onFormDataChange({ department });
    onDepartmentChange(department);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="department">Department *</Label>
        <Select
          value={formData.department}
          onValueChange={handleDepartmentChange}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.name} value={dept.name}>
                {dept.name} ({dept.member_count} members)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="checkin_date">Check-In Date *</Label>
        <Input
          id="checkin_date"
          type="date"
          value={formData.checkin_date}
          onChange={(e) => onFormDataChange({ checkin_date: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">Department Notes / Comments</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => onFormDataChange({ notes: e.target.value })}
          placeholder="Enter department-wide check-in notes, observations, or feedback..."
          rows={4}
        />
      </div>
    </div>
  );
}
