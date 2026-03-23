import { type Post } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { useCreateComment } from "@/hooks/use-posts";
import { Input } from "@/components/ui/input";
import { ReportUserButton } from "@/components/ReportUserButton";
import { TextToSpeech } from "@/components/TextToSpeech";
import { useAuth } from "@/hooks/use-auth";
import { PostReactions } from "@/components/PostReactions";

type PostWithAuthor = Post & {
  author: {
    id?: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
  comments?: any[];
};

export function PostCard({ post }: { post: PostWithAuthor }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const createComment = useCreateComment();
  const { user } = useAuth();

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    createComment.mutate({ content: commentText, postId: post.id }, {
      onSuccess: () => setCommentText(""),
    });
  };

  const authorInitials = `${post.author.firstName?.[0] || ""}${post.author.lastName?.[0] || ""}`.toUpperCase();
  const authorName = `${post.author.firstName || "User"} ${post.author.lastName || ""}`.trim();
  const timeAgo = formatDistanceToNow(new Date(post.createdAt || new Date()), { addSuffix: true });

  return (
    <article className="sm-post" data-testid={`card-post-${post.id}`}>
      <div className="flex gap-3 px-4 pt-4 pb-3">
        <div className="shrink-0">
          <Avatar className="h-10 w-10 rounded-full ring-2 ring-border/30">
            <AvatarImage src={post.author.profileImageUrl || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold rounded-full">
              {authorInitials}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-semibold text-foreground text-sm leading-tight">{authorName}</span>
            <span className="text-muted-foreground text-xs shrink-0">{timeAgo}</span>
            {post.author.id && post.author.id !== user?.id && (
              <div className="ml-auto">
                <ReportUserButton
                  userId={post.author.id}
                  userName={authorName}
                  variant="dropdown"
                />
              </div>
            )}
          </div>

          {post.title && (
            <p className="font-semibold text-foreground text-sm mb-1 leading-snug">{post.title}</p>
          )}
          <p className="text-foreground/80 text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>

          {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(post.tags as string[]).map((tag: string) => (
                <span key={tag} className="sm-badge">{tag}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 mt-3 -ml-1.5">
            <PostReactions postId={post.id} compact />

            <button
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-full hover:bg-primary/10 text-xs"
              onClick={() => setShowComments(!showComments)}
              data-testid={`button-comment-${post.id}`}
              aria-expanded={showComments}
              aria-label={`${showComments ? "Hide" : "Show"} comments`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>{post.comments?.length || 0}</span>
            </button>

            <div className="ml-auto flex items-center gap-1">
              <TextToSpeech
                text={`${post.title}. ${post.content}`}
                label="Read post aloud"
              />
            </div>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="border-t border-border/40 bg-muted/30 rounded-b-2xl">
          <form onSubmit={handleComment} className="flex gap-2 px-4 py-3 border-b border-border/30">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment…"
              className="text-sm h-9 rounded-full bg-background border-border/50"
              data-testid={`input-comment-${post.id}`}
            />
            <Button
              type="submit"
              disabled={createComment.isPending || !commentText.trim()}
              className="h-9 text-xs px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
              data-testid={`button-submit-comment-${post.id}`}
            >
              Reply
            </Button>
          </form>

          {post.comments && post.comments.length > 0 && (
            <div className="divide-y divide-border/30">
              {post.comments.map((comment: any) => (
                <div key={comment.id} className="px-4 py-3 flex gap-2">
                  <Avatar className="h-7 w-7 rounded-full shrink-0">
                    <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-bold rounded-full">
                      {`${comment.author?.firstName?.[0] || ""}${comment.author?.lastName?.[0] || ""}`.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-foreground text-xs mr-1.5">
                      {comment.author?.firstName} {comment.author?.lastName}
                    </span>
                    <span className="text-foreground/80 text-xs">{comment.content}</span>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      {formatDistanceToNow(new Date(comment.createdAt || new Date()), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
