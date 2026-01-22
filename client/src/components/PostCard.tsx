import { type Post } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { useCreateComment } from "@/hooks/use-posts";
import { Input } from "@/components/ui/input";
import { ReportUserButton } from "@/components/ReportUserButton";
import { useAuth } from "@/hooks/use-auth";

type PostWithAuthor = Post & {
  author: {
    id?: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
  comments?: any[]; // Simplified for display
};

export function PostCard({ post }: { post: PostWithAuthor }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const createComment = useCreateComment();
  const { user } = useAuth();

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    createComment.mutate({
      content: commentText,
      postId: post.id,
    }, {
      onSuccess: () => setCommentText("")
    });
  };

  const authorInitials = `${post.author.firstName?.[0] || ''}${post.author.lastName?.[0] || ''}`.toUpperCase();
  const authorName = `${post.author.firstName || 'User'} ${post.author.lastName || ''}`;

  return (
    <Card className="overflow-hidden border-2 border-border/50" data-testid={`card-post-${post.id}`}>
      <CardHeader className="flex flex-row items-center gap-4 bg-secondary/30 p-4">
        <Avatar className="h-12 w-12 border-2 border-background ring-2 ring-primary/10">
          <AvatarImage src={post.author.profileImageUrl || undefined} />
          <AvatarFallback className="bg-primary/20 text-primary font-bold">
            {authorInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-bold text-lg leading-tight">{authorName}</h3>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt || new Date()), { addSuffix: true })}
          </p>
        </div>
        {post.author.id && post.author.id !== user?.id && (
          <ReportUserButton 
            userId={post.author.id} 
            userName={authorName}
            variant="dropdown"
          />
        )}
      </CardHeader>
      <CardContent className="p-6">
        <h4 className="text-xl font-bold mb-3 font-display text-primary">{post.title}</h4>
        <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="bg-muted/30 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-4 w-full">
          <Button variant="ghost" size="sm" className="gap-2" data-testid={`button-like-${post.id}`}>
            <ThumbsUp className="h-5 w-5" />
            <span>{post.likesCount || 0} Likes</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={() => setShowComments(!showComments)}
            data-testid={`button-comment-${post.id}`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Comment</span>
          </Button>
        </div>
        
        {showComments && (
          <form onSubmit={handleComment} className="w-full flex gap-2">
            <Input 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a supportive comment..."
              className="bg-background"
              data-testid={`input-comment-${post.id}`}
            />
            <Button type="submit" disabled={createComment.isPending || !commentText.trim()} data-testid={`button-submit-comment-${post.id}`}>
              Post
            </Button>
          </form>
        )}
      </CardFooter>
    </Card>
  );
}
