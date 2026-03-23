import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import { LoginModal } from "@/components/LoginModal";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { Footer } from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight, Users, MessageSquare, LayoutGrid, Shield,
  Cpu, Heart, Star, MessageCircle, BookOpen, Zap,
  CheckCircle2, Activity, Layers, Home, FileText,
  Stethoscope, Briefcase, HelpCircle, Bus, Gamepad2,
  Trophy, Spline, HeartHandshake, Compass, MapPin,
  Lock, UserCheck, ClipboardList, Building2, BookMarked,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  MessageSquare, Users, Heart, Star, BookOpen, Shield, Zap, Activity,
  Layers, Cpu, MessageCircle, LayoutGrid, Home, FileText, Stethoscope,
  Briefcase, HelpCircle, CheckCircle2,
};

function LucideIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] || MessageSquare;
  return <Icon className={className} aria-hidden="true" />;
}

const FEATURES = [
  {
    icon: MessageSquare,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Community Forums",
    description: "8 topic categories — from NDIS & Funding to Chronic Pain and Mental Health. Post threads, give advice, and get answers from people who truly get it.",
  },
  {
    icon: HeartHandshake,
    color: "text-accent",
    bg: "bg-accent/10",
    title: "Peer Connect",
    description: "Matched connections based on your diagnosis, interests, and location. Find your people — not an algorithmic recommendation of strangers.",
  },
  {
    icon: Spline,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Spoon Tracker",
    description: "Rate your daily energy across 12 spoons, add notes, and track 14-day history. Share how you're managing — or not — without explanation.",
  },
  {
    icon: BookOpen,
    color: "text-accent",
    bg: "bg-accent/10",
    title: "Health Journal",
    description: "Private daily mood tracking, symptom logging, pain/energy sliders, and notes. Your health story in your own words.",
  },
  {
    icon: Building2,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Service Directory",
    description: "Searchable directory of Australian disability service providers, filterable by category, state, and NDIS registration status.",
  },
  {
    icon: Bus,
    color: "text-accent",
    bg: "bg-accent/10",
    title: "Accessible Transport",
    description: "Book accessible transport with step-by-step journey planning. Filter by accessibility needs and see NDIS eligibility at a glance.",
  },
  {
    icon: Briefcase,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Jobs Board",
    description: "Disability-welcoming job listings with accessible workplace badges. Employers who actually mean it when they say \"inclusive.\"",
  },
  {
    icon: BookMarked,
    color: "text-accent",
    bg: "bg-accent/10",
    title: "Resource Library",
    description: "Curated Australian disability resources — bookmarkable, searchable, and filtered by topic. Vetted, current, relevant.",
  },
  {
    icon: Trophy,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Recognition System",
    description: "Earn valorization points for genuine community participation. Badges, levels, and recognition for the people who make this community thrive.",
  },
];

const FOR_WHO = [
  { icon: Activity, label: "Physical Disability", desc: "Mobility, chronic pain, and physical health conditions" },
  { icon: Zap, label: "Chronic Illness", desc: "Fatigue, fibromyalgia, ME/CFS, and energy-limiting conditions" },
  { icon: Heart, label: "Mental Health", desc: "Anxiety, depression, PTSD, bipolar, and psychological conditions" },
  { icon: Stethoscope, label: "Neurodivergent", desc: "Autism, ADHD, dyslexia, and other neurological differences" },
  { icon: ClipboardList, label: "NDIS Participants", desc: "Navigating supports, funding, plan reviews, and providers" },
  { icon: HeartHandshake, label: "Carers & Supporters", desc: "Family members, informal carers, and support workers" },
];

const STEPS = [
  { step: "01", title: "Create a free account", desc: "Sign up in under a minute. No credit card, no ads, no data selling — just your community." },
  { step: "02", title: "Tell us a little about you", desc: "Optional health prompts help you find others with shared experiences. Share only what you're comfortable with." },
  { step: "03", title: "Dive into the village", desc: "Browse forums, join conversations, track your spoons, connect with peers, and explore resources." },
];

const AU_FEATURES = [
  { icon: ClipboardList, title: "NDIS-Aware", desc: "NDIS funding guides, provider directory with registration status, and transport booking with NDIS eligibility flags." },
  { icon: Shield, title: "eSafety Compliant", desc: "Operates under the Australian Online Safety Act 2021. Real humans review every report. 16+ age requirement enforced." },
  { icon: Lock, title: "Australian Data", desc: "Your data is stored on Australian-based infrastructure. We do not sell or share your data with advertisers." },
  { icon: UserCheck, title: "Disability-Led", desc: "Built by and for people with disabilities in Australia. Our lived experience shapes every product decision." },
];

