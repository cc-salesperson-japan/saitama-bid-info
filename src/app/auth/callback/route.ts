import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  // Supabase がエラーを URL パラメータに載せてくる場合
  const errorParam = searchParams.get("error");
  const errorDesc  = searchParams.get("error_description");
  if (errorParam) {
    console.error("[auth/callback] Supabase error:", errorParam, errorDesc);
    return NextResponse.redirect(
      `${origin}/members/login?error=link_expired&detail=${encodeURIComponent(errorDesc ?? errorParam)}`
    );
  }

  const code       = searchParams.get("code");
  const tokenHash  = searchParams.get("token_hash");
  const type       = searchParams.get("type") ?? "magiclink";

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()             { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  // ① PKCE フロー（code パラメータ）
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/members`);
    console.error("[auth/callback] exchangeCodeForSession error:", error.message);
    return NextResponse.redirect(
      `${origin}/members/login?error=link_expired&detail=${encodeURIComponent(error.message)}`
    );
  }

  // ② token_hash フロー（マジックリンクのデフォルト方式）
  if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "magiclink" | "email" | "recovery" | "invite",
    });
    if (!error) return NextResponse.redirect(`${origin}/members`);
    console.error("[auth/callback] verifyOtp error:", error.message);
    return NextResponse.redirect(
      `${origin}/members/login?error=link_expired&detail=${encodeURIComponent(error.message)}`
    );
  }

  // どちらのパラメータもない場合
  console.error("[auth/callback] No code or token_hash in URL:", request.url);
  return NextResponse.redirect(`${origin}/members/login?error=link_expired&detail=no_params`);
}
