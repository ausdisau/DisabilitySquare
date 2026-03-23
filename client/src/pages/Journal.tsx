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
import { ChevronLeft, ChevronRight, BookOpen, Lock, Plus, X } from "lucide-react";

const MOOD_LABELS: Record<number, string> = {
  1: "😞 Very low", 2: "😟 Low", 3: "😐 Neutral", 4: "🙂 Good", 5: "😄 Great",
};

const MOOD_COLORS: Record<number, string> = {
  1: "text-red-500 bg-red-50 border-red-200",
  2: "text-orange-500 bg-orange-50 border-orange-200",
  3: "text-yellow-600 bg-yellow-50 border-yellow-200",
  4: "text-lime-600 bg-lime-50 border-lime-200",
  5: "text-green-600 bg-green-50 border-green-200",
};

const COMMON_SYMPTOMS = [
  "Fatigue", "Pain", "Brain fog", "Anxiety", "Nausea", "Headache",
  "Joint pain", "Insomnia", "Dizziness", "Shortness of breath",
  "Muscle weakness", "Sensory sensitivity",
];

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function addDays(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

interface JournalEntry {
  id: number;
  date: string;
  mood: number;
  symptoms: string[];
  painLevel?: number;
  energyLevel?: number;
  notes?: string;
  isPrivate: boolean;
}

export default function Journal() {
  const { toast } = useToast();
  const today = getToday();
  const [currentDate, setCurrentDate] = useState(today);
  const [mood, setMood] = useState<number | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [viewMode, setViewMode] = useState<'edit' | 'history'>('edit');

  const { data: entry, isLoading } = useQuery<JournalEntry | null>({
    queryKey: ['/api/journal', currentDate],
    queryFn: async () => {
      const data = await fetch(`/api/journal/${currentDate}`, { credentials: 'include' }).then(r => r.json());
      if (data) {
        setMood(data.mood);
        setSelectedSymptoms(data.symptoms || []);
        setPainLevel(data.painLevel ?? null);
        setEnergyLevel(data.energyLevel ?? null);
        setNotes(data.notes || "");
      } else {
        setMood(null);
        setSelectedSymptoms([]);
        setPainLevel(null);
        setEnergyLevel(null);
        setNotes("");
      }
      return data;
    },
  });

  const { data: history = [] } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal'],
    enabled: viewMode === 'history',
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/journal', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      toast({ title: "Journal saved!", description: "Your entry has been saved privately." });
    },
  });

  const handleSave = () => {
    if (!mood) return;
    saveMutation.mutate({
      date: currentDate,
      mood,
      symptoms: selectedSymptoms,
      painLevel: painLevel ?? undefined,
      energyLevel: energyLevel ?? undefined,
      notes: notes || undefined,
      isPrivate: true,
    });
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const addCustomSymptom = () => {
    const trimmed = customSymptom.trim();
    if (trimmed && !selectedSymptoms.includes(trimmed)) {
      setSelectedSymptoms(prev => [...prev, trimmed]);
    }
    setCustomSymptom("");
  };

  const isToday = currentDate === today;
  const isPast = currentDate < today;

  return (
    <Layout>
      <SEO title="Health Journal - DisabilitySquare" description="Track your symptoms and mood privately" />
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" aria-hidden="true" />
              Health Journal
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-1">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              All entries are private and only visible to you
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'edit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('edit')}
              data-testid="button-journal-edit-mode"
            >
              Log Entry
            </Button>
            <Button
              variant={viewMode === 'history' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('history')}
              data-testid="button-journal-history-mode"
            >
              History
            </Button>
          </div>
        </div>

        {viewMode === 'edit' && (
          <>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setCurrentDate(addDays(currentDate, -1)); }}
                aria-label="Previous day"
                data-testid="button-journal-prev-day"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="text-center">
                <h2 className="font-semibold text-lg">{formatDate(currentDate)}</h2>
                {isToday && <Badge variant="secondary" className="text-xs">Today</Badge>}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { if (!isToday) setCurrentDate(addDays(currentDate, 1)); }}
                disabled={isToday}
                aria-label="Next day"
                data-testid="button-journal-next-day"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <Card>
              <CardHeader><CardTitle>How are you feeling?</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Select your mood">
                  {[1, 2, 3, 4, 5].map(m => (
                    <button
                      key={m}
                      role="radio"
                      aria-checked={mood === m}
                      aria-label={MOOD_LABELS[m]}
                      onClick={() => setMood(m)}
                      data-testid={`button-mood-${m}`}
                      className={[
                        "flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        mood === m
                          ? `border-primary ${MOOD_COLORS[m]} shadow-md`
                          : "border-border hover:border-primary/50",
                      ].join(' ')}
                    >
                      <span className="text-2xl" role="img" aria-hidden="true">
                        {MOOD_LABELS[m].split(' ')[0]}
                      </span>
                      <span className="text-xs text-center leading-tight">
                        {MOOD_LABELS[m].split(' ').slice(1).join(' ')}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Symptoms today</h3>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_SYMPTOMS.map(symptom => (
                      <button
                        key={symptom}
                        onClick={() => toggleSymptom(symptom)}
                        data-testid={`button-symptom-${symptom.toLowerCase().replace(/\s+/g, '-')}`}
                        className={[
                          "px-3 py-1.5 rounded-full text-sm border transition-all",
                          selectedSymptoms.includes(symptom)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:border-primary/50 text-muted-foreground",
                        ].join(' ')}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSymptom}
                      onChange={e => setCustomSymptom(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addCustomSymptom(); }}
                      placeholder="Add custom symptom..."
                      className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      data-testid="input-custom-symptom"
                    />
                    <Button variant="outline" size="sm" onClick={addCustomSymptom} data-testid="button-add-symptom">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {selectedSymptoms.filter(s => !COMMON_SYMPTOMS.includes(s)).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedSymptoms.filter(s => !COMMON_SYMPTOMS.includes(s)).map(s => (
                        <Badge key={s} variant="secondary" className="gap-1">
                          {s}
                          <button onClick={() => toggleSymptom(s)} aria-label={`Remove ${s}`}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pain Level (0-10)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={painLevel ?? 0}
                        onChange={e => setPainLevel(Number(e.target.value))}
                        className="flex-1"
                        aria-label="Pain level slider 0 to 10"
                        data-testid="slider-pain-level"
                      />
                      <span className="font-bold text-lg w-8 text-center" data-testid="text-pain-level">
                        {painLevel ?? "—"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setPainLevel(null)}
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Energy Level (1-10)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={energyLevel ?? 1}
                        onChange={e => setEnergyLevel(Number(e.target.value))}
                        className="flex-1"
                        aria-label="Energy level slider 1 to 10"
                        data-testid="slider-energy-level"
                      />
                      <span className="font-bold text-lg w-8 text-center" data-testid="text-energy-level">
                        {energyLevel ?? "—"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setEnergyLevel(null)}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="journal-notes" className="text-sm font-medium">Notes</label>
                  <Textarea
                    id="journal-notes"
                    placeholder="How was your day? What helped? What was hard?"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={4}
                    data-testid="textarea-journal-notes"
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={!mood || saveMutation.isPending}
                  className="w-full"
                  data-testid="button-save-journal"
                >
                  {entry ? "Update Entry" : "Save Entry"}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {viewMode === 'history' && (
          <div className="space-y-4">
            {history.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No journal entries yet. Start tracking your health today!</p>
                  <Button className="mt-4" onClick={() => setViewMode('edit')} data-testid="button-start-journaling">
                    Log Your First Entry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              history.map(h => (
                <Card
                  key={h.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => { setCurrentDate(h.date); setViewMode('edit'); }}
                  data-testid={`card-journal-${h.id}`}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl shrink-0 ${MOOD_COLORS[h.mood]}`}>
                        {MOOD_LABELS[h.mood].split(' ')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold">{formatDate(h.date)}</p>
                          <span className="text-sm text-muted-foreground shrink-0">
                            {MOOD_LABELS[h.mood].split(' ').slice(1).join(' ')}
                          </span>
                        </div>
                        {h.symptoms && h.symptoms.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {h.symptoms.slice(0, 4).map(s => (
                              <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                            ))}
                            {h.symptoms.length > 4 && (
                              <Badge variant="outline" className="text-xs">+{h.symptoms.length - 4} more</Badge>
                            )}
                          </div>
                        )}
                        {h.notes && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">{h.notes}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
