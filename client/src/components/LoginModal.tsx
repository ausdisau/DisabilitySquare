import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Users, Shield, Heart, LogIn, Calendar, AlertTriangle, 
  XCircle, CheckCircle2, Loader2, ArrowLeft
} from "lucide-react";
import { HCaptcha } from "@/components/HCaptcha";
import { apiRequest } from "@/lib/queryClient";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "captcha" | "age" | "signin" | "underage";

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [step, setStep] = useState<Step>("captcha");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Age verification state
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  // Check if user already passed the gates
  useEffect(() => {
    if (open) {
      const ageVerified = localStorage.getItem("ageVerificationPassed");
      const captchaSession = sessionStorage.getItem("captchaVerified");
      
      if (ageVerified === "true" && captchaSession === "true") {
        setStep("signin");
      } else if (captchaSession === "true") {
        setStep("age");
      } else {
        setStep("captcha");
      }
    }
  }, [open]);

  const handleCaptchaVerify = async (token: string) => {
    setIsLoading(true);
    setError("");
    
    try {
      const res = await apiRequest("POST", "/api/verify-captcha", { token });
      const result = await res.json() as { success: boolean; message?: string };
      
      if (result.success) {
        sessionStorage.setItem("captchaVerified", "true");
        const ageVerified = localStorage.getItem("ageVerificationPassed");
        if (ageVerified === "true") {
          setStep("signin");
        } else {
          setStep("age");
        }
      } else {
        setError(result.message || "Verification failed");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isValidDate = (d: number, m: number, y: number): boolean => {
    const date = new Date(y, m - 1, d);
    return (
      date.getFullYear() === y &&
      date.getMonth() === m - 1 &&
      date.getDate() === d
    );
  };

  const handleAgeVerify = () => {
    setError("");
    
    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);
    
    if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > new Date().getFullYear()) {
      setError("Please enter a valid date of birth");
      return;
    }

    if (!isValidDate(d, m, y)) {
      setError("This date doesn't exist. Please check your entry.");
      return;
    }

    if (!declarationAccepted) {
      setError("Please confirm the age declaration to continue");
      return;
    }

    const dob = new Date(y, m - 1, d);
    const today = new Date();
    
    if (dob > today) {
      setError("Date of birth cannot be in the future");
      return;
    }
    
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age > 120) {
      setError("Please enter a valid date of birth");
      return;
    }

    if (age < 16) {
      localStorage.removeItem("ageVerificationPassed");
      localStorage.removeItem("dateOfBirth");
      setStep("underage");
      return;
    }

    // Store age verification locally
    localStorage.setItem("ageVerificationPassed", "true");
    localStorage.setItem("dateOfBirth", dob.toISOString());
    setStep("signin");
  };

  const handleLogin = () => {
    setIsLoading(true);
    window.location.href = "/api/auth/login";
  };

  const renderStep = () => {
    switch (step) {
      case "captcha":
        return (
          <>
            <DialogHeader className="text-center sm:text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-bold text-primary" data-testid="text-modal-title">
                Security Check
              </DialogTitle>
              <DialogDescription className="text-base">
                Please complete the verification below to continue.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              <HCaptcha
                onVerify={handleCaptchaVerify}
                onExpire={() => setError("Captcha expired. Please try again.")}
                onError={(err) => setError(`Captcha error: ${err}`)}
                isLoading={isLoading}
              />
              {error && (
                <div className="flex items-center justify-center gap-2 text-destructive text-sm mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div className="h-2 w-2 rounded-full bg-muted" />
              <div className="h-2 w-2 rounded-full bg-muted" />
            </div>
          </>
        );

      case "age":
        return (
          <>
            <DialogHeader className="text-center sm:text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-bold text-primary" data-testid="text-modal-title">
                Age Verification
              </DialogTitle>
              <DialogDescription className="text-base">
                Australian eSafety regulations require users to be 16 or older.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date of Birth</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="day" className="text-xs text-muted-foreground">Day</Label>
                    <Input
                      id="day"
                      type="number"
                      placeholder="DD"
                      min={1}
                      max={31}
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      className="text-center"
                      data-testid="input-dob-day"
                    />
                  </div>
                  <div>
                    <Label htmlFor="month" className="text-xs text-muted-foreground">Month</Label>
                    <Input
                      id="month"
                      type="number"
                      placeholder="MM"
                      min={1}
                      max={12}
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="text-center"
                      data-testid="input-dob-month"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year" className="text-xs text-muted-foreground">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="YYYY"
                      min={1900}
                      max={new Date().getFullYear()}
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="text-center"
                      data-testid="input-dob-year"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <Checkbox
                  id="login-age-declaration"
                  checked={declarationAccepted}
                  onCheckedChange={(checked) => setDeclarationAccepted(checked === true)}
                  className="mt-0.5"
                  data-testid="checkbox-login-age-declaration"
                />
                <Label htmlFor="login-age-declaration" className="text-xs leading-snug cursor-pointer font-normal">
                  I confirm I am 16 years or older. I understand that accounts belonging to under-16 users will be deactivated and data handled per the{" "}
                  <a href="/privacy" className="underline text-primary">Privacy Policy</a>.
                </Label>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-md">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleAgeVerify}
                disabled={!declarationAccepted}
                data-testid="button-verify-age"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Verify My Age
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Your date of birth is used only for age verification and is kept private.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div className="h-2 w-2 rounded-full bg-muted" />
            </div>
          </>
        );

      case "signin":
        return (
          <>
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
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Redirecting...
                    </>
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

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div className="h-2 w-2 rounded-full bg-primary" />
            </div>
          </>
        );

      case "underage":
        return (
          <>
            <DialogHeader className="text-center sm:text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <DialogTitle className="text-2xl font-bold text-destructive" data-testid="text-modal-title">
                Access Denied
              </DialogTitle>
              <DialogDescription className="text-base">
                DisabilitySquare is only available to users aged 16 and over.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-4 text-center">
              <p className="text-muted-foreground">
                This restriction is in compliance with Australian eSafety regulations 
                designed to protect young people online.
              </p>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "https://www.esafety.gov.au/"}
                data-testid="link-esafety"
              >
                Learn about eSafety
              </Button>

              <p className="text-sm text-muted-foreground">
                If you believe this is an error, please contact support.
              </p>
            </div>
          </>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-login">
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}
