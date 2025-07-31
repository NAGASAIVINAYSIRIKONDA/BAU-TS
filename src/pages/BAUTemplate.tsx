
import { useMemo, useState } from "react";
import { BAUTemplateStats } from "@/components/bauTemplate/BAUTemplateStats";
import { BAUTemplateForm } from "@/components/bauTemplate/BAUTemplateForm";
import { BAUTemplateTable } from "@/components/bauTemplate/BAUTemplateTable";
import { BAUTemplateSearch } from "@/components/bauTemplate/BAUTemplateSearch";
import { useBAUTemplates } from "@/hooks/useBAUTemplates";
import { useDepartments } from "@/hooks/useDepartments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function BAUTemplate() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [showDeactivated, setShowDeactivated] = useState(false);

  const {
    templates,
    loading,
    stats,
    createTemplate,
    updateTemplateStatus,
    updateTemplate,
    deleteTemplate
  } = useBAUTemplates(true); // Always fetch all templates for accurate stats

  const { departments } = useDepartments();

  // Filter templates based on search term, department, and deactivated status
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch = searchTerm === "" || 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        template.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = selectedDepartment === "all" || 
        template.department === selectedDepartment;

      const matchesDeactivatedFilter = showDeactivated 
        ? template.status === 'Deactivated'
        : template.status !== 'Deactivated';

      return matchesSearch && matchesDepartment && matchesDeactivatedFilter;
    });
  }, [templates, searchTerm, selectedDepartment, showDeactivated]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <BAUTemplateStats 
        totalTemplates={stats.totalTemplates}
        activeTemplates={stats.activeTemplates}
        draftTemplates={stats.draftTemplates}
        deactivatedTemplates={stats.deactivatedTemplates}
      />

      {/* Templates List with Search and Add Button */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">BAU Templates</h2>
          <BAUTemplateForm onSubmit={createTemplate} />
        </div>

        {/* Search and Filter */}
        <BAUTemplateSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          departments={departments}
          showDeactivated={showDeactivated}
          onToggleDeactivated={setShowDeactivated}
        />

        {/* Templates Table */}
        <BAUTemplateTable
          templates={filteredTemplates}
          loading={loading}
          onUpdateStatus={updateTemplateStatus}
          onEdit={updateTemplate}
          onDelete={deleteTemplate}
        />
      </div>
    </div>
  );
}
