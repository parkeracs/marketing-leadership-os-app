import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const authEnabled = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only; middleware refreshes them.
        }
      },
    },
  });
}

export function isAllowed(email?: string | null) {
  const allowed = (process.env.ALLOWED_EMAIL ?? "").toLowerCase().trim();
  return Boolean(allowed && email && email.toLowerCase().trim() === allowed);
}
