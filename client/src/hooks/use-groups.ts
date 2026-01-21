import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertGroup } from "@shared/routes";

export function useGroups(filters?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: [api.groups.list.path, filters],
    queryFn: async () => {
      const url = new URL(api.groups.list.path, window.location.origin);
      if (filters?.category) url.searchParams.append("category", filters.category);
      if (filters?.search) url.searchParams.append("search", filters.search);

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch groups");
      return api.groups.list.responses[200].parse(await res.json());
    },
  });
}

export function useGroup(id: number) {
  return useQuery({
    queryKey: [api.groups.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.groups.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch group");
      return api.groups.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertGroup) => {
      const res = await fetch(api.groups.create.path, {
        method: api.groups.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create group");
      return api.groups.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.groups.list.path] });
    },
  });
}
