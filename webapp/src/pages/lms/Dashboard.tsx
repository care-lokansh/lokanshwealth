import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Loader2, FileStack, IndianRupee, Clock, CheckCircle2, ArrowRight, FolderKanban, Users, BarChart3, Inbox, UserCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import { useSession, type SessionUser } from "@/lib/auth-client";
import {
  formatINRShort, formatINR, formatDate, STAGE_LABELS,
  type AnalyticsSummary, type ApplicationListResponse, type LoanProduct,
} from "@/lib/lms";
import { StatusBadge, SectionCard } from "@/components/lms/primitives";
import { Button } from "@/components/ui/button";

function Kpi({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-3 font-mono-num text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

const QUICK = [
  { to: "/app/files", label: "All Files", icon: FolderKanban },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/workers", label: "Workers", icon: Users },
];

export default function Dashboard() {
  const { data: session } = useSession();
  const name = (session?.user as SessionUser | undefined)?.name?.split(" ")[0] ?? "there";

  const { data: summary, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => api.get<AnalyticsSummary>("/api/v1/analytics/summary"),
  });
  const { data: recent } = useQuery({
    queryKey: ["applications", "dashboard-recent"],
    queryFn: () => api.get<ApplicationListResponse>("/api/v1/applications?sort=createdAt&order=desc&pageSize=8"),
  });
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get<LoanProduct[]>("/api/v1/products"),
  });
  const productName = (code: string) => products?.find((p) => p.code === code)?.name ?? code;

  if (isLoading || !summary) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Namaste, {name} 🙏</h1>
          <p className="text-sm text-muted-foreground">Here's how the desk is doing today.</p>
        </div>
        <div className="hidden flex-wrap gap-2 sm:flex">
          {QUICK.map((q) => {
            const Icon = q.icon;
            return (
              <Link key={q.to} to={q.to}>
                <Button variant="outline" size="sm"><Icon className="mr-1.5 h-4 w-4" /> {q.label}</Button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Pipeline counts — received vs in pool vs picked up */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <Kpi icon={<FileStack className="h-4 w-4" />} label="Total Received" value={String(summary.totalAll)} sub={`${summary.totalThisMonth} this month`} />
        <Kpi icon={<Inbox className="h-4 w-4" />} label="In Pool" value={String(summary.inPool)} sub="waiting to be picked" />
        <Kpi icon={<UserCheck className="h-4 w-4" />} label="Taken" value={String(summary.taken)} sub="picked up by workers" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={<FileStack className="h-4 w-4" />} label="New This Month" value={String(summary.totalThisMonth)} sub={`${summary.totalAll} total files`} />
        <Kpi icon={<IndianRupee className="h-4 w-4" />} label="Disbursed" value={formatINRShort(summary.disbursedThisMonth)} sub="this month" />
        <Kpi icon={<Clock className="h-4 w-4" />} label="Avg TAT" value={`${summary.avgProcessingDays}d`} sub="turnaround time" />
        <Kpi icon={<CheckCircle2 className="h-4 w-4" />} label="Approval Rate" value={`${summary.approvalRate}%`} sub="of all files" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent files */}
        <div className="lg:col-span-2">
          <SectionCard
            title="Recent Files · Naye Aavedan"
            action={<Link to="/app/files" className="inline-flex items-center text-xs font-medium text-[hsl(var(--primary))] hover:underline">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>}
          >
            <div className="divide-y divide-border">
              {(recent?.items ?? []).map((a) => (
                <Link key={a.id} to={`/app/files/${a.id}`} className="flex items-center gap-3 py-2.5 transition-colors hover:bg-secondary/30 -mx-2 px-2 rounded">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">{a.fullName}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{a.arn} · {productName(a.loanType)}</div>
                  </div>
                  <span className="hidden font-mono-num text-sm font-semibold text-foreground sm:block" title={formatINR(a.amount)}>{formatINRShort(a.amount)}</span>
                  <span className="hidden text-[11px] text-muted-foreground md:block">{formatDate(a.createdAt)}</span>
                  <StatusBadge status={a.status} />
                </Link>
              ))}
              {(recent?.items ?? []).length === 0 ? <p className="py-6 text-center text-xs text-muted-foreground">No files yet.</p> : null}
            </div>
          </SectionCard>
        </div>

        {/* Oldest pending */}
        <SectionCard title="Needs Attention · Dhyaan Dein">
          <div className="space-y-2">
            {summary.topPending.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">All caught up. 🎉</p>
            ) : summary.topPending.map((a) => (
              <Link key={a.id} to={`/app/files/${a.id}`} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5 transition-colors hover:bg-secondary/40">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--status-process)/0.14)] font-mono-num text-[11px] font-bold text-[hsl(28_90%_34%)]">{a.ageDays}d</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{a.fullName}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{STAGE_LABELS[a.stage]}</div>
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
