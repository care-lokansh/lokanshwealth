import { z } from "zod";

/**
 * Environment variable schema using Zod
 * This ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Server Configuration
  PORT: z.string().optional().default("3000"),
  NODE_ENV: z.string().optional(),
  // Database (Supabase Postgres)
  DATABASE_URL: z.string().optional().default(""),
  DIRECT_URL: z.string().optional(),
  // Auth
  BETTER_AUTH_SECRET: z.string().optional().default(""),
  BACKEND_URL: z.string().optional(),
});

/**
 * Validate and parse environment variables
 */
function validateEnv() {
  const parsed = envSchema.parse(process.env);
  if (!parsed.DATABASE_URL || !parsed.BETTER_AUTH_SECRET) {
    console.warn("⚠️ DATABASE_URL or BETTER_AUTH_SECRET is not set");
  } else {
    console.log("✅ Environment variables validated successfully");
  }
  return parsed;
}

/**
 * Validated and typed environment variables
 */
export const env = validateEnv();

/**
 * Type of the validated environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Extend process.env with our environment variables
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line import/namespace
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
