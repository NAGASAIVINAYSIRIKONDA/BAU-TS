
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, Trash2, Edit, UserCheck, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  department: string | null;
  position: string | null;
  is_active: boolean | null;
  created_at: string | null;
  role: string;
}

interface NonAdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
}

export function AdminManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Fetch all admin users
  const { data: adminUsers, isLoading: isLoadingAdmins } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      // First get all admin user IDs
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'Admin');

      if (rolesError) throw rolesError;

      if (!adminRoles || adminRoles.length === 0) {
        return [];
      }

      const adminUserIds = adminRoles.map(role => role.user_id);

      // Then get the profile data for these admin users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', adminUserIds);

      if (profilesError) throw profilesError;

      // Combine profile data with role information
      const adminUsersData = (profiles || []).map(profile => ({
        ...profile,
        role: 'Admin'
      })) as AdminUser[];

      return adminUsersData;
    },
  });

  // Fetch non-admin users for promotion
  const { data: nonAdminUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['nonAdminUsers', adminUsers],
    queryFn: async () => {
      const adminUserIds = (adminUsers || []).map(u => u.id);
      
      // Get all non-admin users by excluding admin user IDs
      const query = supabase
        .from('profiles')
        .select('id, email, first_name, last_name, display_name');

      if (adminUserIds.length > 0) {
        query.not('id', 'in', `(${adminUserIds.map(id => `'${id}'`).join(',')})`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as NonAdminUser[];
    },
    enabled: !!adminUsers,
  });

  // Promote user to admin
  const promoteToAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'Admin',
          assigned_by: currentUser.user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['nonAdminUsers'] });
      setIsAddDialogOpen(false);
      setSelectedUserId("");
      toast({
        title: "Admin Added",
        description: "User has been promoted to admin successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Admin",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Remove admin role
  const removeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'Admin');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['nonAdminUsers'] });
      toast({
        title: "Admin Removed",
        description: "Admin privileges have been revoked successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Remove Admin",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handlePromoteToAdmin = () => {
    if (selectedUserId) {
      promoteToAdminMutation.mutate(selectedUserId);
    }
  };

  const handleRemoveAdmin = (userId: string) => {
    removeAdminMutation.mutate(userId);
  };

  if (isLoadingAdmins) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading admin users...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Admin Management
            </CardTitle>
            <CardDescription>
              Manage admin users and their privileges
            </CardDescription>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Promote User to Admin</DialogTitle>
                <DialogDescription>
                  Select a user to promote to admin role. They will have full system access.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user to promote" />
                  </SelectTrigger>
                  <SelectContent>
                    {nonAdminUsers?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : user.display_name || user.email}
                        <span className="text-muted-foreground ml-2">({user.email})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handlePromoteToAdmin}
                  disabled={!selectedUserId || promoteToAdminMutation.isPending}
                >
                  {promoteToAdminMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Promote to Admin
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminUsers?.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {admin.first_name && admin.last_name 
                        ? `${admin.first_name} ${admin.last_name}` 
                        : admin.display_name || 'No name set'}
                    </div>
                    {admin.position && (
                      <div className="text-sm text-muted-foreground">{admin.position}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>{admin.department || '-'}</TableCell>
                <TableCell>
                  <Badge variant={admin.is_active ? "default" : "secondary"}>
                    {admin.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {admin.created_at ? format(new Date(admin.created_at), 'MMM dd, yyyy') : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Admin Privileges</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove admin privileges from this user? 
                          They will lose access to admin features.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveAdmin(admin.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove Admin
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
            {(!adminUsers || adminUsers.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No admin users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
