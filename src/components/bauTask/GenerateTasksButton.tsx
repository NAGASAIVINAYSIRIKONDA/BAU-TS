
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateTasksFromTemplate } from "@/hooks/bauTasks/bauTaskService";
import { useBAUTemplates } from "@/hooks/useBAUTemplates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface GenerateTasksButtonProps {
  onTasksGenerated: () => void;
}

export function GenerateTasksButton({ onTasksGenerated }: GenerateTasksButtonProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { templates } = useBAUTemplates();
  const { toast } = useToast();

  const handleGenerateTasks = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Please select a template first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await generateTasksFromTemplate(selectedTemplate);
      toast({
        title: "Success",
        description: "Tasks generated successfully from template",
      });
      onTasksGenerated();
      setSelectedTemplate("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const activeTemplates = templates.filter(t => t.status === 'Active' && t.template_assignments.length > 0);

  if (activeTemplates.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select template" />
        </SelectTrigger>
        <SelectContent>
          {activeTemplates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              {template.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button 
        onClick={handleGenerateTasks} 
        disabled={loading || !selectedTemplate}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        {loading ? "Generating..." : "Generate Tasks"}
      </Button>
    </div>
  );
}
