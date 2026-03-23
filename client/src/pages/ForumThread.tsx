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
import { ArrowUp, CheckCircle, ChevronLeft, Flag, Lightbulb, MessageSquare } from "lucide-react";
import type { ForumThread, ForumReply, ForumCategory } from "@shared/schema";
import { ReportDialog } from "@/components/ReportDialog";

type ReplyWithAuthor = ForumReply & {
  author: { id?: string; firstName: string | null; lastName: string | null; profileImageUrl: string | null };
};
type ThreadDetail = ForumThread & {
  author: { id?: string; firstName: string | null; lastName: string | null; profileImageUrl: string | null };
  replies: ReplyWithAuthor[];
  category?: ForumCategory;
};

function AuthorAvatar({ author, size = "sm" }: { author: { firstName: string | null; lastName: string | null; profileImageUrl: string | null }; size?: "sm" | "md" }) {
  const initials = `${author.firstName?.[0] || ""}${author.lastName?.[0] || ""}`.toUpperCase();
  const sizeClass = size === "md" ? "h-10 w-10" : "h-8 w-8";
  return (
    <Avatar className={`${sizeClass} shrink-0 rounded-full`}>
      <AvatarImage src={author.profileImageUrl || undefined} />
      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold rounded-full">
        {initials || "?"}
      </AvatarFallback>
    </Avatar>
  );
}

