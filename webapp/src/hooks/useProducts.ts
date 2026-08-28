import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LoanProduct } from "@/lib/lms";

// Public product shape (subset of LoanProduct — no id/enabled flags).
export type PublicProduct = Omit<LoanProduct, "id" | "enabled">;

/**
 * Live loan products (rates + document checklists) from the admin-managed DB.
 * Editing a product in /app/products updates these instantly.
 */
export function useProducts() {
  const query = useQuery({
    queryKey: ["public-products"],
    queryFn: () => api.get<PublicProduct[]>("/api/v1/public/products"),
    staleTime: 5 * 60 * 1000,
  });

  const byCode: Record<string, PublicProduct> = {};
  for (const p of query.data ?? []) byCode[p.code] = p;

  return { products: query.data ?? [], byCode, isLoading: query.isLoading };
}

/** Format a product's indicative rate, e.g. "8.5% – 12% p.a." */
export function formatRate(p?: PublicProduct, fallback = ""): string {
  if (!p) return fallback;
  return `${p.interestMin}% – ${p.interestMax}% p.a.`;
}

/** Shortest "starting at" rate, e.g. "from 8.5% p.a." */
export function formatStartRate(p?: PublicProduct, fallback = ""): string {
  if (!p) return fallback;
  return `${p.interestMin}% p.a.`;
}
