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
  Stethoscope, Briefcase, HelpCircle,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  MessageSquare,
  Users,
  Heart,
  Star,
  BookOpen,
  Shield,
  Zap,
  Activity,
  Layers,
  Cpu,
  MessageCircle,
  LayoutGrid,
  Home,
  FileText,
  Stethoscope,
  Briefcase,
  HelpCircle,
  CheckCircle2,
};

function LucideIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] || MessageSquare;
  return <Icon className={className} aria-hidden="true" />;
}

function StatCard({ value, label, loading }: { value: number | undefined; label: string; loading: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 sm-card text-center" data-testid={`stat-card-${label.toLowerCase().replace(/\s/g, "-")}`}>
      {loading ? (
        <Skeleton className="h-10 w-24 mb-2" />
      ) : (
        <span className="font-display text-4xl text-primary font-bold" aria-label={`${value} ${label}`}>
          {value?.toLocaleString() ?? "—"}
        </span>
      )}
      <span className="text-sm text-muted-foreground mt-1 font-medium">{label}</span>
    </div>
  );
}

const VALUES = [
  {
    icon: <Cpu className="h-7 w-7 text-primary" aria-hidden="true" />,
    title: "No Algorithmic Feed",
    description: "You see what you choose, in the order it was posted. No engagement traps, no anxiety loops.",
  },
  {
    icon: <Heart className="h-7 w-7 text-accent" aria-hidden="true" />,
    title: "Disability-Led",
    description: "Built by and for people with disabilities and chronic illness. Our lived experience shapes every decision.",
  },
  {
    icon: <MessageSquare className="h-7 w-7 text-primary" aria-hidden="true" />,
    title: "Pre-2007 Simplicity",
    description: "Forums, threads, replies — the way the internet used to work, before it got complicated.",
  },
  {
    icon: <Shield className="h-7 w-7 text-accent" aria-hidden="true" />,
    title: "eSafety Compliant",
    description: "We follow Australian eSafety Commissioner guidelines. A real human reviews all reports.",
  },
];

