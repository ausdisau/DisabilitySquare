import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { ArrowUp, CheckCircle, ChevronLeft, Lightbulb, MessageSquare } from "lucide-react";
import type { ForumThread, ForumReply, ForumCategory } from "@shared/schema";

type ReplyWithAuthor = ForumReply & {
  author: { id?: string; firstName: string | null; lastName: string | null; profileImageUrl: string | null };
};
type ThreadDetail = ForumThread & {
  author: { id?: string; firstName: string | null; lastName: string | null; profileImageUrl: string | null };
  replies: ReplyWithAuthor[];
  category?: ForumCategory;
};

function AuthorAvatar({ author }: { author: { firstName: string | null; lastName: string | null; profileImageUrl: string | null } }) {
  const initials = `${author.firstName?.[0] || ""}${author.lastName?.[0] || ""}`.toUpperCase();
  return (
    <Avatar className="h-7 w-7 shrink-0 rounded-sm border border-[#b0b8c8]">
      <AvatarImage src={author.profileImageUrl || undefined} />
      <AvatarFallback className="bg-[#1B4B8A] text-white text-[10px] font-bold rounded-sm">{initials || "?"}</AvatarFallback>
    </Avatar>
  );
}

function ReplyCard({
  reply,
  threadId,
  isThreadAuthor,
  isAdviceRequest,
  userVotedReplyIds,
  onVote,
  onAccept,
}: {
  reply: ReplyWithAuthor;
  threadId: number;
  isThreadAuthor: boolean;
  isAdviceRequest: boolean;
  userVotedReplyIds: number[];
  onVote: (replyId: number) => void;
  onAccept: (replyId: number) => void;
}) {
  const voted = userVotedReplyIds.includes(reply.id);
  const authorName = `${reply.author.firstName || "Member"} ${reply.author.lastName || ""}`.trim();

  return (
    <div
      className={cn(
        "retro-post",
        reply.isAcceptedAnswer && "border-[#2A9D8F] bg-[#2A9D8F]/5"
      )}
      data-testid={`card-reply-${reply.id}`}
    >
      {reply.isAcceptedAnswer && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2A9D8F] text-white text-[11px] font-bold">
          <CheckCircle className="h-3 w-3" />
          Accepted Answer
        </div>
      )}
      <div className="retro-post-header">
        <AuthorAvatar author={reply.author} />
        <div className="flex-1 min-w-0">
          <span className="font-bold text-[#1B4B8A] text-sm">{authorName}</span>
          <span className="text-gray-400 text-[11px] ml-2">
            {formatDistanceToNow(new Date(reply.createdAt || new Date()), { addSuffix: true })}
          </span>
        </div>
      </div>
      <div className="retro-post-body">
        <p className="text-[13px] text-gray-800 whitespace-pre-wrap leading-relaxed">{reply.body}</p>
        {reply.mediaUrls && reply.mediaUrls.length > 0 && (
          <div className="mt-2 flex gap-2 flex-wrap">
            {reply.mediaUrls.map((url, i) => (
              <img key={i} src={url} alt={`attachment ${i + 1}`} className="h-24 w-24 object-cover rounded border border-gray-200" />
            ))}
          </div>
        )}
      </div>
      <div className="retro-post-footer">
        <button
          onClick={() => onVote(reply.id)}
          data-testid={`button-vote-reply-${reply.id}`}
          aria-label={`${voted ? "Remove upvote" : "Upvote"} (${reply.upvotesCount})`}
          className={cn(
            "flex items-center gap-1 text-[11px] transition-colors",
            voted ? "text-[#E07830] font-bold" : "text-[#1B4B8A] hover:text-[#E07830]"
          )}
        >
          <ArrowUp className="h-3 w-3" />
          {reply.upvotesCount}
        </button>
        {isThreadAuthor && isAdviceRequest && !reply.isAcceptedAnswer && (
          <button
            onClick={() => onAccept(reply.id)}
            data-testid={`button-accept-reply-${reply.id}`}
            className="flex items-center gap-1 text-[11px] text-[#2A9D8F] hover:text-[#228177] font-medium"
          >
            <CheckCircle className="h-3 w-3" />
            Mark as Answer
          </button>
        )}
      </div>
    </div>
  );
}

