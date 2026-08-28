import { Navigate, useLocation } from "react-router-dom";
import { useSession, type SessionUser } from "@/lib/auth-client";
import type { Role } from "@/lib/lms";

function Spinner() {
  return (
    <div className="lms flex min-h-screen items-center justify-center bg-background">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

/** Default landing route for each role. */
export function homeForRole(role: Role | undefined): string {
  if (role === "SUPER_ADMIN") return "/app/admin";
  if (role === "WORKER") return "/app/files";
  return "/app/login";
}

export function RequireRole({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const location = useLocation();

  if (isPending) return <Spinner />;
  const user = session?.user as SessionUser | undefined;
  if (!user) return <Navigate to="/app/login" replace state={{ from: location.pathname }} />;
  if (!roles.includes(user.role)) return <Navigate to={homeForRole(user.role)} replace />;
  return <>{children}</>;
}
