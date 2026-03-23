import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Users, Heart, MapPin, Sparkles, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

function MemberCard({ member }: { member: any }) {
  const profile = member.profile;
  const name = [member.firstName, member.lastName].filter(Boolean).join(" ") || member.email || "Member";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const interests: string[] = profile?.interests || [];
  const prompts = profile?.healthPrompts || {};

  return (
    <div
      className="sm-card hover:shadow-md transition-shadow cursor-default"
      data-testid={`card-member-${member.id}`}
    >
      <div className="sm-card-body flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-primary/20 shrink-0">
            <AvatarImage src={member.profileImageUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm rounded-full">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{name}</p>
            {profile?.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {profile.location}
              </p>
            )}
          </div>
        </div>

        {profile?.diagnosis && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Heart className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
            <span className="text-xs text-foreground/80">{profile.diagnosis}</span>
          </div>
        )}

        {profile?.bio && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{profile.bio}</p>
        )}

        {prompts.wishPeopleKnew && (
          <div className="bg-accent/5 border border-accent/15 rounded-xl px-3 py-2">
            <p className="text-[10px] text-accent font-semibold mb-0.5">What I wish people knew</p>
            <p className="text-xs text-foreground/70 line-clamp-2 italic">"{prompts.wishPeopleKnew}"</p>
          </div>
        )}

        {interests.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {interests.slice(0, 4).map((interest: string) => (
              <span key={interest} className="sm-badge">{interest}</span>
            ))}
            {interests.length > 4 && (
              <span className="text-[10px] text-muted-foreground px-2 py-0.5">+{interests.length - 4}</span>
            )}
          </div>
        )}
      </div>
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
        title="Connect with Others — DisabilitySquare"
        description="Find others in the DisabilitySquare community with similar experiences, diagnoses, and interests."
      />

      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Peer Connect</h1>
            <p className="text-sm text-muted-foreground">Matched by shared experiences</p>
          </div>
        </div>

        <div className="sm-card mb-4">
          <div className="sm-card-body">
            <p className="text-sm text-foreground/80 leading-relaxed">
              <span className="font-semibold text-primary">Diagnosis-based peer matching</span> — members ranked by what you have in common: shared diagnosis, interests, and location.{" "}
              <Link href="/profile">
                <span className="text-accent underline font-medium cursor-pointer hover:text-accent/80">Fill in your profile</span>
              </Link>{" "}
              to get better matches.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div className="flex gap-1 bg-muted rounded-full p-1">
            <button
              onClick={() => setTab("matches")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                tab === "matches"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="tab-matches"
              aria-pressed={tab === "matches"}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                My Matches
              </span>
            </button>
            <button
              onClick={() => setTab("browse")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                tab === "browse"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="tab-browse"
              aria-pressed={tab === "browse"}
            >
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                Browse All
              </span>
            </button>
          </div>

          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search by name, condition..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full bg-muted/50 border-border/40"
              aria-label="Search members"
              data-testid="input-connect-search"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="sm-card">
            <div className="sm-card-body text-center py-14">
              <div className="text-5xl mb-4" aria-hidden="true">🤝</div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                {tab === "matches" ? "No matches found yet" : "No members found"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                {tab === "matches"
                  ? "Update your profile with your diagnosis and interests to find people who get it."
                  : "Try adjusting your search terms."}
              </p>
              {tab === "matches" && (
                <Link href="/profile">
                  <span className="mt-4 inline-block text-sm font-medium text-primary underline cursor-pointer hover:text-primary/80">
                    Update my profile →
                  </span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              {filtered.length} {filtered.length === 1 ? "person" : "people"}
              {tab === "matches" ? " matched based on your profile" : " in the community"}
              {search && ` matching "${search}"`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((member: any) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
