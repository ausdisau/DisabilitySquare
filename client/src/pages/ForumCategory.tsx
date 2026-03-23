import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { CreateThreadDialog } from "@/components/CreateThreadDialog";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ChevronLeft, ArrowUp, CheckCircle, Lightbulb, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
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

  return (
    <div className="retro-post" data-testid={`card-thread-${thread.id}`}>
      <div className="retro-post-header">
        <div className="flex-1 min-w-0 flex items-center gap-2">
          {thread.isAdviceRequest && (
            <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-[#E07830]/10 text-[#E07830] border border-[#E07830]/30 rounded-sm">
              <Lightbulb className="h-2.5 w-2.5" />Advice Request
            </span>
          )}
          {thread.isSolved && (
            <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-[#2A9D8F]/10 text-[#2A9D8F] border border-[#2A9D8F]/30 rounded-sm">
              <CheckCircle className="h-2.5 w-2.5" />Solved
            </span>
          )}
          <Link href={`/forums/${categorySlug}/${thread.id}`}>
            <span className="font-bold text-[#1B4B8A] hover:text-[#E07830] cursor-pointer truncate">{thread.title}</span>
          </Link>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-gray-400 shrink-0">
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />{thread.replyCount}
          </span>
        </div>
      </div>
      <div className="retro-post-body py-1.5">
        <p className="text-[12px] text-gray-600 line-clamp-2">{thread.body}</p>
        {thread.tags && Array.isArray(thread.tags) && (thread.tags as string[]).length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {(thread.tags as string[]).map(tag => (
              <span key={tag} className="retro-badge">{tag}</span>
            ))}
          </div>
        )}
      </div>
      <div className="retro-post-footer">
        <button
          onClick={() => user && voteMutation.mutate()}
          disabled={voteMutation.isPending || !user}
          data-testid={`button-vote-thread-${thread.id}`}
          aria-label={`${voted ? "Remove upvote" : "Upvote"} (${thread.upvotesCount})`}
          className={cn(
            "flex items-center gap-1 text-[11px] transition-colors",
            voted ? "text-[#E07830] font-bold" : "text-[#1B4B8A] hover:text-[#E07830]"
          )}
        >
          <ArrowUp className="h-3 w-3" />
          {thread.upvotesCount}
        </button>
        <span className="text-[10px] text-gray-400">by {authorName}</span>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-gray-400">
          <Clock className="h-2.5 w-2.5" />
          {formatDistanceToNow(new Date(thread.lastActivityAt || thread.createdAt || new Date()), { addSuffix: true })}
        </span>
      </div>
    </div>
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

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-3 text-[12px]">
        <Link href="/forums">
          <span className="text-[#1B4B8A] hover:text-[#E07830] cursor-pointer flex items-center gap-1">
            <ChevronLeft className="h-3 w-3" />Forums
          </span>
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">{category?.name || slug}</span>
      </div>

      <div className="retro-box mb-3">
        <div className="retro-box-header">
          <MessageSquare className="h-3 w-3" />
          {category?.name || slug}
          <span className="ml-auto font-normal normal-case tracking-normal text-blue-200 text-[10px]">
            {threads?.length || 0} threads · latest activity first
          </span>
        </div>
        {category && (
          <div className="retro-box-content py-2 flex items-center justify-between">
            <p className="text-[12px] text-gray-600">{category.description}</p>
            <CreateThreadDialog categories={allCategories || []} defaultCategorySlug={slug} />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="retro-post animate-pulse">
              <div className="retro-post-header h-8 bg-[#eef2f8]" />
              <div className="retro-post-body h-10" />
            </div>
          ))}
        </div>
      ) : threads?.length === 0 ? (
        <div className="retro-box">
          <div className="retro-box-content text-center py-8">
            <p className="text-[13px] text-gray-500 mb-3">No threads yet in this category. Be the first to start one!</p>
            <CreateThreadDialog categories={allCategories || []} defaultCategorySlug={slug} />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
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
    </Layout>
  );
}
