import { useRoute } from "wouter";
import { useGroup } from "@/hooks/use-groups";
import { usePosts } from "@/hooks/use-posts";
import { Layout } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { Link } from "wouter";

export default function GroupDetails() {
  const [, params] = useRoute("/groups/:id");
  const groupId = Number(params?.id);
  
  const { data: group, isLoading: groupLoading } = useGroup(groupId);
  const { data: posts, isLoading: postsLoading } = usePosts({ groupId: String(groupId) });

  if (groupLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-20 w-1/2" />
        </div>
      </Layout>
    );
  }

  if (!group) return <div className="p-8">Group not found</div>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Link href="/groups">
          <Button variant="ghost" className="mb-6 hover:bg-transparent hover:text-primary p-0 h-auto gap-2">
            <ArrowLeft className="h-5 w-5" /> Back to Groups
          </Button>
        </Link>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 md:p-12 mb-10 border border-border/50 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-32 w-32 bg-background rounded-full flex items-center justify-center shadow-lg text-primary shrink-0">
              <Users className="h-16 w-16" />
            </div>
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 bg-background text-foreground text-sm font-bold rounded-full border shadow-sm">
                {group.category.toUpperCase()}
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-primary">{group.name}</h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">{group.description}</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold font-display">Group Discussions</h2>
          <CreatePostDialog groupId={groupId} />
        </div>

        <div className="space-y-6">
          {postsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : posts?.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-2xl">
              <p className="text-lg text-muted-foreground">No discussions yet. Start one!</p>
            </div>
          ) : (
            posts?.map(post => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>
    </Layout>
  );
}
