
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface AuthenticatedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn' | 'enabled'> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  requireAuth?: boolean;
}

export function useAuthenticatedQuery<T>({
  queryKey,
  queryFn,
  requireAuth = true,
  ...options
}: AuthenticatedQueryOptions<T>) {
  const { user, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: ['authenticated', ...queryKey, user?.id],
    queryFn,
    enabled: !authLoading && (requireAuth ? !!user : true),
    retry: (failureCount, error: any) => {
      // Don't retry auth-related errors
      if (error?.code === 'PGRST301' || error?.message?.includes('JWT')) {
        return false;
      }
      return failureCount < 2;
    },
    ...options,
  });
}
