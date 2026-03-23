import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { CreateThreadDialog } from "@/components/CreateThreadDialog";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, MessageCircle, Heart, Zap, FileText, Home, Briefcase, Activity, Stethoscope } from "lucide-react";
import type { ForumCategory } from "@shared/schema";

const ICON_MAP: Record<string, any> = {
  MessageSquare, MessageCircle, Heart, Zap, FileText, Home, Briefcase, Activity, Stethoscope,
};

function CategoryIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name] || MessageSquare;
  return <Icon className="h-4 w-4" aria-hidden="true" />;
}

export default function Forums() {
  const { data: categories, isLoading } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forums/categories"],
  });

  return (
    <Layout>
      <SEO
        title="Community Forums — DisabilitySquare"
        description="Get peer advice, share experiences, and connect with others in our structured community forums."
      />

      <div className="retro-box mb-3">
        <div className="retro-box-header">
          <MessageSquare className="h-3 w-3" aria-hidden="true" />
          Community Forums — Peer Advice & Discussion
          <span className="ml-auto font-normal normal-case tracking-normal text-blue-200 text-[10px]">
            Pre-algorithmic · Latest activity first
          </span>
        </div>
        <div className="retro-box-content py-2">
          <p className="text-[12px] text-gray-600">
            Ask questions, share experiences, and get real peer support. Threads sorted by latest activity — no algorithm, no ranking by outrage.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="retro-box animate-pulse">
              <div className="h-12 bg-[#eef2f8]" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {categories?.map(cat => (
            <Link key={cat.id} href={`/forums/${cat.slug}`}>
              <div
                className="retro-box hover:border-[#1B4B8A] cursor-pointer transition-colors"
                data-testid={`card-forum-category-${cat.id}`}
              >
                <div className="flex items-center gap-3 p-3">
                  <div className="h-8 w-8 rounded-sm bg-[#1B4B8A]/10 flex items-center justify-center text-[#1B4B8A] shrink-0 border border-[#1B4B8A]/20">
                    <CategoryIcon name={cat.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#1B4B8A] text-sm">{cat.name}</h3>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate">{cat.description}</p>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <div className="text-[11px] font-bold text-[#1B4B8A]">{cat.threadCount}</div>
                    <div className="text-[10px] text-gray-400">threads</div>
                    {cat.lastActivityAt && (
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {formatDistanceToNow(new Date(cat.lastActivityAt), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-4 retro-box">
        <div className="retro-box-content flex items-center justify-between">
          <p className="text-[11px] text-gray-500">Have a question or something to share? Start a new thread in any category.</p>
          <CreateThreadDialog categories={categories || []} />
        </div>
      </div>
    </Layout>
  );
}
