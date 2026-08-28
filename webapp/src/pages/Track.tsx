import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2, RefreshCw, Search, SearchX, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { LoanApplicationProvider, useLoanApplication } from "@/components/landing/application/LoanApplicationContext";
import { ApplicationStatusCard } from "@/components/track/ApplicationStatusCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/lms";
import { isValidTrackQuery, trackApplications } from "@/lib/tracking";
import { toast } from "sonner";

const LAST_QUERY_KEY = "lw:track:lastQuery";
/** How often the page re-checks the database for staff updates. */
const REFRESH_MS = 30_000;

export default function Track() {
  return (
    <LoanApplicationProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <TrackBody />
        <Footer />
      </div>
    </LoanApplicationProvider>
  );
}

function TrackBody() {
  const { open } = useLoanApplication();
  const [params, setParams] = useSearchParams();

  const initial = params.get("q") ?? localStorage.getItem(LAST_QUERY_KEY) ?? "";
  const [query, setQuery] = useState(initial);
  // The committed search — only set once the input is a valid number/ARN.
  const [activeQuery, setActiveQuery] = useState<string | null>(
    params.get("q") && isValidTrackQuery(params.get("q") as string) ? params.get("q") : null,
  );

  // Live data: polls every 30s and refetches whenever the applicant comes back
  // to the tab, so a stage change made by a worker shows up on its own.
  const {
    data: results,
    error,
    isPending,
    isFetching,
    dataUpdatedAt,
    refetch,
  } = useQuery({
    queryKey: ["track", activeQuery],
    queryFn: () => trackApplications(activeQuery as string),
    enabled: activeQuery !== null,
    refetchInterval: REFRESH_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 5_000,
    retry: 1,
  });

  // Re-render the "updated 2m ago" label without refetching.
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 15_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (activeQuery) localStorage.setItem(LAST_QUERY_KEY, activeQuery);
  }, [activeQuery]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!isValidTrackQuery(trimmed)) {
      toast.error(
        "Enter the 10-digit mobile number you applied with, or a reference number like LMS-2026-123456.",
      );
      return;
    }
    setParams({ q: trimmed }, { replace: true });
    // Same number twice = the applicant wants a fresh check, not a cached one.
    if (trimmed === activeQuery) refetch();
    else setActiveQuery(trimmed);
  }

  const searching = activeQuery !== null && isPending;
  const showResults = activeQuery !== null && results !== undefined;

  return (
    <main className="mx-auto max-w-3xl px-5 pb-20 pt-24 sm:pt-28">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
          Application status
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
          Track your loan
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">
          No login, no password. Enter the mobile number you applied with and see every
          application you&apos;ve made, with its live status.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-8 rounded-3xl border border-border bg-card p-5 sm:p-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            inputMode="text"
            autoComplete="tel"
            placeholder="Mobile number or LMS-2026-123456"
            aria-label="Mobile number or reference number"
            className="h-14 flex-1 text-base"
          />
          <Button
            type="submit"
            size="lg"
            disabled={searching}
            className="h-14 rounded-full px-8 text-base"
          >
            {searching ? (
              <>
                <Loader2 className="mr-1.5 h-5 w-5 animate-spin" /> Checking…
              </>
            ) : (
              <>
                <Search className="mr-1.5 h-5 w-5" /> Check status
              </>
            )}
          </Button>
        </div>
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
          We only show loan status here — never your PAN, Aadhaar or documents.
        </p>
      </form>

      {/* Error */}
      {error && !searching ? (
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold text-red-800">Couldn&apos;t fetch your status</p>
            <p className="mt-0.5 text-sm text-red-700">
              {error instanceof Error ? error.message : "Please try again in a moment."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 rounded-full border-red-300 bg-white text-red-700 hover:bg-red-50"
              onClick={() => refetch()}
            >
              Try again
            </Button>
          </div>
        </div>
      ) : null}

      {/* Loading skeletons */}
      {searching ? (
        <div className="mt-8 space-y-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-3xl border border-border bg-secondary/40"
            />
          ))}
        </div>
      ) : null}

      {/* Results */}
      {showResults && !error ? (
        results.length > 0 ? (
          <div className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-muted-foreground">
                {results.length} application{results.length === 1 ? "" : "s"} found
              </p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isFetching ? "animate-pulse bg-accent" : "bg-emerald-500",
                    )}
                  />
                  {isFetching
                    ? "Checking for updates…"
                    : `Live · updated ${timeAgo(new Date(dataUpdatedAt))}`}
                </span>
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-60"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
                  Refresh
                </button>
              </div>
            </div>
            {results.map((app) => (
              <ApplicationStatusCard key={app.arn} app={app} />
            ))}
            <p className="text-center text-xs text-muted-foreground">
              This page updates itself every 30 seconds, so any change your relationship
              manager makes appears here automatically.
            </p>
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary">
              <SearchX className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold text-foreground">
              No applications found
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
              Double-check the number you entered — it must be the same mobile number used on
              the application form.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button className="rounded-full px-7" onClick={() => open()}>
                Start a new application
              </Button>
              <Button asChild variant="outline" className="rounded-full px-7">
                <a href="tel:+917053231846">Call +91 70532 31846</a>
              </Button>
            </div>
          </div>
        )
      ) : null}
    </main>
  );
}
