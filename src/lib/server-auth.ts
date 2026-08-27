// Server-only: resolve the authenticated Supabase user from a request's
// Bearer token. Used by authenticated API route handlers.

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

export async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token || token.split(".").length !== 3) return null;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;

  const { createClient } = await import("@supabase/supabase-js");

  // New-style Supabase keys are opaque, not bearer JWTs — replicate the
  // app's fetch wrapper so the publishable key is sent as `apikey` only.
  const customFetch = (input: any, init: any) => {
    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    if (init?.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));
    if (isNewSupabaseApiKey(SUPABASE_PUBLISHABLE_KEY) && headers.get("Authorization") === `Bearer ${SUPABASE_PUBLISHABLE_KEY}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", SUPABASE_PUBLISHABLE_KEY);
    headers.set("Authorization", `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  };

  const sb = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { fetch: customFetch as never },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}
