import { usePosts } from "@/hooks/use-posts";
import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/PostCard";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { WellnessCheckIn } from "@/components/WellnessCheckIn";
import { Clock, Users, MessageSquare, Star, RefreshCw, Shield } from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function RightPanel() {
  const { data: leaderboard } = useQuery<any[]>({
    queryKey: ["/api/points/leaderboard"],
  });
  const { data: groups } = useQuery<any[]>({
    queryKey: ["/api/groups"],
  });

  return (
    <aside className="w-64 shrink-0 hidden lg:block pl-4" aria-label="Community info">
      <div className="sticky top-20 space-y-3">
        <div className="sm-card">
          <div className="sm-card-title">
            <Users className="h-4 w-4 text-primary" aria-hidden="true" />
            Community
          </div>
          <div className="sm-card-body space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Groups</span>
              <span className="sm-stat">{groups?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Top Members</span>
              <span className="sm-stat">{leaderboard?.length || 0}</span>
            </div>
            <div className="sm-divider" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Showing newest posts first. No algorithm — just people, in order.
            </p>
          </div>
        </div>

        {leaderboard && leaderboard.length > 0 && (
          <div className="sm-card">
            <div className="sm-card-title">
              <Star className="h-4 w-4 text-accent" aria-hidden="true" />
              Top Members
            </div>
            <div className="sm-card-body space-y-2">
              {leaderboard.slice(0, 5).map((entry: any, i: number) => (
                <div key={entry.userId} className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs w-4 shrink-0 text-center">{i + 1}</span>
                  <Avatar className="h-7 w-7 rounded-full shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                      {`${entry.user?.firstName?.[0] || ""}${entry.user?.lastName?.[0] || ""}`.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm truncate text-foreground">
                    {entry.user?.firstName} {entry.user?.lastName?.charAt(0)}.
                  </span>
                  <span className="sm-stat shrink-0">{entry.totalPoints}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {groups && groups.length > 0 && (
          <div className="sm-card">
            <div className="sm-card-title">
              <MessageSquare className="h-4 w-4 text-primary" aria-hidden="true" />
              Groups
            </div>
            <div className="sm-card-body space-y-1">
              {groups.slice(0, 6).map((group: any) => (
                <Link key={group.id} href={`/groups/${group.id}`}>
                  <div className="text-sm text-foreground/80 hover:text-primary cursor-pointer py-1 truncate transition-colors">
                    {group.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="sm-card">
          <div className="sm-card-body">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                This is a moderated, eSafety compliant community. Be kind. Report anything concerning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function Home() {
  const { data: posts, isLoading, refetch } = usePosts();

  return (
    <Layout>
      <SEO
        title="Village Square"
        description="See what's happening in your DisabilitySquare community. Share posts, connect with friends, and stay updated."
      />

      <div className="flex gap-0">
        <div className="flex-1 min-w-0 max-w-[620px]">
          <div className="flex items-center justify-between mb-4 px-1">
            <h1 className="text-lg font-bold text-foreground">Latest</h1>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-muted"
              aria-label="Refresh posts"
              data-testid="button-refresh-posts"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>

          <WellnessCheckIn />

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="sm-post animate-pulse p-4">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted rounded-full w-1/4" />
                      <div className="h-3 bg-muted rounded-full w-3/4" />
                      <div className="h-12 bg-muted rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts?.length === 0 ? (
            <div className="sm-card">
              <div className="sm-card-body text-center py-10">
                <p className="text-sm text-muted-foreground mb-4">
                  The village square is quiet. Be the first to post!
                </p>
                <CreatePostDialog />
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-muted-foreground mb-3 px-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {posts?.length} post{posts?.length !== 1 ? "s" : ""} · newest first · no algorithm
              </p>
              {posts?.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        <RightPanel />
      </div>
    </Layout>
  );
}
