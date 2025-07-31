
import { AppRole } from '@/types/teamMember';

interface NavigationItem {
  title: string;
  url: string;
  icon: any;
  roles: AppRole[];
}

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: "LayoutDashboard",
    roles: ["Admin", "HR", "Team_Lead", "Team_Member"]
  },
  {
    title: "Department",
    url: "/department", 
    icon: "Building2",
    roles: ["Admin", "HR"]
  },
  {
    title: "Team Members",
    url: "/team-members",
    icon: "Users",
    roles: ["Admin", "HR"]
  },
  {
    title: "BAU Template",
    url: "/bau-template",
    icon: "FileText",
    roles: ["Admin", "HR", "Team_Lead"]
  },
  {
    title: "BAU Management", 
    url: "/bau-management",
    icon: "ClipboardList",
    roles: ["Admin", "HR", "Team_Lead", "Team_Member"]
  },
  {
    title: "HR Check-in",
    url: "/hr-checkin",
    icon: "UserCheck",
    roles: ["Admin", "HR", "Team_Lead", "Team_Member"]
  },
  {
    title: "Settings",
    url: "/settings",
    icon: "Settings",
    roles: ["Admin", "HR", "Team_Lead", "Team_Member"]
  },
  {
    title: "Questionnaire",
    url: "/questionnaire",
    icon: "ClipboardCheck",
    roles: ["Admin", "HR", "Team_Lead", "Team_Member"]
  },
  {
    title: "Questionnaire Admin",
    url: "/questionnaire-admin",
    icon: "BarChart3",
    roles: ["Admin"]
  }
];

export function getVisibleNavigationItems(userRole?: AppRole): NavigationItem[] {
  if (!userRole) return [];
  return navigationItems.filter(item => item.roles.includes(userRole));
}
