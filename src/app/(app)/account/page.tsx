import { redirect } from "next/navigation";
import { authEnabled, supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Account" };
export const dynamic = "force-dynamic";

const MIN_LENGTH = 12;

async function setPassword(formData: FormData) {
  "use server";
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < MIN_LENGTH) redirect("/account?error=short");
  if (password !== confirm) redirect("/account?error=match");
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.updateUser({ password });
  redirect(error ? `/account?error=failed` : "/account?saved=1");
}

async function signOut() {
  "use server";
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}

const ERRORS: Record<string, string> = {
  short: `Use at least ${MIN_LENGTH} characters.`,
  match: "The two passwords didn’t match.",
  failed: "That didn’t save. If you signed in a while ago, sign out, sign in again by email link, and retry.",
};

export default async function Account({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  if (process.env.DEMO_MODE === "true") redirect("/"); // no accounts in the demo
  const { saved, error } = await searchParams;
  if (!authEnabled()) {
    return (
      <>
        <h1 className="page-title">Account</h1>
        <p className="lede">Sign-in is off in this environment.</p>
      </>
    );
  }
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <h1 className="page-title">Account</h1>
      <p className="lede">Signed in as {user?.email}.</p>

      <h2 className="section-title" style={{ marginTop: 0 }}>Password</h2>
      <form action={setPassword} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 420 }}>
        <p style={{ margin: 0, color: "var(--ink-muted)" }}>
          Use it to sign in from the home-screen app, where email links don&rsquo;t reach.
        </p>
        {/* Hidden username lets password managers save the pair against the right account. */}
        <input type="email" name="username" autoComplete="username" value={user?.email ?? ""} readOnly hidden />
        <input className="text-input" type="password" name="password" required minLength={MIN_LENGTH} placeholder="New password" autoComplete="new-password" aria-label="New password" />
        <input className="text-input" type="password" name="confirm" required minLength={MIN_LENGTH} placeholder="Confirm password" autoComplete="new-password" aria-label="Confirm password" />
        <button className="button" style={{ alignSelf: "flex-start" }} type="submit">
          Save password
        </button>
        {saved && <p style={{ color: "var(--pine)", fontSize: 14, margin: 0 }}>Password saved.</p>}
        {error && ERRORS[error] && <p style={{ color: "var(--clay)", fontSize: 14, margin: 0 }}>{ERRORS[error]}</p>}
      </form>

      <h2 className="section-title">Sign out</h2>
      <form action={signOut}>
        <button className="button ghost" type="submit">
          Sign out
        </button>
      </form>
    </>
  );
}
