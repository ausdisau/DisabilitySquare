import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { LoginModal } from "@/components/LoginModal";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (isLoading) return null;
  if (isAuthenticated) return <Redirect to="/" />;

  return (
    <>
      <SEO 
        title="Welcome" 
        description="DisabilitySquare - A specialized social platform fostering connection, support, and community for people with disabilities."
      />
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left: Content */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,var(--primary)/0.1,transparent_50%)]" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-4 mb-8">
            <img 
              src="/logo.png" 
              alt="DisabilitySquare Logo" 
              className="h-20 w-auto"
              data-testid="img-logo"
            />
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-bold mb-6 animate-fade-in">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            Welcome to the Village Square
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl text-primary font-bold mb-6 leading-tight" data-testid="text-headline">
            Connect where you <br/>
            <span className="text-accent">belong.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
            A specialized social platform fostering connection, support, and community for people with disabilities.
          </p>

          <div className="grid gap-4 mb-10">
            {[
              "Accessible-first design for everyone",
              "Private communities by diagnosis & interest",
              "Built-in games to play with friends",
              "Safe, supportive environment"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-lg font-medium text-foreground/80">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              onClick={() => setShowLoginModal(true)}
              data-testid="button-join-community"
            >
              Join the Community <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />

      {/* Right: Hero Image/Visual */}
      <div className="hidden lg:block lg:w-1/2 bg-muted relative">
        {/* Abstract "Village Square" representation */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
           <img 
             src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?q=80&w=2070&auto=format&fit=crop" 
             alt="Diverse group of friends smiling together outdoors"
             className="rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 border-8 border-white object-cover w-full h-[600px]"
           />
        </div>
      </div>
    </div>
    </>
  );
}
