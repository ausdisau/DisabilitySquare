import { usePosts } from "@/hooks/use-posts";
import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/PostCard";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Clock, Users, MessageSquare, Star, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function RightSidebar() {
  const { data: leaderboard } = useQuery<any[]>({
    queryKey: ["/api/points/leaderboard"],
  });
  const { data: groups } = useQuery<any[]>({
    queryKey: ["/api/groups"],
  });

  return (
    <aside className="w-44 shrink-0 hidden lg:block" aria-label="Community info">
      {/* Community Stats box */}
      <div className="retro-box">
        <div className="retro-box-header">
          <Users className="h-3 w-3" aria-hidden="true" />
          Community
        </div>
        <div className="retro-box-content">
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Groups</span>
              <span className="retro-stat">{groups?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Top Members</span>
              <span className="retro-stat">{leaderboard?.length || 0}</span>
            </div>
          </div>
          <div className="retro-divider" />
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Showing newest posts first. No algorithm — just people, in order.
          </p>
        </div>
      </div>

      {/* Top Members box */}
      {leaderboard && leaderboard.length > 0 && (
        <div className="retro-box">
          <div className="retro-box-header">
            <Star className="h-3 w-3" aria-hidden="true" />
            Top Members
          </div>
          <div>
            {leaderboard.slice(0, 5).map((entry: any, i: number) => (
              <div key={entry.userId} className="retro-nav-link-sidebar justify-between">
                <span className="flex items-center gap-1 truncate">
                  <span className="text-gray-400 text-[10px] w-4 shrink-0">{i + 1}.</span>
                  <span className="truncate text-[11px]">
                    {entry.user?.firstName} {entry.user?.lastName?.charAt(0)}.
                  </span>
                </span>
                <span className="retro-stat shrink-0">{entry.totalPoints}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Groups box */}
      {groups && groups.length > 0 && (
        <div className="retro-box">
          <div className="retro-box-header">
            <MessageSquare className="h-3 w-3" aria-hidden="true" />
            Groups
          </div>
          <div>
            {groups.slice(0, 6).map((group: any) => (
              <a key={group.id} href={`/groups/${group.id}`} className="retro-nav-link-sidebar">
                <span className="truncate text-[11px]">{group.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* eSafety notice */}
      <div className="retro-box">
        <div className="retro-box-header">Safe Space</div>
        <div className="retro-box-content">
          <p className="text-[10px] text-gray-500 leading-relaxed">
            🔒 This is a moderated, eSafety compliant community. Be kind. Report anything concerning.
          </p>
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

      {/* Page header */}
      <div className="retro-box mb-3">
        <div className="retro-box-header">
          <Clock className="h-3 w-3" aria-hidden="true" />
          Village Square — Bulletin Board
          <span className="ml-auto font-normal normal-case tracking-normal text-blue-200 text-[10px]">
            Chronological · Newest first
          </span>
        </div>
        <div className="retro-box-content py-2 flex items-center justify-between">
          <p className="text-[12px] text-gray-600">
            What's happening in your community right now.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1 text-[11px] text-[#1B4B8A] hover:text-[#E07830]"
              aria-label="Refresh posts"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
            <CreatePostDialog />
          </div>
        </div>
      </div>

      {/* 2-column layout: feed + right sidebar */}
      <div className="flex gap-3">
        {/* Main feed column */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="retro-post animate-pulse">
                  <div className="retro-post-header bg-[#eef2f8] h-8" />
                  <div className="retro-post-body">
                    <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-10 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts?.length === 0 ? (
            <div className="retro-box">
              <div className="retro-box-content text-center py-8">
                <p className="text-[13px] text-gray-500 mb-3">
                  The bulletin board is empty. Be the first to post!
                </p>
                <CreatePostDialog />
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[11px] text-gray-400 mb-2 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {posts?.length} post{posts?.length !== 1 ? "s" : ""} · shown in order of newest first · no algorithm
              </p>
              {posts?.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <RightSidebar />
      </div>
    </Layout>
  );
}
