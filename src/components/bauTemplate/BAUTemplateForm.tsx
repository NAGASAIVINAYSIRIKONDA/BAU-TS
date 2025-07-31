import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { CreateBAUTemplateFormData } from "@/types/bauTemplate";
import { useDepartments } from "@/hooks/useDepartments";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useUserRole } from "@/hooks/useUserRole";
import { Checkbox } from "@/components/ui/checkbox";

const templateSchema = z.object({
  name: z.string().min(1, "BAU name is required"),
  description: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  frequency: z.enum(["Daily", "Weekly", "Bi-Weekly", "Monthly"]),
  kpis: z.array(z.object({
    name: z.string().min(1, "KPI name is required"),
    unit: z.enum(["Percentage", "Count"]),
    operator: z.enum(["GreaterThanEqual", "LessThanEqual"]),
    target_value: z.number().min(0, "Target value must be positive"),
    source: z.string().optional(),
  })).min(1, "At least one KPI is required"),
  assigned_members: z.array(z.string()).min(1, "At least one member must be assigned"),
});

interface BAUTemplateFormProps {
  onSubmit: (data: CreateBAUTemplateFormData) => Promise<boolean>;
}

export function BAUTemplateForm({ onSubmit }: BAUTemplateFormProps) {
  const [open, setOpen] = useState(false);
  const { departments } = useDepartments();
  const { teamMembers } = useTeamMembers();
  const { role, department: userDepartment, isTeamLead } = useUserRole();

  // Filter departments for Team Leads
  const visibleDepartments = isTeamLead && userDepartment 
    ? departments.filter(dept => dept.name === userDepartment)
    : departments;

  const form = useForm<CreateBAUTemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      description: "",
      department: "",
      frequency: "Monthly",
      kpis: [{ name: "", unit: "Percentage", operator: "GreaterThanEqual", target_value: 0, source: "" }],
      assigned_members: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "kpis",
  });

  const selectedDepartment = form.watch("department");

  // Pre-select department for Team Leads
  useEffect(() => {
    if (isTeamLead && userDepartment && !selectedDepartment) {
      form.setValue("department", userDepartment);
    }
  }, [isTeamLead, userDepartment, selectedDepartment, form]);

  // Filter team members based on selected department and role
  const filteredMembers = teamMembers.filter(member => {
    if (!member.is_active || member.isPendingInvitation) return false;
    
    // For Team Leads, only show members from their department
    if (isTeamLead && userDepartment) {
      return member.department === userDepartment;
    }
    
    return selectedDepartment ? member.department === selectedDepartment : true;
  });

  // Reset assigned members when department changes
  const handleDepartmentChange = (department: string) => {
    form.setValue("department", department);
    form.setValue("assigned_members", []); // Clear selected members when department changes
  };

  const handleSubmit = async (data: CreateBAUTemplateFormData) => {
    const success = await onSubmit(data);
    if (success) {
      setOpen(false);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create BAU Template</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BAU Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter BAU name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Bi-Weekly">Bi-Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter template description..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Department and Team Members - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={handleDepartmentChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {visibleDepartments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Team Members Multi-Select */}
              <FormField
                control={form.control}
                name="assigned_members"
                render={() => (
                  <FormItem>
                    <FormLabel>Assign Team Members</FormLabel>
                    <div className="border rounded-lg p-3 max-h-40 overflow-y-auto bg-background">
                      {!selectedDepartment ? (
                        <p className="text-sm text-muted-foreground">Please select a department first</p>
                      ) : filteredMembers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No team members found for this department</p>
                      ) : (
                        <div className="space-y-2">
                          {filteredMembers.map((member) => (
                            <FormField
                              key={member.id}
                              control={form.control}
                              name="assigned_members"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={member.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(member.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, member.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== member.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {member.first_name} {member.last_name} ({member.email})
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* KPIs Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Key Performance Indicators</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: "", unit: "Percentage", operator: "GreaterThanEqual", target_value: 0, source: "" })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add KPI
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">KPI {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* KPI Name - Full Width */}
                    <FormField
                      control={form.control}
                      name={`kpis.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>KPI Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Response Rate" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Unit, Operator, Target Value, Source - 4 Column Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name={`kpis.${index}.unit`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Percentage">Percentage (%)</SelectItem>
                                <SelectItem value="Count">Count (#)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`kpis.${index}.operator`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Operator</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="GreaterThanEqual">≥ (Greater than or equal)</SelectItem>
                                <SelectItem value="LessThanEqual">≤ (Less than or equal)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`kpis.${index}.target_value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Value</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`kpis.${index}.source`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Source</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., CRM System"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="btn-primary">
                Create Template
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