function ReplyCard({
  reply,
  isThreadAuthor,
  isAdviceRequest,
  userVotedReplyIds,
  currentUserId,
  onVote,
  onAccept,
}: {
  reply: ReplyWithAuthor;
  threadId: number;
  isThreadAuthor: boolean;
  isAdviceRequest: boolean;
  userVotedReplyIds: number[];
  currentUserId?: string;
  onVote: (replyId: number) => void;
  onAccept: (replyId: number) => void;
}) {
  const [reportOpen, setReportOpen] = useState(false);
  const voted = userVotedReplyIds.includes(reply.id);
  const authorName = `${reply.author.firstName || "Member"} ${reply.author.lastName || ""}`.trim();
  const canReport = !!currentUserId && !!reply.author.id;

  return (
    <article
      className={cn(
        "sm-post",
        reply.isAcceptedAnswer && "ring-2 ring-[#2A9D8F]/40 bg-[#2A9D8F]/3"
      )}
      data-testid={`card-reply-${reply.id}`}
    >
      {reply.isAcceptedAnswer && (
        <div className="flex items-center gap-1.5 px-4 py-2 bg-[#2A9D8F]/10 border-b border-[#2A9D8F]/20 rounded-t-2xl">
          <CheckCircle className="h-3.5 w-3.5 text-[#2A9D8F]" />
          <span className="text-xs font-semibold text-[#2A9D8F]">Accepted Answer</span>
        </div>
      )}
      <div className="px-4 pt-3 pb-3">
        <div className="flex gap-3">
          <AuthorAvatar author={reply.author} />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-sm font-semibold text-foreground">{authorName}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(reply.createdAt || new Date()), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{reply.body}</p>
            {reply.mediaUrls && reply.mediaUrls.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {reply.mediaUrls.map((url, i) => (
                  <img key={i} src={url} alt={`attachment ${i + 1}`} className="h-24 w-24 object-cover rounded-xl border border-border/50" />
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 mt-3 -ml-1">
              <button
                onClick={() => onVote(reply.id)}
                data-testid={`button-vote-reply-${reply.id}`}
                aria-label={`${voted ? "Remove upvote" : "Upvote"} (${reply.upvotesCount})`}
                className={cn(
                  "flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors",
                  voted
                    ? "text-accent font-bold bg-accent/10"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                )}
              >
                <ArrowUp className="h-3.5 w-3.5" />
                {reply.upvotesCount}
              </button>
              {isThreadAuthor && isAdviceRequest && !reply.isAcceptedAnswer && (
                <button
                  onClick={() => onAccept(reply.id)}
                  data-testid={`button-accept-reply-${reply.id}`}
                  className="flex items-center gap-1 text-xs text-[#2A9D8F] hover:text-[#228177] font-medium px-2 py-1 rounded-full hover:bg-[#2A9D8F]/10 transition-colors"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Mark as Answer
                </button>
              )}
              {canReport && (
                <button
                  onClick={() => setReportOpen(true)}
                  data-testid={`button-report-reply-${reply.id}`}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive px-2 py-1 rounded-full hover:bg-destructive/10 transition-colors ml-auto"
                  aria-label="Report reply"
                >
                  <Flag className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {canReport && reply.author.id && (
        <ReportDialog
          open={reportOpen}
          onOpenChange={setReportOpen}
          contentType="reply"
          contentId={reply.id}
          authorId={reply.author.id}
          authorName={authorName}
        />
      )}
    </article>
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
  const [threadReportOpen, setThreadReportOpen] = useState(false);
  const canReportThread = !!user && thread && !!thread.author.id;

  const acceptedReplies = thread?.replies.filter(r => r.isAcceptedAnswer) || [];
  const otherReplies = thread?.replies.filter(r => !r.isAcceptedAnswer) || [];

  return (
    <Layout>
      <SEO
        title={`${thread?.title || "Thread"} — Forums — DisabilitySquare`}
        description={thread?.body?.slice(0, 160) || "Community forum discussion"}
      />

      <div className="max-w-2xl">
        <nav className="flex items-center gap-2 mb-4 text-xs" aria-label="Breadcrumb">
          <Link href="/forums">
            <span className="text-primary hover:text-primary/80 cursor-pointer flex items-center gap-1 font-medium">
              <ChevronLeft className="h-3.5 w-3.5" />Forums
            </span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href={`/forums/${slug}`}>
            <span className="text-primary hover:text-primary/80 cursor-pointer font-medium">{slug}</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground truncate max-w-[160px]">{thread?.title || "Thread"}</span>
        </nav>

        {isLoading ? (
          <div className="space-y-3">
            <div className="sm-post animate-pulse p-4">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded-full w-1/4" />
                  <div className="h-5 bg-muted rounded-full w-3/4" />
                  <div className="h-16 bg-muted rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        ) : thread ? (
          <div className="space-y-3">
            {/* Original post */}
            <article className="sm-post" data-testid={`card-thread-detail-${thread.id}`}>
              <div className="px-4 pt-4 pb-3">
                <div className="flex gap-3">
                  <AuthorAvatar author={thread.author} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <span className="text-sm font-semibold text-foreground">{authorName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(thread.createdAt || new Date()), { addSuffix: true })}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
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

                    <h1 className="font-bold text-foreground text-base leading-snug mb-2">{thread.title}</h1>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{thread.body}</p>

                    {thread.mediaUrls && thread.mediaUrls.length > 0 && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {thread.mediaUrls.map((url, i) => (
                          <img key={i} src={url} alt={`attachment ${i + 1}`} className="h-32 w-32 object-cover rounded-xl border border-border/50" />
                        ))}
                      </div>
                    )}
                    {thread.tags && Array.isArray(thread.tags) && (thread.tags as string[]).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(thread.tags as string[]).map(tag => (
                          <span key={tag} className="sm-badge">{tag}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-3 -ml-1">
                      <button
                        onClick={() => voteMutation.mutate({ entityType: "thread", entityId: thread.id })}
                        disabled={voteMutation.isPending || !user}
                        data-testid={`button-vote-thread-${thread.id}`}
                        aria-label={`${userVotedThread ? "Remove upvote" : "Upvote"} (${thread.upvotesCount})`}
                        className={cn(
                          "flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors",
                          userVotedThread
                            ? "text-accent font-bold bg-accent/10"
                            : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                        )}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                        {thread.upvotesCount} upvote{thread.upvotesCount !== 1 ? "s" : ""}
                      </button>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {thread.replyCount} repl{thread.replyCount !== 1 ? "ies" : "y"}
                      </span>
                      {canReportThread && (
                        <button
                          onClick={() => setThreadReportOpen(true)}
                          data-testid={`button-report-thread-${thread.id}`}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive px-2 py-1 rounded-full hover:bg-destructive/10 transition-colors ml-auto"
                          aria-label="Report thread"
                        >
                          <Flag className="h-3.5 w-3.5" />
                          Report
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {canReportThread && thread.author.id && (
              <ReportDialog
                open={threadReportOpen}
                onOpenChange={setThreadReportOpen}
                contentType="thread"
                contentId={thread.id}
                authorId={thread.author.id}
                authorName={authorName}
              />
            )}

            {/* Accepted answers pinned first */}
            {acceptedReplies.map(reply => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                threadId={thread.id}
                isThreadAuthor={isThreadAuthor}
                isAdviceRequest={thread.isAdviceRequest}
                userVotedReplyIds={userVotedReplyIds}
                currentUserId={user?.id}
                onVote={id => voteMutation.mutate({ entityType: "reply", entityId: id })}
                onAccept={id => acceptMutation.mutate(id)}
              />
            ))}

            {acceptedReplies.length > 0 && otherReplies.length > 0 && (
              <div className="flex items-center gap-3 px-1 py-1">
                <div className="h-px flex-1 bg-border/40" />
                <span className="text-[11px] text-muted-foreground">Other replies</span>
                <div className="h-px flex-1 bg-border/40" />
              </div>
            )}

            {/* Regular replies */}
            {otherReplies.map(reply => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                threadId={thread.id}
                isThreadAuthor={isThreadAuthor}
                isAdviceRequest={thread.isAdviceRequest}
                userVotedReplyIds={userVotedReplyIds}
                currentUserId={user?.id}
                onVote={id => voteMutation.mutate({ entityType: "reply", entityId: id })}
                onAccept={id => acceptMutation.mutate(id)}
              />
            ))}

            {/* Reply composer */}
            {user ? (
              <div className="sm-card">
                <div className="sm-card-title">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Leave a reply
                </div>
                <div className="sm-card-body pt-2">
                  <Textarea
                    value={replyBody}
                    onChange={e => setReplyBody(e.target.value)}
                    placeholder="Share your thoughts, experience, or advice..."
                    rows={4}
                    className="text-sm mb-3 resize-none"
                    data-testid="input-reply-body"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Thoughtful replies (100+ chars) earn bonus points.
                    </p>
                    <Button
                      onClick={() => replyMutation.mutate()}
                      disabled={replyMutation.isPending || !replyBody.trim()}
                      className="text-xs h-9 px-5 rounded-full bg-primary hover:bg-primary/90"
                      data-testid="button-submit-reply"
                    >
                      {replyMutation.isPending ? "Posting…" : "Post Reply"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="sm-card">
                <div className="sm-card-body text-center py-6">
                  <p className="text-sm text-muted-foreground">Sign in to leave a reply.</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="sm-card">
            <div className="sm-card-body text-center py-12">
              <p className="text-muted-foreground text-sm">Thread not found.</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
