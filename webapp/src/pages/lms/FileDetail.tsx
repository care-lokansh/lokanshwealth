import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ChevronLeft, Phone } from "lucide-react";
import { api } from "@/lib/api";
import { useSession, type SessionUser } from "@/lib/auth-client";
import {
  formatINR, formatDate, STAGE_LABELS,
  type ApplicationDetail, type LoanProduct,
} from "@/lib/lms";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/lms/primitives";
import { OverviewTab } from "@/components/lms/detail/OverviewTab";
import { DocumentsTab } from "@/components/lms/detail/DocumentsTab";
import { CallLogTab } from "@/components/lms/detail/CallLogTab";
import { StagePipelineTab } from "@/components/lms/detail/StagePipelineTab";
import { FinancialsTab } from "@/components/lms/detail/FinancialsTab";
import { NotesTab } from "@/components/lms/detail/NotesTab";
import { CommunicationTab } from "@/components/lms/detail/CommunicationTab";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "documents", label: "Documents" },
  { value: "calls", label: "Call Log" },
  { value: "pipeline", label: "Pipeline" },
  { value: "financials", label: "Financials" },
  { value: "notes", label: "Notes" },
  { value: "comms", label: "Communication" },
];

export default function FileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const role = (session?.user as SessionUser | undefined)?.role;
  const isAdmin = role === "SUPER_ADMIN";
  const canManage = role === "SUPER_ADMIN" || role === "WORKER";

  const { data, isLoading } = useQuery({
    queryKey: ["application", id],
    queryFn: () => api.get<ApplicationDetail>(`/api/v1/applications/${id}`),
    enabled: !!id,
  });
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get<LoanProduct[]>("/api/v1/products"),
  });

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }
  if (!data) {
    return <div className="px-6 py-10 text-sm text-muted-foreground">File not found.</div>;
  }

  const productName = products?.find((p) => p.code === data.loanType)?.name ?? data.loanType;
  const docCounts = {
    pending: (data.documents ?? []).filter((d) => d.status === "PENDING").length,
  };

  return (
    <div className="px-4 py-6 lg:px-8">
      <Button variant="ghost" size="sm" onClick={() => navigate("/app/files")} className="mb-3 -ml-2">
        <ChevronLeft className="mr-1 h-4 w-4" /> Back to files
      </Button>

      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm lg:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{data.fullName}</h1>
              <StatusBadge status={data.status} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="font-mono-num">{data.arn}</span>
              <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {data.mobile}</span>
              <span>· Received {formatDate(data.createdAt)}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-right">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Loan Type</div>
              <div className="text-sm font-semibold text-foreground">{productName}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Amount</div>
              <div className="font-mono-num text-sm font-bold text-foreground">{formatINR(data.amount)}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Stage</div>
              <div className="text-sm font-semibold text-[hsl(var(--primary))]">{STAGE_LABELS[data.stage]}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="mt-5">
        <div className="overflow-x-auto">
          <TabsList className="w-max">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="relative">
                {t.label}
                {t.value === "documents" && docCounts.pending > 0 ? (
                  <span className="ml-1.5 rounded-full bg-[hsl(var(--status-process)/0.2)] px-1.5 text-[10px] font-semibold text-[hsl(28_90%_34%)]">{docCounts.pending}</span>
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="mt-4">
          <TabsContent value="overview"><OverviewTab app={data} isAdmin={isAdmin} productName={productName} /></TabsContent>
          <TabsContent value="documents"><DocumentsTab app={data} canReview={canManage} /></TabsContent>
          <TabsContent value="calls"><CallLogTab app={data} /></TabsContent>
          <TabsContent value="pipeline"><StagePipelineTab app={data} canManage={canManage} /></TabsContent>
          <TabsContent value="financials"><FinancialsTab app={data} canManage={canManage} /></TabsContent>
          <TabsContent value="notes"><NotesTab app={data} /></TabsContent>
          <TabsContent value="comms"><CommunicationTab app={data} canManage={canManage} /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
