import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2, TrendingUp, IndianRupee, Clock, CheckCircle2, Download } from "lucide-react";
import { api } from "@/lib/api";
import {
  formatINR, formatINRShort, formatDate, STAGE_LABELS,
  type AnalyticsSummary, type LoanProduct,
} from "@/lib/lms";
import { cn } from "@/lib/utils";
import { SectionCard } from "@/components/lms/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Warm, earthy palette — saffron-led, not a colourful template.
const PALETTE = [
  "hsl(20 90% 52%)", "hsl(35 85% 50%)", "hsl(150 45% 42%)", "hsl(200 55% 45%)",
  "hsl(280 40% 52%)", "hsl(48 80% 48%)", "hsl(10 65% 50%)", "hsl(170 40% 40%)",
  "hsl(220 50% 55%)", "hsl(330 45% 52%)", "hsl(90 40% 42%)", "hsl(255 40% 55%)",
];

function StatCard({ icon, label, hi, value, sub }: { icon: React.ReactNode; label: string; hi?: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-3 font-mono-num text-2xl font-bold text-foreground">{value}</div>
      {sub ? <div className="text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  );
}

function Donut({ data }: { data: { label: string; count: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const R = 60, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90">
        {total === 0 ? (
          <circle cx={80} cy={80} r={R} fill="none" stroke="hsl(var(--border))" strokeWidth={18} />
        ) : (
          data.map((d) => {
            const len = (d.count / total) * C;
            const seg = <circle key={d.label} cx={80} cy={80} r={R} fill="none" stroke={d.color} strokeWidth={18} strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} />;
            offset += len;
            return seg;
          })
        )}
        <circle cx={80} cy={80} r={42} fill="hsl(var(--card))" />
      </svg>
      <div className="grid flex-1 grid-cols-1 gap-1.5 sm:grid-cols-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: d.color }} />
            <span className="flex-1 truncate text-foreground">{d.label}</span>
            <span className="font-mono-num font-semibold text-muted-foreground">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Analytics() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => api.get<AnalyticsSummary>("/api/v1/analytics/summary"),
  });
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get<LoanProduct[]>("/api/v1/products"),
  });

  const productName = (code: string) => products?.find((p) => p.code === code)?.name ?? code;

  async function exportCsv() {
    const p = new URLSearchParams();
    if (from) p.set("dateFrom", from);
    if (to) p.set("dateTo", to);
    const res = await api.raw(`/api/v1/applications/export/csv?${p.toString()}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lokansh-export-${formatDate(new Date()).replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading || !data) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const donutData = data.byLoanType.map((d, i) => ({ label: productName(d.loanType), count: d.count, color: PALETTE[i % PALETTE.length] }));
  const maxStage = Math.max(1, ...data.byStage.map((s) => s.count));
  const orderedStages = [...data.byStage].sort((a, b) => b.count - a.count);

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Analytics <span className="text-base font-normal text-muted-foreground">· Vishleshan</span></h1>
          <p className="text-sm text-muted-foreground">Operations overview for the current desk.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <Label className="text-[11px] text-muted-foreground">From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-[150px]" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-[150px]" />
          </div>
          <Button variant="outline" size="sm" className="h-9" onClick={exportCsv}>
            <Download className="mr-1.5 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Applications" value={String(data.totalThisMonth)} sub={`this month · ${data.totalAll} all-time`} />
        <StatCard icon={<IndianRupee className="h-4 w-4" />} label="Disbursed" value={formatINRShort(data.disbursedThisMonth)} sub="this month" />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Avg TAT" value={`${data.avgProcessingDays}d`} sub="application → disbursed" />
        <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Approval Rate" value={`${data.approvalRate}%`} sub="approved + disbursed" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Donut */}
        <SectionCard title="By Loan Type · Rin Prakaar">
          <Donut data={donutData} />
        </SectionCard>

        {/* Stage bars */}
        <SectionCard title="Pipeline Distribution · Pragati">
          <div className="space-y-2">
            {orderedStages.map((s) => (
              <div key={s.stage} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate text-xs text-foreground">{STAGE_LABELS[s.stage]}</span>
                <div className="h-5 flex-1 overflow-hidden rounded bg-secondary">
                  <div className="h-full rounded bg-[hsl(var(--primary))]" style={{ width: `${(s.count / maxStage) * 100}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right font-mono-num text-xs font-semibold text-muted-foreground">{s.count}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Worker productivity */}
        <SectionCard title="Worker Productivity · Karmchari">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 font-semibold">Worker</th>
                  <th className="pb-2 text-center font-semibold">Assigned</th>
                  <th className="pb-2 text-center font-semibold">Disbursed</th>
                  <th className="pb-2 text-right font-semibold">Avg TAT</th>
                </tr>
              </thead>
              <tbody>
                {data.workerProductivity.length === 0 ? (
                  <tr><td colSpan={4} className="py-6 text-center text-xs text-muted-foreground">No workers yet.</td></tr>
                ) : data.workerProductivity.map((w) => (
                  <tr key={w.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2 font-medium text-foreground">{w.name}</td>
                    <td className="py-2 text-center font-mono-num text-muted-foreground">{w.assigned}</td>
                    <td className="py-2 text-center font-mono-num text-muted-foreground">{w.disbursed}</td>
                    <td className="py-2 text-right font-mono-num text-muted-foreground">{w.avgTat}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Top pending by age */}
        <SectionCard title="Oldest Pending · Sabse Purane">
          <div className="space-y-2">
            {data.topPending.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">Nothing pending. 🎉</p>
            ) : data.topPending.map((a) => (
              <Link key={a.id} to={`/app/files/${a.id}`} className="flex items-center gap-3 rounded-lg border border-border p-2.5 transition-colors hover:bg-secondary/40">
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono-num text-xs font-bold",
                  a.ageDays >= 14 ? "bg-[hsl(var(--status-rejected)/0.12)] text-[hsl(var(--status-rejected))]" : "bg-[hsl(var(--status-process)/0.14)] text-[hsl(28_90%_34%)]")}>
                  {a.ageDays}d
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">{a.fullName}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{a.arn} · {STAGE_LABELS[a.stage]}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-mono-num text-sm font-semibold text-foreground">{formatINRShort(a.amount)}</div>
                  <div className="text-[11px] text-muted-foreground">{a.assignedWorker?.name ?? "Unassigned"}</div>
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
