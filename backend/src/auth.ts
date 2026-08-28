import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { env } from "./env";

function resolveBaseURL(): string {
  const u = (process.env.BACKEND_URL || "").replace(/\/$/, "");
  if (/lokanshwealth\.com/i.test(u)) return u;
  if (process.env.VERCEL) return "https://www.lokanshwealth.com";
  return u || env.BACKEND_URL || "http://localhost:3000";
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: resolveBaseURL(),
  emailAndPassword: {
    enabled: true,
    // Demo / preview: no email verification gate so seeded accounts log in immediately.
    requireEmailVerification: false,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      // LMS role travels on the session user object.
      role: {
        type: "string",
        required: false,
        defaultValue: "APPLICANT",
        input: false, // cannot be set via public sign-up; managed server-side
      },
      phone: { type: "string", required: false, input: true },
      officePhone: { type: "string", required: false, input: false },
      active: { type: "boolean", required: false, defaultValue: true, input: false },
    },
  },
  trustedOrigins: [
    "http://localhost:*",
    "http://127.0.0.1:*",
    "https://lokanshwealth.com",
    "https://www.lokanshwealth.com",
    "https://lokanshwealth.vercel.app",
    "https://*.vercel.app",
    "https://*.dev.vibecode.run",
    "https://*.vibecode.run",
    "https://*.vibecodeapp.com",
    "https://*.vibecode.dev",
    "https://vibecode.dev",
  ],
  advanced: {
    trustedProxyHeaders: true,
    disableCSRFCheck: true,
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      partitioned: true,
    },
  },
});

export type AuthUser = typeof auth.$Infer.Session.user;
export type AuthSession = typeof auth.$Infer.Session.session;
