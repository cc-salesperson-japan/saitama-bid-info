import Link from "next/link";

export default function MembersCTA() {
  return (
    <div
      className="mt-8 rounded-xl p-5"
      style={{ backgroundColor: "#f0f7ff", border: "1px solid #bfdbfe" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: "#2563eb" }}>
              Members
            </span>
            <span className="text-sm font-bold text-[#1a1a1a]">
              参加業者分析ダッシュボード
            </span>
            <span className="text-xs text-[#6b7280]">招待制・無料</span>
          </div>
          <p className="text-xs text-[#3730a3] leading-relaxed">
            業者×自治体ヒートマップ・勝率ランキング・競合密度マップ・指名業者リスト推定 など全9機能を公開中。
          </p>
        </div>
        <Link
          href="/members/login"
          className="shrink-0 inline-flex items-center justify-center gap-1 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#2563eb" }}
        >
          アクセスを申し込む →
        </Link>
      </div>
    </div>
  );
}
