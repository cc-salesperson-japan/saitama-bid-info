"use client";

import { useState } from "react";
import { checkEmailApproved, submitAccessRequest } from "./actions";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

// ─── ログインフォームの状態 ──────────────────────────
type LoginStatus = "idle" | "pending" | "sent" | "not_approved" | "error";
type LoginState  = { status: LoginStatus; errorDetail?: string };

// ─── 申込フォームの状態 ──────────────────────────────
type ReqStatus = "idle" | "pending" | "submitted" | "already_approved" | "error";

export default function LoginPage() {
  // ログイン
  const [loginEmail, setLoginEmail]   = useState("");
  const [loginState, setLoginState]   = useState<LoginState>({ status: "idle" });

  // 申込
  const [reqEmail,   setReqEmail]     = useState("");
  const [reqCompany, setReqCompany]   = useState("");
  const [reqStatus,  setReqStatus]    = useState<ReqStatus>("idle");

  const urlError =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("error")
      : null;
  const urlDetail =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("detail")
      : null;

  // ── ログイン送信 ──────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail.trim()) return;
    setLoginState({ status: "pending" });

    const normalized = loginEmail.trim().toLowerCase();
    const approved   = await checkEmailApproved(normalized);

    if (!approved) {
      setLoginState({ status: "not_approved" });
      setReqEmail(normalized); // 申込フォームにメアドをコピー
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setLoginState({ status: "error", errorDetail: error.message });
    } else {
      setLoginState({ status: "sent" });
    }
  }

  // ── 申込送信 ──────────────────────────────────────
  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!reqEmail.trim()) return;
    setReqStatus("pending");

    const result = await submitAccessRequest(reqEmail.trim(), reqCompany.trim());

    if (result.ok) {
      setReqStatus("submitted");
    } else if (result.reason === "already_approved") {
      setReqStatus("already_approved");
      setLoginEmail(reqEmail.trim());
    } else {
      setReqStatus("error");
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="w-full max-w-sm space-y-4">

        {/* ── ログインカード ───────────────────────── */}
        <div
          className="bg-white rounded-2xl p-8 space-y-5"
          style={{ border: "1px solid var(--border)" }}
        >
          <div className="text-center space-y-1">
            <p className="text-xs font-medium tracking-wide uppercase" style={{ color: "#16a34a" }}>
              メンバー限定
            </p>
            <h1 className="text-lg font-bold text-[#1a1a1a]">ログイン</h1>
            <p className="text-xs text-[#6b7280]">
              登録済みのメールアドレスを入力してください
            </p>
          </div>

          {urlError === "link_expired" && loginState.status === "idle" && (
            <div className="rounded-lg px-4 py-3 text-xs text-[#92400e] bg-[#fef3c7] border border-[#fde68a]">
              リンクの有効期限が切れています。再度入力してください。
              {urlDetail && (
                <p className="mt-1 font-mono text-[10px] break-all opacity-70">
                  詳細: {urlDetail}
                </p>
              )}
            </div>
          )}

          {loginState.status !== "sent" && (
            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loginState.status === "pending"}
                className="w-full rounded-lg px-4 py-2.5 text-sm text-[#1a1a1a] outline-none disabled:opacity-50"
                style={{ border: "1px solid var(--border)", backgroundColor: "#faf7f2" }}
              />
              <button
                type="submit"
                disabled={loginState.status === "pending" || !loginEmail.trim()}
                className="w-full rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: "#2563eb" }}
              >
                {loginState.status === "pending" ? "確認中…" : "ログインリンクを送信"}
              </button>
            </form>
          )}

          {loginState.status === "sent" && (
            <div className="rounded-lg px-4 py-4 text-sm text-center space-y-2"
              style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <p className="text-lg">📬</p>
              <p className="font-semibold text-[#166534]">メールを送信しました</p>
              <p className="text-xs text-[#166534]">
                受信トレイを確認し、ログインリンクをクリックしてください。
                <br />届かない場合は迷惑メールフォルダもご確認ください。
              </p>
            </div>
          )}

          {loginState.status === "not_approved" && (
            <div className="rounded-lg px-4 py-3 text-xs text-[#92400e] bg-[#fff7ed] border border-[#fed7aa]">
              このメールアドレスは未登録です。下の申込フォームからリクエストしてください。
            </div>
          )}

          {loginState.status === "error" && (
            <div className="rounded-lg px-4 py-3 text-xs text-center text-[#991b1b]"
              style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
              エラーが発生しました。
              {loginState.errorDetail && (
                <p className="mt-1 font-mono text-[10px] break-all opacity-70">
                  {loginState.errorDetail}
                </p>
              )}
              <br />
              <button onClick={() => setLoginState({ status: "idle" })}
                className="mt-1 underline underline-offset-2 cursor-pointer">
                再試行
              </button>
            </div>
          )}
        </div>

        {/* ── 申込カード ───────────────────────────── */}
        <div
          className="bg-white rounded-2xl p-8 space-y-5"
          style={{ border: "1px solid var(--border)" }}
        >
          <div className="text-center space-y-1">
            <p className="text-xs font-medium tracking-wide uppercase" style={{ color: "#16a34a" }}>
              New
            </p>
            <h2 className="text-base font-bold text-[#1a1a1a]">メンバー登録を申し込む</h2>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              招待制・無料。審査後にメールにてご連絡します。
              <br />
              X（
              <a href="https://x.com/cc_salesperson" target="_blank" rel="noopener noreferrer"
                className="underline underline-offset-2">@cc_salesperson
              </a>
              ）のDMからも受け付けています。
            </p>
          </div>

          {reqStatus !== "submitted" && (
            <form onSubmit={handleRequest} className="space-y-3">
              <input
                type="email"
                value={reqEmail}
                onChange={(e) => setReqEmail(e.target.value)}
                placeholder="your@email.com（必須）"
                required
                disabled={reqStatus === "pending"}
                className="w-full rounded-lg px-4 py-2.5 text-sm text-[#1a1a1a] outline-none disabled:opacity-50"
                style={{ border: "1px solid var(--border)", backgroundColor: "#faf7f2" }}
              />
              <input
                type="text"
                value={reqCompany}
                onChange={(e) => setReqCompany(e.target.value)}
                placeholder="会社名・組織名（任意）"
                disabled={reqStatus === "pending"}
                className="w-full rounded-lg px-4 py-2.5 text-sm text-[#1a1a1a] outline-none disabled:opacity-50"
                style={{ border: "1px solid var(--border)", backgroundColor: "#faf7f2" }}
              />
              <button
                type="submit"
                disabled={reqStatus === "pending" || !reqEmail.trim()}
                className="w-full rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: "#16a34a" }}
              >
                {reqStatus === "pending" ? "送信中…" : "メンバー登録を申し込む"}
              </button>
            </form>
          )}

          {reqStatus === "submitted" && (
            <div className="rounded-lg px-4 py-4 text-sm text-center space-y-2"
              style={{ backgroundColor: "#f0f7ff", border: "1px solid #bfdbfe" }}>
              <p className="text-lg">✅</p>
              <p className="font-semibold text-[#1e40af]">申込を受け付けました</p>
              <p className="text-xs text-[#1e40af] leading-relaxed">
                審査後にご登録のメールアドレスへご連絡します。
                <br />お気軽に X の DM でもお声がけください。
              </p>
            </div>
          )}

          {reqStatus === "already_approved" && (
            <div className="rounded-lg px-4 py-3 text-xs text-[#166534] bg-[#f0fdf4] border border-[#bbf7d0]">
              このメールアドレスはすでに登録済みです。上のフォームからログインしてください。
            </div>
          )}

          {reqStatus === "error" && (
            <div className="rounded-lg px-4 py-3 text-xs text-center text-[#991b1b]"
              style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
              エラーが発生しました。しばらく経ってから再度お試しください。
              <br />
              <button onClick={() => setReqStatus("idle")}
                className="mt-1 underline underline-offset-2 cursor-pointer">
                再試行
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-[#9ca3af]">Powered by AnkenGet</p>
      </div>
    </div>
  );
}
