import { NextRequest, NextResponse } from "next/server";
import { isAllowed, supabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const base = req.nextUrl.clone();
  base.search = "";
  if (code) {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && isAllowed(data.user?.email)) {
      base.pathname = "/";
      return NextResponse.redirect(base);
    }
    await supabase.auth.signOut();
  }
  base.pathname = "/login";
  base.search = "?error=1";
  return NextResponse.redirect(base);
}