const TESTIMONIALS = [
  {
    quote: "Finally a place where I can talk about fatigue without people telling me to just exercise more.",
    topic: "Chronic Fatigue",
  },
  {
    quote: "I found others managing the same medications. The advice thread probably saved me a hospital visit.",
    topic: "Medication Support",
  },
  {
    quote: "The jobs board actually has accessible workplaces listed. First time I've seen that anywhere.",
    topic: "Employment",
  },
  {
    quote: "Reading the forum on my worst days reminds me I'm not alone. That matters more than I can say.",
    topic: "Mental Wellbeing",
  },
];

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<{
    memberCount: number;
    threadCount: number;
    categoryCount: number;
  }>({
    queryKey: ["/api/public/stats"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<
    { id: number; name: string; slug: string; description: string; icon: string; threadCount: number }[]
  >({
    queryKey: ["/api/public/categories"],
  });

  const { data: recentThreads, isLoading: threadsLoading } = useQuery<
    { id: number; title: string; categoryName: string; categorySlug: string; createdAt: string }[]
  >({
    queryKey: ["/api/public/recent-threads"],
  });

  if (isLoading) return null;
  if (isAuthenticated) return <Redirect to="/" />;

  return (
    <>
      <SEO
        title="Welcome"
        description="DisabilitySquare — A disability-led forum community. No algorithmic feed, real conversations, Australian eSafety compliant."
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
            className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 py-20 px-6"
            aria-labelledby="hero-heading"
          >
            <div className="max-w-3xl mx-auto text-center relative z-10">
              <img
                src="/logo.png"
                alt="DisabilitySquare Logo"
                className="h-20 w-auto mx-auto mb-6"
                data-testid="img-hero-logo"
              />
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-bold mb-6"
                role="note"
              >
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" aria-hidden="true" />
                Welcome to the Village Square
              </div>
              <h1
                id="hero-heading"
                className="font-display text-5xl md:text-6xl text-primary font-bold mb-5 leading-tight"
                data-testid="text-hero-headline"
              >
                Connect where you <span className="text-accent">belong.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
                A disability-led forum community — no algorithms, no noise. Just real conversations with people who understand.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => setShowLoginModal(true)}
                  data-testid="button-hero-join"
                  aria-label="Join the DisabilitySquare community"
                >
                  Join the Community <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowLoginModal(true)}
                  data-testid="button-hero-signin"
                  aria-label="Sign in to your account"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </section>

          {/* ── Live Stats Bar ── */}
          <section
            className="py-10 px-6 bg-background border-y border-border"
            aria-labelledby="stats-heading"
          >
            <h2 id="stats-heading" className="sr-only">Community Statistics</h2>
            <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4" role="list">
              <div role="listitem">
                <StatCard value={stats?.memberCount} label="Members" loading={statsLoading} />
              </div>
              <div role="listitem">
                <StatCard value={stats?.threadCount} label="Active Threads" loading={statsLoading} />
              </div>
              <div role="listitem">
                <StatCard value={stats?.categoryCount} label="Forum Categories" loading={statsLoading} />
              </div>
            </div>
          </section>

          {/* ── Forum Categories Grid ── */}
          <section
            className="py-14 px-6 bg-secondary/30"
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
                Browse the forum categories — no login needed to look around.
              </p>

              {categoriesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="sm-card p-5 flex items-start gap-4">
                      <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
                  {(categories ?? []).map((cat) => (
                    <li key={cat.id} role="listitem">
                      <div
                        className="sm-card p-5 flex items-start gap-4 h-full"
                        data-testid={`card-category-${cat.id}`}
                      >
                        <div
                          className="shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
                          aria-hidden="true"
                        >
                          <LucideIcon name={cat.icon} className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground text-sm truncate">{cat.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{cat.description}</p>
                          <span
                            className="inline-block mt-2 sm-stat text-xs"
                            aria-label={`${cat.threadCount} threads in ${cat.name}`}
                          >
                            {cat.threadCount} threads
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* ── Recent Activity Strip ── */}
          <section
            className="py-14 px-6 bg-background"
            aria-labelledby="activity-heading"
          >
            <div className="max-w-3xl mx-auto">
              <h2
                id="activity-heading"
                className="font-display text-3xl text-primary font-bold mb-2 text-center"
              >
                What People Are Talking About
              </h2>
              <p className="text-muted-foreground text-center mb-8 text-sm">
                Recent discussion titles — members and authors are kept private.
              </p>

              {threadsLoading ? (
                <ul className="space-y-3" aria-busy="true" aria-label="Loading recent threads">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <li key={i} className="sm-card px-4 py-3 flex items-center gap-3">
                      <Skeleton className="h-4 w-4 shrink-0 rounded" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-5/6" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : recentThreads && recentThreads.length > 0 ? (
                <ul className="space-y-2" role="list" aria-label="Recent community threads">
                  {recentThreads.map((thread) => (
                    <li
                      key={thread.id}
                      className="sm-card px-4 py-3 flex items-center gap-3"
                      data-testid={`activity-thread-${thread.id}`}
                    >
                      <MessageCircle className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{thread.title}</p>
                        <span className="sm-badge text-xs mt-0.5">{thread.categoryName}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="sm-card p-8 text-center text-muted-foreground text-sm">
                  Be the first to start a conversation.
                </div>
              )}
            </div>
          </section>

          {/* ── Why DisabilitySquare ── */}
          <section
            className="py-14 px-6 bg-secondary/30"
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
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6" role="list">
                {VALUES.map((v) => (
                  <li
                    key={v.title}
                    className="sm-card p-6 flex items-start gap-4"
                    data-testid={`card-value-${v.title.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <div className="shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      {v.icon}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground text-base mb-1">{v.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── Testimonials ── */}
          <section
            className="py-14 px-6 bg-background"
            aria-labelledby="testimonials-heading"
          >
            <div className="max-w-5xl mx-auto">
              <h2
                id="testimonials-heading"
                className="font-display text-3xl text-primary font-bold mb-2 text-center"
              >
                The Kinds of Conversations We Have
              </h2>
              <p className="text-muted-foreground text-center mb-10 text-sm">
                Illustrative examples of the topics our community discusses.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5" role="list">
                {TESTIMONIALS.map((t, i) => (
                  <li
                    key={i}
                    className="sm-card p-6 flex flex-col gap-3"
                    data-testid={`card-testimonial-${i}`}
                  >
                    <blockquote className="text-sm text-foreground leading-relaxed italic">
                      "{t.quote}"
                    </blockquote>
                    <span className="sm-badge self-start">{t.topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── Safety Bar ── */}
          <section
            className="py-6 px-6 bg-primary/5 border-y border-primary/15"
            aria-labelledby="safety-bar-heading"
          >
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <Shield className="h-10 w-10 text-primary shrink-0" aria-hidden="true" />
              <div>
                <h2 id="safety-bar-heading" className="font-display font-bold text-primary text-base">
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
                      Visit our Safety Centre →
                    </span>
                  </Link>
                </p>
              </div>
            </div>
          </section>

          {/* ── Bottom CTA ── */}
          <section
            className="py-16 px-6 bg-gradient-to-br from-primary/10 to-accent/10 text-center"
            aria-labelledby="cta-heading"
          >
            <div className="max-w-xl mx-auto">
              <h2
                id="cta-heading"
                className="font-display text-3xl text-primary font-bold mb-4"
              >
                Ready to join the village?
              </h2>
              <p className="text-muted-foreground mb-8">
                Free to join. No ads. No algorithms. Just community.
              </p>
              <Button
                size="lg"
                onClick={() => setShowLoginModal(true)}
                data-testid="button-cta-join"
                aria-label="Join the DisabilitySquare community"
              >
                Join the Community <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </section>

        </main>

        <Footer />

        <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
        <AccessibilityPanel />
        <KeyboardShortcuts />

        <div
          id="announcer"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
      </div>
    </>
  );
}
