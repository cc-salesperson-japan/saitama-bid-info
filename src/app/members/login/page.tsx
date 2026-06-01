"use client";

import { useState } from "react";
import { checkEmailApproved } from "./actions";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Status = "idle" | "pending" | "sent" | "not_approved" | "error";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  // URLエラーパラメータ（リンク期限切れなど）
  const urlError =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("error")
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("pending");

    const normalized = email.trim().toLowerCase();

    // ① サーバー側で承認確認（service role で approved_emails を照合）
    const approved = await checkEmailApproved(normalized);
    if (!approved) {
      setStatus("not_approved");
      return;
    }

    // ② ブラウザ側クライアントでマジックリンク送信（PKCE が正しく機能する）
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setStatus(error ? "error" : "sent");
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl p-8 space-y-6"
        style={{ border: "1px solid var(--border)" }}
      >
        {/* ヘッダー */}
        <div className="text-center space-y-1">
          <p className="text-xs text-[#6b7280] font-medium tracking-wide uppercase">
            Members Only
          </p>
          <h1 className="text-lg font-bold text-[#1a1a1a]">
            会員限定エリア
          </h1>
          <p className="text-xs text-[#6b7280] leading-relaxed">
            登録済みのメールアドレスを入力してください。
            <br />
            ログインリンクをお送りします。
          </p>
        </div>

        {/* リンク期限切れエラー */}
        {urlError === "link_expired" && status === "idle" && (
          <div className="rounded-lg px-4 py-3 text-xs text-[#92400e] bg-[#fef3c7] border border-[#fde68a]">
            リンクの有効期限が切れています。再度メールアドレスを入力してください。
          </div>
        )}

        {/* フォーム */}
        {status !== "sent" && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={status === "pending"}
              className="w-full rounded-lg px-4 py-2.5 text-sm text-[#1a1a1a] outline-none transition-colors disabled:opacity-50"
              style={{
                border: "1px solid var(--border)",
                backgroundColor: "#faf7f2",
              }}
            />
            <button
              type="submit"
              disabled={status === "pending" || !email.trim()}
              className="w-full rounded-lg py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: "#2563eb" }}
            >
              {status === "pending" ? "送信中…" : "ログインリンクを送信"}
            </button>
          </form>
        )}

        {/* 送信完了 */}
        {status === "sent" && (
          <div className="rounded-lg px-4 py-4 text-sm text-center space-y-2"
            style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <p className="text-lg">📬</p>
            <p className="font-semibold text-[#166534]">メールを送信しました</p>
            <p className="text-xs text-[#166534]">
              受信トレイを確認し、ログインリンクをクリックしてください。
              <br />
              メールが届かない場合は迷惑メールフォルダもご確認ください。
            </p>
          </div>
        )}

        {/* 未承認 */}
        {status === "not_approved" && (
          <div className="rounded-lg px-4 py-4 text-xs text-center space-y-2"
            style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa" }}>
            <p className="font-semibold text-[#9a3412]">
              このメールアドレスは登録されていません
            </p>
            <p className="text-[#9a3412] leading-relaxed">
              アクセスをご希望の方は X（Twitter）の DM にてお申し込みください。
            </p>
            <a
              href="https://x.com/cc_salesperson"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 font-medium underline underline-offset-2 text-[#9a3412]"
            >
              @cc_salesperson にDM →
            </a>
            <div className="pt-1">
              <button
                onClick={() => setStatus("idle")}
                className="text-[#6b7280] underline underline-offset-2"
              >
                別のアドレスで試す
              </button>
            </div>
          </div>
        )}

        {/* エラー */}
        {status === "error" && (
          <div className="rounded-lg px-4 py-3 text-xs text-center text-[#991b1b]"
            style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
            エラーが発生しました。しばらく経ってから再度お試しください。
            <br />
            <button
              onClick={() => setStatus("idle")}
              className="mt-1 underline underline-offset-2"
            >
              再試行
            </button>
          </div>
        )}

        {/* フッター */}
        <p className="text-center text-[10px] text-[#9ca3af]">
          Powered by AnkenGet
        </p>
      </div>
    </div>
  );
}
