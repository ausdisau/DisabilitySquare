import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Flame, Smile } from "lucide-react";

const MOODS = [
  { value: 1, emoji: "😔", label: "Rough day" },
  { value: 2, emoji: "😟", label: "Struggling" },
  { value: 3, emoji: "😐", label: "Getting by" },
  { value: 4, emoji: "😊", label: "Pretty good" },
  { value: 5, emoji: "🤩", label: "Thriving!" },
];

export function WellnessCheckIn() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hovered, setHovered] = useState<number | null>(null);
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: todayEntry } = useQuery<any>({
    queryKey: ["/api/journal", today],
    enabled: !!user,
  });

  const { data: recentEntries } = useQuery<any[]>({
    queryKey: ["/api/journal"],
    enabled: !!user,
  });

  const streak = (() => {
    if (!recentEntries?.length) return 0;
    let count = 0;
    const sorted = [...recentEntries].sort((a, b) => b.date.localeCompare(a.date));
    for (const entry of sorted) {
      if (entry.mood) count++;
      else break;
    }
    return count;
  })();

  const checkIn = useMutation({
    mutationFn: (mood: number) =>
      apiRequest("POST", "/api/journal", { date: today, mood }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      toast({ title: "Check-in recorded!" });
    },
  });

  if (!user) return null;

  const todayMood = todayEntry?.mood;
  const displayMood = MOODS.find((m) => m.value === todayMood);

  return (
    <div className="sm-card mb-3" role="region" aria-label="Daily wellness check-in">
      <div className="sm-card-body">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Smile className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="text-sm font-semibold text-foreground">
              {todayMood ? "Today's check-in" : "How are you today?"}
            </span>
          </div>
          {streak > 1 && (
            <span className="flex items-center gap-1 text-xs text-accent font-semibold">
              <Flame className="h-3.5 w-3.5" aria-hidden="true" />
              {streak} day streak
            </span>
          )}
        </div>

        {todayMood ? (
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">{displayMood?.emoji}</span>
            <div>
              <p className="text-sm font-medium text-foreground">{displayMood?.label}</p>
              <p className="text-xs text-muted-foreground">You checked in today</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 justify-between">
            {MOODS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => checkIn.mutate(mood.value)}
                onMouseEnter={() => setHovered(mood.value)}
                onMouseLeave={() => setHovered(null)}
                disabled={checkIn.isPending}
                className="flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all hover:bg-muted hover:scale-110"
                title={mood.label}
                data-testid={`button-mood-${mood.value}`}
                aria-label={mood.label}
              >
                <span className="text-2xl leading-none" aria-hidden="true">{mood.emoji}</span>
                {hovered === mood.value && (
                  <span className="text-[9px] text-muted-foreground font-medium truncate">{mood.label}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
