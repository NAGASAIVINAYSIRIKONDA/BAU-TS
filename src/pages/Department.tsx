import { DepartmentForm } from "@/components/department/DepartmentForm";
import { DepartmentStats } from "@/components/department/DepartmentStats";
import { DepartmentTable } from "@/components/department/DepartmentTable";
import { DepartmentSearch } from "@/components/department/DepartmentSearch";
import { useDepartments } from "@/hooks/useDepartments";
import { useState, useMemo } from "react";

export function Department() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const {
    departments,
    loading,
    totalEmployees,
    createDepartment,
    updateDepartment,
    deleteDepartment
  } = useDepartments();

  // Filter departments based on search term
  const filteredDepartments = useMemo(() => {
    if (!searchTerm) return departments;
    
    return departments.filter((department) =>
      department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (department.description && department.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [departments, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <DepartmentStats 
        totalDepartments={departments.length}
        totalEmployees={totalEmployees}
      />

      {/* Department List with Search and Add Button */}
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground">Departments</h2>
          <div className="flex items-center gap-4">
            <DepartmentSearch 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
            <DepartmentForm onSubmit={createDepartment} />
          </div>
        </div>

        {/* Department List */}
        <DepartmentTable
          departments={filteredDepartments}
          loading={loading}
          onUpdate={updateDepartment}
          onDelete={deleteDepartment}
        />
      </div>
    </div>
  );
}