import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Flag,
  Shield,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Loader2,
  Users,
  Camera,
  MessageSquareWarning,
  BanIcon,
  ShieldAlert,
} from "lucide-react";

export type ReportableType = "post" | "thread" | "reply";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: ReportableType;
  contentId: number;
  authorId: string;
  authorName?: string;
}

type EsafetyScheme =
  | "cyberbullying"
  | "adult_cyber_abuse"
  | "image_based_abuse"
  | "illegal_content"
  | "general_harassment"
  | "underage";

interface SchemeDefinition {
  value: EsafetyScheme;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  audience?: string;
}

const SCHEMES: SchemeDefinition[] = [
  {
    value: "cyberbullying",
    label: "Cyberbullying",
    description:
      "Serious bullying targeting someone under 18 — threats, humiliation, or repeated harassment of a young person.",
    icon: Users,
    audience: "Under-18 target",
  },
  {
    value: "adult_cyber_abuse",
    label: "Adult Cyber Abuse",
    description:
      "Seriously harmful online abuse targeting an adult — menacing, harassing, or offensive content intended to cause serious harm.",
    icon: MessageSquareWarning,
    audience: "Adult target",
  },
  {
    value: "image_based_abuse",
    label: "Non-Consensual Intimate Image",
    description:
      "Sharing or threatening to share intimate images of a person without their consent (image-based abuse).",
    icon: Camera,
  },
  {
    value: "illegal_content",
    label: "Illegal / Class 1 Content",
    description:
      "Content that is clearly illegal — child sexual abuse material, content advocating serious violence or terrorism.",
    icon: BanIcon,
  },
  {
    value: "general_harassment",
    label: "General Harassment",
    description:
      "Repeated unwanted contact, hate speech, or behaviour that violates community guidelines.",
    icon: ShieldAlert,
  },
  {
    value: "underage",
    label: "Underage Account (suspected under 16)",
    description:
      "You believe this account belongs to a user who is under 16 years old.",
    icon: Shield,
  },
];

interface SchemeContextFields {
  cyberbullying: { targetAge?: string };
  adult_cyber_abuse: {};
  image_based_abuse: { showsReporter?: boolean };
  illegal_content: {};
  general_harassment: {};
  underage: {};
}

function generateReferenceNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ESR-${ts}-${rand}`;
}

export function ReportDialog({
  open,
  onOpenChange,
  contentType,
  contentId,
  authorId,
  authorName,
}: ReportDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedScheme, setSelectedScheme] = useState<EsafetyScheme | null>(null);
  const [contextFields, setContextFields] = useState<Record<string, string>>({});
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const { toast } = useToast();

  const reportMutation = useMutation({
    mutationFn: async (data: {
      reportedUserId: string;
      reportType: string;
      reason?: string;
      contentType?: string;
      contentId?: number;
      esafetyScheme?: string;
      contextData?: Record<string, string>;
    }) => {
      const res = await apiRequest("POST", "/api/reports", data);
      if (!res.ok) {
        const err = await res.json() as { message?: string };
        throw new Error(err.message || "Report submission failed");
      }
      return res.json() as Promise<{ success: boolean; reportId: number }>;
    },
    onSuccess: () => {
      const ref = generateReferenceNumber();
      setReferenceNumber(ref);
      setStep(3);
    },
    onError: (error: any) => {
      toast({
        title: "Report Failed",
        description: error.message || "Unable to submit report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setSelectedScheme(null);
      setContextFields({});
      setAdditionalDetails("");
      setReferenceNumber("");
    }, 300);
  };

  const handleSchemeSelect = (scheme: EsafetyScheme) => {
    setSelectedScheme(scheme);
    setStep(2);
  };

  const handleSubmit = () => {
    if (!selectedScheme) return;
    const reasonParts: string[] = [];
    if (additionalDetails.trim()) reasonParts.push(additionalDetails.trim());
    Object.entries(contextFields).forEach(([k, v]) => {
      if (v) reasonParts.push(`${k}: ${v}`);
    });
    reportMutation.mutate({
      reportedUserId: authorId,
      reportType: selectedScheme,
      reason: reasonParts.join(" | ") || undefined,
      contentType,
      contentId,
      esafetyScheme: selectedScheme,
      contextData: contextFields,
    });
  };

  const selectedSchemeInfo = SCHEMES.find((s) => s.value === selectedScheme);
  const SchemeIcon = selectedSchemeInfo?.icon || Flag;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg" data-testid="dialog-report">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-destructive" />
                Report {contentType === "post" ? "Post" : contentType === "thread" ? "Thread" : "Reply"}
              </DialogTitle>
              <DialogDescription>
                Select the type of harm to report. This helps us handle your report under the correct eSafety scheme.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-2 max-h-[60vh] overflow-y-auto pr-1">
              {SCHEMES.map((scheme) => {
                const Icon = scheme.icon;
                return (
                  <button
                    key={scheme.value}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 text-left transition-colors group"
                    onClick={() => handleSchemeSelect(scheme.value)}
                    data-testid={`button-scheme-${scheme.value}`}
                  >
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{scheme.label}</span>
                        {scheme.audience && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {scheme.audience}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        {scheme.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 2 && selectedScheme && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <SchemeIcon className="h-5 w-5 text-destructive" />
                {selectedSchemeInfo?.label}
              </DialogTitle>
              <DialogDescription>
                {selectedSchemeInfo?.description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {selectedScheme === "cyberbullying" && (
                <div className="space-y-2">
                  <Label htmlFor="target-age">
                    Approximate age of the targeted person (if known)
                  </Label>
                  <Input
                    id="target-age"
                    placeholder="e.g. 14, under 18, not sure"
                    value={contextFields.targetAge || ""}
                    onChange={(e) =>
                      setContextFields((prev) => ({ ...prev, targetAge: e.target.value }))
                    }
                    data-testid="input-target-age"
                  />
                  <p className="text-xs text-muted-foreground">
                    Cyberbullying reports under the eSafety scheme require the target to be under 18.
                  </p>
                </div>
              )}
              {selectedScheme === "image_based_abuse" && (
                <div className="space-y-2">
                  <Label>Does the image or video show you?</Label>
                  <div className="flex gap-3">
                    {["Yes", "No", "Not sure"].map((opt) => (
                      <button
                        key={opt}
                        className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                          contextFields.showsReporter === opt
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() =>
                          setContextFields((prev) => ({ ...prev, showsReporter: opt }))
                        }
                        data-testid={`button-shows-reporter-${opt.toLowerCase().replace(" ", "-")}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="additional-details">
                  Additional details{" "}
                  <span className="text-muted-foreground font-normal">(optional but helpful)</span>
                </Label>
                <Textarea
                  id="additional-details"
                  placeholder="Provide any further context to help our team review this report..."
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  className="min-h-[100px]"
                  data-testid="input-additional-details"
                />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <span className="font-semibold">Privacy note:</span> Your identity will not be shared with the person you are reporting. Reports are reviewed by our safety team.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                disabled={reportMutation.isPending}
                data-testid="button-report-back"
              >
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleSubmit}
                disabled={reportMutation.isPending}
                data-testid="button-report-submit"
              >
                {reportMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Flag className="h-4 w-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Report Submitted
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <p className="font-medium text-sm text-green-800">Thank you for your report</p>
                <p className="text-xs text-green-700">
                  Our safety team will review your report. We aim to respond within 48 hours.
                </p>
                {referenceNumber && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-xs text-green-700 font-medium">Reference number:</p>
                    <p
                      className="text-sm font-mono font-bold text-green-800"
                      data-testid="text-report-reference"
                    >
                      {referenceNumber}
                    </p>
                    <p className="text-xs text-green-600 mt-1">Keep this for your records.</p>
                  </div>
                )}
              </div>

              <div className="border border-border rounded-lg p-3 space-y-2">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  Next steps & escalation
                </p>
                <p className="text-xs text-muted-foreground">
                  If this report is not resolved within 48 hours, you can escalate directly to the eSafety Commissioner:
                </p>
                <div className="flex flex-col gap-1.5 mt-1">
                  <a
                    href="https://www.esafety.gov.au/report/cyberbullying"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary underline flex items-center gap-1"
                    data-testid="link-esafety-cyberbullying"
                  >
                    <ExternalLink className="h-3 w-3" />
                    eSafety Cyberbullying Complaint
                  </a>
                  <a
                    href="https://www.esafety.gov.au/report/adult-cyber-abuse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary underline flex items-center gap-1"
                    data-testid="link-esafety-adult"
                  >
                    <ExternalLink className="h-3 w-3" />
                    eSafety Adult Cyber Abuse Complaint
                  </a>
                  <a
                    href="https://www.esafety.gov.au/report/image-based-abuse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary underline flex items-center gap-1"
                    data-testid="link-esafety-image"
                  >
                    <ExternalLink className="h-3 w-3" />
                    eSafety Image-Based Abuse Complaint
                  </a>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleClose} data-testid="button-close-report-dialog">
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
