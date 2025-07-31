import { Search, Archive } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface BAUTemplateSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
  departments: Array<{ name: string }>;
  showDeactivated: boolean;
  onToggleDeactivated: (value: boolean) => void;
}

export function BAUTemplateSearch({ 
  searchTerm, 
  onSearchChange, 
  selectedDepartment, 
  onDepartmentChange, 
  departments,
  showDeactivated,
  onToggleDeactivated
}: BAUTemplateSearchProps) {
  return (
    <Card className="card-elevated">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search templates by name, description, or department..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.name} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-3">
              <Label htmlFor="deactivated-toggle" className="text-sm font-medium flex items-center gap-2">
                <Archive className="w-4 h-4" />
                Show Deactivated
              </Label>
              <Switch
                id="deactivated-toggle"
                checked={showDeactivated}
                onCheckedChange={onToggleDeactivated}
              />
            </div>
            
            {showDeactivated && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Viewing Deactivated Templates
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}