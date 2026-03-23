import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { SEO } from "@/components/SEO";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookMarked, Plus, Search, ExternalLink, Bookmark, BookmarkCheck, Flag } from "lucide-react";

const CATEGORIES = [
  { value: "ndis", label: "NDIS" },
  { value: "mental_health", label: "Mental Health" },
  { value: "employment", label: "Employment" },
  { value: "legal", label: "Legal & Rights" },
  { value: "housing", label: "Housing" },
  { value: "community", label: "Community" },
  { value: "research", label: "Research" },
  { value: "tools", label: "Tools & Apps" },
];

const CATEGORY_COLORS: Record<string, string> = {
  ndis: "bg-blue-100 text-blue-700",
  mental_health: "bg-purple-100 text-purple-700",
  employment: "bg-green-100 text-green-700",
  legal: "bg-red-100 text-red-700",
  housing: "bg-orange-100 text-orange-700",
  community: "bg-teal-100 text-teal-700",
  research: "bg-yellow-100 text-yellow-700",
  tools: "bg-gray-100 text-gray-700",
};

const submitSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  url: z.string().url("Please enter a valid URL"),
  category: z.enum(["ndis", "mental_health", "employment", "legal", "housing", "community", "research", "tools"]),
  source: z.string().min(2, "Source organisation is required"),
  isAustralian: z.boolean().optional().default(true),
});

interface Resource {
  id: number;
  title: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  source: string;
  isAustralian: boolean;
  saves: number;
}

export default function Resources() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [submitOpen, setSubmitOpen] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);

  const { data: resources = [], isLoading } = useQuery<Resource[]>({
    queryKey: ['/api/resources', categoryFilter, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (search) params.set('search', search);
      return fetch(`/api/resources?${params}`, { credentials: 'include' }).then(r => r.json());
    },
  });

  const { data: savedIds = [] } = useQuery<number[]>({
    queryKey: ['/api/resources/saved'],
    queryFn: () => fetch('/api/resources/saved', { credentials: 'include' }).then(r => r.json()),
  });

  const saveMutation = useMutation({
    mutationFn: (resourceId: number) => apiRequest('POST', `/api/resources/${resourceId}/save`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resources/saved'] });
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
    },
  });

  const form = useForm({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      title: "", description: "", url: "", category: "ndis" as const, source: "", isAustralian: true,
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/resources', data),
    onSuccess: () => {
      setSubmitOpen(false);
      form.reset();
      toast({ title: "Resource submitted!", description: "Your submission is pending admin review. Thank you!" });
    },
  });

  const getCategoryLabel = (cat: string) => CATEGORIES.find(c => c.value === cat)?.label || cat;

  const displayResources = savedOnly
    ? resources.filter(r => savedIds.includes(r.id))
    : resources;

  return (
    <Layout>
      <SEO title="Resource Library - DisabilitySquare" description="Curated disability resources and guides for Australians" />
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BookMarked className="h-8 w-8 text-primary" aria-hidden="true" />
              Resource Library
            </h1>
            <p className="text-muted-foreground mt-1">Curated guides, tools and information for people with disabilities</p>
          </div>
          <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-submit-resource" className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Suggest Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Suggest a Resource</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Found something helpful? Share it with the community. All submissions are reviewed before publication.
              </p>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(d => submitMutation.mutate(d))} className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Resource title" {...field} data-testid="input-resource-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="url" render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} data-testid="input-resource-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What is this resource about? Who is it for?" {...field} data-testid="textarea-resource-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-resource-category">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="source" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source / Publisher</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. NDIS, Beyond Blue" {...field} data-testid="input-resource-source" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitMutation.isPending} data-testid="button-submit-resource-form">
                    Submit for Review
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search resources..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-resource-search"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44" data-testid="select-filter-resource-category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button
            variant={savedOnly ? "default" : "outline"}
            onClick={() => setSavedOnly(!savedOnly)}
            data-testid="button-filter-saved"
            className="gap-2"
          >
            <Bookmark className="h-4 w-4" />
            Saved
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap" role="list" aria-label="Category filters">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-full text-sm border transition-all ${categoryFilter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'}`}
            data-testid="button-category-all"
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all ${categoryFilter === cat.value ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'}`}
              data-testid={`button-category-${cat.value}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-4 pb-4">
                  <div className="h-5 bg-muted rounded w-2/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-full mb-1" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayResources.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <BookMarked className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium mb-1">
                {savedOnly ? "No saved resources yet" : "No resources found"}
              </p>
              <p className="text-sm">
                {savedOnly ? "Bookmark resources to find them here easily." : "Try different filters or suggest a resource!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {displayResources.length} resource{displayResources.length !== 1 ? 's' : ''} found
            </p>
            <div className="space-y-3">
              {displayResources.map(resource => {
                const isSaved = savedIds.includes(resource.id);
                return (
                  <Card key={resource.id} className="hover:border-primary/40 transition-colors" data-testid={`card-resource-${resource.id}`}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-foreground hover:text-primary hover:underline flex items-center gap-1"
                              data-testid={`link-resource-${resource.id}`}
                            >
                              {resource.title}
                              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            </a>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[resource.category] || ''}`}>
                              {getCategoryLabel(resource.category)}
                            </span>
                            {resource.isAustralian && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
                                🇦🇺 AU
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>Source: {resource.source}</span>
                            {resource.saves > 0 && (
                              <span className="flex items-center gap-1">
                                <Bookmark className="h-3 w-3" />
                                {resource.saves} save{resource.saves !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => saveMutation.mutate(resource.id)}
                          aria-label={isSaved ? `Unsave ${resource.title}` : `Save ${resource.title}`}
                          data-testid={`button-save-resource-${resource.id}`}
                          className="shrink-0"
                        >
                          {isSaved ? (
                            <BookmarkCheck className="h-5 w-5 text-primary" />
                          ) : (
                            <Bookmark className="h-5 w-5 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
