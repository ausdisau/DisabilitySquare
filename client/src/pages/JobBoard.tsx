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
import { Checkbox } from "@/components/ui/checkbox";
import { SEO } from "@/components/SEO";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Briefcase, Plus, Search, MapPin, Clock, DollarSign, Wifi, CheckCircle2, Heart, Mail, Globe } from "lucide-react";

const JOB_CATEGORIES = [
  { value: "admin", label: "Administration" },
  { value: "healthcare", label: "Healthcare" },
  { value: "tech", label: "Technology" },
  { value: "creative", label: "Creative & Arts" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail & Hospitality" },
  { value: "trades", label: "Trades & Labour" },
  { value: "other", label: "Other" },
];

const JOB_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "casual", label: "Casual" },
  { value: "volunteer", label: "Volunteer" },
  { value: "contract", label: "Contract" },
];

const AU_STATES = ["National", "Online", "ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];

const TYPE_COLORS: Record<string, string> = {
  full_time: "bg-blue-100 text-blue-700",
  part_time: "bg-indigo-100 text-indigo-700",
  casual: "bg-purple-100 text-purple-700",
  volunteer: "bg-green-100 text-green-700",
  contract: "bg-orange-100 text-orange-700",
};

const submitSchema = z.object({
  title: z.string().min(2, "Job title is required"),
  company: z.string().min(2, "Company name is required"),
  description: z.string().min(10, "Please provide a description"),
  location: z.string().min(2, "Location is required"),
  state: z.string().min(2, "State is required"),
  type: z.enum(["full_time", "part_time", "casual", "volunteer", "contract"]),
  salary: z.string().optional(),
  category: z.enum(["admin", "healthcare", "tech", "creative", "education", "retail", "trades", "other"]),
  isRemote: z.boolean().optional().default(false),
  isAccessible: z.boolean().optional().default(false),
  disabilityWelcome: z.boolean().optional().default(false),
  applyUrl: z.string().url().optional().or(z.literal("")),
  applyEmail: z.string().email().optional().or(z.literal("")),
});

interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  location: string;
  state: string;
  type: string;
  salary?: string;
  category: string;
  isRemote: boolean;
  isAccessible: boolean;
  disabilityWelcome: boolean;
  applyUrl?: string;
  applyEmail?: string;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) !== 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) !== 1 ? 's' : ''} ago`;
}

export default function JobBoard() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs', categoryFilter, stateFilter, typeFilter, remoteOnly, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (stateFilter !== 'all') params.set('state', stateFilter);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (remoteOnly) params.set('isRemote', 'true');
      if (search) params.set('search', search);
      return fetch(`/api/jobs?${params}`, { credentials: 'include' }).then(r => r.json());
    },
  });

  const form = useForm({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      title: "", company: "", description: "", location: "", state: "VIC",
      type: "full_time" as const, salary: "", category: "admin" as const,
      isRemote: false, isAccessible: false, disabilityWelcome: false,
      applyUrl: "", applyEmail: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/jobs', data),
    onSuccess: () => {
      setPostOpen(false);
      form.reset();
      toast({ title: "Job posted!", description: "Your listing is pending admin review." });
    },
  });

  const getTypeLabel = (t: string) => JOB_TYPES.find(j => j.value === t)?.label || t;
  const getCatLabel = (c: string) => JOB_CATEGORIES.find(j => j.value === c)?.label || c;

  return (
    <Layout>
      <SEO title="Job Board - DisabilitySquare" description="Accessible jobs for Australians with disability" />
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-primary" aria-hidden="true" />
              Job Board
            </h1>
            <p className="text-muted-foreground mt-1">Accessible and disability-welcoming employment opportunities</p>
          </div>
          <Dialog open={postOpen} onOpenChange={setPostOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-post-job" className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Post a Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Post a Job</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">All postings are reviewed before going live. Free for disability-welcoming employers.</p>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(d => submitMutation.mutate(d))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Customer Service Officer" {...field} data-testid="input-job-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="company" render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Company / Organisation</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Disability Connect Australia" {...field} data-testid="input-job-company" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-job-category">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {JOB_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="type" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-job-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {JOB_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="location" render={({ field }) => (
                      <FormItem>
                        <FormLabel>City / Area</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Melbourne" {...field} data-testid="input-job-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="state" render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-job-state">
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
                  <FormField control={form.control} name="salary" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary / Rate (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. $60,000–$70,000 per year" {...field} data-testid="input-job-salary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the role, responsibilities, and requirements..." rows={4} {...field} data-testid="textarea-job-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="space-y-2">
                    <FormField control={form.control} name="isRemote" render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-remote" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Remote / work from home available</FormLabel>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="isAccessible" render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-accessible" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Accessible workplace confirmed</FormLabel>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="disabilityWelcome" render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-disability-welcome" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">We explicitly welcome candidates with disability</FormLabel>
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="applyUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application URL (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} data-testid="input-job-apply-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="applyEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Email (optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jobs@example.com.au" {...field} data-testid="input-job-apply-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={submitMutation.isPending} data-testid="button-submit-job-form">
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
              placeholder="Search jobs or companies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-job-search"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44" data-testid="select-filter-job-category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {JOB_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36" data-testid="select-filter-job-type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {JOB_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-32" data-testid="select-filter-job-state">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {AU_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button
            variant={remoteOnly ? "default" : "outline"}
            onClick={() => setRemoteOnly(!remoteOnly)}
            data-testid="button-filter-remote"
            className="gap-2"
          >
            <Wifi className="h-4 w-4" />
            Remote
          </Button>
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
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium mb-1">No jobs found</p>
              <p className="text-sm">Try different filters, or be the first to post a disability-welcoming role!</p>
              <Button className="mt-4" onClick={() => setPostOpen(true)} data-testid="button-post-first-job">
                Post a Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
            </p>
            <div className="space-y-3">
              {jobs.map(job => (
                <Card
                  key={job.id}
                  className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
                  onClick={() => setSelectedJob(job)}
                  data-testid={`card-job-${job.id}`}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <h3 className="font-semibold text-foreground">{job.title}</h3>
                            <p className="text-sm text-muted-foreground">{job.company}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${TYPE_COLORS[job.type] || 'bg-gray-100 text-gray-700'}`}>
                            {getTypeLabel(job.type)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{job.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" aria-hidden="true" />
                            {job.location}, {job.state}
                          </span>
                          {job.salary && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" aria-hidden="true" />
                              {job.salary}
                            </span>
                          )}
                          {job.isRemote && (
                            <span className="flex items-center gap-1 text-primary">
                              <Wifi className="h-3 w-3" aria-hidden="true" />
                              Remote
                            </span>
                          )}
                          {job.isAccessible && (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                              Accessible
                            </span>
                          )}
                          {job.disabilityWelcome && (
                            <span className="flex items-center gap-1 text-accent">
                              <Heart className="h-3 w-3" aria-hidden="true" />
                              Disability Welcome
                            </span>
                          )}
                          <span className="flex items-center gap-1 ml-auto">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            {timeAgo(job.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {selectedJob && (
          <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedJob.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-lg">{selectedJob.company}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[selectedJob.type] || ''}`}>
                      {getTypeLabel(selectedJob.type)}
                    </span>
                    <Badge variant="outline">{getCatLabel(selectedJob.category)}</Badge>
                    {selectedJob.isRemote && <Badge variant="secondary" className="text-primary">Remote</Badge>}
                    {selectedJob.isAccessible && <Badge variant="secondary" className="text-green-600">Accessible Workplace</Badge>}
                    {selectedJob.disabilityWelcome && <Badge variant="secondary" className="text-accent">Disability Welcome</Badge>}
                  </div>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{selectedJob.location}, {selectedJob.state}</span>
                  </div>
                  {selectedJob.salary && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 shrink-0" />
                      <span>{selectedJob.salary}</span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium mb-2">About the Role</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedJob.description}</p>
                </div>
                {(selectedJob.applyUrl || selectedJob.applyEmail) && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <h4 className="font-medium">How to Apply</h4>
                    {selectedJob.applyUrl && (
                      <Button className="w-full" asChild>
                        <a href={selectedJob.applyUrl} target="_blank" rel="noopener noreferrer" data-testid={`link-apply-url-${selectedJob.id}`}>
                          <Globe className="h-4 w-4 mr-2" />
                          Apply Online
                        </a>
                      </Button>
                    )}
                    {selectedJob.applyEmail && (
                      <Button variant="outline" className="w-full" asChild>
                        <a href={`mailto:${selectedJob.applyEmail}`} data-testid={`link-apply-email-${selectedJob.id}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          Apply via Email
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}
