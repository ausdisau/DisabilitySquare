import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertPost, type InsertComment } from "@shared/routes";
import { z } from "zod";

export function usePosts(filters?: { groupId?: string; tag?: string }) {
  return useQuery({
    queryKey: [api.posts.list.path, filters],
    queryFn: async () => {
      const url = new URL(api.posts.list.path, window.location.origin);
      if (filters?.groupId) url.searchParams.append("groupId", filters.groupId);
      if (filters?.tag) url.searchParams.append("tag", filters.tag);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return api.posts.list.responses[200].parse(await res.json());
    },
  });
}

export function usePost(id: number) {
  return useQuery({
    queryKey: [api.posts.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.posts.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch post");
      return api.posts.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPost) => {
      const res = await fetch(api.posts.create.path, {
        method: api.posts.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create post");
      return api.posts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.posts.list.path] });
    },
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertComment) => {
      const res = await fetch(api.comments.create.path, {
        method: api.comments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add comment");
      return api.comments.create.responses[201].parse(await res.json());
    },
    onSuccess: (newComment) => {
      queryClient.invalidateQueries({ queryKey: [api.posts.get.path, newComment.postId] });
      queryClient.invalidateQueries({ queryKey: [api.posts.list.path] });
    },
  });
}
