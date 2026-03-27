import { useState, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Send, X, Tag, ArrowLeft, Eye } from "lucide-react";
import { Link } from "wouter";
import type { BlogPost } from "@shared/schema";

const SUGGESTED_TAGS = [
  "NDIS", "Chronic Pain", "Advocacy", "Mental Health", "Accessibility",
  "Employment", "Housing", "Community", "Personal Story", "Carer",
  "Autism", "Physical Disability", "Invisible Illness", "Grief", "Inspiring",
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 100);
}

export default function BlogWrite() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id?: string }>();
  const editId = params.id ? Number(params.id) : undefined;
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [loaded, setLoaded] = useState(!editId);

  const { isLoading: editLoading } = useQuery<BlogPost>({
    queryKey: ["/api/blogs/my", editId],
    queryFn: async () => {
      const res = await fetch(`/api/blogs/my`, { credentials: "include" });
      const posts: BlogPost[] = await res.json();
      return posts.find(p => p.id === editId) as BlogPost;
    },
    enabled: !!editId,
    refetchOnWindowFocus: false,
    select: (post) => {
      if (post && !loaded) {
        setTitle(post.title);
        setSlug(post.slug);
        setContent(post.content);
        setExcerpt(post.excerpt || "");
        setTags((post.tags as string[]) || []);
        setSlugManuallyEdited(true);
        setLoaded(true);
      }
      return post;
    },
  });

  const handleTitleChange = useCallback((val: string) => {
    setTitle(val);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(val));
    }
  }, [slugManuallyEdited]);

  const addTag = useCallback((tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags(prev => [...prev, trimmed]);
    }
    setTagInput("");
  }, [tags]);

  const removeTag = useCallback((tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  }, []);

  const createMutation = useMutation({
    mutationFn: async (data: { status: "draft" | "published" }) => {
      const body = { title, slug: slug || generateSlug(title), content, excerpt: excerpt || undefined, tags, status: data.status };
      if (editId) {
        const res = await apiRequest("PATCH", `/api/blogs/${editId}`, { title, content, excerpt: excerpt || undefined, tags, slug: body.slug });
        if (!res.ok) { const e = await res.json() as any; throw new Error(e.message); }
        return { post: await res.json() as BlogPost, status: data.status };
      } else {
        const res = await apiRequest("POST", "/api/blogs", body);
        if (!res.ok) { const e = await res.json() as any; throw new Error(e.message); }
        return { post: await res.json() as BlogPost, status: data.status };
      }
    },
    onSuccess: async ({ post, status }) => {
      if (status === "published" && editId) {
        await apiRequest("POST", `/api/blogs/${post.id}/publish`);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blogs/my"] });
      toast({
        title: status === "published" ? "Story published!" : "Draft saved",
        description: status === "published"
          ? "Your story is now live for the community to read."
          : "Your draft has been saved. Come back anytime to publish.",
      });
      if (status === "published") {
        setLocation(`/blogs/${post.slug}`);
      } else {
        setLocation("/blogs/my");
      }
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message || "Failed to save", variant: "destructive" });
    },
  });

  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl text-center py-12">
          <p className="text-muted-foreground">Please sign in to write a story.</p>
        </div>
      </Layout>
    );
  }

  if (editId && editLoading && !loaded) {
    return (
      <Layout>
        <div className="max-w-2xl flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={editId ? "Edit Story — DisabilitySquare" : "Write a Story — DisabilitySquare"}
        description="Share your lived experience with the DisabilitySquare community."
      />

      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/blogs/my">
            <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-back-blogs">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {editId ? "Edit your story" : "Write a story"}
            </h1>
            <p className="text-xs text-muted-foreground">Share your experience with the community.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="sm-card">
            <div className="sm-card-body space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="blog-title">Title</Label>
                <Input
                  id="blog-title"
                  placeholder="Give your story a title..."
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="text-lg font-semibold h-12"
                  data-testid="input-blog-title"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="blog-slug">
                  URL slug{" "}
                  <span className="text-muted-foreground font-normal text-xs">(auto-generated, editable)</span>
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground shrink-0">/blogs/</span>
                  <Input
                    id="blog-slug"
                    placeholder="my-story-title"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                      setSlugManuallyEdited(true);
                    }}
                    className="text-sm font-mono"
                    data-testid="input-blog-slug"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="blog-excerpt">
                  Short excerpt{" "}
                  <span className="text-muted-foreground font-normal text-xs">(optional — shows on the listing page)</span>
                </Label>
                <Textarea
                  id="blog-excerpt"
                  placeholder="A brief summary of your story (1–2 sentences)..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  data-testid="input-blog-excerpt"
                />
              </div>
            </div>
          </div>

          <div className="sm-card">
            <div className="sm-card-body space-y-2">
              <Label htmlFor="blog-content">Your story</Label>
              <p className="text-xs text-muted-foreground">
                Write your full story here. You can use line breaks for paragraphs.
              </p>
              <Textarea
                id="blog-content"
                placeholder="Share your lived experience, insights, or personal story with the community..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                className="resize-y min-h-[300px] font-sans text-sm leading-relaxed"
                data-testid="input-blog-content"
              />
              <p className="text-xs text-muted-foreground text-right">
                {content.length} characters
              </p>
            </div>
          </div>

          <div className="sm-card">
            <div className="sm-card-body space-y-3">
              <div>
                <Label>Tags</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Add up to 5 tags to help others find your story.</p>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                      data-testid={`badge-tag-${tag}`}
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                        data-testid={`button-remove-tag-${tag}`}
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {tags.length < 5 && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); }
                    }}
                    className="text-sm"
                    data-testid="input-tag"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTag(tagInput)}
                    disabled={!tagInput.trim()}
                    data-testid="button-add-tag"
                  >
                    Add
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-muted-foreground">Suggestions:</span>
                {SUGGESTED_TAGS.filter(t => !tags.includes(t)).slice(0, 8).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    disabled={tags.length >= 5}
                    className="text-xs px-2 py-0.5 rounded-full border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors disabled:opacity-40"
                    data-testid={`button-suggest-tag-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pb-8">
            <Link href="/blogs">
              <Button variant="ghost" data-testid="button-cancel-blog">Cancel</Button>
            </Link>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => createMutation.mutate({ status: "draft" })}
                disabled={createMutation.isPending || !title.trim() || !content.trim()}
                data-testid="button-save-draft"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save draft
              </Button>
              <Button
                onClick={() => createMutation.mutate({ status: "published" })}
                disabled={createMutation.isPending || !title.trim() || !content.trim() || !slug.trim()}
                data-testid="button-publish-blog"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Publish story
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
