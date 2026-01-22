import { useState } from "react";
import { useCreatePost } from "@/hooks/use-posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PenSquare, Loader2 } from "lucide-react";

export function CreatePostDialog({ groupId }: { groupId?: number }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const createPost = useCreatePost();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPost.mutate(
      { title, content, groupId },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle("");
          setContent("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" data-testid="button-create-post">
          <PenSquare className="h-5 w-5" />
          Share Something
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-2 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-primary">Create New Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-lg">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title..."
              required
              data-testid="input-post-title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content" className="text-lg">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[150px] resize-none"
              required
              data-testid="input-post-content"
            />
          </div>
          <DialogFooter>
            <Button type="submit" size="lg" disabled={createPost.isPending} className="w-full" data-testid="button-submit-post">
              {createPost.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post to Square"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
