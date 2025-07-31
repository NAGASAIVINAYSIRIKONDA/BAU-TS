
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generateManualUserSQL } from "@/utils/manualUserScript";
import { Copy, User, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ManualUserTool() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    role: 'Team_Member' as 'Admin' | 'HR' | 'Team_Lead' | 'Team_Member'
  });
  const [generatedSQL, setGeneratedSQL] = useState('');
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast({
        title: "Missing Information",
        description: "Please fill in email, first name, and last name",
        variant: "destructive"
      });
      return;
    }

    const sql = generateManualUserSQL(
      formData.email,
      formData.firstName,
      formData.lastName,
      formData.department || null,
      formData.role
    );
    
    setGeneratedSQL(sql);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedSQL);
      toast({
        title: "Copied!",
        description: "SQL script copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the SQL manually",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Manual User Addition Tool
        </CardTitle>
        <CardDescription>
          For testing purposes when email invitations are not working. Use only for development.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="john.doe@example.com"
            />
          </div>
          
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value: any) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Team_Member">Team Member</SelectItem>
                <SelectItem value="Team_Lead">Team Lead</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="John"
            />
          </div>

          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Doe"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              placeholder="Engineering"
            />
          </div>
        </div>

        <Button onClick={handleGenerate} className="w-full">
          <Database className="w-4 h-4 mr-2" />
          Generate SQL Script
        </Button>

        {generatedSQL && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Generated SQL Script</Label>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
            <Textarea
              value={generatedSQL}
              readOnly
              className="h-64 font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              Copy this SQL and execute it in Supabase Dashboard &gt; SQL Editor
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
