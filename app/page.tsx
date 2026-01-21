"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageCircle, Gamepad2, Heart, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <AuthenticatedHome />;
  }

  return <LandingPage />;
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="DisabilitySquare Logo"
                width={40}
                height={40}
                className="rounded"
              />
              <span className="font-display text-xl font-bold text-primary">
                DisabilitySquare
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/api/auth/login">
                <Button variant="outline" data-testid="button-login">
                  Log In
                </Button>
              </Link>
              <Link href="/api/auth/login">
                <Button data-testid="button-signup">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary leading-tight">
                Your Village Square for Connection & Support
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                A welcoming social network designed for people with disabilities. 
                Connect with peers, share experiences, join communities, and have fun together.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/api/auth/login">
                  <Button size="lg" className="gap-2" data-testid="button-hero-cta">
                    Join Our Community <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-secondary" /> Free to join
                </span>
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent" /> Supportive community
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square max-w-lg mx-auto bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-3xl flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="DisabilitySquare"
                  width={300}
                  height={300}
                  className="drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">
              Everything You Need to Connect
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with accessibility in mind, our platform offers multiple ways to engage with your community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Community Groups"
              description="Join groups based on diagnosis, interests, or location. Find your people."
            />
            <FeatureCard
              icon={<MessageCircle className="w-8 h-8" />}
              title="Forums & Blogs"
              description="Share your story, ask questions, and engage in meaningful discussions."
            />
            <FeatureCard
              icon={<Gamepad2 className="w-8 h-8" />}
              title="Fun & Games"
              description="Play accessible games like Chess and Tetris. Compete on leaderboards!"
            />
            <FeatureCard
              icon={<Heart className="w-8 h-8" />}
              title="Peer Support"
              description="Connect with others who understand. You're never alone here."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Ready to Join the Community?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Sign up today and start connecting with thousands of members who get it.
          </p>
          <Link href="/api/auth/login">
            <Button size="lg" variant="secondary" className="gap-2" data-testid="button-cta-join">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-background border-t">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={24} height={24} />
            <span className="font-display font-semibold text-primary">DisabilitySquare</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your social network for people with disabilities.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="text-center hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

function AuthenticatedHome() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-primary mb-8">Welcome to the Village Square!</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/feed">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold">Community Feed</h3>
              </CardContent>
            </Card>
          </Link>
          <Link href="/groups">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-accent" />
                <h3 className="font-semibold">Groups</h3>
              </CardContent>
            </Card>
          </Link>
          <Link href="/games">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6 text-center">
                <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-secondary" />
                <h3 className="font-semibold">Games</h3>
              </CardContent>
            </Card>
          </Link>
          <Link href="/profile">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6 text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 text-destructive" />
                <h3 className="font-semibold">My Profile</h3>
              </CardContent>
            </Card>
          </Link>
        </div>
        <div className="mt-8">
          <Link href="/api/auth/logout">
            <Button variant="outline" data-testid="button-logout">Log Out</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
