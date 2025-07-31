import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { QuestionnaireService } from '@/hooks/questionnaire/questionnaireService';
import { UserQuestionnaire } from '@/types/questionnaire';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

const questionnaireService = new QuestionnaireService();

export default function QuestionnaireAdmin() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [userQuestionnaires, setUserQuestionnaires] = useState<UserQuestionnaire[]>([]);
  const [filteredQuestionnaires, setFilteredQuestionnaires] = useState<UserQuestionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState({
    search: '',
    roleFilter: 'all',
    categoryFilter: 'all'
  });

  useEffect(() => {
    if (user && role === 'Admin') {
      loadData();
    }
  }, [user, role]);

  useEffect(() => {
    applyFilters();
  }, [userQuestionnaires, filters]);

  const loadData = async () => {
    try {
      const [questionnaires, questionnaireStats] = await Promise.all([
        questionnaireService.getAllUserQuestionnaires(),
        questionnaireService.getQuestionnaireStats()
      ]);
      
      setUserQuestionnaires(questionnaires);
      setStats(questionnaireStats);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load questionnaire data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...userQuestionnaires];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(q => 
        q.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
        q.userEmail.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Role filter
    if (filters.roleFilter !== 'all') {
      filtered = filtered.filter(q => q.userRole === filters.roleFilter);
    }

    setFilteredQuestionnaires(filtered);
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'Admin': 'bg-red-100 text-red-800',
      'HR': 'bg-blue-100 text-blue-800',
      'Team_Lead': 'bg-green-100 text-green-800',
      'Team_Member': 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (role !== 'Admin') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
            <p className="text-muted-foreground">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Questionnaire Administration</h1>
        <p className="text-muted-foreground">View and manage all user questionnaire responses</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalResponses || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userQuestionnaires.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userQuestionnaires.filter(q => q.responses.length > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userQuestionnaires.length > 0 
                ? Math.round((userQuestionnaires.filter(q => q.responses.length > 0).length / userQuestionnaires.length) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Users</label>
              <Input
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Role</label>
              <Select
                value={filters.roleFilter}
                onValueChange={(value) => setFilters(prev => ({ ...prev, roleFilter: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Team_Lead">Team Lead</SelectItem>
                  <SelectItem value="Team_Member">Team Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Responses</label>
              <Select
                value={filters.categoryFilter}
                onValueChange={(value) => setFilters(prev => ({ ...prev, categoryFilter: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Accountability">Accountability</SelectItem>
                  <SelectItem value="Decision-making">Decision-making</SelectItem>
                  <SelectItem value="Process efficiency">Process efficiency</SelectItem>
                  <SelectItem value="Communication">Communication</SelectItem>
                  <SelectItem value="Role-specific KPIs">Role-specific KPIs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Questionnaires Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Questionnaires ({filteredQuestionnaires.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead>Last Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestionnaires.map((questionnaire) => (
                <TableRow key={questionnaire.userId}>
                  <TableCell className="font-medium">{questionnaire.userName}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(questionnaire.userRole)}>
                      {questionnaire.userRole.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{questionnaire.userEmail}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {questionnaire.responses.length} responses
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {questionnaire.lastSubmitted 
                      ? new Date(questionnaire.lastSubmitted).toLocaleDateString()
                      : 'Not submitted'
                    }
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">View Details</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Questionnaire Details - {questionnaire.userName}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Role:</strong> {questionnaire.userRole.replace('_', ' ')}
                            </div>
                            <div>
                              <strong>Email:</strong> {questionnaire.userEmail}
                            </div>
                            <div>
                              <strong>Total Responses:</strong> {questionnaire.responses.length}
                            </div>
                            <div>
                              <strong>Custom Questions:</strong> {questionnaire.customQuestions.length}
                            </div>
                          </div>
                          
                          {questionnaire.responses.length > 0 ? (
                            <div className="space-y-4">
                              <h3 className="font-semibold">Responses</h3>
                              {questionnaire.responses.map((response, index) => (
                                <Card key={response.id}>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">
                                      Response {index + 1}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-sm text-muted-foreground mb-2">
                                      Submitted: {new Date(response.submittedAt).toLocaleString()}
                                    </p>
                                    <p className="whitespace-pre-wrap">{response.answer}</p>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No responses submitted yet.</p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 