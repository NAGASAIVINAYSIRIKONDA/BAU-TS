
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedQuery } from './useAuthenticatedQuery';
import { supabase } from '@/integrations/supabase/client';

export function useUserProfile() {
  const { user, loading: authLoading } = useAuth();

  const { data: userProfile, isLoading: profileLoading, error, refetch } = useAuthenticatedQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      if (!user?.id) throw new Error('No authenticated user');
      
      console.log('Fetching profile for user:', user.id);
      
      // First get the profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      // Then get the user roles separately
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (rolesError) {
        console.error('Roles fetch error:', rolesError);
        throw rolesError;
      }

      // Combine the data
      const combinedData = {
        ...profile,
        user_roles: userRoles || []
      };
      
      console.log('Profile data loaded:', combinedData);
      
      return combinedData;
    },
    requireAuth: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data: userProfile,
    isLoading: authLoading || profileLoading,
    error,
    refetch,
  };
}
