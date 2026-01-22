import { usePosts } from "@/hooks/use-posts";
import { PostCard } from "@/components/PostCard";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";

export default function Home() {
  const { data: posts, isLoading } = usePosts();

  return (
    <Layout>
      <SEO 
        title="Village Square" 
        description="See what's happening in your DisabilitySquare community. Share posts, connect with friends, and stay updated."
      />
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-primary mb-2" data-testid="text-village-square-title">The Village Square</h1>
            <p className="text-lg text-muted-foreground">See what's happening in your community today.</p>
          </div>
          <CreatePostDialog />
        </header>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 border rounded-2xl space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-20 bg-secondary/20 rounded-3xl border-2 border-dashed border-border">
            <h3 className="text-2xl font-display text-muted-foreground mb-2">It's quiet here...</h3>
            <p className="mb-6">Be the first to share something with the village!</p>
            <CreatePostDialog />
          </div>
        ) : (
          <div className="space-y-6">
            {posts?.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
