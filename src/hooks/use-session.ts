import { api } from "~/trpc/react";

export function useSession() {
  const query = api.user.getCurrentSession.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
}
