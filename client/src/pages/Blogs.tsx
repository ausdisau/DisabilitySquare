import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import { BookOpen, Tag, PenSquare, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import type { BlogPost } from "@shared/schema";

type BlogPostWithAuthor = BlogPost & {
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
  reactionCounts: Record<string, number>;
};

const POPULAR_TAGS = [
  "NDIS", "Chronic Pain", "Advocacy", "Mental Health", "Accessibility",
  "Employment", "Housing", "Community", "Personal Story", "Carer",
];

const REACTION_LABELS: Record<string, string> = {
  hug: "🤗",
  me_too: "💙",
  helpful: "💡",
  inspiring: "✨",
};

function ReactionSummary({ counts }: { counts: Record<string, number> }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {Object.entries(REACTION_LABELS).map(([type, emoji]) =>
        counts[type] ? (
          <span key={type} className="flex items-center gap-0.5" data-testid={`reaction-count-${type}`}>
            {emoji} {counts[type]}
          </span>
        ) : null
      )}
    </div>
  );
}

function BlogCard({ post, onTagClick }: { post: BlogPostWithAuthor; onTagClick: (tag: string) => void }) {
  const authorName = `${post.author.firstName || "Member"} ${post.author.lastName || ""}`.trim();
  const initials = `${post.author.firstName?.[0] || ""}${post.author.lastName?.[0] || ""}`.toUpperCase();
  const publishedDate = post.publishedAt ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true }) : "recently";
  const excerpt = post.excerpt || post.content.substring(0, 200) + (post.content.length > 200 ? "..." : "");
  const totalReactions = Object.values(post.reactionCounts || {}).reduce((a, b) => a + b, 0);

  return (
    <article
      className="sm-card hover:border-primary/30 hover:shadow-md transition-all"
      data-testid={`card-blog-post-${post.id}`}
    >
      <div className="sm-card-body">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 rounded-full shrink-0 ring-2 ring-primary/15 mt-0.5">
            <AvatarImage src={post.author.profileImageUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold rounded-full">
              {initials || "M"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-foreground text-sm">{authorName}</span>
              <span className="text-muted-foreground text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {publishedDate}
              </span>
            </div>

            <Link href={`/blogs/${post.slug}`}>
              <h2 className="text-base font-bold text-foreground leading-snug mb-1.5 hover:text-primary transition-colors cursor-pointer">
                {post.title}
              </h2>
            </Link>

            <p className="text-sm text-foreground/70 leading-relaxed mb-3 line-clamp-3">
              {excerpt}
            </p>

            <div className="flex items-center justify-between flex-wrap gap-2">
              {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {(post.tags as string[]).map((tag: string) => (
                    <button
                      key={tag}
                      onClick={() => onTagClick(tag)}
                      className="sm-badge flex items-center gap-1 hover:bg-primary/20 transition-colors cursor-pointer"
                      data-testid={`card-tag-${post.id}-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {tag}
                    </button>
                  ))}
                </div>
              )}
              {totalReactions > 0 && (
                <ReactionSummary counts={post.reactionCounts || {}} />
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Blogs() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const searchParams = new URLSearchParams(location.includes("?") ? location.split("?")[1] : "");
  const tagFromUrl = searchParams.get("tag") || null;
  const [activeTag, setActiveTag] = useState<string | null>(tagFromUrl);

  useEffect(() => {
    setActiveTag(tagFromUrl);
  }, [tagFromUrl]);

  const handleTagClick = (tag: string) => {
    if (!tag) {
      setActiveTag(null);
      setLocation("/blogs");
      return;
    }
    const newTag = activeTag === tag ? null : tag;
    setActiveTag(newTag);
    if (newTag) {
      setLocation(`/blogs?tag=${encodeURIComponent(newTag)}`);
    } else {
      setLocation("/blogs");
    }
  };

  const { data: posts, isLoading } = useQuery<BlogPostWithAuthor[]>({
    queryKey: ["/api/blogs", { tag: activeTag }],
    queryFn: async () => {
      const url = activeTag ? `/api/blogs?tag=${encodeURIComponent(activeTag)}` : "/api/blogs";
      const res = await fetch(url, { credentials: "include" });
      return res.json();
    },
  });

  return (
    <Layout>
      <SEO
        title="Community Stories — DisabilitySquare"
        description="Read personal stories, lived-experience articles, and community essays from the DisabilitySquare community."
      />

      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Community Stories
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Personal stories and lived experiences from our community.
            </p>
          </div>
          {user && (
            <Button
              onClick={() => setLocation("/blogs/write")}
              className="shrink-0"
              data-testid="button-write-story"
            >
              <PenSquare className="h-4 w-4 mr-2" />
              Write a story
            </Button>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleTagClick("")}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeTag === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
              data-testid="button-tag-all"
            >
              All stories
            </button>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  activeTag === tag
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
                data-testid={`button-tag-${tag.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="sm-card animate-pulse">
                <div className="sm-card-body">
                  <div className="flex gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted rounded-full w-1/4" />
                      <div className="h-4 bg-muted rounded-full w-3/4" />
                      <div className="h-3 bg-muted rounded-full w-full" />
                      <div className="h-3 bg-muted rounded-full w-2/3" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : posts?.length === 0 ? (
          <div className="sm-card">
            <div className="sm-card-body text-center py-12">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                {activeTag ? `No stories tagged "${activeTag}" yet` : "No stories published yet"}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Be the first to share your experience with this community.
              </p>
              {user && (
                <Button variant="outline" size="sm" onClick={() => setLocation("/blogs/write")} data-testid="button-write-first-story">
                  <PenSquare className="h-4 w-4 mr-2" />
                  Write the first story
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground px-1">
              {posts?.length} {posts?.length === 1 ? "story" : "stories"}
              {activeTag && ` tagged "${activeTag}"`}
            </p>
            {posts?.map((post) => (
              <BlogCard key={post.id} post={post} onTagClick={handleTagClick} />
            ))}
          </div>
        )}

        {user && (
          <div className="sm-card mt-4">
            <div className="sm-card-body flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Share your story</p>
                <p className="text-xs text-muted-foreground">Your lived experience matters. Write an article and help others.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setLocation("/blogs/write")} data-testid="button-write-story-cta">
                <PenSquare className="h-4 w-4 mr-2" />
                Write
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
