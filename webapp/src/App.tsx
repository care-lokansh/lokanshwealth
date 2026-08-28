import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Calculator from "./pages/Calculator";
import Apply from "./pages/Apply";
import Track from "./pages/Track";
import NotFound from "./pages/NotFound";

import { useSession, type SessionUser } from "@/lib/auth-client";
import { RequireRole, homeForRole } from "@/components/lms/RequireRole";
import { LmsLayout } from "@/components/lms/LmsLayout";
import type { Role } from "@/lib/lms";
import Login from "./pages/lms/Login";
import WorkerFiles from "./pages/lms/WorkerFiles";
import FileDetail from "./pages/lms/FileDetail";
import Dashboard from "./pages/lms/Dashboard";
import Analytics from "./pages/lms/Analytics";
import Workers from "./pages/lms/Workers";
import Products from "./pages/lms/Products";
import Pool from "./pages/lms/Pool";

const queryClient = new QueryClient();

function Guarded({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  return (
    <RequireRole roles={roles}>
      <LmsLayout>{children}</LmsLayout>
    </RequireRole>
  );
}

function AppHome() {
  const { data: session, isPending } = useSession();
  if (isPending) return null;
  const user = session?.user as SessionUser | undefined;
  return <Navigate to={user ? homeForRole(user.role) : "/app/login"} replace />;
}

const STAFF: Role[] = ["SUPER_ADMIN", "WORKER"];
const ADMIN: Role[] = ["SUPER_ADMIN"];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Marketing site (existing) */}
          <Route path="/" element={<Index />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/apply/:code" element={<Apply />} />
          <Route path="/track" element={<Track />} />

          {/* LMS console */}
          <Route path="/app" element={<AppHome />} />
          <Route path="/app/login" element={<Login />} />
          <Route path="/app/files" element={<Guarded roles={STAFF}><WorkerFiles /></Guarded>} />
          <Route path="/app/pool" element={<Guarded roles={STAFF}><Pool /></Guarded>} />
          <Route path="/app/files/:id" element={<Guarded roles={STAFF}><FileDetail /></Guarded>} />
          <Route path="/app/admin" element={<Guarded roles={ADMIN}><Dashboard /></Guarded>} />
          <Route path="/app/analytics" element={<Guarded roles={ADMIN}><Analytics /></Guarded>} />
          <Route path="/app/workers" element={<Guarded roles={ADMIN}><Workers /></Guarded>} />
          <Route path="/app/products" element={<Guarded roles={ADMIN}><Products /></Guarded>} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
