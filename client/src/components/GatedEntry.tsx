import { useState, useEffect } from "react";
import { HCaptcha } from "@/components/HCaptcha";
import { AgeGate } from "@/components/AgeGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type Step = "captcha" | "age" | "complete" | "underage";

interface GatedEntryProps {
  onComplete: () => void;
}

export function GatedEntry({ onComplete }: GatedEntryProps) {
  const [step, setStep] = useState<Step>("captcha");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const ageVerified = localStorage.getItem("ageVerificationPassed");
    const captchaSession = sessionStorage.getItem("captchaVerified");
    
    if (ageVerified === "true" && captchaSession === "true") {
      onComplete();
    } else if (ageVerified === "true") {
      setStep("captcha");
    }
  }, [onComplete]);

  const handleCaptchaVerify = async (token: string) => {
    setIsVerifying(true);
    setError("");
    
    try {
      const result = await apiRequest<{ success: boolean; message?: string }>("/api/verify-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      
      if (result.success) {
        setCaptchaVerified(true);
        sessionStorage.setItem("captchaVerified", "true");
        
        const ageVerified = localStorage.getItem("ageVerificationPassed");
        if (ageVerified === "true") {
          onComplete();
        } else {
          setStep("age");
        }
      } else {
        setError(result.message || "Verification failed");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAgeVerified = () => {
    setStep("complete");
    onComplete();
  };

  const handleUnderage = () => {
    setStep("underage");
    localStorage.removeItem("ageVerificationPassed");
    localStorage.removeItem("dateOfBirth");
  };

  if (step === "underage") {
    return (
      <Card className="w-full max-w-md mx-auto border-2 border-destructive/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-display text-destructive">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            DisabilitySquare is only available to users aged 16 and over, in compliance with Australian eSafety regulations.
          </p>
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact support.
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = "https://www.esafety.gov.au/"}
            data-testid="link-esafety"
          >
            Learn about eSafety
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "captcha") {
    return (
      <div className="space-y-4">
        <HCaptcha
          onVerify={handleCaptchaVerify}
          onExpire={() => setCaptchaVerified(false)}
          onError={(err) => setError(`Captcha error: ${err}`)}
          isLoading={isVerifying}
        />
        {error && (
          <div className="flex items-center justify-center gap-2 text-destructive text-sm">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>
    );
  }

  if (step === "age") {
    return (
      <AgeGate
        onVerified={handleAgeVerified}
        onUnderage={handleUnderage}
      />
    );
  }

  return null;
}
