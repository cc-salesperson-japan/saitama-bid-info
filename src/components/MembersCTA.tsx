import Link from "next/link";

export default function MembersCTA() {
  return (
    <div
      className="mt-6 rounded-xl p-5"
      style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: "#16a34a" }}
            >
              メンバー限定
            </span>
            <span className="text-sm font-bold text-[#1a1a1a]">
              埼玉県　参加業者分析ダッシュボード
            </span>
            <span className="text-xs text-[#6b7280]">招待制・無料</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "#166534" }}>
            メンバー限定公開の機能：各自治体の指名業者リスト推定、業者×自治体ヒートマップ、など全9機能
          </p>
        </div>
        <Link
          href="/members/login"
          className="shrink-0 inline-flex items-center justify-center gap-1 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#16a34a" }}
        >
          メンバー限定ページへ →
        </Link>
      </div>
    </div>
  );
}
