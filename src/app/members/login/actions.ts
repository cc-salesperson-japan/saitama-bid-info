"use server";

import { createClient } from "@supabase/supabase-js";

/**
 * approved_emails テーブルに登録済みか確認するだけ。
 * マジックリンクの送信はブラウザ側 Supabase クライアントで行う（PKCE のため）。
 */
export async function checkEmailApproved(email: string): Promise<boolean> {
  const normalized = email.toLowerCase().trim();

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await admin
    .from("approved_emails")
    .select("email")
    .eq("email", normalized)
    .maybeSingle();

  return !!data;
}
