import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Department } from "@/types/department";

interface DepartmentFormProps {
  onSubmit: (name: string, description: string) => Promise<boolean>;
  isEdit?: boolean;
  department?: Department;
  trigger?: React.ReactNode;
}

export function DepartmentForm({ onSubmit, isEdit = false, department, trigger }: DepartmentFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(department?.name || "");
  const [description, setDescription] = useState(department?.description || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(name, description);
    if (success) {
      setOpen(false);
      if (!isEdit) {
        setName("");
        setDescription("");
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && department) {
      setName(department.name);
      setDescription(department.description || "");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Department" : "Add New Department"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Department Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter department name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter department description"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {isEdit ? "Update Department" : "Add Department"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}