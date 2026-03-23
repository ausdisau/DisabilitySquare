import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Bus, MapPin, Clock, DollarSign, CheckCircle2, XCircle,
  ArrowRight, User, Users, Loader2, ChevronLeft, Star
} from "lucide-react";

const ACCESS_NEEDS = [
  { id: "wheelchair", label: "Wheelchair accessible" },
  { id: "ramp", label: "Ramp required" },
  { id: "driver_assistance", label: "Driver assistance" },
  { id: "low_sensory", label: "Low sensory environment" },
  { id: "no_stairs", label: "No stairs" },
];

const FUNDING_TYPES = [
  { value: "private", label: "Private (self-funded)" },
  { value: "ndis", label: "NDIS funding" },
  { value: "transport_allowance", label: "Transport allowance" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const VEHICLE_LABELS: Record<string, string> = {
  wheelchair_van: "Wheelchair Van",
  sedan: "Sedan",
  suv: "SUV",
  minibus: "Minibus",
};

function getSessionId(): string {
  let id = sessionStorage.getItem("transport_session_id");
  if (!id) {
    id = `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem("transport_session_id", id);
  }
  return id;
}

async function geocodeAddress(address: string): Promise<{ lat: string; lng: string } | null> {
  try {
    const query = encodeURIComponent(address + ", Australia");
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=au`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;
    return { lat: data[0].lat, lng: data[0].lon };
  } catch {
    return null;
  }
}

interface QuoteOption {
  providerId: number;
  providerName: string;
  vehicleType: string;
  etaMinutes: number;
  priceAud: number;
  ndisEligible: boolean;
  vehicleId: number;
}

interface QuoteResult {
  quoteId: number;
  distanceKm: number;
  durationMinutes: number;
  options: QuoteOption[];
  expiresAt: string;
}

interface BookingResult {
  tripId: number;
  referenceNumber: string;
  status: string;
  message?: string;
  pickupAddress: string;
  dropoffAddress: string;
  priceAud: number;
  providerName: string;
  vehicleType: string;
  etaMinutes: number;
}

interface Trip {
  id: number;
  pickupAddress: string;
  dropoffAddress: string;
  status: string;
  priceAud: string;
  externalRef?: string;
  createdAt: string;
  provider: { name: string; kind: string };
}

export default function Transport() {
  const { toast } = useToast();
  const sessionId = getSessionId();

  const [step, setStep] = useState<"search" | "results" | "confirmation">("search");
  const [activeTab, setActiveTab] = useState("book");

  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [accessNeeds, setAccessNeeds] = useState<string[]>([]);
  const [companionCount, setCompanionCount] = useState(0);
  const [fundingType, setFundingType] = useState("private");

  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  const { data: trips = [], isLoading: tripsLoading, refetch: refetchTrips } = useQuery<Trip[]>({
    queryKey: ["/api/transport/trips", sessionId],
    queryFn: () =>
      fetch(`/api/transport/trips?sessionId=${encodeURIComponent(sessionId)}`, { credentials: "include" })
        .then(r => r.json()),
  });

  const quoteMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/transport/quote", data),
    onSuccess: async (res) => {
      const data = await res.json();
      setQuoteResult(data);
      setStep("results");
      setSelectedOptionIndex(null);
    },
    onError: async (err: any) => {
      const msg = err?.message || "Failed to get quotes. Please try again.";
      toast({ title: "Quote failed", description: msg, variant: "destructive" });
    },
  });

  const bookMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/transport/trips", data),
    onSuccess: async (res) => {
      const data = await res.json();
      setBookingResult(data);
      setStep("confirmation");
      queryClient.invalidateQueries({ queryKey: ["/api/transport/trips", sessionId] });
    },
    onError: async (err: any) => {
      const msg = err?.message || "Booking failed. Please try again.";
      toast({ title: "Booking failed", description: msg, variant: "destructive" });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (tripId: number) => apiRequest("POST", `/api/transport/trips/${tripId}/cancel`, { sessionId }),
    onSuccess: () => {
      toast({ title: "Trip cancelled", description: "Your booking has been cancelled." });
      queryClient.invalidateQueries({ queryKey: ["/api/transport/trips", sessionId] });
    },
    onError: () => {
      toast({ title: "Cancel failed", description: "Unable to cancel. Please try again.", variant: "destructive" });
    },
  });

  const toggleAccessNeed = useCallback((id: string) => {
    setAccessNeeds(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    );
  }, []);

  const [geocoding, setGeocoding] = useState(false);

  const handleSearch = async () => {
    if (!pickupAddress.trim() || !dropoffAddress.trim()) {
      toast({ title: "Missing details", description: "Please enter both pickup and dropoff addresses.", variant: "destructive" });
      return;
    }
    setGeocoding(true);
    const [pickupCoords, dropoffCoords] = await Promise.all([
      geocodeAddress(pickupAddress),
      geocodeAddress(dropoffAddress),
    ]);
    setGeocoding(false);

    if (!pickupCoords) {
      toast({ title: "Address not found", description: `Could not locate pickup address: "${pickupAddress}". Try a suburb, street, or city name.`, variant: "destructive" });
      return;
    }
    if (!dropoffCoords) {
      toast({ title: "Address not found", description: `Could not locate dropoff address: "${dropoffAddress}". Try a suburb, street, or city name.`, variant: "destructive" });
      return;
    }

    quoteMutation.mutate({
      pickupAddress,
      pickupLat: pickupCoords.lat,
      pickupLng: pickupCoords.lng,
      dropoffAddress,
      dropoffLat: dropoffCoords.lat,
      dropoffLng: dropoffCoords.lng,
      accessNeeds,
      companionCount,
      fundingType,
      sessionId,
    });
  };

  const handleBook = () => {
    if (selectedOptionIndex === null || !quoteResult) return;
    bookMutation.mutate({
      quoteId: quoteResult.quoteId,
      selectedOptionIndex,
      sessionId,
    });
  };

  const resetSearch = () => {
    setStep("search");
    setQuoteResult(null);
    setSelectedOptionIndex(null);
    setBookingResult(null);
  };

  return (
    <Layout>
      <SEO
        title="Book Accessible Transport - DisabilitySquare"
        description="Find and book wheelchair-accessible transport in Australia with NDIS support"
      />
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Bus className="h-8 w-8 text-primary" aria-hidden="true" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Accessible Transport</h1>
            <p className="text-muted-foreground mt-0.5">Book wheelchair-accessible rides with NDIS support options</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-transport">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="book" data-testid="tab-book">Book a Ride</TabsTrigger>
            <TabsTrigger value="trips" data-testid="tab-my-trips">My Trips</TabsTrigger>
          </TabsList>

          <TabsContent value="book" className="space-y-4 mt-4">
            {step === "search" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Plan Your Trip</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="pickup-address" className="text-base font-medium">
                        <MapPin className="inline h-4 w-4 mr-1 text-green-600" aria-hidden="true" />
                        Pickup address
                      </Label>
                      <Input
                        id="pickup-address"
                        placeholder="e.g. 100 George Street, Sydney NSW"
                        value={pickupAddress}
                        onChange={e => setPickupAddress(e.target.value)}
                        className="mt-1"
                        data-testid="input-pickup-address"
                        aria-label="Pickup address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dropoff-address" className="text-base font-medium">
                        <MapPin className="inline h-4 w-4 mr-1 text-red-500" aria-hidden="true" />
                        Dropoff address
                      </Label>
                      <Input
                        id="dropoff-address"
                        placeholder="e.g. 1 Hospital Drive, Westmead NSW"
                        value={dropoffAddress}
                        onChange={e => setDropoffAddress(e.target.value)}
                        className="mt-1"
                        data-testid="input-dropoff-address"
                        aria-label="Dropoff address"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-base font-medium mb-2">Accessibility needs</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="group" aria-label="Accessibility needs">
                      {ACCESS_NEEDS.map(need => (
                        <div key={need.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`need-${need.id}`}
                            checked={accessNeeds.includes(need.id)}
                            onCheckedChange={() => toggleAccessNeed(need.id)}
                            data-testid={`checkbox-need-${need.id}`}
                          />
                          <Label htmlFor={`need-${need.id}`} className="cursor-pointer font-normal">
                            {need.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companion-count" className="text-base font-medium">
                        <Users className="inline h-4 w-4 mr-1" aria-hidden="true" />
                        Companions
                      </Label>
                      <Select
                        value={String(companionCount)}
                        onValueChange={v => setCompanionCount(Number(v))}
                      >
                        <SelectTrigger
                          id="companion-count"
                          className="mt-1"
                          data-testid="select-companion-count"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4, 5].map(n => (
                            <SelectItem key={n} value={String(n)}>
                              {n === 0 ? "Just me" : `${n} companion${n > 1 ? "s" : ""}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="funding-type" className="text-base font-medium">Funding type</Label>
                      <Select value={fundingType} onValueChange={setFundingType}>
                        <SelectTrigger
                          id="funding-type"
                          className="mt-1"
                          data-testid="select-funding-type"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FUNDING_TYPES.map(f => (
                            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleSearch}
                    disabled={quoteMutation.isPending || geocoding}
                    className="w-full"
                    size="lg"
                    data-testid="button-get-quotes"
                    aria-label="Search for available transport options"
                  >
                    {geocoding ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                        Locating addresses...
                      </>
                    ) : quoteMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                        Finding options...
                      </>
                    ) : (
                      <>
                        Find Transport Options
                        <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === "results" && quoteResult && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetSearch}
                    data-testid="button-back-to-search"
                    aria-label="Back to search"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
                    Back
                  </Button>
                </div>

                <Card className="bg-muted/30">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex gap-4 flex-wrap text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-green-600" aria-hidden="true" />
                        {pickupAddress}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground self-center" aria-hidden="true" />
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
                        {dropoffAddress}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{quoteResult.distanceKm.toFixed(1)} km</span>
                      <span>~{quoteResult.durationMinutes} min drive</span>
                    </div>
                  </CardContent>
                </Card>

                <p className="font-semibold text-foreground" aria-live="polite">
                  {quoteResult.options.length} option{quoteResult.options.length !== 1 ? "s" : ""} available
                </p>

                <div className="space-y-3" role="radiogroup" aria-label="Transport options">
                  {quoteResult.options.map((option, idx) => (
                    <Card
                      key={idx}
                      className={`cursor-pointer transition-all ${selectedOptionIndex === idx
                        ? "border-primary shadow-md ring-2 ring-primary"
                        : "hover:border-primary/50 hover:shadow-sm"
                        }`}
                      onClick={() => setSelectedOptionIndex(idx)}
                      data-testid={`card-option-${idx}`}
                      role="radio"
                      aria-checked={selectedOptionIndex === idx}
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setSelectedOptionIndex(idx); }}
                    >
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold" data-testid={`text-provider-name-${idx}`}>
                                {option.providerName}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {VEHICLE_LABELS[option.vehicleType] || option.vehicleType}
                              </Badge>
                              {option.ndisEligible && (
                                <Badge className="text-xs bg-primary/10 text-primary border-primary/20" data-testid={`badge-ndis-${idx}`}>
                                  <Star className="h-3 w-3 mr-1" aria-hidden="true" />
                                  NDIS Eligible
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                ~{option.etaMinutes} min ETA
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xl font-bold text-foreground" data-testid={`text-price-${idx}`}>
                              ${option.priceAud.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">AUD</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button
                  onClick={handleBook}
                  disabled={selectedOptionIndex === null || bookMutation.isPending}
                  className="w-full"
                  size="lg"
                  data-testid="button-book"
                  aria-label="Book selected transport option"
                >
                  {bookMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                      Booking...
                    </>
                  ) : (
                    <>
                      Book
                      {selectedOptionIndex !== null && (
                        <span className="ml-1">
                          — ${quoteResult.options[selectedOptionIndex]?.priceAud.toFixed(2)} AUD
                        </span>
                      )}
                    </>
                  )}
                </Button>
              </div>
            )}

            {step === "confirmation" && bookingResult && (
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="pt-6 pb-6 text-center space-y-4">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" aria-hidden="true" />
                  <div>
                    <h2 className="text-2xl font-bold text-foreground" data-testid="text-booking-confirmed">
                      Booking Confirmed!
                    </h2>
                    <p className="text-muted-foreground mt-1">Your trip has been successfully booked.</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reference</span>
                      <span className="font-mono font-bold" data-testid="text-reference-number">{bookingResult.referenceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provider</span>
                      <span>{bookingResult.providerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vehicle</span>
                      <span>{VEHICLE_LABELS[bookingResult.vehicleType] || bookingResult.vehicleType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ETA</span>
                      <span>~{bookingResult.etaMinutes} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-semibold">${Number(bookingResult.priceAud).toFixed(2)} AUD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className="capitalize">{bookingResult.status}</span>
                    </div>
                  </div>
                  {bookingResult.message && (
                    <p className="text-sm text-muted-foreground">{bookingResult.message}</p>
                  )}
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={resetSearch}
                      variant="outline"
                      data-testid="button-book-another"
                      aria-label="Book another trip"
                    >
                      Book Another Trip
                    </Button>
                    <Button
                      onClick={() => setActiveTab("trips")}
                      data-testid="button-view-trips"
                      aria-label="View my trips"
                    >
                      View My Trips
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trips" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Trips</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchTrips()}
                data-testid="button-refresh-trips"
                aria-label="Refresh trips list"
              >
                Refresh
              </Button>
            </div>

            {tripsLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="pt-4 pb-4">
                      <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                      <div className="h-4 bg-muted rounded w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : trips.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  <Bus className="h-12 w-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
                  <p className="text-lg font-medium mb-1">No trips yet</p>
                  <p className="text-sm">Book a trip to get started!</p>
                  <Button
                    className="mt-4"
                    onClick={() => setActiveTab("book")}
                    data-testid="button-start-booking"
                    aria-label="Start booking a trip"
                  >
                    Book a Trip
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {trips.map(trip => (
                  <Card key={trip.id} data-testid={`card-trip-${trip.id}`}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="font-semibold">{trip.provider?.name || "Unknown Provider"}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[trip.status] || "bg-muted text-muted-foreground"}`}
                              data-testid={`status-trip-${trip.id}`}
                              aria-label={`Trip status: ${STATUS_LABELS[trip.status] || trip.status}`}
                            >
                              {STATUS_LABELS[trip.status] || trip.status}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p className="flex items-start gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
                              <span className="truncate">{trip.pickupAddress}</span>
                            </p>
                            <p className="flex items-start gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
                              <span className="truncate">{trip.dropoffAddress}</span>
                            </p>
                          </div>
                          {trip.externalRef && (
                            <p className="text-xs text-muted-foreground mt-1.5 font-mono" data-testid={`text-trip-ref-${trip.id}`}>
                              Ref: {trip.externalRef}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-foreground">${parseFloat(trip.priceAud).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">AUD</p>
                          {(trip.status === "pending" || trip.status === "confirmed") && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="mt-2 text-xs"
                              onClick={() => cancelMutation.mutate(trip.id)}
                              disabled={cancelMutation.isPending}
                              data-testid={`button-cancel-trip-${trip.id}`}
                              aria-label={`Cancel trip ${trip.id}`}
                            >
                              {cancelMutation.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                                  Cancel
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