const VALUES = [
  { icon: <Cpu className="h-6 w-6 text-primary" />, title: "No Algorithmic Feed", description: "You see what you choose, in the order it was posted. No engagement traps, no rage bait, no anxiety loops." },
  { icon: <Heart className="h-6 w-6 text-accent" />, title: "Disability-Led", description: "Built by and for people with disabilities. Our lived experience shapes every decision." },
  { icon: <MessageSquare className="h-6 w-6 text-primary" />, title: "Pre-Algorithm Simplicity", description: "Forums, threads, replies — the way the internet worked before it got complicated and extractive." },
  { icon: <Shield className="h-6 w-6 text-accent" />, title: "eSafety Compliant", description: "We follow Australian eSafety Commissioner guidelines. A real human reviews every report." },
];

const TESTIMONIALS = [
  { quote: "Finally a place where I can talk about fatigue without people telling me to just exercise more.", topic: "Chronic Fatigue", icon: Zap },
  { quote: "I found others managing the same medications. The advice thread probably saved me a hospital visit.", topic: "Medication Support", icon: Stethoscope },
  { quote: "The jobs board actually has accessible workplaces listed. First time I've seen that anywhere.", topic: "Employment", icon: Briefcase },
  { quote: "Reading the forum on my worst days reminds me I'm not alone. That matters more than I can say.", topic: "Mental Wellbeing", icon: Heart },
  { quote: "The Spoon Tracker helped me explain my energy levels to my family for the first time.", topic: "Spoon Theory", icon: Spline },
  { quote: "I got matched with someone who has the same rare condition. We talk every week now.", topic: "Peer Connect", icon: HeartHandshake },
];

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<{
    memberCount: number;
    threadCount: number;
    categoryCount: number;
  }>({ queryKey: ["/api/public/stats"] });

  const { data: categories, isLoading: categoriesLoading } = useQuery<
    { id: number; name: string; slug: string; description: string; icon: string; threadCount: number }[]
  >({ queryKey: ["/api/public/categories"] });

  const { data: recentThreads, isLoading: threadsLoading } = useQuery<
    { id: number; title: string; categoryName: string; categorySlug: string; createdAt: string }[]
  >({ queryKey: ["/api/public/recent-threads"] });

  if (isLoading) return null;
  if (isAuthenticated) return <Redirect to="/" />;

  return (
    <>
      <SEO
        title="Welcome"
        description="DisabilitySquare — Australia's disability-led forum community. No algorithmic feed, real conversations, NDIS-aware, eSafety compliant."
      />

      <a href="#main-content" className="skip-link">Skip to main content</a>

      <div className="min-h-screen bg-background flex flex-col">

        {/* ── Topbar ── */}
        <header className="sm-topbar" role="banner" aria-label="Site header">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="DisabilitySquare Logo" className="h-7 w-7 object-contain" data-testid="img-topbar-logo" />
            <span className="font-bold text-white text-base tracking-wide hidden sm:inline">DisabilitySquare</span>
          </div>
          <div className="flex-1" />
          <nav className="flex items-center gap-4 mr-4" aria-label="Quick links">
            <Link href="/safety">
              <span className="text-white/80 hover:text-white text-sm cursor-pointer transition-colors hidden sm:inline">Safety</span>
            </Link>
            <Link href="/forums">
              <span className="text-white/80 hover:text-white text-sm cursor-pointer transition-colors hidden sm:inline">Forums</span>
            </Link>
          </nav>
          <Button
            variant="outline"
            className="text-white border-white/40 hover:bg-white/20 bg-transparent"
            onClick={() => setShowLoginModal(true)}
            data-testid="button-topbar-login"
            aria-label="Sign in or create an account"
          >
            Sign In / Join
          </Button>
        </header>

        <main id="main-content" role="main" className="flex-1 flex flex-col" style={{ paddingTop: "56px" }}>

          {/* ── Hero ── */}
          <section
            className="relative overflow-hidden py-16 px-6"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--accent) / 0.06) 50%, hsl(var(--primary) / 0.04) 100%)" }}
            aria-labelledby="hero-heading"
          >
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <img
                src="/logo.png"
                alt="DisabilitySquare Logo"
                className="h-16 w-auto mx-auto mb-5"
                data-testid="img-hero-logo"
              />
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent font-bold mb-5 text-sm"
                role="note"
              >
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" aria-hidden="true" />
                Australia's Disability-Led Community
              </div>
              <h1
                id="hero-heading"
                className="font-display text-4xl md:text-5xl text-primary font-bold mb-5 leading-tight"
                data-testid="text-hero-headline"
              >
                The forum built <em>by</em> people with disabilities,<br className="hidden md:block" />
                <span className="text-accent">for</span> people with disabilities.
              </h1>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed max-w-2xl mx-auto">
                No algorithms. No ads. No ableism. Just real conversations with people who understand — plus tools designed specifically for life with disability.
              </p>

              {/* Inline stat strip */}
              <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
                {statsLoading ? (
                  <>
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-24" />
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5 text-foreground/70">
                      <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                      <strong className="text-primary">{(stats?.memberCount ?? 0).toLocaleString()}</strong> members
                    </span>
                    <span className="flex items-center gap-1.5 text-foreground/70">
                      <MessageSquare className="h-4 w-4 text-primary" aria-hidden="true" />
                      <strong className="text-primary">{(stats?.threadCount ?? 0).toLocaleString()}</strong> threads
                    </span>
                    <span className="flex items-center gap-1.5 text-foreground/70">
                      <LayoutGrid className="h-4 w-4 text-primary" aria-hidden="true" />
                      <strong className="text-primary">{stats?.categoryCount ?? 8}</strong> community topics
                    </span>
                    <span className="flex items-center gap-1.5 text-foreground/70">
                      <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
                      <strong className="text-accent">Australian</strong>
                    </span>
                  </>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  onClick={() => setShowLoginModal(true)}
                  data-testid="button-hero-join"
                  className="text-base px-8"
                  aria-label="Join the DisabilitySquare community"
                >
                  Join Free <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowLoginModal(true)}
                  data-testid="button-hero-signin"
                  className="text-base px-8"
                  aria-label="Sign in to your account"
                >
                  Sign In
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">Free forever. No credit card. 16+ only.</p>
            </div>
          </section>

          {/* ── Who It's For ── */}
          <section
            className="py-12 px-6 bg-background border-y border-border"
            aria-labelledby="for-who-heading"
          >
            <div className="max-w-5xl mx-auto">
              <h2 id="for-who-heading" className="font-display text-2xl text-primary font-bold text-center mb-2">
                Who Is DisabilitySquare For?
              </h2>
              <p className="text-muted-foreground text-center text-sm mb-8">
                Whether you're newly diagnosed, a long-time survivor, or supporting someone you love.
              </p>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4" role="list">
                {FOR_WHO.map((item) => (
                  <li
                    key={item.label}
                    className="sm-card p-4 flex items-start gap-3"
                    data-testid={`card-for-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="shrink-0 h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center" aria-hidden="true">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── Feature Showcase ── */}
          <section
            className="py-14 px-6"
            style={{ background: "hsl(var(--secondary) / 0.4)" }}
            aria-labelledby="features-heading"
          >
            <div className="max-w-5xl mx-auto">
              <h2
                id="features-heading"
                className="font-display text-3xl text-primary font-bold mb-2 text-center"
              >
                Everything You Need in One Place
              </h2>
              <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
                Designed around life with disability — not retrofitted with an accessibility checkbox.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
                {FEATURES.map((f) => (
                  <li
                    key={f.title}
                    className="sm-card p-5 flex items-start gap-4 h-full"
                    data-testid={`card-feature-${f.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className={`shrink-0 h-11 w-11 rounded-xl ${f.bg} flex items-center justify-center`} aria-hidden="true">
                      <f.icon className={`h-5 w-5 ${f.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm mb-1">{f.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── How It Works ── */}
          <section
            className="py-14 px-6 bg-background"
            aria-labelledby="how-heading"
          >
            <div className="max-w-3xl mx-auto">
              <h2
                id="how-heading"
                className="font-display text-3xl text-primary font-bold mb-2 text-center"
              >
                Getting Started Is Simple
              </h2>
              <p className="text-muted-foreground text-center mb-10">
                No overwhelming onboarding. Just join and find your people.
              </p>
              <ol className="space-y-5" role="list">
                {STEPS.map((s) => (
                  <li
                    key={s.step}
                    className="sm-card p-5 flex items-start gap-5"
                    data-testid={`card-step-${s.step}`}
                  >
                    <div className="shrink-0 h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-display font-black text-lg" aria-hidden="true">
                      {s.step}
                    </div>
                    <div className="pt-1">
                      <h3 className="font-bold text-foreground text-base mb-1">{s.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="text-center mt-8">
                <Button
                  size="lg"
                  onClick={() => setShowLoginModal(true)}
                  data-testid="button-steps-join"
                  className="text-base px-10"
                >
                  Create Your Free Account <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>

          {/* ── Australian Features ── */}
          <section
            className="py-14 px-6 border-y border-border"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--primary) / 0.02) 100%)" }}
            aria-labelledby="au-heading"
          >
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-2">
                <MapPin className="h-6 w-6 text-primary" aria-hidden="true" />
                <h2 id="au-heading" className="font-display text-3xl text-primary font-bold text-center">
                  Built for Australia
                </h2>
              </div>
              <p className="text-muted-foreground text-center mb-10">
                We're not an overseas platform with an Australian flag added. We were built here, for here.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5" role="list">
                {AU_FEATURES.map((f) => (
                  <li
                    key={f.title}
                    className="sm-card p-5 flex items-start gap-4"
                    data-testid={`card-au-${f.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="shrink-0 h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center" aria-hidden="true">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm mb-1">{f.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── Forum Categories ── */}
          <section
            className="py-14 px-6 bg-background"
            aria-labelledby="categories-heading"
          >
            <div className="max-w-5xl mx-auto">
              <h2
                id="categories-heading"
                className="font-display text-3xl text-primary font-bold mb-2 text-center"
              >
                Community Topics
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                Browse the forums — no login required to look around.
              </p>

              {categoriesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="sm-card p-4 flex items-start gap-3">
                      <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" role="list">
                  {(categories ?? []).map((cat) => (
                    <li key={cat.id} role="listitem">
                      <div
                        className="sm-card p-4 flex items-start gap-3 h-full"
                        data-testid={`card-category-${cat.id}`}
                      >
                        <div
                          className="shrink-0 h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
                          aria-hidden="true"
                        >
                          <LucideIcon name={cat.icon} className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground text-sm truncate">{cat.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-snug">{cat.description}</p>
                          {cat.threadCount > 0 && (
                            <span
                              className="inline-block mt-1.5 sm-stat text-[10px]"
                              aria-label={`${cat.threadCount} threads`}
                            >
                              {cat.threadCount} threads
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* ── Recent Conversations + Testimonials side by side ── */}
          <section
            className="py-14 px-6"
            style={{ background: "hsl(var(--secondary) / 0.35)" }}
            aria-labelledby="conversations-heading"
          >
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Recent activity */}
                <div>
                  <h2 id="conversations-heading" className="font-display text-2xl text-primary font-bold mb-2">
                    What People Are Talking About
                  </h2>
                  <p className="text-sm text-muted-foreground mb-5">
                    Thread titles only — authors kept private.
                  </p>
                  {threadsLoading ? (
                    <ul className="space-y-2" aria-busy="true">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <li key={i} className="sm-card px-4 py-3 flex items-center gap-3">
                          <Skeleton className="h-4 w-4 shrink-0 rounded" />
                          <Skeleton className="h-3.5 flex-1" />
                        </li>
                      ))}
                    </ul>
                  ) : recentThreads && recentThreads.length > 0 ? (
                    <ul className="space-y-2" role="list" aria-label="Recent threads">
                      {recentThreads.slice(0, 6).map((thread) => (
                        <li
                          key={thread.id}
                          className="sm-card px-4 py-3 flex items-start gap-3"
                          data-testid={`activity-thread-${thread.id}`}
                        >
                          <MessageCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground leading-snug">{thread.title}</p>
                            <span className="sm-badge text-[10px] mt-1">{thread.categoryName}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="sm-card p-6 text-center">
                      <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No threads yet — be the first!</p>
                      <Button size="sm" className="mt-3" onClick={() => setShowLoginModal(true)}>
                        Start a conversation
                      </Button>
                    </div>
                  )}
                </div>

                {/* Illustrative testimonials */}
                <div>
                  <h2 className="font-display text-2xl text-primary font-bold mb-2" aria-label="Community voices">
                    Voices from the Village
                  </h2>
                  <p className="text-sm text-muted-foreground mb-5">
                    The kinds of conversations that happen here.
                  </p>
                  <ul className="space-y-3" role="list">
                    {TESTIMONIALS.slice(0, 4).map((t, i) => (
                      <li
                        key={i}
                        className="sm-card px-4 py-3 flex items-start gap-3"
                        data-testid={`card-testimonial-${i}`}
                      >
                        <div className="shrink-0 h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center" aria-hidden="true">
                          <t.icon className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm text-foreground italic leading-relaxed">"{t.quote}"</p>
                          <span className="sm-badge text-[10px] mt-1.5">{t.topic}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ── Values ── */}
          <section
            className="py-14 px-6 bg-background"
            aria-labelledby="values-heading"
          >
            <div className="max-w-5xl mx-auto">
              <h2
                id="values-heading"
                className="font-display text-3xl text-primary font-bold mb-2 text-center"
              >
                Why DisabilitySquare?
              </h2>
              <p className="text-muted-foreground text-center mb-10">
                We built the platform we wished existed.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5" role="list">
                {VALUES.map((v) => (
                  <li
                    key={v.title}
                    className="sm-card p-5 flex items-start gap-4"
                    data-testid={`card-value-${v.title.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <div className="shrink-0 h-11 w-11 rounded-xl bg-secondary flex items-center justify-center">
                      {v.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm mb-1">{v.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{v.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── Accessibility commitment ── */}
          <section
            className="py-10 px-6 border-y border-border"
            style={{ background: "hsl(var(--primary) / 0.04)" }}
            aria-labelledby="a11y-heading"
          >
            <div className="max-w-3xl mx-auto text-center">
              <h2 id="a11y-heading" className="font-display text-xl text-primary font-bold mb-3 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                WCAG AAA Accessible
              </h2>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                High contrast mode, adjustable font sizes, keyboard navigation, skip links, ARIA labels, and screen reader support — because accessibility isn't optional here.
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-xs">
                {["Keyboard navigable", "Screen reader ready", "High contrast mode", "Adjustable font size", "Skip links", "ARIA labels"].map((a) => (
                  <span key={a} className="sm-badge px-3 py-1.5">{a}</span>
                ))}
              </div>
            </div>
          </section>

          {/* ── Safety Bar ── */}
          <section
            className="py-6 px-6"
            style={{ background: "hsl(var(--primary) / 0.07)" }}
            aria-labelledby="safety-bar-heading"
          >
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <Shield className="h-10 w-10 text-primary shrink-0" aria-hidden="true" />
              <div>
                <h2 id="safety-bar-heading" className="font-bold text-primary text-base">
                  Your Safety Matters
                </h2>
                <p className="text-sm text-muted-foreground">
                  DisabilitySquare meets{" "}
                  <a
                    href="https://esafety.gov.au"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-primary"
                    data-testid="link-safety-bar-esafety"
                  >
                    Australian eSafety Commissioner
                  </a>{" "}
                  standards. Every report is reviewed by a real person. We do not tolerate harassment or ableism.{" "}
                  <Link href="/safety">
                    <span
                      className="underline hover:text-primary cursor-pointer font-semibold"
                      data-testid="link-safety-bar-centre"
                    >
                      Safety Centre →
                    </span>
                  </Link>
                </p>
              </div>
            </div>
          </section>

          {/* ── Bottom CTA ── */}
          <section
            className="py-16 px-6 text-center"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.09) 0%, hsl(var(--accent) / 0.07) 100%)" }}
            aria-labelledby="cta-heading"
          >
            <div className="max-w-xl mx-auto">
              <h2
                id="cta-heading"
                className="font-display text-3xl text-primary font-bold mb-3"
              >
                Ready to join the village?
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Free to join. No ads. No algorithms. No ableism.<br />
                Just community, support, and tools built for the way you actually live.
              </p>
              <Button
                size="lg"
                onClick={() => setShowLoginModal(true)}
                data-testid="button-cta-join"
                className="text-base px-10"
                aria-label="Join the DisabilitySquare community"
              >
                Join the Community <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                16+ only · Australian-hosted · Privacy-first
              </p>
            </div>
          </section>

        </main>

        <Footer />

        <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
        <AccessibilityPanel />
        <KeyboardShortcuts />

        <div id="announcer" role="status" aria-live="polite" aria-atomic="true" className="sr-only" />
      </div>
    </>
  );
}
