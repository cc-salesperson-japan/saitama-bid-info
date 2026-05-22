import { fetchAllRawData } from "@/lib/data";
import Dashboard from "@/components/Dashboard";

// 1時間ごとにデータを再取得（ISR）
export const revalidate = 3600;

export default async function Page() {
  const rawData = await fetchAllRawData();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* ヘッダー */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#1a1a1a]">
          埼玉県 落札結果ダッシュボード
        </h1>
        <p className="text-xs text-[#6b7280] mt-0.5">
          建設コンサルタント業務（設計・調査・測量）落札情報
        </p>
      </div>

      {/* ダッシュボード（クライアントサイドフィルタリング） */}
      <Dashboard rawData={rawData} />

      {/* フッター */}
      <p className="text-xs text-center text-[#6b7280] mt-6">
        Powered by AnkenGet｜データ出典: 埼玉県電子入札システム
      </p>
    </div>
  );
}
