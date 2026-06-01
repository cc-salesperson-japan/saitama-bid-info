import { fetchAllRawData } from "@/lib/data";
import Dashboard from "@/components/Dashboard";
import MembersCTA from "@/components/MembersCTA";
import TermsDisclaimer from "@/components/TermsDisclaimer";

// 1時間ごとにデータを再取得（ISR）
export const revalidate = 3600;

export default async function Page() {
  const rawData = await fetchAllRawData();
  const { latestDate } = rawData;

  // 最新開札日を「YYYY年M月D日」形式にフォーマット
  const formattedDate = latestDate
    ? (() => {
        const d = new Date(latestDate);
        return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
      })()
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* ヘッダー */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#1a1a1a]">
          埼玉県 落札結果ダッシュボード
        </h1>
        <p className="text-xs text-[#6b7280] mt-0.5">
          建設コンサルタント業務（設計・調査・測量）落札情報 ／{" "}
          <a
            href="https://ebidjk2.ebid2.pref.saitama.lg.jp/koukai/do/KF000ShowAction"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-[#1a1a1a] transition-colors"
          >
            データ出典：埼玉県 入札情報公開システム
          </a>
          {formattedDate && (
            <span className="ml-2 text-[#9ca3af]">
              ｜ データ更新: {formattedDate}
            </span>
          )}
        </p>
      </div>

      {/* ダッシュボード（クライアントサイドフィルタリング） */}
      <Dashboard rawData={rawData} />

      {/* 会員限定エリア入口 */}
      <MembersCTA />

      {/* 利用規約・免責事項 */}
      <TermsDisclaimer />

      {/* フッター */}
      <p className="text-xs text-center text-[#6b7280] mt-4 pb-4">
        Powered by AnkenGet
      </p>
    </div>
  );
}
