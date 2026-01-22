import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Shield, Heart, LogIn } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    window.location.href = "/api/auth/login";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-login">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <img
              src="/logo.png"
              alt="DisabilitySquare"
              className="h-10 w-auto"
            />
          </div>
          <DialogTitle className="text-2xl font-bold text-primary" data-testid="text-modal-title">
            Welcome to DisabilitySquare
          </DialogTitle>
          <DialogDescription className="text-base">
            Join our supportive community and connect with others who understand.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-3">
            {[
              { icon: Users, text: "Connect with your community" },
              { icon: Shield, text: "Safe, accessible environment" },
              { icon: Heart, text: "Earn recognition for participation" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <item.icon className="h-4 w-4 text-accent flex-shrink-0" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button
              size="lg"
              className="w-full"
              onClick={handleLogin}
              disabled={isLoading}
              data-testid="button-login-submit"
            >
              {isLoading ? (
                "Redirecting..."
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In to Continue
                </>
              )}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our community guidelines.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
