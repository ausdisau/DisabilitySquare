import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bus,
  Car,
  Phone,
  Globe,
  Search,
  Plus,
  MapPin,
  CheckCircle,
  Wheelchair,
  Clock,
  CalendarDays,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { TransportProvider, TripRequest } from "@shared/schema";

const STATES = ["National", "NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

const TRANSPORT_TYPES: Record<string, { label: string; color: string }> = {
  public_transport: { label: "Public Transport", color: "bg-blue-100 text-blue-800" },
  taxi: { label: "Taxi / Hire Car", color: "bg-yellow-100 text-yellow-800" },
  rideshare: { label: "Rideshare", color: "bg-purple-100 text-purple-800" },
  community_transport: { label: "Community Transport", color: "bg-green-100 text-green-800" },
  ndis_transport: { label: "NDIS Transport", color: "bg-orange-100 text-orange-800" },
};

const FEATURE_LABELS: Record<string, string> = {
  ramp: "Ramp",
  hoist: "Hoist / Lift",
  trained_driver: "Trained Driver",
  door_to_door: "Door-to-Door",
  advance_booking: "Advance Booking",
  companion_seat: "Companion Seat",
  oxygen_friendly: "Oxygen-Friendly Vehicle",
  assistance_dogs: "Assistance Dogs Welcome",
};

const submitProviderSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Please write a short description"),
  type: z.string().min(1, "Please select a type"),
  state: z.string().min(1, "Please select a state"),
  phone: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  isNdisRegistered: z.boolean().default(false),
  isWheelchairAccessible: z.boolean().default(false),
  acceptsCompanionCard: z.boolean().default(false),
  isNdisTransportFunded: z.boolean().default(false),
  features: z.array(z.string()).default([]),
});

const tripRequestSchema = z.object({
  fromLocation: z.string().min(2, "From location is required"),
  toLocation: z.string().min(2, "To location is required"),
  state: z.string().min(1, "Please select a state"),
  date: z.string().min(1, "Date is required"),
  needsWheelchairAccess: z.boolean().default(false),
  needsCompanion: z.boolean().default(false),
  isNdisFunded: z.boolean().default(false),
  notes: z.string().optional(),
});

