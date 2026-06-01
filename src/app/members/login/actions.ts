"use server";

import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * approved_emails テーブルに登録済みか確認するだけ。
 * マジックリンクの送信はブラウザ側 Supabase クライアントで行う（PKCE のため）。
 */
export async function checkEmailApproved(email: string): Promise<boolean> {
  const { data } = await adminClient()
    .from("approved_emails")
    .select("email")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();
  return !!data;
}

/**
 * アクセス申込フォームの送信処理。
 * access_requests テーブルに保存する（重複は上書き更新）。
 */
export async function submitAccessRequest(
  email: string,
  company: string
): Promise<{ ok: boolean; reason?: "already_approved" | "error" }> {
  const normalized = email.toLowerCase().trim();
  const admin = adminClient();

  // すでに承認済みなら「ログインしてください」を促す
  const { data: approved } = await admin
    .from("approved_emails")
    .select("email")
    .eq("email", normalized)
    .maybeSingle();

  if (approved) return { ok: false, reason: "already_approved" };

  // access_requests に保存（同一メアドは updated_at を更新）
  const { error } = await admin.from("access_requests").upsert(
    { email: normalized, company: company.trim() || null },
    { onConflict: "email" }
  );

  if (error) {
    console.error("submitAccessRequest error:", error.message);
    return { ok: false, reason: "error" };
  }
  return { ok: true };
}
