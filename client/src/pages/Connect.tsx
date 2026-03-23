import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Users, Heart, MapPin, Sparkles, Search } from "lucide-react";
import { useState } from "react";

const REACTION_LABEL: Record<string, string> = {
  hug: "🤗 Hug",
  me_too: "✋ Me Too",
  helpful: "💡 Helpful",
  inspiring: "✨ Inspiring",
};

function MemberCard({ member }: { member: any }) {
  const profile = member.profile;
  const name = [member.firstName, member.lastName].filter(Boolean).join(" ") || member.email || "Member";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const interests: string[] = profile?.interests || [];
  const prompts = profile?.healthPrompts || {};

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 ring-2 ring-[#2A9D8F]/20">
          <AvatarImage src={member.profileImageUrl || undefined} />
          <AvatarFallback className="bg-[#1B4B8A] text-white font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{name}</p>
          {profile?.location && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {profile.location}
            </p>
          )}
        </div>
      </div>

      {profile?.diagnosis && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Heart className="h-3.5 w-3.5 text-[#E07830] shrink-0" />
          <span className="text-xs text-gray-600">{profile.diagnosis}</span>
        </div>
      )}

      {profile?.bio && (
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{profile.bio}</p>
      )}

      {prompts.wishPeopleKnew && (
        <div className="bg-amber-50 rounded-lg px-3 py-2">
          <p className="text-[10px] text-amber-700 font-medium mb-0.5">What I wish people knew</p>
          <p className="text-xs text-gray-600 line-clamp-2 italic">"{prompts.wishPeopleKnew}"</p>
        </div>
      )}

      {interests.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {interests.slice(0, 4).map((interest: string) => (
            <Badge key={interest} variant="secondary" className="text-[10px] px-2 py-0 bg-[#2A9D8F]/10 text-[#2A9D8F] border-none">
              {interest}
            </Badge>
          ))}
          {interests.length > 4 && (
            <Badge variant="outline" className="text-[10px] px-2 py-0 text-gray-400">
              +{interests.length - 4}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export default function Connect() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"matches" | "browse">("matches");

  const { data: matches, isLoading: loadingMatches } = useQuery<any[]>({
    queryKey: ["/api/connect/matches"],
    enabled: !!user && tab === "matches",
  });

  const { data: members, isLoading: loadingBrowse } = useQuery<any[]>({
    queryKey: ["/api/connect/members"],
    enabled: tab === "browse",
  });

  const list = tab === "matches" ? matches : members;
  const isLoading = tab === "matches" ? loadingMatches : loadingBrowse;

  const filtered = (list || []).filter((m: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = [m.firstName, m.lastName].filter(Boolean).join(" ").toLowerCase();
    return (
      name.includes(q) ||
      m.profile?.diagnosis?.toLowerCase().includes(q) ||
      m.profile?.location?.toLowerCase().includes(q) ||
      (m.profile?.interests || []).some((i: string) => i.toLowerCase().includes(q))
    );
  });

  return (
    <Layout>
      <SEO
        title="Connect with Others"
        description="Find others in the DisabilitySquare community with similar experiences, diagnoses, and interests."
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#2A9D8F]/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-[#2A9D8F]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Connect</h1>
            <p className="text-sm text-gray-500">Find your people — matched by shared experiences</p>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-gradient-to-r from-[#1B4B8A]/5 to-[#2A9D8F]/5 rounded-2xl p-4 border border-[#1B4B8A]/10">
          <p className="text-sm text-gray-700 leading-relaxed">
            <span className="font-semibold text-[#1B4B8A]">Peer matching</span> — inspired by Spoony's diagnosis-based matching. 
            Members are ranked by how much you have in common: shared diagnosis, interests, and location. 
            Fill in your <a href="/profile" className="text-[#E07830] underline font-medium">profile</a> to get better matches.
          </p>
        </div>

        {/* Tabs + Search */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-1 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setTab("matches")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${tab === "matches" ? "bg-white text-[#1B4B8A] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              data-testid="tab-matches"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                My Matches
              </span>
            </button>
            <button
              onClick={() => setTab("browse")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${tab === "browse" ? "bg-white text-[#1B4B8A] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              data-testid="tab-browse"
            >
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Browse All
              </span>
            </button>
          </div>

          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, condition..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full bg-gray-50 border-gray-200"
              data-testid="input-connect-search"
            />
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {tab === "matches" ? "No matches found yet" : "No members found"}
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {tab === "matches"
                ? "Update your profile with your diagnosis and interests to find people who get it."
                : "Try adjusting your search terms."}
            </p>
            {tab === "matches" && (
              <a href="/profile" className="mt-4 inline-block text-sm font-medium text-[#1B4B8A] underline">
                Update my profile →
              </a>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400">
              {filtered.length} {filtered.length === 1 ? "person" : "people"}
              {tab === "matches" ? " matched based on your profile" : " in the community"}
              {search && ` matching "${search}"`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((member: any) => (
                <MemberCard key={member.id} member={member} data-testid={`card-member-${member.id}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
