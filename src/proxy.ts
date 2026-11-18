import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = ["/login", "/auth/callback"];

export async function proxy(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  // Demo mode (and local dev without Supabase) runs without auth.
  if (process.env.DEMO_MODE === "true" || !url || !key) return NextResponse.next();

  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;
  if (PUBLIC.some((p) => path.startsWith(p))) return res;

  const allowed = (process.env.ALLOWED_EMAIL ?? "").toLowerCase().trim();
  const ok = user?.email && allowed && user.email.toLowerCase() === allowed;
  if (!ok) {
    if (path.startsWith("/api/")) return new NextResponse("Unauthorized", { status: 401 });
    const login = req.nextUrl.clone();
    login.pathname = "/login";
    login.search = "";
    return NextResponse.redirect(login);
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg|apple-icon|manifest.webmanifest).*)"],
};
