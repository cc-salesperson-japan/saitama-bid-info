"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const search = new URLSearchParams(window.location.search);
    const hash   = new URLSearchParams(window.location.hash.slice(1));

    // ── Supabase がハッシュ or クエリでエラーを返した場合 ──
    const errorCode = hash.get("error_code") ?? search.get("error_code");
    const errorDesc = hash.get("error_description") ?? search.get("error_description");

    if (errorCode) {
      router.replace(
        `/members/login?error=link_expired&detail=${encodeURIComponent(errorDesc ?? errorCode)}`
      );
      return;
    }

    const code      = search.get("code");
    const tokenHash = search.get("token_hash");
    const type      = (search.get("type") ?? "magiclink") as "magiclink" | "email" | "recovery" | "invite";

    async function handleAuth() {
      // ① PKCE フロー（code パラメータ）
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) { router.replace("/members"); return; }
        router.replace(
          `/members/login?error=link_expired&detail=${encodeURIComponent(error.message)}`
        );
        return;
      }

      // ② token_hash フロー
      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (!error) { router.replace("/members"); return; }
        router.replace(
          `/members/login?error=link_expired&detail=${encodeURIComponent(error.message)}`
        );
        return;
      }

      // ③ ハッシュに access_token がある場合（インプリシットフロー）
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!error) { router.replace("/members"); return; }
        router.replace(
          `/members/login?error=link_expired&detail=${encodeURIComponent(error.message)}`
        );
        return;
      }

      // ④ すでにセッションが存在するか確認
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/members");
        return;
      }

      router.replace("/members/login?error=link_expired&detail=no_params");
    }

    handleAuth();
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <p className="text-sm text-[#6b7280]">認証中...</p>
    </div>
  );
}
