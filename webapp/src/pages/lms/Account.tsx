import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useSession, type SessionUser } from "@/lib/auth-client";
import { SectionCard } from "@/components/lms/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Account() {
  const { data: session } = useSession();
  const user = session?.user as SessionUser | undefined;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
  }, [user]);

  const profile = useMutation({
    mutationFn: () => api.patch("/api/v1/me", { name: name.trim(), email: email.trim() }),
    onSuccess: () => {
      toast.success("Saved. Use the new email the next time you sign in.");
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Could not update profile."),
  });

  const password = useMutation({
    mutationFn: () => api.post("/api/v1/me/password", { currentPassword, newPassword }),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password updated.");
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Could not update password."),
  });

  const profileValid = name.trim().length >= 2 && /\S+@\S+\.\S+/.test(email);
  const passwordValid = currentPassword.length > 0 && newPassword.length >= 8;

  return (
    <div className="mx-auto max-w-xl px-4 py-6 lg:px-8">
      <h1 className="text-xl font-bold text-foreground">Your account</h1>
      <p className="text-sm text-muted-foreground">Change your own login email or password.</p>

      <SectionCard className="mt-5">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Name & email</h2>
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Login email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button disabled={!profileValid || profile.isPending} onClick={() => profile.mutate()}>
            {profile.isPending ? "Saving…" : "Save name & email"}
          </Button>
        </div>
      </SectionCard>

      <SectionCard className="mt-4">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Password</h2>
          <div className="space-y-1.5">
            <Label>Current password</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
          </div>
          <div className="space-y-1.5">
            <Label>New password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" autoComplete="new-password" />
          </div>
          <Button disabled={!passwordValid || password.isPending} onClick={() => password.mutate()}>
            {password.isPending ? "Saving…" : "Update password"}
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
