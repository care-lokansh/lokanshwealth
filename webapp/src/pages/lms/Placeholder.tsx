import { Construction } from "lucide-react";

export function Placeholder({ title, note }: { title: string; note?: string }) {
  return (
    <div className="px-5 py-6 lg:px-8">
      <h1 className="text-xl font-bold text-foreground">{title}</h1>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
        <Construction className="h-8 w-8 text-primary" />
        <p className="text-sm font-medium text-foreground">This module is being built</p>
        <p className="max-w-sm text-xs text-muted-foreground">{note ?? "Coming up in the next build phase."}</p>
      </div>
    </div>
  );
}