export default function ForumThreadPage() {
  const { slug, threadId } = useParams<{ slug: string; threadId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [replyBody, setReplyBody] = useState("");

  const { data: thread, isLoading } = useQuery<ThreadDetail>({
    queryKey: [`/api/forums/threads/${threadId}`],
    enabled: !!threadId,
  });

  const replyIds = thread?.replies.map(r => r.id) || [];
  const { data: votesData } = useQuery<{ votedIds: number[] }>({
    queryKey: [`/api/forums/votes/bulk-replies`, threadId],
    enabled: replyIds.length > 0,
    queryFn: async () => {
      const res = await fetch("/api/forums/votes/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ entityType: "reply", entityIds: replyIds }),
      });
      return res.json();
    },
  });
  const userVotedReplyIds = votesData?.votedIds || [];

  const { data: threadVotesData } = useQuery<{ votedIds: number[] }>({
    queryKey: [`/api/forums/votes/bulk-thread-single`, threadId],
    enabled: !!threadId,
    queryFn: async () => {
      const res = await fetch("/api/forums/votes/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ entityType: "thread", entityIds: [parseInt(threadId!)] }),
      });
      return res.json();
    },
  });
  const userVotedThread = threadVotesData?.votedIds?.includes(parseInt(threadId!)) ?? false;

  const replyMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/forums/threads/${threadId}/replies`, { body: replyBody }),
    onSuccess: () => {
      setReplyBody("");
      queryClient.invalidateQueries({ queryKey: [`/api/forums/threads/${threadId}`] });
      toast({ title: "Reply posted!" });
    },
    onError: () => toast({ title: "Failed to post reply", variant: "destructive" }),
  });

  const voteMutation = useMutation({
    mutationFn: ({ entityType, entityId }: { entityType: string; entityId: number }) =>
      apiRequest("POST", `/api/forums/${entityType === "thread" ? "threads" : "replies"}/${entityId}/vote`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/forums/threads/${threadId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/forums/votes/bulk-replies`, threadId] });
      queryClient.invalidateQueries({ queryKey: [`/api/forums/votes/bulk-thread-single`, threadId] });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (replyId: number) => apiRequest("POST", `/api/forums/replies/${replyId}/accept`, { threadId: parseInt(threadId!) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/forums/threads/${threadId}`] });
      toast({ title: "Answer accepted!" });
    },
    onError: (e: any) => toast({ title: e?.message || "Failed to mark answer", variant: "destructive" }),
  });

  const isThreadAuthor = !!user && thread?.authorId === user.id;
  const authorName = thread ? `${thread.author.firstName || "Member"} ${thread.author.lastName || ""}`.trim() : "";

  // Partition replies: accepted first, rest chronological
  const acceptedReplies = thread?.replies.filter(r => r.isAcceptedAnswer) || [];
  const otherReplies = thread?.replies.filter(r => !r.isAcceptedAnswer) || [];

  return (
    <Layout>
      <SEO
        title={`${thread?.title || "Thread"} — Forums — DisabilitySquare`}
        description={thread?.body?.slice(0, 160) || "Community forum discussion"}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-3 text-[12px]">
        <Link href="/forums">
          <span className="text-[#1B4B8A] hover:text-[#E07830] cursor-pointer flex items-center gap-1">
            <ChevronLeft className="h-3 w-3" />Forums
          </span>
        </Link>
        <span className="text-gray-400">/</span>
        <Link href={`/forums/${slug}`}>
          <span className="text-[#1B4B8A] hover:text-[#E07830] cursor-pointer">{slug}</span>
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600 truncate max-w-[200px]">{thread?.title || "Thread"}</span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <div className="retro-post animate-pulse">
            <div className="retro-post-header h-8 bg-[#eef2f8]" />
            <div className="retro-post-body h-20" />
          </div>
        </div>
      ) : thread ? (
        <div className="space-y-2">
          {/* Original post */}
          <article className="retro-post" data-testid={`card-thread-detail-${thread.id}`}>
            <div className="retro-post-header">
              <AuthorAvatar author={thread.author} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {thread.isAdviceRequest && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-[#E07830]/10 text-[#E07830] border border-[#E07830]/30 rounded-sm">
                      <Lightbulb className="h-2.5 w-2.5" />Advice Request
                    </span>
                  )}
                  {thread.isSolved && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-[#2A9D8F]/10 text-[#2A9D8F] border border-[#2A9D8F]/30 rounded-sm">
                      <CheckCircle className="h-2.5 w-2.5" />Solved
                    </span>
                  )}
                </div>
                <h1 className="font-bold text-[#1B4B8A] text-[14px] leading-tight mt-0.5">{thread.title}</h1>
                <span className="text-gray-400 text-[11px]">
                  by {authorName} · {formatDistanceToNow(new Date(thread.createdAt || new Date()), { addSuffix: true })}
                </span>
              </div>
            </div>
            <div className="retro-post-body">
              <p className="text-[13px] text-gray-800 whitespace-pre-wrap leading-relaxed">{thread.body}</p>
              {thread.mediaUrls && thread.mediaUrls.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {thread.mediaUrls.map((url, i) => (
                    <img key={i} src={url} alt={`attachment ${i + 1}`} className="h-32 w-32 object-cover rounded border border-gray-200" />
                  ))}
                </div>
              )}
              {thread.tags && Array.isArray(thread.tags) && (thread.tags as string[]).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {(thread.tags as string[]).map(tag => (
                    <span key={tag} className="retro-badge">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="retro-post-footer">
              <button
                onClick={() => voteMutation.mutate({ entityType: "thread", entityId: thread.id })}
                disabled={voteMutation.isPending || !user}
                data-testid={`button-vote-thread-${thread.id}`}
                className={cn(
                  "flex items-center gap-1 text-[11px] transition-colors",
                  userVotedThread ? "text-[#E07830] font-bold" : "text-[#1B4B8A] hover:text-[#E07830]"
                )}
              >
                <ArrowUp className="h-3 w-3" />
                {thread.upvotesCount} upvote{thread.upvotesCount !== 1 ? "s" : ""}
              </button>
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <MessageSquare className="h-3 w-3" />{thread.replyCount} repl{thread.replyCount !== 1 ? "ies" : "y"}
              </span>
            </div>
          </article>

          {/* Accepted answers pinned first */}
          {acceptedReplies.map(reply => (
            <ReplyCard
              key={reply.id}
              reply={reply}
              threadId={thread.id}
              isThreadAuthor={isThreadAuthor}
              isAdviceRequest={thread.isAdviceRequest}
              userVotedReplyIds={userVotedReplyIds}
              onVote={id => voteMutation.mutate({ entityType: "reply", entityId: id })}
              onAccept={id => acceptMutation.mutate(id)}
            />
          ))}

          {/* Regular replies */}
          {otherReplies.map(reply => (
            <ReplyCard
              key={reply.id}
              reply={reply}
              threadId={thread.id}
              isThreadAuthor={isThreadAuthor}
              isAdviceRequest={thread.isAdviceRequest}
              userVotedReplyIds={userVotedReplyIds}
              onVote={id => voteMutation.mutate({ entityType: "reply", entityId: id })}
              onAccept={id => acceptMutation.mutate(id)}
            />
          ))}

          {/* Reply composer */}
          {user ? (
            <div className="retro-box">
              <div className="retro-box-header">
                <MessageSquare className="h-3 w-3" />
                Leave a reply
              </div>
              <div className="retro-box-content">
                <Textarea
                  value={replyBody}
                  onChange={e => setReplyBody(e.target.value)}
                  placeholder="Share your thoughts, experience, or advice..."
                  rows={4}
                  className="text-[13px] border-[#c8d0dc] mb-2"
                  data-testid="input-reply-body"
                />
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-gray-400">
                    Thoughtful replies (100+ chars) earn bonus points.
                  </p>
                  <Button
                    onClick={() => replyMutation.mutate()}
                    disabled={replyMutation.isPending || !replyBody.trim()}
                    className="bg-[#1B4B8A] hover:bg-[#163d75] text-white text-[12px] h-8 px-4"
                    data-testid="button-submit-reply"
                  >
                    {replyMutation.isPending ? "Posting…" : "Post Reply"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="retro-box">
              <div className="retro-box-content text-center py-4">
                <p className="text-[12px] text-gray-500">Sign in to leave a reply.</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="retro-box">
          <div className="retro-box-content text-center py-8">
            <p className="text-gray-500 text-[13px]">Thread not found.</p>
          </div>
        </div>
      )}
    </Layout>
  );
}
