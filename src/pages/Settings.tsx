
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { AdminManagement } from "@/components/settings/AdminManagement";
import { ManualUserTool } from "@/components/dashboard/ManualUserTool";
import { useUserProfile } from "@/hooks/useUserProfile";
import { User, Shield, UserPlus, Loader2 } from "lucide-react";

export function Settings() {
  const { data: userProfile, isLoading } = useUserProfile();
  
  console.log('Settings userProfile:', userProfile);
  console.log('User roles:', userProfile?.user_roles);
  
  const isAdmin = userProfile?.user_roles?.some((role: any) => role.role === 'Admin');
  
  console.log('Is admin:', isAdmin);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and system preferences</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            General
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Admin Management
            </TabsTrigger>
          )}
          <TabsTrigger value="manual-user" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Manual User Addition
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <GeneralSettings />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admins" className="mt-6">
            <AdminManagement />
          </TabsContent>
        )}

        <TabsContent value="manual-user" className="mt-6">
          <ManualUserTool />
        </TabsContent>
      </Tabs>
    </div>
  );
}
