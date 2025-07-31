import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/department':
        return 'Department';
      case '/team-members':
        return 'Team Members';
      case '/bau-management':
        return 'BAU Management';
      case '/bau-template':
        return 'BAU Template';
      case '/hr-checkin':
        return 'HR Check-In';
      case '/settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 bg-card border-b border-border flex items-center px-6 sticky top-0 z-40">
            <SidebarTrigger className="mr-4" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground">{getPageTitle()}</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Add notifications, user menu, etc. here */}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}