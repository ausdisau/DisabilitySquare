import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertProfile } from "@shared/routes";

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: [api.profiles.get.path, userId],
    queryFn: async () => {
      if (!userId) return null;
      const url = buildUrl(api.profiles.get.path, { userId });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.profiles.get.responses[200].parse(await res.json());
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<InsertProfile>) => {
      const res = await fetch(api.profiles.update.path, {
        method: api.profiles.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return api.profiles.update.responses[200].parse(await res.json());
    },
    onSuccess: (updatedProfile) => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.get.path] });
      // Also update the specific user profile query if we have the ID
      if (updatedProfile.userId) {
        queryClient.invalidateQueries({ 
          queryKey: [api.profiles.get.path, updatedProfile.userId] 
        });
      }
    },
  });
}
