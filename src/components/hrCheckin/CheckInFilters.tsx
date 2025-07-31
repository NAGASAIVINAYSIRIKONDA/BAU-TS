import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { DepartmentOption, TeamMemberOption } from "@/types/hrCheckin";

interface CheckInFilters {
  department: string;
  search: string;
}

interface CheckInFiltersProps {
  filters: CheckInFilters;
  onFiltersChange: (filters: CheckInFilters) => void;
  departments: DepartmentOption[];
}

export function CheckInFilters({ filters, onFiltersChange, departments }: CheckInFiltersProps) {
  const hasActiveFilters = filters.department !== "all" || filters.search;

  const handleFilterChange = (key: keyof CheckInFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      department: "all",
      search: ""
    });
  };

  return (
    <Card className="card-elevated">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Department Filter */}
          <Select value={filters.department} onValueChange={(value) => handleFilterChange('department', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.name} value={dept.name}>
                  {dept.name} ({dept.member_count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}