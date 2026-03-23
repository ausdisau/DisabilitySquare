import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, AlertTriangle, CheckCircle2, Clock, Ban, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const SCHEME_LABELS: Record<string, string> = {
  cyberbullying: "Cyberbullying",
  adult_cyber_abuse: "Adult Cyber Abuse",
  image_based_abuse: "Image-Based Abuse",
  illegal_content: "Illegal Content",
  general_harassment: "General Harassment",
  underage: "Underage User",
};

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  pending: { label: "Pending", variant: "secondary", icon: Clock },
  reviewed: { label: "Reviewed", variant: "default", icon: CheckCircle2 },
  actioned: { label: "Actioned", variant: "destructive", icon: ShieldAlert },
  dismissed: { label: "Dismissed", variant: "outline", icon: AlertTriangle },
};

export default function AdminReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [schemeFilter, setSchemeFilter] = useState<string>("all");

  const { data: reports, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/reports", statusFilter, schemeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (schemeFilter !== "all") params.set("scheme", schemeFilter);
      const res = await fetch(`/api/admin/reports?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Access denied");
      return res.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ reportId, status }: { reportId: number; status: string }) =>
      apiRequest("PATCH", `/api/admin/reports/${reportId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
      toast({ title: "Report status updated" });
    },
    onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
  });

  const deactivateMutation = useMutation({
    mutationFn: (reportId: number) =>
      apiRequest("POST", `/api/admin/reports/${reportId}/deactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
      toast({ title: "User account deactivated" });
    },
    onError: () => toast({ title: "Failed to deactivate user", variant: "destructive" }),
  });

  const reverifyMutation = useMutation({
    mutationFn: (reportId: number) =>
      apiRequest("POST", `/api/admin/reports/${reportId}/reverify`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
      toast({ title: "Re-verification requested" });
    },
    onError: () => toast({ title: "Failed to request re-verification", variant: "destructive" }),
  });

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-20 text-muted-foreground">Please sign in to access this page.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title="Admin — eSafety Reports — DisabilitySquare"
        description="Review and manage eSafety reports from community members."
      />
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-destructive" />
          <h1 className="text-2xl font-display font-bold text-foreground" data-testid="text-admin-reports-title">
            eSafety Reports
          </h1>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" data-testid="select-status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="actioned">Actioned</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={schemeFilter} onValueChange={setSchemeFilter}>
            <SelectTrigger className="w-48" data-testid="select-scheme-filter">
              <SelectValue placeholder="Filter by scheme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schemes</SelectItem>
              {Object.entries(SCHEME_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-36 w-full rounded-2xl" />
            ))}
          </div>
        ) : reports && reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map((report: any) => {
              const statusInfo = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusInfo.icon;
              const isUnderage = report.esafetyScheme === "underage";

              return (
                <Card
                  key={report.id}
                  className={`border ${isUnderage ? "border-orange-300 dark:border-orange-700 bg-orange-50/40 dark:bg-orange-950/20" : "border-border"}`}
                  data-testid={`card-report-${report.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-sm font-semibold">
                          Report #{report.id}
                        </CardTitle>
                        <Badge variant={statusInfo.variant} className="flex items-center gap-1 text-[11px]">
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                        {report.esafetyScheme && (
                          <Badge variant="outline" className={`text-[11px] ${isUnderage ? "border-orange-400 text-orange-700 dark:text-orange-400" : ""}`}>
                            {isUnderage && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {SCHEME_LABELS[report.esafetyScheme] || report.esafetyScheme}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(report.createdAt || new Date()), { addSuffix: true })}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Content Type:</span>{" "}
                        <span className="font-medium capitalize">{report.contentType || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Content ID:</span>{" "}
                        <span className="font-medium">#{report.contentId || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reported User:</span>{" "}
                        <span className="font-medium">{report.reportedUserId || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reporter:</span>{" "}
                        <span className="font-medium">{report.reporterId || "—"}</span>
                      </div>
                    </div>

                    {report.reason && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Reason:</span>{" "}
                        <span>{report.reason}</span>
                      </div>
                    )}

                    {report.contextData && Object.keys(report.contextData).length > 0 && (
                      <div className="text-xs bg-muted/40 rounded-lg p-2 space-y-1">
                        {Object.entries(report.contextData).map(([key, val]) => (
                          <div key={key}>
                            <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}:</span>{" "}
                            <span>{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="text-xs text-muted-foreground">Update status:</span>
                      {["reviewed", "actioned", "dismissed"].map(status => (
                        <Button
                          key={status}
                          variant={report.status === status ? "default" : "outline"}
                          size="sm"
                          className="h-7 text-xs px-3"
                          disabled={updateStatusMutation.isPending || report.status === status}
                          onClick={() => updateStatusMutation.mutate({ reportId: report.id, status })}
                          data-testid={`button-status-${status}-${report.id}`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-3 flex items-center gap-1"
                        disabled={reverifyMutation.isPending}
                        onClick={() => reverifyMutation.mutate(report.id)}
                        data-testid={`button-reverify-${report.id}`}
                      >
                        <RefreshCw className="h-3 w-3" />
                        Request Re-verification
                      </Button>

                      {report.reportedUserId && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7 text-xs px-3 ml-auto flex items-center gap-1"
                          disabled={deactivateMutation.isPending}
                          onClick={() => {
                            if (confirm("Deactivate this user account? This cannot be undone without admin intervention.")) {
                              deactivateMutation.mutate(report.id);
                            }
                          }}
                          data-testid={`button-deactivate-user-${report.id}`}
                        >
                          <Ban className="h-3 w-3" />
                          Deactivate User
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <ShieldAlert className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No reports found.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
