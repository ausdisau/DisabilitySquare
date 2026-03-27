import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { BookOpen, PenSquare, Edit, Trash2, Eye, EyeOff, Send, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { BlogPost } from "@shared/schema";

export default function BlogMy() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blogs/my"],
    queryFn: async () => {
      const res = await fetch("/api/blogs/my", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    enabled: !!user,
  });

  const publishMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: "publish" | "unpublish" }) => {
      const res = await apiRequest("POST", `/api/blogs/${id}/${action}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      toast({ title: action === "publish" ? "Story published!" : "Story unpublished and saved as draft." });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/blogs/${id}`);
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      toast({ title: "Story deleted" });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl text-center py-12">
          <p className="text-muted-foreground">Please sign in to view your stories.</p>
        </div>
      </Layout>
    );
  }

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();

  return (
    <Layout>
      <SEO
        title="My Stories — DisabilitySquare"
        description="Manage your published and draft stories on DisabilitySquare."
      />

      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/blogs">
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-back-blogs-my">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-foreground">My Stories</h1>
              <p className="text-xs text-muted-foreground">Manage your published stories and drafts.</p>
            </div>
          </div>
          <Button onClick={() => setLocation("/blogs/write")} data-testid="button-write-new-story">
            <PenSquare className="h-4 w-4 mr-2" />
            Write a story
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="sm-card animate-pulse">
                <div className="sm-card-body space-y-2">
                  <div className="h-4 bg-muted rounded-full w-3/4" />
                  <div className="h-3 bg-muted rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : posts?.length === 0 ? (
          <div className="sm-card">
            <div className="sm-card-body text-center py-12">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">No stories yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                Share your lived experience with the community.
              </p>
              <Button onClick={() => setLocation("/blogs/write")} data-testid="button-write-first-story-my">
                <PenSquare className="h-4 w-4 mr-2" />
                Write your first story
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {posts?.map((post) => (
              <div key={post.id} className="sm-card" data-testid={`card-my-blog-${post.id}`}>
                <div className="sm-card-body">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={post.status === "published" ? "default" : "secondary"}
                          className="text-xs"
                          data-testid={`badge-status-${post.id}`}
                        >
                          {post.status === "published" ? (
                            <><Eye className="h-3 w-3 mr-1" />Published</>
                          ) : (
                            <><EyeOff className="h-3 w-3 mr-1" />Draft</>
                          )}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.updatedAt || post.createdAt || new Date()), { addSuffix: true })}
                        </span>
                      </div>

                      <h2 className="font-semibold text-foreground text-sm mb-1 leading-snug">
                        {post.title}
                      </h2>

                      {post.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                      )}

                      {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(post.tags as string[]).slice(0, 3).map((tag: string) => (
                            <span key={tag} className="sm-badge text-[10px]">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {post.status === "draft" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => publishMutation.mutate({ id: post.id, action: "publish" })}
                          disabled={publishMutation.isPending}
                          data-testid={`button-publish-${post.id}`}
                        >
                          {publishMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => publishMutation.mutate({ id: post.id, action: "unpublish" })}
                          disabled={publishMutation.isPending}
                          className="text-muted-foreground"
                          data-testid={`button-unpublish-${post.id}`}
                          title="Unpublish (revert to draft)"
                        >
                          {publishMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </Button>
                      )}
                      <Link href={`/blogs/edit/${post.id}`}>
                        <Button size="sm" variant="ghost" data-testid={`button-edit-${post.id}`}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (window.confirm("Delete this story? This cannot be undone.")) {
                            deleteMutation.mutate(post.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${post.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      {post.status === "published" && (
                        <Link href={`/blogs/${post.slug}`}>
                          <Button size="sm" variant="ghost" data-testid={`button-view-${post.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
