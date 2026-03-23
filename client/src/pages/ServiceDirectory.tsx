import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SEO } from "@/components/SEO";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, Mail, Globe, MapPin, Building2, Plus, Search, CheckCircle2, Info } from "lucide-react";

const CATEGORIES = [
  { value: "allied_health", label: "Allied Health" },
  { value: "support_worker", label: "Support Workers" },
  { value: "accommodation", label: "Accommodation" },
  { value: "employment", label: "Employment" },
  { value: "legal", label: "Legal & Advocacy" },
  { value: "mental_health", label: "Mental Health" },
  { value: "equipment", label: "Equipment & Aids" },
  { value: "other", label: "Other" },
];

const AU_STATES = ["National", "Online", "ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];

const submitSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.enum(["allied_health", "support_worker", "accommodation", "employment", "legal", "mental_health", "equipment", "other"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  state: z.string().min(2, "State is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  ndisRegistered: z.boolean().optional().default(false),
  acceptsNdis: z.boolean().optional().default(false),
});

interface Provider {
  id: number;
  name: string;
  category: string;
  description: string;
  location: string;
  state: string;
  phone?: string;
  email?: string;
  website?: string;
  ndisRegistered: boolean;
  acceptsNdis: boolean;
  disabilityTypes: string[];
}

export default function ServiceDirectory() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [ndisFilter, setNdisFilter] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  const { data: providers = [], isLoading } = useQuery<Provider[]>({
    queryKey: ['/api/providers', categoryFilter, stateFilter, ndisFilter, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (stateFilter !== 'all') params.set('state', stateFilter);
      if (ndisFilter) params.set('ndisRegistered', 'true');
      if (search) params.set('search', search);
      return fetch(`/api/providers?${params}`, { credentials: 'include' }).then(r => r.json());
    },
  });

  const form = useForm({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      name: "", category: "allied_health" as const, description: "",
      location: "", state: "VIC", phone: "", email: "", website: "",
      ndisRegistered: false, acceptsNdis: false,
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/providers', data),
    onSuccess: () => {
      setSubmitOpen(false);
      form.reset();
      toast({ title: "Provider submitted!", description: "Your submission is pending admin review." });
    },
  });

  const getCategoryLabel = (cat: string) => CATEGORIES.find(c => c.value === cat)?.label || cat;

  return (
    <Layout>
      <SEO title="Service Directory - DisabilitySquare" description="Find disability service providers in Australia" />
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" aria-hidden="true" />
              Service Directory
            </h1>
            <p className="text-muted-foreground mt-1">Find disability support services across Australia</p>
          </div>
          <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-submit-provider" className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Submit Provider
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Submit a Service Provider</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Submissions are reviewed by our team before appearing in the directory.
              </p>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(d => submitMutation.mutate(d))} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organisation Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Ability Connect" {...field} data-testid="input-provider-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-provider-category">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What services do they provide?" {...field} data-testid="textarea-provider-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="location" render={({ field }) => (
                      <FormItem>
                        <FormLabel>City / Area</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Melbourne" {...field} data-testid="input-provider-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="state" render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-provider-state">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {AU_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 1800 123 456" {...field} data-testid="input-provider-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@example.com.au" {...field} data-testid="input-provider-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="website" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} data-testid="input-provider-website" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex gap-6">
                    <FormField control={form.control} name="ndisRegistered" render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-ndis-registered" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">NDIS Registered</FormLabel>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="acceptsNdis" render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-accepts-ndis" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Accepts NDIS</FormLabel>
                      </FormItem>
                    )} />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitMutation.isPending} data-testid="button-submit-provider-form">
                    Submit for Review
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  placeholder="Search providers..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                  data-testid="input-provider-search"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-44" data-testid="select-filter-category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-36" data-testid="select-filter-state">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {AU_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button
                variant={ndisFilter ? "default" : "outline"}
                onClick={() => setNdisFilter(!ndisFilter)}
                data-testid="button-filter-ndis"
              >
                NDIS Registered
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-4 pb-4">
                  <div className="h-5 bg-muted rounded w-2/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-full mb-1" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium mb-1">No providers found</p>
              <p className="text-sm">Try different filters or be the first to submit a provider!</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {providers.length} provider{providers.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {providers.map(provider => (
                <Card
                  key={provider.id}
                  className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
                  onClick={() => setSelectedProvider(provider)}
                  data-testid={`card-provider-${provider.id}`}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-foreground leading-tight">{provider.name}</h3>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {getCategoryLabel(provider.category)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{provider.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                        {provider.location}, {provider.state}
                      </span>
                      {provider.ndisRegistered && (
                        <span className="flex items-center gap-1 text-primary">
                          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                          NDIS Registered
                        </span>
                      )}
                      {provider.acceptsNdis && !provider.ndisRegistered && (
                        <span className="text-accent">Accepts NDIS</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {selectedProvider && (
          <Dialog open={!!selectedProvider} onOpenChange={() => setSelectedProvider(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{selectedProvider.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Badge>{getCategoryLabel(selectedProvider.category)}</Badge>
                  {selectedProvider.ndisRegistered && <Badge variant="secondary" className="text-primary">NDIS Registered</Badge>}
                  {selectedProvider.acceptsNdis && <Badge variant="outline">Accepts NDIS</Badge>}
                </div>
                <p className="text-muted-foreground">{selectedProvider.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{selectedProvider.location}, {selectedProvider.state}</span>
                  </div>
                  {selectedProvider.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a href={`tel:${selectedProvider.phone}`} className="hover:underline text-primary">{selectedProvider.phone}</a>
                    </div>
                  )}
                  {selectedProvider.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a href={`mailto:${selectedProvider.email}`} className="hover:underline text-primary">{selectedProvider.email}</a>
                    </div>
                  )}
                  {selectedProvider.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a href={selectedProvider.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary truncate">
                        {selectedProvider.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}
