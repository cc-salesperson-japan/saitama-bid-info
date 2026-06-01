import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import LogoutButton from "./LogoutButton";

const COMING_SOON = [
  { no: "①", title: "参加件数ランキング", desc: "積極的に参加している業者を件数で可視化" },
  { no: "②", title: "業者×自治体 ヒートマップ", desc: "どの業者がどの自治体に強いかを一目で把握" },
  { no: "③", title: "落札率（勝率）ランキング", desc: "参加数と落札数から「本当に強い業者」を算出" },
  { no: "④", title: "競合密度グラフ", desc: "自治体別の平均参加業者数推移・穴場の発見" },
  { no: "⑤", title: "勝率ランキング（詳細）", desc: "参加10件以上に絞った精度の高い勝率分析" },
  { no: "⑥", title: "競合密度マトリックス", desc: "自治体×分野の組み合わせで激戦区・穴場を色分け" },
  { no: "⑦", title: "業者の活動分布", desc: "特定業者を選択し活動エリア・得意分野を可視化" },
  { no: "⑧", title: "新規参入トラッカー", desc: "2024→2025年度の新規参入業者を自動検出" },
  { no: "⑨", title: "指名業者リスト推定", desc: "指名競争案件の参加業者から実質的な指名リストを逆算" },
];

export default async function MembersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/members/login");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" style={{ minHeight: "100vh" }}>
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: "#2563eb" }}>
              Members
            </span>
            <h1 className="text-lg font-bold text-[#1a1a1a]">
              参加業者分析ダッシュボード
            </h1>
          </div>
          <p className="text-xs text-[#6b7280]">
            {user.email} でログイン中
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-xs text-[#6b7280] hover:text-[#1a1a1a] transition-colors underline underline-offset-2"
          >
            無料ダッシュボードへ
          </a>
          <LogoutButton />
        </div>
      </div>

      {/* コンテンツ準備中 */}
      <div
        className="rounded-2xl p-8 text-center mb-6"
        style={{ backgroundColor: "#f0f7ff", border: "1px solid #bfdbfe" }}
      >
        <p className="text-3xl mb-3">🔧</p>
        <h2 className="text-base font-bold text-[#1e40af] mb-2">
          コンテンツ準備中
        </h2>
        <p className="text-sm text-[#3730a3] leading-relaxed">
          参加業者データ（46,004件）の分析グラフを順次公開予定です。
          <br />
          公開時にXでお知らせします →
          <a href="https://x.com/cc_salesperson" target="_blank" rel="noopener noreferrer"
            className="font-medium underline underline-offset-2 ml-1">
            @cc_salesperson
          </a>
        </p>
      </div>

      {/* 公開予定コンテンツ一覧 */}
      <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3">
        公開予定のコンテンツ
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {COMING_SOON.map((item) => (
          <div
            key={item.no}
            className="bg-white rounded-xl p-4 flex gap-3"
            style={{ border: "1px solid var(--border)" }}
          >
            <span className="text-sm font-bold text-[#2563eb] w-6 shrink-0">
              {item.no}
            </span>
            <div>
              <p className="text-xs font-semibold text-[#1a1a1a] mb-0.5">
                {item.title}
              </p>
              <p className="text-xs text-[#6b7280] leading-relaxed">
                {item.desc}
              </p>
            </div>
            <span className="ml-auto text-[10px] text-[#9ca3af] shrink-0 self-start">
              準備中
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-[#9ca3af] mt-8">
        Powered by AnkenGet
      </p>
    </div>
  );
}
