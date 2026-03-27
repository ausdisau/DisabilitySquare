import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Building2, CalendarDays, Route, UserPlus, Check, MapPin, Clock,
  Accessibility, Wifi, ChevronRight, Loader2, Star, AlertTriangle, Bus,
} from "lucide-react";
import { SEO } from "@/components/SEO";

// Types
interface SuggestedUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  profile: {
    bio: string | null;
    location: string | null;
    diagnosis: string | null;
    interests: string[];
  } | null;
  sharedGroupCount: number;
}

interface ServiceProvider {
  id: number;
  name: string;
  category: string;
  description: string;
  location: string;
  state: string;
  ndisRegistered: boolean;
  disabilityTypes: string[];
}

interface TransportProvider {
  id: number;
  name: string;
  kind: string;
  ndisSupport: boolean;
  adaptations: string[];
}

interface Venue {
  id: number;
  name: string;
  suburb: string;
  state: string;
  isOnline: boolean;
  accessibilityFeatures: string[];
}

interface DiscoverEvent {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string | null;
  category: string;
  tags: string[];
  accessibilityNotes: string | null;
  maxAttendees: number | null;
  isOnline: boolean;
  meetingLink: string | null;
  venue: Venue | null;
  attendeeCount: number;
}

interface JourneyOptions {
  event: DiscoverEvent | undefined;
  venue: Venue | undefined;
  serviceProviders: ServiceProvider[];
  transportProviders: (TransportProvider & { compatibleVehicleCount: number })[];
  accessibilityWarnings: string[];
}

interface PlannedJourney {
  id: number;
  eventId: number;
  status: string;
  supportNeeds: string[];
  notes: string | null;
  createdAt: string;
  event: { id: number; title: string; startTime: string } | null;
  serviceProvider: { id: number; name: string; location: string; state: string } | null;
  transportProvider: { id: number; name: string; kind: string } | null;
}

const FEATURE_LABELS: Record<string, string> = {
  ramp: "Ramp",
  lift: "Lift",
  hearing_loop: "Hearing Loop",
  accessible_bathroom: "Accessible Bathroom",
  quiet_room: "Quiet Room",
  braille: "Braille",
  auslan: "Auslan",
};

const CATEGORY_LABELS: Record<string, string> = {
  social: "Social",
  sport: "Sport",
  art: "Arts & Craft",
  health: "Health",
  education: "Education",
  support_group: "Support Group",
  other: "Other",
};

const SUPPORT_NEEDS = [
  { value: "personal_care", label: "Personal Care" },
  { value: "communication", label: "Communication Support" },
  { value: "transport", label: "Transport Assistance" },
  { value: "behaviour", label: "Behaviour Support" },
  { value: "nursing", label: "Nursing Support" },
];

