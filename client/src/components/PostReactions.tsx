import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export type ReactionType = "hug" | "me_too" | "helpful" | "inspiring";

export const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "hug", emoji: "🤗", label: "Hug" },
  { type: "me_too", emoji: "✋", label: "Me Too" },
  { type: "helpful", emoji: "💡", label: "Helpful" },
  { type: "inspiring", emoji: "✨", label: "Inspiring" },
];

interface PostReactionsProps {
  postId: number;
  className?: string;
  compact?: boolean;
}

export function PostReactions({ postId, className, compact = false }: PostReactionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hoveredType, setHoveredType] = useState<ReactionType | null>(null);

  const { data } = useQuery<{ counts: Record<string, number>; userReaction: string | null }>({
    queryKey: [`/api/posts/${postId}/reactions`],
    enabled: true,
  });

  const counts = data?.counts || {};
  const userReaction = data?.userReaction || null;
  const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0);

  const reactMutation = useMutation({
    mutationFn: async (reactionType: ReactionType) => {
      if (!user) throw new Error("Login required");
      if (userReaction === reactionType) {
        return apiRequest("DELETE", `/api/posts/${postId}/react`);
      }
      return apiRequest("POST", `/api/posts/${postId}/react`, { reactionType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/reactions`] });
    },
    onError: () => {
      if (!user) toast({ title: "Please sign in to react", variant: "destructive" });
    },
  });

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {REACTIONS.map(({ type, emoji, label }) => {
          const count = counts[type] || 0;
          const isActive = userReaction === type;
          return (
            <button
              key={type}
              onClick={() => reactMutation.mutate(type)}
              disabled={reactMutation.isPending}
              aria-label={`${label}${count > 0 ? ` (${count})` : ""}`}
              data-testid={`button-react-${type}-${postId}`}
              className={cn(
                "flex items-center gap-1 text-xs rounded-full px-2 py-1 transition-all",
                isActive
                  ? "bg-[#1B4B8A]/10 text-[#1B4B8A] font-semibold"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
              )}
            >
              <span>{emoji}</span>
              {count > 0 && <span>{count}</span>}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1 flex-wrap", className)}>
      {REACTIONS.map(({ type, emoji, label }) => {
        const count = counts[type] || 0;
        const isActive = userReaction === type;
        const isHovered = hoveredType === type;
        return (
          <button
            key={type}
            onClick={() => reactMutation.mutate(type)}
            onMouseEnter={() => setHoveredType(type)}
            onMouseLeave={() => setHoveredType(null)}
            disabled={reactMutation.isPending}
            aria-label={`${isActive ? "Remove " : ""}${label} reaction${count > 0 ? ` (${count})` : ""}`}
            data-testid={`button-react-${type}-${postId}`}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all border",
              isActive
                ? "bg-[#1B4B8A] text-white border-[#1B4B8A] shadow-sm"
                : isHovered
                ? "bg-[#1B4B8A]/5 border-[#1B4B8A]/20 text-gray-700"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300",
            )}
          >
            <span className="text-base leading-none">{emoji}</span>
            <span className={cn("font-medium text-xs", isActive ? "text-white" : "text-current")}>
              {label}
              {count > 0 && <span className="ml-1 opacity-80">{count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
