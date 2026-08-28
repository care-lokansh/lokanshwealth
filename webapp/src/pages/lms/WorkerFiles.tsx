import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search, SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Download, Loader2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { useSession, type SessionUser } from "@/lib/auth-client";
import {
  formatINR, formatINRShort, formatDate, maskAadhaar, STAGE_LABELS,
  type ApplicationListResponse, type ApplicationRow, type LoanProduct, type AppStatus, type Stage, type MiniUser,
} from "@/lib/lms";
import { StatusBadge } from "@/components/lms/primitives";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS: AppStatus[] = ["IN_PROCESS", "APPROVED", "REJECTED", "DISBURSED"];
type SortField = "createdAt" | "amount" | "fullName" | "status" | "stage" | "cibilScore";

export default function WorkerFiles() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const isAdmin = (session?.user as SessionUser | undefined)?.role === "SUPER_ADMIN";

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [loanType, setLoanType] = useState<string>("ALL");
  const [workerId, setWorkerId] = useState<string>("ALL");
  const [sort, setSort] = useState<SortField>("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 25;

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get<LoanProduct[]>("/api/v1/products"),
  });
  const { data: workers } = useQuery({
    queryKey: ["workers"],
    queryFn: () => api.get<(MiniUser & { _count: { assignedFiles: number } })[]>("/api/v1/workers"),
    enabled: isAdmin,
  });

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (status !== "ALL") p.set("status", status);
    if (loanType !== "ALL") p.set("loanType", loanType);
    if (isAdmin && workerId !== "ALL") p.set("workerId", workerId);
    p.set("sort", sort);
    p.set("order", order);
    p.set("page", String(page));
    p.set("pageSize", String(pageSize));
    return p.toString();
  }, [q, status, loanType, workerId, isAdmin, sort, order, page]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["applications", queryString],
    queryFn: () => api.get<ApplicationListResponse>(`/api/v1/applications?${queryString}`),
    placeholderData: (prev) => prev,
    refetchInterval: 15000, // keep counts fresh as cases get picked / move stages
  });

  const productName = (code: string) => products?.find((p) => p.code === code)?.name ?? code;

  function toggleSort(field: SortField) {
    if (sort === field) setOrder(order === "asc" ? "desc" : "asc");
    else { setSort(field); setOrder("desc"); }
    setPage(1);
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sort !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return order === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  }

  async function exportCsv() {
    const res = await api.raw(`/api/v1/applications/export/csv`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applications-${formatDate(new Date()).replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isAdmin ? "All Files" : "My Files"}
            <span className="ml-1 text-base font-normal text-muted-foreground">· Files</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "application" : "applications"}
            {isAdmin ? " across the desk" : " assigned to you"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="mr-1.5 h-4 w-4" /> Export CSV
            </Button>
          ) : null}
        </div>
      </div>

      {/* Search + filters */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search ARN, name, PAN, mobile…"
            className="pl-9"
          />
        </div>
        <Button variant={showFilters ? "default" : "outline"} size="sm" onClick={() => setShowFilters((s) => !s)}>
          <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Filters
        </Button>
      </div>

      {showFilters ? (
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-border bg-card p-3 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase text-muted-foreground">Status</label>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase text-muted-foreground">Loan Type</label>
            <Select value={loanType} onValueChange={(v) => { setLoanType(v); setPage(1); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All types</SelectItem>
                {products?.map((p) => <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {isAdmin ? (
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase text-muted-foreground">Worker</label>
              <Select value={workerId} onValueChange={(v) => { setWorkerId(v); setPage(1); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All workers</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {workers?.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2.5 font-semibold">
                  <button onClick={() => toggleSort("fullName")} className="flex items-center gap-1">Applicant <SortIcon field="fullName" /></button>
                </th>
                <th className="px-3 py-2.5 font-semibold">Loan Type</th>
                <th className="px-3 py-2.5 text-right font-semibold">
                  <button onClick={() => toggleSort("amount")} className="ml-auto flex items-center gap-1">Amount <SortIcon field="amount" /></button>
                </th>
                <th className="px-3 py-2.5 font-semibold">PAN</th>
                <th className="px-3 py-2.5 font-semibold">Mobile</th>
                <th className="px-3 py-2.5 text-center font-semibold">
                  <button onClick={() => toggleSort("cibilScore")} className="mx-auto flex items-center gap-1">CIBIL <SortIcon field="cibilScore" /></button>
                </th>
                <th className="px-3 py-2.5 font-semibold">
                  <button onClick={() => toggleSort("createdAt")} className="flex items-center gap-1">Received <SortIcon field="createdAt" /></button>
                </th>
                {isAdmin ? <th className="px-3 py-2.5 font-semibold">Worker</th> : null}
                <th className="px-3 py-2.5 font-semibold">Stage</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={isAdmin ? 10 : 9} className="py-16 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={isAdmin ? 10 : 9} className="py-16 text-center text-sm text-muted-foreground">
                  No files match your filters.
                </td></tr>
              ) : (
                items.map((a: ApplicationRow) => (
                  <tr
                    key={a.id}
                    onClick={() => navigate(`/app/files/${a.id}`)}
                    className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40"
                  >
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-foreground">{a.fullName}</div>
                      <div className="font-mono-num text-[11px] text-muted-foreground">{a.arn}</div>
                    </td>
                    <td className="px-3 py-2.5 text-foreground">{productName(a.loanType)}</td>
                    <td className="px-3 py-2.5 text-right font-mono-num font-semibold text-foreground" title={formatINR(a.amount)}>
                      {formatINRShort(a.amount)}
                    </td>
                    <td className="px-3 py-2.5 font-mono-num text-xs text-muted-foreground">{a.pan ?? "—"}</td>
                    <td className="px-3 py-2.5 font-mono-num text-xs text-muted-foreground">{a.mobile}</td>
                    <td className="px-3 py-2.5 text-center">
                      {a.cibilScore ? (
                        <span className={cn("font-mono-num font-semibold", a.cibilScore >= 750 ? "text-[hsl(var(--status-approved))]" : a.cibilScore >= 650 ? "text-[hsl(28_90%_40%)]" : "text-[hsl(var(--status-rejected))]")}>
                          {a.cibilScore}
                        </span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{formatDate(a.createdAt)}</td>
                    {isAdmin ? <td className="px-3 py-2.5 text-xs text-foreground">{a.assignedWorker?.name ?? <span className="text-muted-foreground">Unassigned</span>}</td> : null}
                    <td className="px-3 py-2.5">
                      <span className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">{STAGE_LABELS[a.stage as Stage]}</span>
                    </td>
                    <td className="px-3 py-2.5"><StatusBadge status={a.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-3 py-2.5 text-xs text-muted-foreground">
          <span>{isFetching ? "Updating…" : `Page ${page} of ${totalPages}`}</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">Tip: Aadhaar is masked across the system — {maskAadhaar("123412341234")} format.</p>
    </div>
  );
}
