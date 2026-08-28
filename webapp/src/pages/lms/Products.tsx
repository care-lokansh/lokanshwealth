import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Settings2, Percent, FileCheck2, Clock } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { formatINRShort, type LoanProduct } from "@/lib/lms";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";

interface EditState {
  minAmount: string; maxAmount: string; processingFeePct: string;
  interestMin: string; interestMax: string; typicalProcessDays: string;
}

function EditProductDialog({ product, open, onOpenChange }: { product: LoanProduct | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<EditState>({
    minAmount: "", maxAmount: "", processingFeePct: "", interestMin: "", interestMax: "", typicalProcessDays: "",
  });
  const [lastCode, setLastCode] = useState<string | undefined>();
  if (product && product.code !== lastCode) {
    setLastCode(product.code);
    setForm({
      minAmount: String(product.minAmount), maxAmount: String(product.maxAmount),
      processingFeePct: String(product.processingFeePct), interestMin: String(product.interestMin),
      interestMax: String(product.interestMax), typicalProcessDays: String(product.typicalProcessDays),
    });
  }
  const set = (k: keyof EditState) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const mut = useMutation({
    mutationFn: () => api.patch(`/api/v1/products/${product!.code}`, {
      minAmount: Number(form.minAmount), maxAmount: Number(form.maxAmount),
      processingFeePct: Number(form.processingFeePct), interestMin: Number(form.interestMin),
      interestMax: Number(form.interestMax), typicalProcessDays: Number(form.typicalProcessDays),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); toast.success("Product updated."); onOpenChange(false); },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Update failed."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product?.name}</DialogTitle>
          <DialogDescription>Configure limits, fees and indicative rates.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Min amount (₹)</Label><Input type="number" value={form.minAmount} onChange={set("minAmount")} className="font-mono-num" /></div>
          <div className="space-y-1.5"><Label>Max amount (₹)</Label><Input type="number" value={form.maxAmount} onChange={set("maxAmount")} className="font-mono-num" /></div>
          <div className="space-y-1.5"><Label>Interest min (%)</Label><Input type="number" step="0.05" value={form.interestMin} onChange={set("interestMin")} className="font-mono-num" /></div>
          <div className="space-y-1.5"><Label>Interest max (%)</Label><Input type="number" step="0.05" value={form.interestMax} onChange={set("interestMax")} className="font-mono-num" /></div>
          <div className="space-y-1.5"><Label>Processing fee (%)</Label><Input type="number" step="0.05" value={form.processingFeePct} onChange={set("processingFeePct")} className="font-mono-num" /></div>
          <div className="space-y-1.5"><Label>Typical days</Label><Input type="number" value={form.typicalProcessDays} onChange={set("typicalProcessDays")} className="font-mono-num" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={mut.isPending} onClick={() => mut.mutate()}>{mut.isPending ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Products() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<LoanProduct | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get<LoanProduct[]>("/api/v1/products"),
  });

  const toggle = useMutation({
    mutationFn: ({ code, enabled }: { code: string; enabled: boolean }) => api.patch(`/api/v1/products/${code}`, { enabled }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); toast.success("Product updated."); },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Update failed."),
  });

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Loan Products <span className="text-base font-normal text-muted-foreground">· Rin Utpaad</span></h1>
          <p className="text-sm text-muted-foreground">Enable products, set limits, fees and indicative rates.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(products ?? []).map((p) => (
            <div key={p.code} className={cn("rounded-xl border bg-card p-4 shadow-sm transition-opacity", p.enabled ? "border-border" : "border-dashed border-border opacity-70")}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-foreground">{p.name}</div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{p.category}</div>
                </div>
                <Switch checked={p.enabled} onCheckedChange={(v) => toggle.mutate({ code: p.code, enabled: v })} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground"><Percent className="h-3 w-3" /> Rate</div>
                <div className="text-right font-mono-num font-semibold text-foreground">{p.interestMin}–{p.interestMax}%</div>
                <div className="flex items-center gap-1.5 text-muted-foreground">₹ Amount</div>
                <div className="text-right font-mono-num font-semibold text-foreground">{formatINRShort(p.minAmount)}–{formatINRShort(p.maxAmount)}</div>
                <div className="flex items-center gap-1.5 text-muted-foreground"><Settings2 className="h-3 w-3" /> Fee</div>
                <div className="text-right font-mono-num font-semibold text-foreground">{p.processingFeePct}%</div>
                <div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3 w-3" /> TAT</div>
                <div className="text-right font-mono-num font-semibold text-foreground">{p.typicalProcessDays} days</div>
                <div className="flex items-center gap-1.5 text-muted-foreground"><FileCheck2 className="h-3 w-3" /> Docs</div>
                <div className="text-right font-mono-num font-semibold text-foreground">{p.docChecklist.length}</div>
              </div>

              <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setEditing(p)}>Configure</Button>
            </div>
          ))}
        </div>
      )}

      <EditProductDialog product={editing} open={!!editing} onOpenChange={(v) => !v && setEditing(null)} />
    </div>
  );
}
