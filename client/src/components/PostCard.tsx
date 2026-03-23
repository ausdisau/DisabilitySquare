import { type Post } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, Volume2 } from "lucide-react";
import { useState } from "react";
import { useCreateComment } from "@/hooks/use-posts";
import { Input } from "@/components/ui/input";
import { ReportUserButton } from "@/components/ReportUserButton";
import { TextToSpeech } from "@/components/TextToSpeech";
import { useAuth } from "@/hooks/use-auth";

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
    <article className="retro-post" data-testid={`card-post-${post.id}`}>
      {/* Post header row — author info bar */}
      <div className="retro-post-header">
        <Avatar className="h-7 w-7 shrink-0 rounded-sm border border-[#b0b8c8]">
          <AvatarImage src={post.author.profileImageUrl || undefined} />
          <AvatarFallback className="bg-[#1B4B8A] text-white text-[10px] font-bold rounded-sm">
            {authorInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <span className="font-bold text-[#1B4B8A] mr-2">{authorName}</span>
          <span className="text-gray-400">posted</span>
          <span className="text-gray-500 ml-2 text-[11px]">{timeAgo}</span>
        </div>
        {post.author.id && post.author.id !== user?.id && (
          <ReportUserButton
            userId={post.author.id}
            userName={authorName}
            variant="dropdown"
          />
        )}
      </div>

      {/* Post body */}
      <div className="retro-post-body">
        <h4 className="font-bold text-[#1B4B8A] mb-1 text-sm leading-tight">{post.title}</h4>
        <p className="text-gray-800 whitespace-pre-wrap text-[13px] leading-relaxed">{post.content}</p>

        {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {(post.tags as string[]).map((tag: string) => (
              <span key={tag} className="retro-badge">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Post footer — actions */}
      <div className="retro-post-footer">
        <button
          className="flex items-center gap-1 text-[#1B4B8A] hover:text-[#E07830] transition-colors"
          data-testid={`button-like-${post.id}`}
          aria-label={`${post.likesCount || 0} likes`}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          <span>{post.likesCount || 0} Like{post.likesCount !== 1 ? "s" : ""}</span>
        </button>

        <button
          className="flex items-center gap-1 text-[#1B4B8A] hover:text-[#E07830] transition-colors"
          onClick={() => setShowComments(!showComments)}
          data-testid={`button-comment-${post.id}`}
          aria-expanded={showComments}
          aria-label={`${showComments ? "Hide" : "Show"} comments`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Comment</span>
        </button>

        <div className="ml-auto">
          <TextToSpeech
            text={`${post.title}. ${post.content}`}
            label="Read post aloud"
          />
        </div>
      </div>

      {/* Comment section */}
      {showComments && (
        <div className="border-t border-[#e0e6ef] bg-[#fafbfd]">
          <form onSubmit={handleComment} className="flex gap-2 p-2 border-b border-[#e0e6ef]">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="text-[12px] h-7 border-[#b0b8c8]"
              data-testid={`input-comment-${post.id}`}
            />
            <Button
              type="submit"
              disabled={createComment.isPending || !commentText.trim()}
              className="h-7 text-[11px] px-3 bg-[#1B4B8A] hover:bg-[#163d75] text-white"
              data-testid={`button-submit-comment-${post.id}`}
            >
              Post
            </Button>
          </form>

          {post.comments && post.comments.length > 0 && (
            <div className="divide-y divide-[#eef2f8]">
              {post.comments.map((comment: any) => (
                <div key={comment.id} className="px-3 py-1.5 text-[12px]">
                  <span className="font-bold text-[#1B4B8A] mr-1">
                    {comment.author?.firstName} {comment.author?.lastName}:
                  </span>
                  <span className="text-gray-700">{comment.content}</span>
                  <span className="text-gray-400 text-[11px] ml-2">
                    {formatDistanceToNow(new Date(comment.createdAt || new Date()), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
