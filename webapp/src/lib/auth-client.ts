import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { Role } from "./lms";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BACKEND_URL || undefined,
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: "string", required: false, input: false },
        phone: { type: "string", required: false },
        officePhone: { type: "string", required: false, input: false },
        active: { type: "boolean", required: false, input: false },
      },
    }),
  ],
  fetchOptions: { credentials: "include" },
});

export const { useSession, signOut, signIn, signUp } = authClient;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  officePhone?: string | null;
  active?: boolean;
};
