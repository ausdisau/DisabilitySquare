import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, AlertTriangle, Loader2, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AgeVerificationOnboardingProps {
  onVerified: () => void;
}

const MINIMUM_AGE = 16;

export function AgeVerificationOnboarding({ onVerified }: AgeVerificationOnboardingProps) {
  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [underage, setUnderage] = useState(false);
  const queryClient = useQueryClient();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const isValidDate = (d: number, m: number, y: number): boolean => {
    const date = new Date(y, m - 1, d);
    return (
      date.getFullYear() === y &&
      date.getMonth() === m - 1 &&
      date.getDate() === d
    );
  };

  const verifyMutation = useMutation({
    mutationFn: async (dateOfBirth: string) => {
      const res = await apiRequest("POST", "/api/verify-age", { dateOfBirth });
      return res.json() as Promise<{ success: boolean; message?: string }>;
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/status"] });
        onVerified();
      }
    },
    onError: (error: any) => {
      if (error.message?.includes("16 years old") || error.message?.includes("403")) {
        setUnderage(true);
      } else {
        setError(error.message || "Verification failed. Please try again.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!day || !month || !year) {
      setError("Please enter your complete date of birth");
      return;
    }

    const dayNum = Number(day);
    const monthNum = Number(month);
    const yearNum = Number(year);

    if (!isValidDate(dayNum, monthNum, yearNum)) {
      setError("Please enter a valid date (e.g., February 30 is not valid)");
      return;
    }

    const birthDate = new Date(yearNum, monthNum - 1, dayNum);
    
    if (birthDate > new Date()) {
      setError("Date of birth cannot be in the future");
      return;
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < MINIMUM_AGE) {
      setUnderage(true);
      return;
    }

    if (age > 120) {
      setError("Please enter a valid date of birth");
      return;
    }

    verifyMutation.mutate(birthDate.toISOString());
  };

  if (underage) {
    return (
      <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-4">
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
              Your account has been logged out. If you believe this is an error, please contact support.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "/api/auth/logout"}
              data-testid="button-logout"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto border-2 border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display text-primary">Complete Your Profile</CardTitle>
          <CardDescription className="text-base">
            To comply with Australian eSafety regulations, we need to verify that you are at least {MINIMUM_AGE} years old.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base">Date of Birth</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Select value={day} onValueChange={setDay}>
                    <SelectTrigger data-testid="select-onboarding-day">
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger data-testid="select-onboarding-month">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger data-testid="select-onboarding-year">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={verifyMutation.isPending}
              data-testid="button-verify-age-onboarding"
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Age & Continue"
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Your date of birth is stored securely and used only to verify your eligibility.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
