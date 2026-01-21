import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AuthUser {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  hasPasscode: boolean;
  passcodeVerified: boolean;
}

async function fetchUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      window.location.href = "/login";
    },
  });

  const isAuthenticated = !!user && user.passcodeVerified;
  const needsPasscode = !!user && user.hasPasscode && !user.passcodeVerified;
  const needsPasscodeSetup = !!user && !user.hasPasscode;

  return {
    user,
    isLoading,
    isAuthenticated,
    needsPasscode,
    needsPasscodeSetup,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
