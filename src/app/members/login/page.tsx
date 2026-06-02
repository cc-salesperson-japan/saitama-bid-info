"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendEmailOtp, submitAccessRequest } from "./actions";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

// ─── ログインフロー ───────────────────────────────────
type LoginStep = "email" | "code";
type LoginStatus = "idle" | "pending" | "not_approved" | "error";

// ─── 申込フォームの状態 ──────────────────────────────
type ReqStatus = "idle" | "pending" | "submitted" | "already_approved" | "error";

export default function LoginPage() {
  const router = useRouter();

  // ログイン
  const [step,        setStep]        = useState<LoginStep>("email");
  const [loginEmail,  setLoginEmail]  = useState("");
  const [otpCode,     setOtpCode]     = useState("");
  const [loginStatus, setLoginStatus] = useState<LoginStatus>("idle");
  const [loginError,  setLoginError]  = useState("");

  // 申込
  const [reqEmail,   setReqEmail]   = useState("");
  const [reqCompany, setReqCompany] = useState("");
  const [reqStatus,  setReqStatus]  = useState<ReqStatus>("idle");

  // ── ステップ1: メアド入力 → OTP送信 ────────────────
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail.trim()) return;
    setLoginStatus("pending");
    setLoginError("");

    const result = await sendEmailOtp(loginEmail.trim());
    if (result.ok) {
      setStep("code");
      setLoginStatus("idle");
    } else if (result.reason === "not_approved") {
      setLoginStatus("not_approved");
      setReqEmail(loginEmail.trim().toLowerCase());
    } else {
      setLoginStatus("error");
      setLoginError("メールの送信に失敗しました。しばらく経ってから再度お試しください。");
    }
  }

  // ── ステップ2: 6桁コード入力 → 認証 ───────────────
  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (otpCode.trim().length === 0) return;
    setLoginStatus("pending");
    setLoginError("");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.verifyOtp({
      email: loginEmail.trim().toLowerCase(),
      token: otpCode.trim(),
      type:  "email",
    });

    if (!error) {
      router.push("/members");
    } else {
      setLoginStatus("error");
      setLoginError(
        error.message.includes("expired") || error.message.includes("invalid")
          ? "コードが無効または期限切れです。再度メールを送信してください。"
          : error.message
      );
    }
  }

  // ── 申込送信 ─────────────────────────────────────
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

        {/* ── ログインカード ─────────────────────────── */}
        <div
          className="bg-white rounded-2xl p-8 space-y-5"
          style={{ border: "1px solid var(--border)" }}
        >
          <div className="text-center space-y-1">
            <p className="text-xs font-medium tracking-wide uppercase" style={{ color: "#16a34a" }}>
              メンバー限定
            </p>
            <h1 className="text-lg font-bold text-[#1a1a1a]">ログイン</h1>
          </div>

          {/* ステップ1: メアド入力 */}
          {step === "email" && (
            <>
              <p className="text-xs text-[#6b7280] text-center">
                登録済みのメールアドレスを入力してください。
                <br />8桁の確認コードをお送りします。
              </p>

              <form onSubmit={handleSendOtp} className="space-y-3">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={loginStatus === "pending"}
                  className="w-full rounded-lg px-4 py-2.5 text-sm text-[#1a1a1a] outline-none disabled:opacity-50"
                  style={{ border: "1px solid var(--border)", backgroundColor: "#faf7f2" }}
                />
                <button
                  type="submit"
                  disabled={loginStatus === "pending" || !loginEmail.trim()}
                  className="w-full rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: "#2563eb" }}
                >
                  {loginStatus === "pending" ? "送信中…" : "確認コードを送信"}
                </button>
              </form>

              {loginStatus === "not_approved" && (
                <div className="rounded-lg px-4 py-3 text-xs text-[#92400e] bg-[#fff7ed] border border-[#fed7aa]">
                  このメールアドレスは未登録です。下の申込フォームからリクエストしてください。
                </div>
              )}

              {loginStatus === "error" && (
                <div className="rounded-lg px-4 py-3 text-xs text-center text-[#991b1b]"
                  style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
                  {loginError}
                  <br />
                  <button onClick={() => { setLoginStatus("idle"); setLoginError(""); }}
                    className="mt-1 underline underline-offset-2 cursor-pointer">
                    再試行
                  </button>
                </div>
              )}
            </>
          )}

          {/* ステップ2: コード入力 */}
          {step === "code" && (
            <>
              <div className="rounded-lg px-4 py-3 text-xs text-center text-[#166534]"
                style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <p className="font-semibold mb-1">📬 コードを送信しました</p>
                <p>{loginEmail} に届いた8桁のコードを入力してください</p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-3">
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="12345678"
                  inputMode="numeric"
                  maxLength={8}
                  disabled={loginStatus === "pending"}
                  className="w-full rounded-lg px-4 py-3 text-2xl text-center font-mono tracking-widest text-[#1a1a1a] outline-none disabled:opacity-50"
                  style={{ border: "1px solid var(--border)", backgroundColor: "#faf7f2" }}
                />
                <button
                  type="submit"
                  disabled={loginStatus === "pending" || otpCode.trim().length === 0}
                  className="w-full rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: "#2563eb" }}
                >
                  {loginStatus === "pending" ? "確認中…" : "ログインする"}
                </button>
              </form>

              {loginStatus === "error" && (
                <div className="rounded-lg px-4 py-3 text-xs text-center text-[#991b1b]"
                  style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
                  {loginError}
                  <br />
                  <button onClick={() => { setStep("email"); setOtpCode(""); setLoginStatus("idle"); setLoginError(""); }}
                    className="mt-1 underline underline-offset-2 cursor-pointer">
                    メールアドレスを変更して再送信
                  </button>
                </div>
              )}

              <p className="text-center">
                <button
                  onClick={() => { setStep("email"); setOtpCode(""); setLoginStatus("idle"); setLoginError(""); }}
                  className="text-xs text-[#6b7280] underline underline-offset-2 cursor-pointer"
                >
                  ← メールアドレスを変更
                </button>
              </p>
            </>
          )}
        </div>

        {/* ── 申込カード ─────────────────────────────── */}
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
