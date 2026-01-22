import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useMyPoints() {
  return useQuery({
    queryKey: [api.valorization.myPoints.path],
    queryFn: async () => {
      const res = await fetch(api.valorization.myPoints.path, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) return null;
        throw new Error("Failed to fetch points");
      }
      return res.json();
    },
  });
}

export function useUserPoints(userId: string) {
  return useQuery({
    queryKey: [api.valorization.userPoints.path, userId],
    queryFn: async () => {
      const url = buildUrl(api.valorization.userPoints.path, { userId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!userId,
  });
}

export function usePointsLeaderboard(limit: number = 10) {
  return useQuery({
    queryKey: [api.valorization.leaderboard.path, limit],
    queryFn: async () => {
      const url = new URL(api.valorization.leaderboard.path, window.location.origin);
      url.searchParams.append("limit", String(limit));
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
  });
}

export function useMyBadges() {
  return useQuery({
    queryKey: [api.valorization.myBadges.path],
    queryFn: async () => {
      const res = await fetch(api.valorization.myBadges.path, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) return [];
        throw new Error("Failed to fetch badges");
      }
      return res.json();
    },
  });
}

export function useUserBadges(userId: string) {
  return useQuery({
    queryKey: [api.valorization.userBadges.path, userId],
    queryFn: async () => {
      const url = buildUrl(api.valorization.userBadges.path, { userId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userId,
  });
}

export function useAllBadges() {
  return useQuery({
    queryKey: [api.valorization.allBadges.path],
    queryFn: async () => {
      const res = await fetch(api.valorization.allBadges.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch badges");
      return res.json();
    },
  });
}

export function useRecentAchievements(limit: number = 20) {
  return useQuery({
    queryKey: [api.valorization.recentAchievements.path, limit],
    queryFn: async () => {
      const url = new URL(api.valorization.recentAchievements.path, window.location.origin);
      url.searchParams.append("limit", String(limit));
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch achievements");
      return res.json();
    },
  });
}
