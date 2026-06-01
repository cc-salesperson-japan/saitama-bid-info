"use server";

import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

type Result =
  | { ok: true }
  | { ok: false; reason: "not_approved" | "error" };

export async function requestMagicLink(email: string): Promise<Result> {
  const normalized = email.toLowerCase().trim();

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // approved_emails テーブルで承認済みか確認
  const { data } = await admin
    .from("approved_emails")
    .select("email")
    .eq("email", normalized)
    .maybeSingle();

  if (!data) {
    return { ok: false, reason: "not_approved" };
  }

  // 承認済み → マジックリンクを送信
  const headersList = await headers();
  const origin =
    headersList.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://saitama-bid-info.vercel.app";

  const { error } = await admin.auth.signInWithOtp({
    email: normalized,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("signInWithOtp error:", error.message);
    return { ok: false, reason: "error" };
  }

  return { ok: true };
}
