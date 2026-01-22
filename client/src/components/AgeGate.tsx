import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, AlertTriangle } from "lucide-react";

interface AgeGateProps {
  onVerified: () => void;
  onUnderage: () => void;
}

const MINIMUM_AGE = 16;

export function AgeGate({ onVerified, onUnderage }: AgeGateProps) {
  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [error, setError] = useState<string>("");

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

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

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
    
    if (isNaN(birthDate.getTime())) {
      setError("Please enter a valid date");
      return;
    }

    if (birthDate > new Date()) {
      setError("Date of birth cannot be in the future");
      return;
    }

    const age = calculateAge(birthDate);

    if (age < MINIMUM_AGE) {
      onUnderage();
    } else if (age > 120) {
      setError("Please enter a valid date of birth");
    } else {
      localStorage.setItem("ageVerificationPassed", "true");
      localStorage.setItem("dateOfBirth", birthDate.toISOString());
      onVerified();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-2 border-primary/20">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <ShieldCheck className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl font-display text-primary">Age Verification Required</CardTitle>
        <CardDescription className="text-base">
          DisabilitySquare is designed for users aged {MINIMUM_AGE} and over, in compliance with Australian eSafety regulations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base">Date of Birth</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Select value={day} onValueChange={setDay}>
                  <SelectTrigger data-testid="select-day">
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
                  <SelectTrigger data-testid="select-month">
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
                  <SelectTrigger data-testid="select-year">
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

          <Button type="submit" className="w-full" size="lg" data-testid="button-verify-age">
            Verify Age
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By continuing, you confirm that the information provided is accurate.
            Your date of birth will be stored securely to verify your eligibility.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
