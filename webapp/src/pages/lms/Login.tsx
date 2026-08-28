import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Landmark, Loader2 } from "lucide-react";
import { signIn, useSession, type SessionUser } from "@/lib/auth-client";
import { homeForRole } from "@/components/lms/RequireRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEMO = [
  { role: "Super Admin", email: "admin@lokansh.in", password: "Admin@12345" },
  { role: "Worker", email: "rahul@lokansh.in", password: "Worker@12345" },
];

export default function Login() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already signed in → bounce to role home.
  if (session?.user) {
    const u = session.user as SessionUser;
    navigate(homeForRole(u.role), { replace: true });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn.email({ email, password });
      if (res.error) { setError(res.error.message || "Invalid credentials"); setLoading(false); return; }
      const role = (res.data?.user as SessionUser | undefined)?.role;
      navigate(homeForRole(role), { replace: true });
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  function fillDemo(d: (typeof DEMO)[number]) {
    setEmail(d.email);
    setPassword(d.password);
  }

  return (
    <div className="lms flex min-h-screen bg-background">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Landmark className="h-6 w-6" />
          </div>
          <span className="text-lg font-bold">Lokansh<span className="text-sidebar-primary">LMS</span></span>
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold leading-tight">Loan Disbursement<br />Management System</h1>
          <p className="max-w-md text-sm text-sidebar-foreground/65">
            Ek hi platform — application intake, document verification, credit checks, lender
            coordination aur disbursement tracking. Built for Indian loan operations teams.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {["Personal", "Home", "Business", "Gold", "Mudra", "KCC"].map((t) => (
              <span key={t} className="rounded-full bg-sidebar-accent px-3 py-1 text-xs text-sidebar-accent-foreground">{t}</span>
            ))}
          </div>
        </div>
        <div className="text-xs text-sidebar-foreground/40">RBI-aligned workflow · CIBIL · NEFT / RTGS / IMPS</div>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="text-lg font-bold">Lokansh<span className="text-primary">LMS</span></span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Staff sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Access your operations console. Applicants apply from the website — no login needed.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@lokansh.in" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" minLength={8} />
            </div>

            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>

          <div className="mt-8 rounded-lg border border-dashed border-border bg-secondary/40 p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Demo accounts — tap to fill</p>
            <div className="grid gap-1.5">
              {DEMO.map((d) => (
                <button key={d.email} onClick={() => fillDemo(d)} className="flex items-center justify-between rounded-md bg-card px-2.5 py-1.5 text-left text-xs ring-1 ring-border hover:ring-primary/40">
                  <span className="font-semibold text-foreground">{d.role}</span>
                  <span className="font-mono-num text-muted-foreground">{d.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
