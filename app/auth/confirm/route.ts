import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedDestinations = new Set(["/today", "/onboarding"]);

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next");
  const destination = next && allowedDestinations.has(next) ? next : "/today";

  if (!code && !(tokenHash && type === "magiclink")) {
    return NextResponse.redirect(new URL("/auth/error?reason=missing_code", origin));
  }

  try {
    const supabase = await createClient();
    const result = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: "magiclink" });
    if (result.error) throw result.error;
    return NextResponse.redirect(new URL(destination, origin));
  } catch {
    return NextResponse.redirect(new URL("/auth/error?reason=invalid_code", origin));
  }
}