function ProviderCard({ provider }: { provider: TransportProvider }) {
  const [expanded, setExpanded] = useState(false);
  const typeInfo = TRANSPORT_TYPES[provider.type] || { label: provider.type, color: "bg-gray-100 text-gray-800" };

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`card-transport-${provider.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold text-[#1B4B8A] text-base" data-testid={`text-provider-name-${provider.id}`}>
                {provider.name}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeInfo.color}`}>
                {typeInfo.label}
              </span>
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{provider.state}</span>
            </div>

            <p className="text-sm text-gray-700 line-clamp-2">{provider.description}</p>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {provider.isWheelchairAccessible && (
                <Badge variant="secondary" className="text-xs bg-teal-50 text-teal-700 border-teal-200">
                  ♿ Wheelchair Accessible
                </Badge>
              )}
              {provider.acceptsCompanionCard && (
                <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  Companion Card
                </Badge>
              )}
              {provider.isNdisRegistered && (
                <Badge variant="secondary" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                  NDIS Registered
                </Badge>
              )}
              {provider.isNdisTransportFunded && (
                <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                  NDIS Transport Funded
                </Badge>
              )}
            </div>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t space-y-2">
            {(provider.features ?? []).length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Features</p>
                <div className="flex flex-wrap gap-1">
                  {(provider.features ?? []).map(f => (
                    <span key={f} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {FEATURE_LABELS[f] ?? f}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-3 text-sm">
              {provider.phone && (
                <a href={`tel:${provider.phone}`} className="flex items-center gap-1 text-[#1B4B8A] hover:underline" data-testid={`link-phone-${provider.id}`}>
                  <Phone className="w-3.5 h-3.5" /> {provider.phone}
                </a>
              )}
              {provider.website && (
                <a href={provider.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#1B4B8A] hover:underline" data-testid={`link-website-${provider.id}`}>
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              )}
              {provider.email && (
                <a href={`mailto:${provider.email}`} className="flex items-center gap-1 text-[#1B4B8A] hover:underline">
                  Email
                </a>
              )}
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full text-xs text-gray-500 hover:text-[#1B4B8A]"
          onClick={() => setExpanded(!expanded)}
          data-testid={`button-expand-${provider.id}`}
          aria-expanded={expanded}
        >
          {expanded ? <><ChevronUp className="w-3 h-3 mr-1" /> Less</> : <><ChevronDown className="w-3 h-3 mr-1" /> More details</>}
        </Button>
      </CardContent>
    </Card>
  );
}

function SubmitProviderDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof submitProviderSchema>>({
    resolver: zodResolver(submitProviderSchema),
    defaultValues: {
      name: "", description: "", type: "", state: "",
      phone: "", website: "", email: "",
      isNdisRegistered: false, isWheelchairAccessible: false,
      acceptsCompanionCard: false, isNdisTransportFunded: false,
      features: [],
    },
  });

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof submitProviderSchema>) =>
      apiRequest("POST", "/api/transport", data),
    onSuccess: () => {
      toast({ title: "Provider submitted", description: "It will appear once reviewed by our team." });
      form.reset();
      setOpen(false);
    },
    onError: () => toast({ title: "Error", description: "Could not submit provider.", variant: "destructive" }),
  });

  const allFeatures = Object.keys(FEATURE_LABELS);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#E07830] hover:bg-[#c96a28] text-white" data-testid="button-submit-provider">
          <Plus className="w-4 h-4 mr-1" /> Submit Provider
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit a Transport Provider</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(d => mutation.mutate(d))} className="space-y-3">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Provider Name</FormLabel>
                <FormControl><Input {...field} data-testid="input-provider-name" /></FormControl>
                <FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem><FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger data-testid="select-provider-type"><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {Object.entries(TRANSPORT_TYPES).map(([v, { label }]) => (
                        <SelectItem key={v} value={v}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="state" render={({ field }) => (
                <FormItem><FormLabel>State</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger data-testid="select-provider-state"><SelectValue placeholder="Select state" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel>
                <FormControl><Textarea {...field} rows={3} data-testid="textarea-provider-description" /></FormControl>
                <FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone (optional)</FormLabel>
                  <FormControl><Input {...field} data-testid="input-provider-phone" /></FormControl>
                  <FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="website" render={({ field }) => (
                <FormItem><FormLabel>Website (optional)</FormLabel>
                  <FormControl><Input {...field} placeholder="https://" data-testid="input-provider-website" /></FormControl>
                  <FormMessage /></FormItem>
              )} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Accessibility</p>
              {[
                { name: "isWheelchairAccessible" as const, label: "Wheelchair accessible vehicles" },
                { name: "acceptsCompanionCard" as const, label: "Accepts Companion Card" },
                { name: "isNdisRegistered" as const, label: "NDIS registered provider" },
                { name: "isNdisTransportFunded" as const, label: "Can use NDIS transport funding" },
              ].map(({ name, label }) => (
                <FormField key={name} control={form.control} name={name} render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value as boolean} onCheckedChange={field.onChange}
                        data-testid={`checkbox-${name}`} />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">{label}</FormLabel>
                  </FormItem>
                )} />
              ))}
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Features</p>
              <div className="grid grid-cols-2 gap-1.5">
                {allFeatures.map(f => {
                  const checked = form.watch("features").includes(f);
                  return (
                    <label key={f} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={checked} onCheckedChange={c => {
                        const cur = form.getValues("features");
                        form.setValue("features", c ? [...cur, f] : cur.filter(x => x !== f));
                      }} />
                      {FEATURE_LABELS[f]}
                    </label>
                  );
                })}
              </div>
            </div>
            <Button type="submit" disabled={mutation.isPending} className="w-full bg-[#1B4B8A] hover:bg-[#163d75] text-white" data-testid="button-submit-provider-form">
              {mutation.isPending ? "Submitting..." : "Submit for Review"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function TripRequestForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof tripRequestSchema>>({
    resolver: zodResolver(tripRequestSchema),
    defaultValues: {
      fromLocation: "", toLocation: "", state: "",
      date: new Date().toISOString().split("T")[0],
      needsWheelchairAccess: false, needsCompanion: false, isNdisFunded: false, notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof tripRequestSchema>) =>
      apiRequest("POST", "/api/transport/trips", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transport/my-trips"] });
      toast({ title: "Trip request logged", description: "We'll match you with accessible providers in your area." });
      form.reset();
      setOpen(false);
    },
    onError: () => toast({ title: "Error", description: "Could not log trip request.", variant: "destructive" }),
  });

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-[#1B4B8A] text-[#1B4B8A] hover:bg-[#1B4B8A] hover:text-white" data-testid="button-request-trip">
          <CalendarDays className="w-4 h-4 mr-1" /> Log a Trip Need
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log a Transport Need</DialogTitle>
          <p className="text-sm text-gray-500">We'll match you with accessible providers in your area.</p>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(d => mutation.mutate(d))} className="space-y-3">
            <FormField control={form.control} name="fromLocation" render={({ field }) => (
              <FormItem><FormLabel>From</FormLabel>
                <FormControl><Input {...field} placeholder="Suburb or address" data-testid="input-from-location" /></FormControl>
                <FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="toLocation" render={({ field }) => (
              <FormItem><FormLabel>To</FormLabel>
                <FormControl><Input {...field} placeholder="Suburb or address" data-testid="input-to-location" /></FormControl>
                <FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="state" render={({ field }) => (
                <FormItem><FormLabel>State</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger data-testid="select-trip-state"><SelectValue placeholder="State" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {STATES.filter(s => s !== "National").map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem><FormLabel>Date</FormLabel>
                  <FormControl><Input type="date" {...field} data-testid="input-trip-date" /></FormControl>
                  <FormMessage /></FormItem>
              )} />
            </div>
            <div className="space-y-2">
              {[
                { name: "needsWheelchairAccess" as const, label: "Need wheelchair-accessible vehicle" },
                { name: "needsCompanion" as const, label: "Travelling with a companion" },
                { name: "isNdisFunded" as const, label: "Using NDIS transport funding" },
              ].map(({ name, label }) => (
                <FormField key={name} control={form.control} name={name} render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl><Checkbox checked={field.value as boolean} onCheckedChange={field.onChange} data-testid={`checkbox-${name}`} /></FormControl>
                    <FormLabel className="font-normal cursor-pointer">{label}</FormLabel>
                  </FormItem>
                )} />
              ))}
            </div>
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem><FormLabel>Notes (optional)</FormLabel>
                <FormControl><Textarea {...field} rows={2} placeholder="Any special requirements..." data-testid="textarea-trip-notes" /></FormControl>
                <FormMessage /></FormItem>
            )} />
            <Button type="submit" disabled={mutation.isPending} className="w-full bg-[#1B4B8A] hover:bg-[#163d75] text-white" data-testid="button-submit-trip">
              {mutation.isPending ? "Saving..." : "Log Trip Need"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function MyTrips() {
  const { data: trips = [], isLoading } = useQuery<TripRequest[]>({
    queryKey: ["/api/transport/my-trips"],
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/transport/trips/${id}/cancel`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/transport/my-trips"] }),
  });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    matched: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-600",
  };

  if (isLoading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (trips.length === 0) return <p className="text-sm text-gray-500 text-center py-8">No trip requests yet. Use "Log a Trip Need" to get started.</p>;

  return (
    <div className="space-y-3">
      {trips.map(trip => (
        <Card key={trip.id} data-testid={`card-trip-${trip.id}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{trip.fromLocation} → {trip.toLocation}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[trip.status ?? "pending"]}`}>
                    {trip.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{trip.date}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{trip.state}</span>
                </div>
                <div className="flex gap-1.5 mt-1.5">
                  {trip.needsWheelchairAccess && <Badge variant="secondary" className="text-xs">♿ Wheelchair</Badge>}
                  {trip.needsCompanion && <Badge variant="secondary" className="text-xs">+Companion</Badge>}
                  {trip.isNdisFunded && <Badge variant="secondary" className="text-xs">NDIS Funded</Badge>}
                </div>
              </div>
              {trip.status === "pending" && (
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700"
                  onClick={() => cancelMutation.mutate(trip.id)}
                  disabled={cancelMutation.isPending}
                  data-testid={`button-cancel-trip-${trip.id}`}
                  aria-label="Cancel trip request">
                  <XCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
            {trip.notes && <p className="text-xs text-gray-500 mt-2 italic">{trip.notes}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Transport() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterWheelchair, setFilterWheelchair] = useState(false);
  const [filterCompanion, setFilterCompanion] = useState(false);
  const [filterNdis, setFilterNdis] = useState(false);

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (filterType) params.set("type", filterType);
  if (filterState) params.set("state", filterState);
  if (filterWheelchair) params.set("wheelchair", "true");
  if (filterCompanion) params.set("companion", "true");
  if (filterNdis) params.set("ndis", "true");

  const { data: providers = [], isLoading } = useQuery<TransportProvider[]>({
    queryKey: ["/api/transport", params.toString()],
    queryFn: () => fetch(`/api/transport?${params.toString()}`).then(r => r.json()),
  });

  const clearFilters = () => {
    setSearch("");
    setFilterType("");
    setFilterState("");
    setFilterWheelchair(false);
    setFilterCompanion(false);
    setFilterNdis(false);
  };

  const hasFilters = search || filterType || filterState || filterWheelchair || filterCompanion || filterNdis;

  return (
    <main className="max-w-4xl mx-auto px-4 py-6" aria-label="Transport Search and Booking">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4B8A]" data-testid="heading-transport">
            Accessible Transport
          </h1>
          <p className="text-gray-600 text-sm mt-1">Find accessible transport providers across Australia</p>
        </div>
        <div className="flex gap-2">
          {user && <TripRequestForm />}
          {user && <SubmitProviderDialog />}
        </div>
      </div>

      <Tabs defaultValue="directory">
        <TabsList className="mb-4" aria-label="Transport sections">
          <TabsTrigger value="directory" data-testid="tab-directory">
            <Bus className="w-4 h-4 mr-1.5" /> Provider Directory
          </TabsTrigger>
          {user && (
            <TabsTrigger value="my-trips" data-testid="tab-my-trips">
              <CalendarDays className="w-4 h-4 mr-1.5" /> My Trip Requests
            </TabsTrigger>
          )}
          <TabsTrigger value="info" data-testid="tab-info">
            <Info className="w-4 h-4 mr-1.5" /> NDIS Transport Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory">
          {/* Search + Filters */}
          <div className="bg-white rounded-xl border p-4 mb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Search transport providers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                data-testid="input-search-transport"
                aria-label="Search transport providers"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-44" data-testid="select-filter-type">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  {Object.entries(TRANSPORT_TYPES).map(([v, { label }]) => (
                    <SelectItem key={v} value={v}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterState} onValueChange={setFilterState}>
                <SelectTrigger className="w-36" data-testid="select-filter-state">
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All states</SelectItem>
                  {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none border rounded-md px-3 py-1.5 hover:bg-gray-50">
                <Checkbox checked={filterWheelchair} onCheckedChange={v => setFilterWheelchair(!!v)} data-testid="checkbox-filter-wheelchair" />
                ♿ Wheelchair
              </label>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none border rounded-md px-3 py-1.5 hover:bg-gray-50">
                <Checkbox checked={filterCompanion} onCheckedChange={v => setFilterCompanion(!!v)} data-testid="checkbox-filter-companion" />
                Companion Card
              </label>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none border rounded-md px-3 py-1.5 hover:bg-gray-50">
                <Checkbox checked={filterNdis} onCheckedChange={v => setFilterNdis(!!v)} data-testid="checkbox-filter-ndis" />
                NDIS Funded
              </label>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500" data-testid="button-clear-filters">
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse"><CardContent className="p-4 h-32 bg-gray-50" /></Card>
              ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Car className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No providers found</p>
              <p className="text-sm mt-1">Try adjusting your filters or submit a provider to help the community.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-3">{providers.length} provider{providers.length !== 1 ? "s" : ""} found</p>
              <div className="grid gap-3 sm:grid-cols-2" data-testid="list-providers">
                {providers.map(p => <ProviderCard key={p.id} provider={p} />)}
              </div>
            </>
          )}
        </TabsContent>

        {user && (
          <TabsContent value="my-trips">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1B4B8A]">My Trip Requests</h2>
              <TripRequestForm />
            </div>
            <MyTrips />
          </TabsContent>
        )}

        <TabsContent value="info">
          <div className="space-y-4">
            <Card className="border-l-4 border-l-[#E07830]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-[#1B4B8A]">NDIS Transport Supports</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <p>The NDIS can fund transport supports to help you get to work, education, community activities, and health appointments.</p>
                <p>Transport funding is included under <strong>Core Supports — Transport</strong> and is separate from other support categories.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Must be included in your NDIS plan</li>
                  <li>Reviewed annually at your plan review</li>
                  <li>Can pay for taxis, rideshare, community transport, or NDIS-registered providers</li>
                  <li>Self-managed or plan-managed participants have more flexibility</li>
                </ul>
                <a href="https://www.ndis.gov.au/participants/using-your-plan/transport" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#1B4B8A] underline font-medium mt-1">
                  <Globe className="w-3.5 h-3.5" /> Learn more on the NDIS website
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-[#1B4B8A]">Companion Card Program</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <p>The Companion Card entitles people with a disability who need a companion to attend activities to a second ticket at no extra cost.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Accepted by many public transport operators</li>
                  <li>Apply through your state/territory government</li>
                  <li>Free for the cardholder's companion on participating transport</li>
                </ul>
                <a href="https://www.companioncard.gov.au" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#1B4B8A] underline font-medium mt-1">
                  <Globe className="w-3.5 h-3.5" /> companioncard.gov.au
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-[#1B4B8A]">Community Transport</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <p>Community transport services provide affordable, door-to-door transport for people who cannot use public transport.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Subsidised by state governments and local councils</li>
                  <li>Often not NDIS registered but can use NDIS transport funding</li>
                  <li>Good option for medical appointments and social activities</li>
                  <li>Search by postcode at your local council website</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-[#1B4B8A]">Taxi Subsidy Schemes</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <p>Most Australian states have taxi subsidy or assistance schemes for people with disability who cannot use public transport.</p>
                <div className="grid sm:grid-cols-2 gap-1 text-xs">
                  {[
                    ["NSW", "Transport for NSW Taxi Transport Subsidy Scheme"],
                    ["VIC", "Multi Purpose Taxi Program (MPTP)"],
                    ["QLD", "Taxi Subsidy Scheme (TSS)"],
                    ["WA", "Taxi User Subsidy Scheme (TUSS)"],
                    ["SA", "Patient Assistance Transport Scheme (PATS)"],
                    ["TAS", "Community Passenger Networks"],
                    ["ACT", "Taxi Subsidy Scheme (ACT)"],
                  ].map(([state, scheme]) => (
                    <div key={state} className="flex gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-[#2A9D8F] shrink-0 mt-0.5" />
                      <span><strong>{state}:</strong> {scheme}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
