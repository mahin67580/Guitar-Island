export function checkSupabaseEnv() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ] as const;

  const missing = required.filter((k) => !process.env[k]);

  if (missing.length > 0) {
    throw new Error(
      `Missing Supabase env vars: ${missing.join(", ")}. Check .env.local.`
    );
  }
}