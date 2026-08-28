import { prisma } from "../prisma";

/** Generates a unique Application Reference Number: LMS-YYYY-XXXXXX. */
export async function generateArn(): Promise<string> {
  const year = new Date().getFullYear();
  for (let i = 0; i < 10; i++) {
    const n = Math.floor(100000 + Math.random() * 900000); // 6 digits
    const arn = `LMS-${year}-${n}`;
    const existing = await prisma.application.findUnique({ where: { arn }, select: { id: true } });
    if (!existing) return arn;
  }
  // Extremely unlikely fallback
  return `LMS-${year}-${Date.now().toString().slice(-6)}`;
}

/** Masks the first 8 digits of a 12-digit Aadhaar: XXXX XXXX 1234. */
export function maskAadhaar(aadhaar?: string | null): string | null {
  if (!aadhaar) return null;
  const digits = aadhaar.replace(/\D/g, "");
  if (digits.length !== 12) return aadhaar;
  return `XXXX XXXX ${digits.slice(8)}`;
}

/** Standard response envelope helpers. */
export const ok = (data: unknown) => ({ data });
export const fail = (message: string, code = "BAD_REQUEST") => ({ error: { message, code } });
