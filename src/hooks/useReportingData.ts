
import { useAuthenticatedQuery } from './useAuthenticatedQuery';
import { supabase } from "@/integrations/supabase/client";
import { ReportingFilters } from "@/components/dashboard/ReportingSection";
import { useUserRole } from './useUserRole';

interface TeamMemberProgress {
  id: string;
  display_name: string;
  department: string | null;
  avatar_url?: string | null;
  progressData: {
    overallProgress: number;
    tasksCompleted: number;
    totalTasks: number;
    avgScore: number;
    taskCompletionRate: number;
    recentTrend: 'up' | 'down' | 'stable';
  };
}

interface DashboardStats {
  overallProgress: number;
  taskCompletionRate: number;
  tasksCompleted: number;
}

interface ReportingData {
  teamMembers: Array<{ id: string; display_name: string; department: string | null }>;
  individualProgress: TeamMemberProgress[];
  dashboardStats: DashboardStats;
}

export function useReportingData(filters: ReportingFilters) {
  const { role, department: userDepartment } = useUserRole();
  
  return useAuthenticatedQuery<ReportingData>({
    queryKey: ['reporting-data', JSON.stringify(filters), role, userDepartment],
    queryFn: async () => {
      try {
        // Get team members for filter dropdown (exclude Admin users)
        const { data: allProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            id, 
            display_name, 
            department,
            is_active
          `)
          .eq('is_active', true);

        if (profilesError) throw profilesError;

        // Get user roles to identify admins - include all users, just identify admins to exclude
        const memberIds = allProfiles?.map(m => m.id) || [];
        
        const { data: allRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', memberIds);

        if (rolesError) throw rolesError;

        // Create a set of Admin user IDs to exclude
        const adminUserIds = new Set(
          allRoles
            ?.filter(r => r.role === 'Admin')
            ?.map(r => r.user_id) || []
        );
        
        // Include all active users except Admins
        let teamMembers = allProfiles
          ?.filter(member => !adminUserIds.has(member.id))
          ?.map(member => ({
            id: member.id,
            display_name: member.display_name,
            department: member.department
          })) || [];

        // Apply role-based filtering for teamMembers dropdown
        if ((role === 'Team_Lead' || role === 'Team_Member') && userDepartment) {
          // Team Leads and Team Members should see all members from their department
          teamMembers = teamMembers.filter(member => member.department === userDepartment);
        }

        // Build BAU tasks query with filters
        let taskQuery = supabase
          .from('bau_task_instances')
          .select(`
            *,
            assigned_to_profile:profiles!bau_task_instances_assigned_to_fkey(
              id,
              display_name,
              department,
              avatar_url
            )
          `);

        // Apply date range filter
        if (filters.dateRange?.from) {
          taskQuery = taskQuery.gte('created_at', filters.dateRange.from.toISOString());
        }
        if (filters.dateRange?.to) {
          taskQuery = taskQuery.lte('created_at', filters.dateRange.to.toISOString());
        }

        // Apply member filter
        if (filters.memberId) {
          taskQuery = taskQuery.eq('assigned_to', filters.memberId);
        }

        // Apply role-based task filtering for data calculation
        if (role === 'Team_Member' && userDepartment) {
          // Team members see all tasks from their department for transparency
          const deptUserIds = teamMembers
            .filter(u => u.department === userDepartment)
            .map(u => u.id);
          
          if (deptUserIds.length > 0) {
            taskQuery = taskQuery.in('assigned_to', deptUserIds);
          }
        } else {
          // For Admin, HR, and Team_Lead: Apply department filter or default behavior
          let effectiveDepartmentFilter = filters.department;
          
          // If Team_Lead and no specific department filter is applied, default to their department
          if (role === 'Team_Lead' && userDepartment && !effectiveDepartmentFilter && !filters.memberId) {
            effectiveDepartmentFilter = userDepartment;
          }
          
          if (effectiveDepartmentFilter) {
            const deptUserIds = teamMembers
              .filter(u => u.department === effectiveDepartmentFilter)
              .map(u => u.id);
            
            if (deptUserIds.length > 0) {
              taskQuery = taskQuery.in('assigned_to', deptUserIds);
            } else {
              // No users in department, return empty results
              return {
                teamMembers,
                individualProgress: [],
                dashboardStats: { overallProgress: 0, taskCompletionRate: 0, tasksCompleted: 0 }
              };
            }
          }
        }

        const { data: allTasks, error: tasksError } = await taskQuery;

        if (tasksError) throw tasksError;

        if (!allTasks || allTasks.length === 0) {
          return {
            teamMembers,
            individualProgress: [],
            dashboardStats: { overallProgress: 0, taskCompletionRate: 0, tasksCompleted: 0 }
          };
        }

        // Calculate dashboard stats from filtered tasks
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter(task => task.status === 'Completed').length;
        const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const overallProgress = totalTasks > 0 
          ? Math.round(allTasks.reduce((sum, task) => sum + (task.progress_percentage || 0), 0) / totalTasks)
          : 0;

        const dashboardStats = {
          overallProgress,
          taskCompletionRate,
          tasksCompleted: completedTasks
        };

        // Group tasks by user for individual progress
        const userTasksMap = new Map();
        allTasks.forEach(task => {
          const userId = task.assigned_to;
          if (!userTasksMap.has(userId)) {
            userTasksMap.set(userId, []);
          }
          userTasksMap.get(userId).push(task);
        });

        // Calculate individual progress for each user
        const individualProgress: TeamMemberProgress[] = [];
        
        for (const [userId, userTasks] of userTasksMap.entries()) {
          const userProfile = userTasks[0]?.assigned_to_profile;
          if (!userProfile) continue;

          const userTotalTasks = userTasks.length;
          const userCompletedTasks = userTasks.filter((t: any) => t.status === 'Completed').length;
          
          const userTaskCompletionRate = userTotalTasks > 0 ? Math.round((userCompletedTasks / userTotalTasks) * 100) : 0;
          const userOverallProgress = userTotalTasks > 0 
            ? Math.round(userTasks.reduce((sum: number, t: any) => sum + (t.progress_percentage || 0), 0) / userTotalTasks)
            : 0;
          
          const tasksWithScores = userTasks.filter((t: any) => t.score !== null && t.score !== undefined);
          const userAvgScore = tasksWithScores.length > 0 
            ? Math.round(tasksWithScores.reduce((sum: number, t: any) => sum + (t.score || 0), 0) / tasksWithScores.length) 
            : 0;

          const recentTrend = userOverallProgress >= 80 ? 'up' : userOverallProgress >= 60 ? 'stable' : 'down';

          individualProgress.push({
            id: userProfile.id,
            display_name: userProfile.display_name,
            department: userProfile.department,
            avatar_url: userProfile.avatar_url,
            progressData: {
              overallProgress: userOverallProgress,
              tasksCompleted: userCompletedTasks,
              totalTasks: userTotalTasks,
              avgScore: userAvgScore,
              taskCompletionRate: userTaskCompletionRate,
              recentTrend: recentTrend as 'up' | 'down' | 'stable'
            }
          });
        }
      
        return {
          teamMembers,
          individualProgress,
          dashboardStats
        };
      } catch (error) {
        console.error('Error fetching reporting data:', error);
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