function formatDateTime(dt: string) {
  const d = new Date(dt);
  return d.toLocaleString("en-AU", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// People Panel
function PeoplePanel() {
  const { toast } = useToast();

  const { data: suggestions = [], isLoading } = useQuery<SuggestedUser[]>({
    queryKey: ["/api/graph/connections"],
  });

  const { data: following = [] } = useQuery<{ followingId: string }[]>({
    queryKey: ["/api/connections/following"],
  });

  const followingIds = new Set(following.map((f) => f.followingId));

  const followMutation = useMutation({
    mutationFn: (userId: string) => apiRequest("POST", `/api/connections/follow/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections/following"] });
      queryClient.invalidateQueries({ queryKey: ["/api/graph/connections"] });
      toast({ title: "Connected!", description: "You are now following this person." });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!suggestions.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>No suggestions yet.</p>
        <p className="text-sm mt-1">Join some groups or update your profile to get connection suggestions.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {suggestions.map((person) => {
        const isFollowing = followingIds.has(person.id);
        const name = [person.firstName, person.lastName].filter(Boolean).join(" ") || "Community Member";
        const initials = [person.firstName?.[0], person.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";
        return (
          <div className="sm-card flex flex-col" key={person.id} data-testid={`card-person-${person.id}`}>
            <div className="sm-card-body flex-1">
              <div className="flex items-start gap-3">
                <Avatar className="h-11 w-11 shrink-0">
                  <AvatarImage src={person.profileImageUrl || undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" data-testid={`text-person-name-${person.id}`}>{name}</p>
                  {person.profile?.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />{person.profile.location}
                    </p>
                  )}
                  {person.profile?.diagnosis && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{person.profile.diagnosis}</p>
                  )}
                  {person.sharedGroupCount > 0 && (
                    <Badge variant="secondary" className="mt-1 text-[10px]">
                      {person.sharedGroupCount} shared group{person.sharedGroupCount !== 1 ? "s" : ""}
                    </Badge>
                  )}
                  {person.profile?.interests && (person.profile.interests as string[]).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(person.profile.interests as string[]).slice(0, 3).map((interest: string) => (
                        <Badge key={interest} variant="outline" className="text-[10px] px-1 py-0">{interest}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant={isFollowing ? "outline" : "default"}
                className="mt-3 w-full"
                disabled={isFollowing || followMutation.isPending}
                onClick={() => followMutation.mutate(person.id)}
                data-testid={`button-follow-${person.id}`}
              >
                {isFollowing ? (
                  <><Check className="h-3.5 w-3.5 mr-1" />Following</>
                ) : (
                  <><UserPlus className="h-3.5 w-3.5 mr-1" />Connect</>
                )}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Services Panel
function ServicesPanel() {
  const { toast } = useToast();

  const { data: services = [], isLoading } = useQuery<ServiceProvider[]>({
    queryKey: ["/api/graph/services"],
  });

  const { data: affinities = [] } = useQuery<{ serviceProviderId: number }[]>({
    queryKey: ["/api/affinities"],
  });

  const savedIds = new Set(affinities.map((a) => a.serviceProviderId));

  const saveMutation = useMutation({
    mutationFn: (providerId: number) => apiRequest("POST", "/api/affinities", { serviceProviderId: providerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affinities"] });
      toast({ title: "Saved!", description: "Provider added to your trusted network." });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!services.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>No matched services yet.</p>
        <p className="text-sm mt-1">Update your profile with your diagnosis and location to get personalised recommendations.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {services.map((provider) => {
        const isSaved = savedIds.has(provider.id);
        return (
          <div className="sm-card flex flex-col" key={provider.id} data-testid={`card-service-${provider.id}`}>
            <div className="sm-card-body flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm leading-snug" data-testid={`text-service-name-${provider.id}`}>{provider.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{provider.location}, {provider.state}</p>
                </div>
                {provider.ndisRegistered && (
                  <Badge variant="secondary" className="text-[10px] shrink-0">NDIS</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{provider.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {(provider.disabilityTypes as string[]).slice(0, 3).map((t: string) => (
                  <Badge key={t} variant="outline" className="text-[10px] px-1 py-0">{t}</Badge>
                ))}
              </div>
              <Button
                size="sm"
                variant={isSaved ? "outline" : "default"}
                className="mt-3 w-full"
                disabled={isSaved || saveMutation.isPending}
                onClick={() => saveMutation.mutate(provider.id)}
                data-testid={`button-save-service-${provider.id}`}
              >
                {isSaved ? (
                  <><Check className="h-3.5 w-3.5 mr-1" />Saved</>
                ) : (
                  <><Star className="h-3.5 w-3.5 mr-1" />Save Provider</>
                )}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Events Panel
function EventsPanel({ onPlanJourney }: { onPlanJourney: (eventId: number) => void }) {
  const { toast } = useToast();

  const { data: events = [], isLoading } = useQuery<DiscoverEvent[]>({
    queryKey: ["/api/graph/events"],
  });

  const { data: rsvps = [] } = useQuery<{ eventId: number; status: string }[]>({
    queryKey: ["/api/events/rsvps/mine"],
  });

  const rsvpMap: Record<number, string> = {};
  rsvps.forEach((r) => { rsvpMap[r.eventId] = r.status; });

  const rsvpMutation = useMutation({
    mutationFn: ({ eventId, status }: { eventId: number; status: string }) =>
      apiRequest("POST", `/api/events/${eventId}/rsvp`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events/rsvps/mine"] });
      toast({ title: "RSVP updated!", description: "Your response has been saved." });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>No upcoming events found.</p>
        <p className="text-sm mt-1">Join groups and update your interests to discover relevant events.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {events.map((event) => {
        const myRsvp = rsvpMap[event.id];
        const features = event.venue?.accessibilityFeatures as string[] | undefined;
        return (
          <div className="sm-card" key={event.id} data-testid={`card-event-${event.id}`}>
            <div className="sm-card-body">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm" data-testid={`text-event-title-${event.id}`}>{event.title}</p>
                    <Badge variant="outline" className="text-[10px]">{CATEGORY_LABELS[event.category] || event.category}</Badge>
                    {event.isOnline && (
                      <Badge variant="secondary" className="text-[10px]">
                        <Wifi className="h-3 w-3 mr-0.5" />Online
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />{formatDateTime(event.startTime)}
                  </div>
                  {event.venue && !event.isOnline && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {event.venue.name}, {event.venue.suburb} {event.venue.state}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{event.description}</p>
                  {event.accessibilityNotes && (
                    <p className="text-xs text-primary mt-1 flex items-center gap-1">
                      <Accessibility className="h-3 w-3" />{event.accessibilityNotes}
                    </p>
                  )}
                  {features && features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {features.slice(0, 4).map((f: string) => (
                        <Badge key={f} variant="outline" className="text-[10px] px-1 py-0">
                          {FEATURE_LABELS[f] || f}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {event.attendeeCount} going
                    {event.maxAttendees && ` · ${event.maxAttendees - event.attendeeCount} spots left`}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Button
                  size="sm"
                  variant={myRsvp === "going" ? "default" : "outline"}
                  disabled={rsvpMutation.isPending}
                  onClick={() => rsvpMutation.mutate({ eventId: event.id, status: "going" })}
                  data-testid={`button-rsvp-going-${event.id}`}
                >
                  {myRsvp === "going" ? <><Check className="h-3 w-3 mr-1" />Going</> : "I'm Going"}
                </Button>
                <Button
                  size="sm"
                  variant={myRsvp === "interested" ? "secondary" : "ghost"}
                  disabled={rsvpMutation.isPending}
                  onClick={() => rsvpMutation.mutate({ eventId: event.id, status: "interested" })}
                  data-testid={`button-rsvp-interested-${event.id}`}
                >
                  Interested
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto text-xs"
                  onClick={() => onPlanJourney(event.id)}
                  data-testid={`button-plan-journey-${event.id}`}
                >
                  <Route className="h-3.5 w-3.5 mr-1" />Plan Journey
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Journey Wizard — 5 steps
type WizardStep = "select-event" | "support-needs" | "select-service" | "select-transport" | "confirm";

const WIZARD_STEP_ORDER: WizardStep[] = ["select-event", "support-needs", "select-service", "select-transport", "confirm"];

const STEP_TITLES: Record<WizardStep, string> = {
  "select-event": "Step 1 — Choose an activity",
  "support-needs": "Step 2 — What support do you need?",
  "select-service": "Step 3 — Find a support provider",
  "select-transport": "Step 4 — Book accessible transport",
  "confirm": "Step 5 — Confirm your journey plan",
};

function JourneyWizard({
  initialEventId,
  onClose,
}: {
  initialEventId?: number;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState<WizardStep>(initialEventId ? "support-needs" : "select-event");
  const [selectedEventId, setSelectedEventId] = useState<number | undefined>(initialEventId);
  const [selectedSupportNeeds, setSelectedSupportNeeds] = useState<string[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | undefined>();
  const [selectedTransportId, setSelectedTransportId] = useState<number | undefined>();

  const prevStep = () => {
    const idx = WIZARD_STEP_ORDER.indexOf(step);
    if (idx > 0) setStep(WIZARD_STEP_ORDER[idx - 1]);
  };

  const nextStep = () => {
    const idx = WIZARD_STEP_ORDER.indexOf(step);
    if (idx < WIZARD_STEP_ORDER.length - 1) setStep(WIZARD_STEP_ORDER[idx + 1]);
  };

  const { data: allEvents = [], isLoading: eventsLoading } = useQuery<DiscoverEvent[]>({
    queryKey: ["/api/events"],
    enabled: step === "select-event",
  });

  const { data: options, isLoading: optionsLoading } = useQuery<JourneyOptions>({
    queryKey: ["/api/graph/journey-options", selectedEventId],
    queryFn: async () => {
      const res = await fetch(`/api/graph/journey-options/${selectedEventId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load journey options");
      return res.json();
    },
    enabled: !!selectedEventId && (step === "select-service" || step === "select-transport" || step === "confirm"),
  });

  const createJourneyMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/journeys", {
      eventId: selectedEventId,
      serviceProviderId: selectedServiceId ?? null,
      transportProviderId: selectedTransportId ?? null,
      supportNeeds: selectedSupportNeeds,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journeys"] });
      toast({ title: "Journey planned!", description: "Your participation journey has been saved." });
      onClose();
    },
    onError: (e: any) => {
      toast({ title: "Error saving journey", description: e.message, variant: "destructive" });
    },
  });

  const selectedEvent = allEvents.find((e) => e.id === selectedEventId) ?? options?.event as DiscoverEvent | undefined;

  const toggleSupportNeed = (need: string) => {
    setSelectedSupportNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  const selectedService = options?.serviceProviders?.find((p) => p.id === selectedServiceId);
  const selectedTransport = options?.transportProviders?.find((t) => t.id === selectedTransportId);
  const hasTransportNeed = selectedSupportNeeds.includes("transport");

  return (
    <div className="sm-card mt-2" data-testid="card-journey-wizard">
      <div className="px-4 pt-3 pb-2 border-b border-border/60 bg-primary/5">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm text-primary">{STEP_TITLES[step]}</p>
          <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-wizard">Close</Button>
        </div>
        <div className="flex gap-1 mt-2">
          {WIZARD_STEP_ORDER.map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                WIZARD_STEP_ORDER.indexOf(s) <= WIZARD_STEP_ORDER.indexOf(step)
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="sm-card-body">
        {step === "select-event" && (
          <div className="space-y-2">
            {eventsLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : allEvents.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming events found.</p>
            ) : (
              allEvents.map((event) => (
                <button
                  key={event.id}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    selectedEventId === event.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedEventId(event.id)}
                  data-testid={`button-wizard-select-event-${event.id}`}
                >
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(event.startTime)}</p>
                  {event.venue && <p className="text-xs text-muted-foreground">{event.venue.name}, {event.venue.suburb}</p>}
                </button>
              ))
            )}
            <Button
              className="w-full mt-2"
              disabled={!selectedEventId}
              onClick={nextStep}
              data-testid="button-wizard-next-support"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {step === "support-needs" && (
          <div className="space-y-3">
            {selectedEvent && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium">{selectedEvent.title}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{formatDateTime(selectedEvent.startTime)}</p>
                {selectedEvent.venue && !selectedEvent.isOnline && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <Accessibility className="h-3 w-3 inline mr-1" />
                    Venue accessibility: {
                      (selectedEvent.venue.accessibilityFeatures as string[]).map((f: string) => FEATURE_LABELS[f] || f).join(", ") || "Not specified"
                    }
                  </p>
                )}
              </div>
            )}
            <p className="text-sm text-muted-foreground">Select the supports you will need to attend:</p>
            <div className="grid gap-2">
              {SUPPORT_NEEDS.map((need) => {
                const selected = selectedSupportNeeds.includes(need.value);
                return (
                  <button
                    key={need.value}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      selected ? "border-primary bg-primary/5 font-medium" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => toggleSupportNeed(need.value)}
                    data-testid={`button-support-need-${need.value}`}
                  >
                    {selected && <Check className="h-4 w-4 text-primary shrink-0" />}
                    {need.label}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" onClick={prevStep} data-testid="button-wizard-back-1">Back</Button>
              <Button className="flex-1" onClick={nextStep} data-testid="button-wizard-next-service">
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === "select-service" && (
          <div className="space-y-3">
            {optionsLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : (
              <>
                {options?.accessibilityWarnings && options.accessibilityWarnings.length > 0 && (
                  <Alert variant="destructive" className="py-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Accessibility notice:</strong>
                      <ul className="list-disc ml-4 mt-1 space-y-0.5">
                        {options.accessibilityWarnings.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                {selectedSupportNeeds.length === 0 && (
                  <p className="text-sm text-muted-foreground">You have not selected any support needs — you can skip this step.</p>
                )}
                {(options?.serviceProviders || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No matched service providers found for your profile.</p>
                ) : (
                  (options?.serviceProviders || []).map((provider) => (
                    <button
                      key={provider.id}
                      className={`w-full text-left rounded-lg border p-3 transition-colors ${
                        selectedServiceId === provider.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedServiceId(selectedServiceId === provider.id ? undefined : provider.id)}
                      data-testid={`button-wizard-select-service-${provider.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{provider.name}</p>
                        <div className="flex items-center gap-1">
                          {selectedServiceId === provider.id && <Check className="h-4 w-4 text-primary" />}
                          {provider.ndisRegistered && <Badge variant="secondary" className="text-[10px]">NDIS</Badge>}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{provider.location}, {provider.state}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{provider.description}</p>
                    </button>
                  ))
                )}
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" onClick={prevStep} data-testid="button-wizard-back-2">Back</Button>
                  <Button className="flex-1" onClick={nextStep} data-testid="button-wizard-next-transport">
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {step === "select-transport" && (
          <div className="space-y-3">
            {optionsLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : (
              <>
                {options?.accessibilityWarnings && options.accessibilityWarnings.length > 0 && (
                  <Alert variant="destructive" className="py-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Accessibility notice:</strong>
                      <ul className="list-disc ml-4 mt-1 space-y-0.5">
                        {options.accessibilityWarnings.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                {!hasTransportNeed && (
                  <p className="text-sm text-muted-foreground">You did not select transport as a need — you can skip this step or select an option below.</p>
                )}
                {(options?.transportProviders || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No accessible transport providers found in your area.</p>
                ) : (
                  (options?.transportProviders || []).map((provider) => (
                    <button
                      key={provider.id}
                      className={`w-full text-left rounded-lg border p-3 transition-colors ${
                        selectedTransportId === provider.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedTransportId(selectedTransportId === provider.id ? undefined : provider.id)}
                      data-testid={`button-wizard-select-transport-${provider.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bus className="h-4 w-4 text-muted-foreground shrink-0" />
                          <p className="font-medium text-sm">{provider.name}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {selectedTransportId === provider.id && <Check className="h-4 w-4 text-primary" />}
                          {provider.ndisSupport && <Badge variant="secondary" className="text-[10px]">NDIS</Badge>}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">{provider.kind?.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {provider.compatibleVehicleCount > 0
                          ? `${provider.compatibleVehicleCount} accessible vehicle${provider.compatibleVehicleCount !== 1 ? "s" : ""} available`
                          : "No accessible vehicles currently available"
                        }
                      </p>
                    </button>
                  ))
                )}
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" onClick={prevStep} data-testid="button-wizard-back-3">Back</Button>
                  <Button className="flex-1" onClick={nextStep} data-testid="button-wizard-next-confirm">
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-3">
            {options?.accessibilityWarnings && options.accessibilityWarnings.length > 0 && (
              <Alert className="py-2 border-amber-500 bg-amber-50 dark:bg-amber-950">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>Please note:</strong> Some of your access needs may not be fully met at this venue.
                  <ul className="list-disc ml-4 mt-1 space-y-0.5">
                    {options.accessibilityWarnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                  Confirm only if you are comfortable proceeding.
                </AlertDescription>
              </Alert>
            )}
            <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
              <p className="font-semibold">Journey Summary</p>
              {selectedEvent && (
                <div>
                  <span className="text-muted-foreground">Activity: </span>
                  {selectedEvent.title} — {formatDateTime(selectedEvent.startTime)}
                </div>
              )}
              {selectedEvent?.venue && !selectedEvent.isOnline && (
                <div>
                  <span className="text-muted-foreground">Venue: </span>
                  {selectedEvent.venue.name}, {selectedEvent.venue.suburb} {selectedEvent.venue.state}
                </div>
              )}
              {selectedSupportNeeds.length > 0 ? (
                <div>
                  <span className="text-muted-foreground">Support needs: </span>
                  {selectedSupportNeeds.map((n) => SUPPORT_NEEDS.find((s) => s.value === n)?.label || n).join(", ")}
                </div>
              ) : (
                <div className="text-muted-foreground">No support needs selected.</div>
              )}
              {selectedService ? (
                <div>
                  <span className="text-muted-foreground">Support provider: </span>
                  {selectedService.name} ({selectedService.location}, {selectedService.state})
                </div>
              ) : (
                <div className="text-muted-foreground">No support provider selected.</div>
              )}
              {selectedTransport ? (
                <div>
                  <span className="text-muted-foreground">Transport: </span>
                  {selectedTransport.name}
                  {selectedTransport.ndisSupport && " (NDIS supported)"}
                </div>
              ) : (
                <div className="text-muted-foreground">No transport booked.</div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={prevStep} data-testid="button-wizard-back-4">Back</Button>
              <Button
                className="flex-1"
                disabled={!selectedEventId || createJourneyMutation.isPending}
                onClick={() => createJourneyMutation.mutate()}
                data-testid="button-wizard-confirm"
              >
                {createJourneyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : "Confirm Journey Plan"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Journey Panel — receives optional pre-selected event id
function JourneyPanel({ initialEventId, onEventConsumed }: { initialEventId?: number; onEventConsumed: () => void }) {
  const [wizardOpen, setWizardOpen] = useState(!!initialEventId);
  const [wizardEventId, setWizardEventId] = useState<number | undefined>(initialEventId);

  const { data: journeys = [], isLoading } = useQuery<PlannedJourney[]>({
    queryKey: ["/api/journeys"],
  });

  const openWizard = (eventId?: number) => {
    setWizardEventId(eventId);
    setWizardOpen(true);
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setWizardEventId(undefined);
    onEventConsumed();
  };

  return (
    <div>
      {!wizardOpen && (
        <div className="mb-4">
          <Button onClick={() => openWizard()} data-testid="button-start-journey-wizard">
            <Route className="h-4 w-4 mr-2" />Plan a New Journey
          </Button>
        </div>
      )}

      {wizardOpen && (
        <JourneyWizard
          initialEventId={wizardEventId}
          onClose={closeWizard}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : journeys.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Route className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No journeys planned yet.</p>
          <p className="text-sm mt-1">Use the wizard above to plan your first participation journey.</p>
        </div>
      ) : (
        <div className="grid gap-3 mt-4">
          {journeys.map((journey) => (
            <div className="sm-card" key={journey.id} data-testid={`card-journey-${journey.id}`}>
              <div className="sm-card-body">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{journey.event?.title || "Event"}</p>
                    {journey.event?.startTime && (
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(journey.event.startTime)}</p>
                    )}
                    {journey.serviceProvider && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Support: {journey.serviceProvider.name}
                      </p>
                    )}
                    {journey.transportProvider && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Transport: {journey.transportProvider.name}
                      </p>
                    )}
                    {(journey.supportNeeds as string[]).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(journey.supportNeeds as string[]).map((n: string) => (
                          <Badge key={n} variant="outline" className="text-[10px] px-1 py-0">
                            {SUPPORT_NEEDS.find((s) => s.value === n)?.label || n}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Badge
                    variant={journey.status === "confirmed" ? "default" : journey.status === "completed" ? "secondary" : "outline"}
                    className="text-[10px] shrink-0 capitalize"
                    data-testid={`status-journey-${journey.id}`}
                  >
                    {journey.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Discover() {
  const [activeTab, setActiveTab] = useState("people");
  const [journeyEventId, setJourneyEventId] = useState<number | undefined>();

  const handlePlanJourney = (eventId: number) => {
    setJourneyEventId(eventId);
    setActiveTab("journey");
  };

  return (
    <Layout>
      <SEO
        title="Discover & Participate — DisabilitySquare"
        description="Find people, services, events and plan your participation journey in the DisabilitySquare community."
      />
      <div className="max-w-2xl">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-foreground" data-testid="text-discover-heading">Discover & Participate</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Personalised connections, services, events and journey planning — all in one place.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4 mb-6" data-testid="tabs-discover">
            <TabsTrigger value="people" data-testid="tab-people">
              <Users className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">People</span>
            </TabsTrigger>
            <TabsTrigger value="services" data-testid="tab-services">
              <Building2 className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger value="events" data-testid="tab-events">
              <CalendarDays className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
            <TabsTrigger value="journey" data-testid="tab-journey">
              <Route className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Journey</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="people">
            <PeoplePanel />
          </TabsContent>

          <TabsContent value="services">
            <ServicesPanel />
          </TabsContent>

          <TabsContent value="events">
            <EventsPanel onPlanJourney={handlePlanJourney} />
          </TabsContent>

          <TabsContent value="journey">
            <JourneyPanel
              initialEventId={journeyEventId}
              onEventConsumed={() => setJourneyEventId(undefined)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
