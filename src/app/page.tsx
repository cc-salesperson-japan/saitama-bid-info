import { fetchDashboardData } from "@/lib/data";
import FilterBar from "@/components/FilterBar";
import SummaryCards from "@/components/SummaryCards";
import MonthlyChart from "@/components/MonthlyChart";
import FieldChart from "@/components/FieldChart";
import MunicipalityChart from "@/components/MunicipalityChart";
import ProcurementChart from "@/components/ProcurementChart";
import DepartmentTable from "@/components/DepartmentTable";
import WinRateStatsCard from "@/components/WinRateStats";
import CompanyRanking from "@/components/CompanyRanking";

type SearchParams = Promise<{ year?: string; issuer?: string }>;

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { year = "all", issuer = "all" } = await searchParams;

  const data = await fetchDashboardData(year, issuer);

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

      {/* フィルターバー */}
      <FilterBar year={year} issuer={issuer} />

      {/* サマリーカード */}
      <SummaryCards data={data.summary} />

      {/* 月別グラフ */}
      <MonthlyChart data={data.monthly} years={data.years} />

      {/* 分野別 + 自治体別 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <div className="md:col-span-2">
          <FieldChart data={data.fields} />
        </div>
        <div className="md:col-span-3">
          <MunicipalityChart data={data.municipalities} />
        </div>
      </div>

      {/* 発注方式 + 発注部局 + 落札率 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <ProcurementChart data={data.procurement} />
        <DepartmentTable data={data.departments} />
        <WinRateStatsCard data={data.winRateStats} />
      </div>

      {/* 落札業者ランキング */}
      <CompanyRanking data={data.companies} />

      {/* フッター */}
      <p className="text-xs text-center text-[#6b7280] mt-6">
        Powered by AnkenGet｜データ出典: 埼玉県電子入札システム
      </p>
    </div>
  );
}
