import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Inbox, Loader2, Hand, RefreshCw } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import {
  formatINR, formatINRShort, formatDate,
  type ApplicationListResponse, type ApplicationRow, type LoanProduct,
} from "@/lib/lms";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/lms/primitives";

// Shared pool of unassigned leads. Any worker can pick a case; once picked it
// disappears from everyone's pool (we poll every few seconds to stay in sync).
export default function Pool() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get<LoanProduct[]>("/api/v1/products"),
  });
  const productName = (code: string) => products?.find((p) => p.code === code)?.name ?? code;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["applications", "pool"],
    queryFn: () => api.get<ApplicationListResponse>("/api/v1/applications?view=pool&sort=createdAt&order=asc&pageSize=100"),
    refetchInterval: 7000, // live sync across all workers
  });

  const claim = useMutation({
    mutationFn: (id: string) => api.post<ApplicationRow>(`/api/v1/applications/${id}/claim`),
    onSuccess: (app) => {
      toast.success("Case picked! It's now in your cases.");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      navigate(`/app/files/${app.id}`);
    },
    onError: (e: unknown) => {
      // Someone else grabbed it first — refresh the pool so it disappears.
      toast.error(e instanceof ApiError ? e.message : "Could not pick this case.");
      queryClient.invalidateQueries({ queryKey: ["applications", "pool"] });
    },
  });

  const items = data?.items ?? [];

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Inbox className="h-5 w-5 text-primary" /> New Leads
            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">{items.length}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Fresh applications from the website. Pick a case to start working on it.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className={`mr-1.5 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="mt-5">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <EmptyState icon={<Inbox className="h-6 w-6" />} title="No new leads right now" hint="New website applications will appear here automatically." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.map((a) => (
              <div key={a.id} className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-foreground">{a.fullName}</div>
                    <div className="font-mono-num text-[11px] text-muted-foreground">{a.arn}</div>
                  </div>
                  <span className="shrink-0 rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">{productName(a.loanType)}</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-[11px] uppercase text-muted-foreground">Amount</div>
                    <div className="font-mono-num font-semibold text-foreground" title={formatINR(a.amount)}>{formatINRShort(a.amount)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase text-muted-foreground">Mobile</div>
                    <div className="font-mono-num text-foreground">{a.mobile}</div>
                  </div>
                </div>

                <div className="mt-1 text-[11px] text-muted-foreground">Received {formatDate(a.createdAt)}</div>

                <Button
                  className="mt-4 w-full"
                  size="sm"
                  disabled={claim.isPending}
                  onClick={() => claim.mutate(a.id)}
                >
                  {claim.isPending && claim.variables === a.id ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Hand className="mr-1.5 h-4 w-4" />
                  )}
                  Pick this case
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
