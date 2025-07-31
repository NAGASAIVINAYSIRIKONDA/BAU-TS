
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { useUserProfile } from "@/hooks/useUserProfile"
import { ChevronUp, LogOut, User2, Building2, Users, FileText, ClipboardList, UserCheck, Settings, LayoutDashboard } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useUserRole } from "@/hooks/useUserRole"
import { getVisibleNavigationItems } from "./RoleBasedNavigation"

const iconMap = {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  ClipboardList,
  UserCheck,
  Settings
};

export function AppSidebar() {
  const { signOut } = useAuth();
  const location = useLocation();
  const { role, isLoading } = useUserRole();
  const { data: userProfile } = useUserProfile();
  const { open } = useSidebar();
  
  const visibleItems = getVisibleNavigationItems(role);
  
  // Get display name
  const displayName = userProfile?.display_name || 
    (userProfile?.first_name && userProfile?.last_name 
      ? `${userProfile.first_name} ${userProfile.last_name}` 
      : userProfile?.first_name || userProfile?.email?.split('@')[0] || 'User');
  
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <Sidebar variant="inset">
        <SidebarContent>
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="size-4" />
          </div>
          {open && (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">BAU Tracker</span>
              <span className="truncate text-xs text-muted-foreground">
                Business Operations
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const IconComponent = iconMap[item.icon as keyof typeof iconMap];
                const isActive = location.pathname === item.url;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <IconComponent className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
                <User2 className="size-4" />
              </div>
              {open && (
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <div className="flex items-center gap-1">
                    {role && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        {role.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="ml-auto size-8 p-0"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
