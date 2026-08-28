import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FolderKanban, Users, Settings2, BarChart3,
  LogOut, Menu, X, Landmark, Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut, type SessionUser } from "@/lib/auth-client";
import type { Role } from "@/lib/lms";

interface NavItem { to: string; label: string; hi?: string; icon: React.ElementType; roles: Role[]; }

const NAV: NavItem[] = [
  { to: "/app/admin", label: "Dashboard", hi: "Mukhya Patal", icon: LayoutDashboard, roles: ["SUPER_ADMIN"] },
  { to: "/app/files", label: "Cases", hi: "Files", icon: FolderKanban, roles: ["SUPER_ADMIN", "WORKER"] },
  { to: "/app/pool", label: "New Leads", hi: "Naye Aavedan", icon: Inbox, roles: ["WORKER"] },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3, roles: ["SUPER_ADMIN"] },
  { to: "/app/workers", label: "Workers", hi: "Karmchari", icon: Users, roles: ["SUPER_ADMIN"] },
  { to: "/app/products", label: "Loan Products", icon: Settings2, roles: ["SUPER_ADMIN"] },
];

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin", WORKER: "Operations", APPLICANT: "Applicant",
};

export function LmsLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const user = session?.user as SessionUser | undefined;
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const items = NAV.filter((n) => user && n.roles.includes(user.role));

  async function handleSignOut() {
    await signOut();
    navigate("/app/login");
  }

  const SidebarInner = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Landmark className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-tight">Lokansh<span className="text-sidebar-primary">LMS</span></div>
          <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">Loan Operations</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map((item) => {
          const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
            {user ? initials(user.name) : "--"}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm font-semibold">{user?.name}</div>
            <div className="text-[11px] text-sidebar-foreground/55">{user ? ROLE_LABEL[user.role] : ""}</div>
          </div>
          <button onClick={handleSignOut} title="Sign out" className="rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="lms min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 lg:block">{SidebarInner}</aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">{SidebarInner}</div>
        </div>
      ) : null}

      <div className="lg:pl-60">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded-md p-1.5 hover:bg-secondary">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-sm font-bold">Lokansh<span className="text-primary">LMS</span></span>
          <span className="w-8" />
        </div>

        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
