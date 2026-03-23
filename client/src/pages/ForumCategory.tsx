import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { CreateThreadDialog } from "@/components/CreateThreadDialog";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ChevronLeft, ArrowUp, CheckCircle, Lightbulb, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ForumCategory, ForumThread } from "@shared/schema";

type ThreadWithAuthor = ForumThread & { author: { firstName: string | null; lastName: string | null } };

function ThreadRow({ thread, categorySlug, userVotedIds }: { thread: ThreadWithAuthor; categorySlug: string; userVotedIds: number[] }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const voted = userVotedIds.includes(thread.id);

  const voteMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/forums/threads/${thread.id}/vote`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/forums/categories/${categorySlug}/threads`] });
      queryClient.invalidateQueries({ queryKey: [`/api/forums/votes/bulk-threads`, categorySlug] });
    },
  });

  const authorName = `${thread.author.firstName || "Member"} ${thread.author.lastName || ""}`.trim();
  const authorInitials = `${thread.author.firstName?.[0] || ""}${thread.author.lastName?.[0] || ""}`.toUpperCase();

  return (
    <article className="sm-post" data-testid={`card-thread-${thread.id}`}>
      <div className="px-4 pt-4 pb-3">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 rounded-full shrink-0 mt-0.5">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold rounded-full">
              {authorInitials || "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-xs font-semibold text-foreground">{authorName}</span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-0.5 shrink-0">
                <Clock className="h-2.5 w-2.5" />
                {formatDistanceToNow(new Date(thread.lastActivityAt || thread.createdAt || new Date()), { addSuffix: true })}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              {thread.isAdviceRequest && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-accent/10 text-accent rounded-full border border-accent/20">
                  <Lightbulb className="h-2.5 w-2.5" />Advice Request
                </span>
              )}
              {thread.isSolved && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-[#2A9D8F]/10 text-[#2A9D8F] rounded-full border border-[#2A9D8F]/20">
                  <CheckCircle className="h-2.5 w-2.5" />Solved
                </span>
              )}
            </div>

            <Link href={`/forums/${categorySlug}/${thread.id}`}>
              <h3 className="font-semibold text-foreground text-sm leading-snug hover:text-primary transition-colors cursor-pointer mb-1">
                {thread.title}
              </h3>
            </Link>

            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{thread.body}</p>

            {thread.tags && Array.isArray(thread.tags) && (thread.tags as string[]).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {(thread.tags as string[]).map(tag => (
                  <span key={tag} className="sm-badge">{tag}</span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 mt-3 -ml-1">
              <button
                onClick={() => user && voteMutation.mutate()}
                disabled={voteMutation.isPending || !user}
                data-testid={`button-vote-thread-${thread.id}`}
                aria-label={`${voted ? "Remove upvote" : "Upvote"} (${thread.upvotesCount})`}
                className={cn(
                  "flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors",
                  voted
                    ? "text-accent font-bold bg-accent/10"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                )}
              >
                <ArrowUp className="h-3.5 w-3.5" />
                {thread.upvotesCount}
              </button>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                {thread.replyCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ForumCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category, isLoading: catLoading } = useQuery<ForumCategory>({
    queryKey: [`/api/forums/categories/${slug}`],
  });
  const { data: threads, isLoading: threadsLoading } = useQuery<ThreadWithAuthor[]>({
    queryKey: [`/api/forums/categories/${slug}/threads`],
    enabled: !!slug,
  });
  const { data: allCategories } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forums/categories"],
  });

  const threadIds = threads?.map(t => t.id) || [];
  const { data: votesData } = useQuery<{ votedIds: number[] }>({
    queryKey: [`/api/forums/votes/bulk-threads`, slug],
    enabled: threadIds.length > 0,
    queryFn: async () => {
      const res = await fetch("/api/forums/votes/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ entityType: "thread", entityIds: threadIds }),
      });
      return res.json();
    },
  });
  const userVotedIds = votesData?.votedIds || [];

  const isLoading = catLoading || threadsLoading;

  return (
    <Layout>
      <SEO
        title={`${category?.name || "Forum"} — DisabilitySquare`}
        description={category?.description || "Community forum discussion threads"}
      />

      <div className="max-w-2xl">
        <nav className="flex items-center gap-2 mb-4 text-xs" aria-label="Breadcrumb">
          <Link href="/forums">
            <span className="text-primary hover:text-primary/80 cursor-pointer flex items-center gap-1 font-medium">
              <ChevronLeft className="h-3.5 w-3.5" />Forums
            </span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{category?.name || slug}</span>
        </nav>

        <div className="sm-card mb-4">
          <div className="sm-card-title">
            <MessageSquare className="h-4 w-4 text-primary" />
            {category?.name || slug}
            <span className="ml-auto text-[10px] font-normal text-muted-foreground">
              {threads?.length || 0} threads
            </span>
          </div>
          {category && (
            <div className="sm-card-body pt-1 flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground leading-relaxed">{category.description}</p>
              <CreateThreadDialog categories={allCategories || []} defaultCategorySlug={slug} />
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="sm-post animate-pulse p-4">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded-full w-1/4" />
                    <div className="h-4 bg-muted rounded-full w-3/4" />
                    <div className="h-3 bg-muted rounded-full w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : threads?.length === 0 ? (
          <div className="sm-card">
            <div className="sm-card-body text-center py-10">
              <p className="text-sm text-muted-foreground mb-4">
                No threads yet in this category. Be the first to start one!
              </p>
              <CreateThreadDialog categories={allCategories || []} defaultCategorySlug={slug} />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {threads?.map(thread => (
              <ThreadRow
                key={thread.id}
                thread={thread}
                categorySlug={slug}
                userVotedIds={userVotedIds}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
