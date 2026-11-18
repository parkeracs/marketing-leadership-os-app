import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Mark } from "@/components/Mark";
import { isAllowed, supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Sign in" };

/**
 * Password sign-in. The home-screen app on iPhone keeps its own cookies, separate from Safari,
 * and email links always open in Safari, so a password is how you sign in there.
 * Set the password on /account after signing in once by email link.
 */
async function signInWithPassword(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  // Only the allowed address is ever tried, and every failure looks the same, so the allowlist isn't revealed.
  if (isAllowed(email) && password) {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && isAllowed(data.user?.email)) redirect("/");
    await supabase.auth.signOut();
  }
  redirect("/login?error=password");
}

async function sendLink(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  // Only the allowed address ever gets a link. Everyone else sees the same message, so the allowlist isn't revealed.
  if (isAllowed(email)) {
    const h = await headers();
    const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
    const supabase = await supabaseServer();
    await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${origin}/auth/callback` } });
  }
  redirect("/login?sent=1");
}

export default async function Login({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  if (process.env.DEMO_MODE === "true") redirect("/"); // no sign-in in the demo
  const { sent, error } = await searchParams;
  const formStyle = { display: "flex", flexDirection: "column", gap: 12 } as const;
  return (
    <div style={{ maxWidth: 460, padding: "calc(10vh + env(safe-area-inset-top)) 24px 10vh" }}>
      <Mark size={34} />
      <h1 className="page-title" style={{ marginTop: 22 }}>Marketing Leadership OS</h1>
      {sent ? (
        <p className="lede">
          If that address has access, a sign-in link is on its way. Open it on this device, in the browser.{" "}
          <Link href="/login">Back to sign in</Link>
        </p>
      ) : (
        <>
          <form action={signInWithPassword} style={formStyle}>
            <p className="lede" style={{ marginBottom: 6 }}>Private. Sign in to continue.</p>
            <input className="text-input" type="email" name="email" required placeholder="you@example.com" autoComplete="username" aria-label="Email" />
            <input className="text-input" type="password" name="password" required placeholder="Password" autoComplete="current-password" aria-label="Password" />
            <button className="button" style={{ alignSelf: "flex-start" }} type="submit">
              Sign in
            </button>
            {error === "password" && <p style={{ color: "var(--clay)", fontSize: 14, margin: 0 }}>That email and password didn&rsquo;t match.</p>}
            {error === "1" && <p style={{ color: "var(--clay)", fontSize: 14, margin: 0 }}>That link didn&rsquo;t work. Request a new one.</p>}
          </form>
          <details style={{ marginTop: 40 }}>
            <summary style={{ cursor: "pointer", color: "var(--ink-muted)", fontSize: 15 }}>No password yet? Email me a sign-in link</summary>
            <form action={sendLink} style={{ ...formStyle, marginTop: 14 }}>
              <input className="text-input" type="email" name="email" required placeholder="you@example.com" autoComplete="email" aria-label="Email for sign-in link" />
              <button className="button ghost" style={{ alignSelf: "flex-start" }} type="submit">
                Send sign-in link
              </button>
              <p style={{ fontSize: 14, color: "var(--ink-faint)", margin: 0 }}>
                Links open in your browser, not the home-screen app. Sign in there, then set a password under Account.
              </p>
            </form>
          </details>
        </>
      )}
    </div>
  );
}
