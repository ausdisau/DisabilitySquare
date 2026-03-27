import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ReportDialog } from "@/components/ReportDialog";
import {
  ArrowLeft, Tag, Calendar, Edit, Trash2, Flag, Send, Loader2, EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlogPost, BlogComment } from "@shared/schema";

type BlogPostDetail = BlogPost & {
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
  comments: (BlogComment & {
    author: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      profileImageUrl: string | null;
    };
  })[];
  reactionCounts: Record<string, number>;
  userReaction: string | null;
};

const REACTIONS: { type: string; emoji: string; label: string }[] = [
  { type: "hug", emoji: "🤗", label: "Hug" },
  { type: "me_too", emoji: "✋", label: "Me Too" },
  { type: "helpful", emoji: "💡", label: "Helpful" },
  { type: "inspiring", emoji: "✨", label: "Inspiring" },
];

function BlogReactions({ postId, slug, userReaction, reactionCounts }: {
  postId: number;
  slug: string;
  userReaction: string | null;
  reactionCounts: Record<string, number>;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reactMutation = useMutation({
    mutationFn: async (reactionType: string) => {
      if (!user) throw new Error("Login required");
      if (userReaction === reactionType) {
        const res = await apiRequest("DELETE", `/api/blogs/${postId}/react`);
        if (!res.ok) throw new Error("Failed to remove reaction");
      } else {
        const res = await apiRequest("POST", `/api/blogs/${postId}/react`, { reactionType });
        if (!res.ok) throw new Error("Failed to add reaction");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs", slug] });
    },
    onError: () => {
      if (!user) toast({ title: "Please sign in to react", variant: "destructive" });
    },
  });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {REACTIONS.map(({ type, emoji, label }) => {
        const count = reactionCounts[type] || 0;
        const isActive = userReaction === type;
        return (
          <button
            key={type}
            onClick={() => reactMutation.mutate(type)}
            disabled={reactMutation.isPending}
            aria-label={`${isActive ? "Remove " : ""}${label} reaction${count > 0 ? ` (${count})` : ""}`}
            data-testid={`button-react-blog-${type}`}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all border",
              isActive
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            <span className="text-base leading-none">{emoji}</span>
            <span className={cn("font-medium text-xs", isActive ? "text-primary-foreground" : "text-current")}>
              {label}
              {count > 0 && <span className="ml-1 opacity-80">{count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [reportOpen, setReportOpen] = useState(false);

  const { data: post, isLoading, error } = useQuery<BlogPostDetail>({
    queryKey: ["/api/blogs", slug],
    queryFn: async () => {
      const res = await fetch(`/api/blogs/${slug}`, { credentials: "include" });
      if (!res.ok) throw new Error("Post not found");
      return res.json();
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!post) throw new Error("No post");
      const res = await apiRequest("POST", `/api/blogs/${post.id}/comments`, { content });
      if (!res.ok) { const e = await res.json() as any; throw new Error(e.message); }
      return res.json();
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["/api/blogs", slug] });
      toast({ title: "Comment added" });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (action: "publish" | "unpublish") => {
      if (!post) throw new Error("No post");
      const res = await apiRequest("POST", `/api/blogs/${post.id}/${action}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blogs", slug] });
      toast({ title: action === "publish" ? "Story published!" : "Story unpublished" });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!post) throw new Error("No post");
      const res = await apiRequest("DELETE", `/api/blogs/${post.id}`);
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      toast({ title: "Story deleted" });
      setLocation("/blogs");
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded-full w-3/4" />
            <div className="flex gap-3 items-center">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="space-y-1">
                <div className="h-3 bg-muted rounded-full w-24" />
                <div className="h-3 bg-muted rounded-full w-16" />
              </div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-3 bg-muted rounded-full" />)}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="max-w-2xl text-center py-12">
          <p className="text-muted-foreground mb-4">Story not found.</p>
          <Link href="/blogs">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to stories
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const isAuthor = user?.id === post.authorId;
  const authorName = `${post.author.firstName || "Member"} ${post.author.lastName || ""}`.trim();
  const initials = `${post.author.firstName?.[0] || ""}${post.author.lastName?.[0] || ""}`.toUpperCase();
  const publishedDate = post.publishedAt
    ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
    : null;

  return (
    <Layout>
      <SEO
        title={`${post.title} — DisabilitySquare`}
        description={post.excerpt || post.content.substring(0, 160)}
      />

      <div className="max-w-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/blogs">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back-to-blogs">
              <ArrowLeft className="h-4 w-4" />
              Stories
            </Button>
          </Link>
        </div>

        {post.status === "draft" && (
          <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center gap-2">
            <EyeOff className="h-4 w-4 shrink-0" />
            This story is a draft. Only you can see it.
          </div>
        )}

        <article className="sm-card mb-4" data-testid="article-blog-post">
          <div className="sm-card-body">
            <h1 className="text-2xl font-bold text-foreground leading-tight mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/50">
              <Avatar className="h-10 w-10 rounded-full shrink-0 ring-2 ring-primary/15">
                <AvatarImage src={post.author.profileImageUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold rounded-full">
                  {initials || "M"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{authorName}</p>
                {publishedDate && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {publishedDate}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isAuthor && (
                  <>
                    <Link href={`/blogs/edit/${post.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-edit-blog">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    {post.status === "draft" ? (
                      <Button
                        size="sm"
                        onClick={() => publishMutation.mutate("publish")}
                        disabled={publishMutation.isPending}
                        data-testid="button-publish-from-detail"
                      >
                        {publishMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish"}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => publishMutation.mutate("unpublish")}
                        disabled={publishMutation.isPending}
                        data-testid="button-unpublish"
                      >
                        {publishMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unpublish"}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this story? This cannot be undone.")) {
                          deleteMutation.mutate();
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      data-testid="button-delete-blog"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {user && !isAuthor && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setReportOpen(true)}
                    data-testid="button-report-blog"
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {post.excerpt && (
              <p className="text-base text-foreground/80 italic leading-relaxed mb-4 pb-4 border-b border-border/30">
                {post.excerpt}
              </p>
            )}

            <div className="prose prose-sm max-w-none text-foreground/85 leading-relaxed whitespace-pre-wrap mb-4">
              {post.content}
            </div>

            {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border/30">
                {(post.tags as string[]).map((tag: string) => (
                  <Link key={tag} href={`/blogs?tag=${encodeURIComponent(tag)}`}>
                    <Badge variant="secondary" className="flex items-center gap-1 cursor-pointer hover:bg-primary/10" data-testid={`tag-${tag}`}>
                      <Tag className="h-3 w-3" />
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </article>

        {post.status === "published" && (
          <div className="sm-card mb-4">
            <div className="sm-card-body">
              <p className="text-sm font-medium text-foreground mb-3">How did this story make you feel?</p>
              <BlogReactions
                postId={post.id}
                slug={slug}
                userReaction={post.userReaction}
                reactionCounts={post.reactionCounts}
              />
            </div>
          </div>
        )}

        <div className="sm-card">
          <div className="sm-card-body">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Comments ({post.comments?.length || 0})
            </h2>

            {user && post.status === "published" && (
              <div className="flex gap-2 mb-4">
                <Textarea
                  placeholder="Share your thoughts or support..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={2}
                  className="resize-none text-sm"
                  data-testid="input-blog-comment"
                />
                <Button
                  onClick={() => commentMutation.mutate(commentText)}
                  disabled={commentMutation.isPending || !commentText.trim()}
                  className="shrink-0 self-end"
                  data-testid="button-submit-blog-comment"
                >
                  {commentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            {post.comments && post.comments.length > 0 ? (
              <div className="space-y-3 divide-y divide-border/30">
                {post.comments.map((comment) => {
                  const cAuthorName = `${comment.author.firstName || "Member"} ${comment.author.lastName || ""}`.trim();
                  const cInitials = `${comment.author.firstName?.[0] || ""}${comment.author.lastName?.[0] || ""}`.toUpperCase();
                  return (
                    <div key={comment.id} className="pt-3 first:pt-0 flex gap-2.5" data-testid={`comment-${comment.id}`}>
                      <Avatar className="h-7 w-7 rounded-full shrink-0">
                        <AvatarImage src={comment.author.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                          {cInitials || "M"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-foreground text-xs">{cAuthorName}</span>
                          <span className="text-muted-foreground text-[10px]">
                            {formatDistanceToNow(new Date(comment.createdAt || new Date()), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-foreground/80 text-sm leading-relaxed mt-0.5">{comment.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                No comments yet. Be the first to share your thoughts.
              </p>
            )}
          </div>
        </div>
      </div>

      {user && !isAuthor && post.author?.id && (
        <ReportDialog
          open={reportOpen}
          onOpenChange={setReportOpen}
          contentType="post"
          contentId={post.id}
          authorId={post.author.id}
          authorName={authorName}
        />
      )}
    </Layout>
  );
}
