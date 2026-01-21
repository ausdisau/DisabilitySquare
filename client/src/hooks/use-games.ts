import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertGameScore } from "@shared/routes";

export function useGameLeaderboard(gameName: string) {
  return useQuery({
    queryKey: [api.games.leaderboard.path, gameName],
    queryFn: async () => {
      const url = buildUrl(api.games.leaderboard.path, { gameName });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return api.games.leaderboard.responses[200].parse(await res.json());
    },
  });
}

export function useSubmitScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertGameScore) => {
      const res = await fetch(api.games.submitScore.path, {
        method: api.games.submitScore.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit score");
      return api.games.submitScore.responses[201].parse(await res.json());
    },
    onSuccess: (newScore) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.games.leaderboard.path, newScore.gameName] 
      });
    },
  });
}
