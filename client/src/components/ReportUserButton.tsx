import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Flag, MoreHorizontal, AlertTriangle, Loader2, Check, Shield, ExternalLink } from "lucide-react";

interface ReportUserButtonProps {
  userId: string;
  userName?: string;
  variant?: "icon" | "dropdown";
}

const REPORT_TYPES = [
  { value: "underage", label: "Underage User", description: "Report if you believe this user is under 16 years old" },
  { value: "harassment", label: "Harassment", description: "Bullying, threats, or abusive behavior" },
  { value: "inappropriate_content", label: "Inappropriate Content", description: "Offensive or harmful content" },
  { value: "spam", label: "Spam", description: "Unwanted or repetitive content" },
  { value: "other", label: "Other", description: "Other policy violations" },
] as const;

export function ReportUserButton({ userId, userName, variant = "icon" }: ReportUserButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const { data: hasReported } = useQuery({
    queryKey: ["/api/reports/check", userId, "underage"],
    queryFn: async () => {
      const res = await fetch(`/api/reports/check/${userId}/underage`, { credentials: "include" });
      if (!res.ok) return { hasReported: false };
      return res.json();
    },
    enabled: !!userId,
  });

  const reportMutation = useMutation({
    mutationFn: async (data: { reportedUserId: string; reportType: string; reason?: string }) => {
      const res = await apiRequest("POST", "/api/reports", data);
      return res.json() as Promise<{ success: boolean }>;
    },
    onSuccess: () => {
      setSubmitted(true);
      setSelectedType("");
      setReason("");
      queryClient.invalidateQueries({ queryKey: ["/api/reports/check", userId] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Report Failed", 
        description: error.message || "Unable to submit report. Please try again.",
        variant: "destructive"
      });
    },
  });

  const handleSubmitReport = () => {
    if (!selectedType) {
      toast({ title: "Select a report type", variant: "destructive" });
      return;
    }
    reportMutation.mutate({
      reportedUserId: userId,
      reportType: selectedType,
      reason: reason.trim() || undefined,
    });
  };

  const openReportDialog = (type: string) => {
    setSelectedType(type);
    setSubmitted(false);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSubmitted(false);
    setSelectedType("");
    setReason("");
  };

  const ReportConfirmation = () => (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-md">
        <Check className="h-5 w-5 text-green-600 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-medium text-sm text-green-800">Report submitted</p>
          <p className="text-xs text-green-700">Thank you for helping keep DisabilitySquare safe. Our team will review your report.</p>
        </div>
      </div>
      <div className="border border-[#c8d0dc] rounded-sm p-3 space-y-2">
        <p className="text-xs font-bold text-[#1B4B8A] flex items-center gap-1">
          <Shield className="h-3 w-3" aria-hidden="true" />
          Additional resources
        </p>
        <div className="flex flex-col gap-1">
          <Link href="/safety" onClick={handleCloseDialog}>
            <span className="text-xs text-[#1B4B8A] underline cursor-pointer flex items-center gap-1" data-testid="link-report-safety-centre">
              <Shield className="h-3 w-3" aria-hidden="true" />
              Safety Centre
            </span>
          </Link>
          <a
            href="https://www.esafety.gov.au/report/cyberbullying"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#1B4B8A] underline flex items-center gap-1"
            data-testid="link-report-esafety-cyberbullying"
          >
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
            eSafety Cyberbullying Complaint
          </a>
          <a
            href="https://www.esafety.gov.au/report/adult-cyber-abuse"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#1B4B8A] underline flex items-center gap-1"
            data-testid="link-report-esafety-adult"
          >
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
            eSafety Adult Cyber Abuse Complaint
          </a>
        </div>
      </div>
    </div>
  );

  if (variant === "dropdown") {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid={`button-report-menu-${userId}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => openReportDialog("underage")}
              className="text-destructive focus:text-destructive"
              data-testid={`button-report-underage-${userId}`}
            >
              <Flag className="h-4 w-4 mr-2" />
              Report as Underage
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openReportDialog("")}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-destructive" />
                Report {userName || "User"}
              </DialogTitle>
              {!submitted && (
                <DialogDescription>
                  Help us maintain a safe community by reporting policy violations.
                </DialogDescription>
              )}
            </DialogHeader>

            {submitted ? (
              <ReportConfirmation />
            ) : (
              <div className="space-y-4 py-4">
                {!selectedType && (
                  <div className="space-y-2">
                    <Label>Select Report Type</Label>
                    <div className="grid gap-2">
                      {REPORT_TYPES.map((type) => (
                        <Button
                          key={type.value}
                          variant="outline"
                          className="justify-start h-auto py-3 px-4"
                          onClick={() => setSelectedType(type.value)}
                          data-testid={`button-select-report-${type.value}`}
                        >
                          <div className="text-left">
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedType && (
                  <>
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md">
                      <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">
                          {REPORT_TYPES.find(t => t.value === selectedType)?.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {REPORT_TYPES.find(t => t.value === selectedType)?.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason">Additional Details (Optional)</Label>
                      <Textarea
                        id="reason"
                        placeholder="Provide any additional information that might help our review..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="min-h-[100px]"
                        data-testid="input-report-reason"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            <DialogFooter>
              {submitted ? (
                <Button variant="outline" onClick={handleCloseDialog} data-testid="button-close-report">
                  Close
                </Button>
              ) : (
                <>
                  {selectedType && (
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedType("")}
                      disabled={reportMutation.isPending}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={handleSubmitReport}
                    disabled={!selectedType || reportMutation.isPending}
                    data-testid="button-submit-report"
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
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => openReportDialog("")}
        className="text-muted-foreground hover:text-destructive"
        title="Report user"
        data-testid={`button-report-${userId}`}
      >
        {hasReported?.hasReported ? (
          <Check className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Flag className="h-4 w-4" />
        )}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-destructive" />
              Report {userName || "User"}
            </DialogTitle>
            {!submitted && (
              <DialogDescription>
                Help us maintain a safe community by reporting policy violations.
              </DialogDescription>
            )}
          </DialogHeader>

          {submitted ? (
            <ReportConfirmation />
          ) : (
            <div className="space-y-4 py-4">
              {!selectedType && (
                <div className="space-y-2">
                  <Label>Select Report Type</Label>
                  <div className="grid gap-2">
                    {REPORT_TYPES.map((type) => (
                      <Button
                        key={type.value}
                        variant="outline"
                        className="justify-start h-auto py-3 px-4"
                        onClick={() => setSelectedType(type.value)}
                        data-testid={`button-select-report-${type.value}`}
                      >
                        <div className="text-left">
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {selectedType && (
                <>
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md">
                    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">
                        {REPORT_TYPES.find(t => t.value === selectedType)?.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {REPORT_TYPES.find(t => t.value === selectedType)?.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason2">Additional Details (Optional)</Label>
                    <Textarea
                      id="reason2"
                      placeholder="Provide any additional information that might help our review..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="min-h-[100px]"
                      data-testid="input-report-reason"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            {submitted ? (
              <Button variant="outline" onClick={handleCloseDialog} data-testid="button-close-report">
                Close
              </Button>
            ) : (
              <>
                {selectedType && (
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedType("")}
                    disabled={reportMutation.isPending}
                  >
                    Back
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={handleSubmitReport}
                  disabled={!selectedType || reportMutation.isPending}
                  data-testid="button-submit-report"
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
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
