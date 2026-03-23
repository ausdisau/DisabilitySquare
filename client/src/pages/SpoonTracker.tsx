import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Spline, TrendingUp, Info, ChevronLeft, ChevronRight } from "lucide-react";

const SPOON_LABELS: Record<number, string> = {
  1: "No spoons at all",
  2: "Barely any energy",
  3: "Very limited",
  4: "Limited",
  5: "Below average",
  6: "Average",
  7: "Decent",
  8: "Good",
  9: "Very good",
  10: "Excellent",
  11: "Fantastic",
  12: "Full energy",
};

const SPOON_COLORS: Record<number, string> = {
  1: "bg-red-600", 2: "bg-red-500", 3: "bg-red-400", 4: "bg-orange-500",
  5: "bg-orange-400", 6: "bg-yellow-500", 7: "bg-yellow-400",
  8: "bg-lime-500", 9: "bg-green-400", 10: "bg-green-500",
  11: "bg-teal-500", 12: "bg-teal-600",
};

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getLastNDates(n: number): string[] {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export default function SpoonTracker() {
  const { toast } = useToast();
  const [selectedSpoons, setSelectedSpoons] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const today = getToday();

  const { data: todayStatus } = useQuery<{ id: number; spoons: number; note?: string; date: string } | null>({
    queryKey: ['/api/spoons/today'],
  });

  const { data: history = [] } = useQuery<Array<{ id: number; spoons: number; note?: string; date: string }>>({
    queryKey: ['/api/spoons/history'],
  });

  const spoonsByDate: Record<string, number> = {};
  history.forEach(h => { spoonsByDate[h.date] = h.spoons; });
  if (todayStatus) spoonsByDate[today] = todayStatus.spoons;

  const displaySpoons = selectedSpoons ?? todayStatus?.spoons ?? null;

  const saveMutation = useMutation({
    mutationFn: (data: { spoons: number; note?: string; date: string }) =>
      apiRequest('POST', '/api/spoons', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/spoons/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/spoons/history'] });
      toast({ title: "Spoon status saved!", description: "Your energy level has been recorded." });
    },
  });

  const handleSave = () => {
    if (!selectedSpoons) return;
    saveMutation.mutate({ spoons: selectedSpoons, note: note || undefined, date: today });
  };

  const last14 = getLastNDates(14);
  const avgSpoons = history.length > 0
    ? Math.round((history.reduce((s, h) => s + h.spoons, 0) / history.length) * 10) / 10
    : null;

  return (
    <Layout>
      <SEO title="Spoon Tracker - DisabilitySquare" description="Track your daily energy using spoon theory" />
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Spoon Tracker</h1>
          <p className="text-muted-foreground mt-1">Track your daily energy using spoon theory</p>
        </div>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <CardTitle className="text-base">What is spoon theory?</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Spoon theory is a metaphor for the limited energy available to people with chronic illness or disability.
                  Each "spoon" represents a unit of energy. You start each day with a certain number of spoons and every
                  activity costs spoons. When they're gone, they're gone.
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How many spoons do you have today?</CardTitle>
            <p className="text-sm text-muted-foreground">{formatDate(today)}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className="grid grid-cols-6 gap-2"
              role="radiogroup"
              aria-label="Select your spoon count (1-12)"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setSelectedSpoons(n)}
                  role="radio"
                  aria-checked={displaySpoons === n}
                  aria-label={`${n} spoon${n !== 1 ? 's' : ''}: ${SPOON_LABELS[n]}`}
                  data-testid={`button-spoon-${n}`}
                  className={[
                    "relative flex flex-col items-center justify-center rounded-xl border-2 p-3 cursor-pointer transition-all",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    displaySpoons === n
                      ? "border-primary shadow-md scale-105"
                      : "border-border hover:border-primary/50 hover:scale-102",
                  ].join(' ')}
                >
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${SPOON_COLORS[n]}`}>
                    {n}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1 text-center leading-tight hidden sm:block">
                    {n === 1 ? "None" : n === 12 ? "Full" : n <= 4 ? "Low" : n <= 8 ? "Mid" : "High"}
                  </span>
                </button>
              ))}
            </div>

            {displaySpoons && (
              <div className="text-center py-2">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold ${SPOON_COLORS[displaySpoons]}`}>
                  <Spline className="h-4 w-4" />
                  {displaySpoons} spoon{displaySpoons !== 1 ? 's' : ''} — {SPOON_LABELS[displaySpoons]}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="spoon-note" className="text-sm font-medium">
                Add a note (optional)
              </label>
              <Textarea
                id="spoon-note"
                placeholder="How are you feeling? What affected your energy today?"
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                data-testid="textarea-spoon-note"
                className="resize-none"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={!selectedSpoons || saveMutation.isPending}
              className="w-full"
              data-testid="button-save-spoons"
            >
              {todayStatus ? "Update Today's Spoons" : "Save Today's Spoons"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-primary" data-testid="text-today-spoons">
                {todayStatus ? todayStatus.spoons : "—"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Today</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-accent" data-testid="text-avg-spoons">
                {avgSpoons ?? "—"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">30-Day Average</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-secondary" data-testid="text-streak-spoons">
                {history.length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Days Tracked</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" aria-hidden="true" />
              Last 14 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-32" aria-label="Spoon history chart">
              {last14.map(date => {
                const spoons = spoonsByDate[date];
                const height = spoons ? `${(spoons / 12) * 100}%` : '4px';
                const isToday = date === today;
                return (
                  <div
                    key={date}
                    className="flex-1 flex flex-col items-center gap-1"
                    title={`${formatDate(date)}: ${spoons ? `${spoons} spoons` : 'Not recorded'}`}
                  >
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className={`w-full rounded-t transition-all ${spoons ? SPOON_COLORS[spoons] : 'bg-muted'} ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                        style={{ height }}
                      />
                    </div>
                    <span className={`text-xs ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                      {new Date(date + 'T00:00:00').getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {[2, 4, 6, 8, 10, 12].map(n => (
                <div key={n} className="flex items-center gap-1">
                  <div className={`h-3 w-3 rounded-sm ${SPOON_COLORS[n]}`} />
                  <span className="text-xs text-muted-foreground">{n}</span>
                </div>
              ))}
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-sm bg-muted" />
                <span className="text-xs text-muted-foreground">Not recorded</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.slice(0, 7).map(entry => (
                  <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${SPOON_COLORS[entry.spoons]}`}>
                      {entry.spoons}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{formatDate(entry.date)}</p>
                      {entry.note && <p className="text-xs text-muted-foreground truncate">{entry.note}</p>}
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {SPOON_LABELS[entry.spoons]}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
