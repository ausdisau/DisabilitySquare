import { type Post } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Flag, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useCreateComment } from "@/hooks/use-posts";
import { Input } from "@/components/ui/input";
import { TextToSpeech } from "@/components/TextToSpeech";
import { useAuth } from "@/hooks/use-auth";
import { PostReactions } from "@/components/PostReactions";
import { ReportDialog } from "@/components/ReportDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [reportOpen, setReportOpen] = useState(false);
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
      {/* Wall-post author header — identity first (Bebo-style) */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2.5 border-b border-border/30 bg-primary/[0.03]">
        <Avatar className="h-9 w-9 rounded-full shrink-0 ring-2 ring-primary/15">
          <AvatarImage src={post.author.profileImageUrl || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold rounded-full">
            {authorInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <span className="font-bold text-foreground text-sm leading-tight block truncate">{authorName}</span>
          <span className="text-muted-foreground text-[11px]">{timeAgo}</span>
        </div>
        {user && post.author.id && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid={`button-post-menu-${post.id}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setReportOpen(true)}
                className="text-destructive focus:text-destructive"
                data-testid={`button-report-post-${post.id}`}
              >
                <Flag className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Post body */}
      <div className="px-4 pt-3 pb-2">
        {post.title && (
          <p className="font-semibold text-foreground text-sm mb-1.5 leading-snug">{post.title}</p>
        )}
        <p className="text-foreground/80 text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>

        {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {(post.tags as string[]).map((tag: string) => (
              <span key={tag} className="sm-badge">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-1 px-3 pb-2 -ml-0.5">
        <PostReactions postId={post.id} compact />

        <button
          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-full hover:bg-primary/8 text-xs"
          onClick={() => setShowComments(!showComments)}
          data-testid={`button-comment-${post.id}`}
          aria-expanded={showComments}
          aria-label={`${showComments ? "Hide" : "Show"} comments`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>{post.comments?.length || 0}</span>
        </button>

        <div className="ml-auto">
          <TextToSpeech
            text={`${post.title}. ${post.content}`}
            label="Read post aloud"
          />
        </div>
      </div>

      {showComments && (
        <div className="border-t border-border/40 bg-muted/20">
          <form onSubmit={handleComment} className="flex gap-2 px-4 py-3 border-b border-border/20">
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
            <div className="divide-y divide-border/20">
              {post.comments.map((comment: any) => (
                <div key={comment.id} className="px-4 py-2.5 flex gap-2.5">
                  <Avatar className="h-7 w-7 rounded-full shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                      {`${comment.author?.firstName?.[0] || ""}${comment.author?.lastName?.[0] || ""}`.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-foreground text-xs mr-1.5">
                      {comment.author?.firstName} {comment.author?.lastName}
                    </span>
                    <span className="text-foreground/75 text-xs">{comment.content}</span>
                    <p className="text-muted-foreground text-[10px] mt-0.5">
                      {formatDistanceToNow(new Date(comment.createdAt || new Date()), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {post.author.id && (
        <ReportDialog
          open={reportOpen}
          onOpenChange={setReportOpen}
          contentType="post"
          contentId={post.id}
          authorId={post.author.id}
          authorName={authorName}
        />
      )}
    </article>
  );
}
