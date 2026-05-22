"use client";
import { useState, useMemo } from "react";
import type { RawDataResult, RawRow } from "@/lib/data";
import { computeDashboardData } from "@/lib/data";
import FilterBar from "./FilterBar";
import SummaryCards from "./SummaryCards";
import MonthlyChart from "./MonthlyChart";
import FieldChart from "./FieldChart";
import MunicipalityChart from "./MunicipalityChart";
import ProcurementChart from "./ProcurementChart";
import DepartmentTable from "./DepartmentTable";
import WinRateStatsCard from "./WinRateStats";
import CompanyRanking from "./CompanyRanking";

type Props = { rawData: RawDataResult };

export default function Dashboard({ rawData }: Props) {
  const { rows, kenIssuers, cityIssuers, allFields, allYears } = rawData;

  // ─── フィルター状態 ───────────────────────────────────
  const [year, setYear] = useState("all");
  const [selectedIssuers, setSelectedIssuers] = useState<Set<string>>(
    () => new Set([...kenIssuers, ...cityIssuers])
  );
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    () => new Set(allFields)
  );

  // ─── フィルタ適用 ─────────────────────────────────────
  const filteredRows = useMemo(() => {
    return rows.filter((r: RawRow) => {
      if (year !== "all" && r.year !== parseInt(year)) return false;
      if (!selectedIssuers.has(r.issuer)) return false;
      if (!selectedFields.has(r.field)) return false;
      return true;
    });
  }, [rows, year, selectedIssuers, selectedFields]);

  // ─── 集計（フィルタ変更のたびに再計算）──────────────────
  const data = useMemo(
    () => computeDashboardData(filteredRows),
    [filteredRows]
  );

  // 月別グラフは全年度を凡例に含める（全期間表示時）
  const chartYears = useMemo(() => {
    return year === "all" ? allYears : data.years;
  }, [year, allYears, data.years]);

  return (
    <>
      {/* フィルターバー */}
      <FilterBar
        year={year}
        onYearChange={setYear}
        kenIssuers={kenIssuers}
        cityIssuers={cityIssuers}
        selectedIssuers={selectedIssuers}
        onIssuersChange={setSelectedIssuers}
        allFields={allFields}
        selectedFields={selectedFields}
        onFieldsChange={setSelectedFields}
      />

      {/* サマリーカード */}
      <SummaryCards data={data.summary} />

      {/* 月別グラフ */}
      <MonthlyChart data={data.monthly} years={chartYears} />

      {/* 分野別（全幅・高さ自動） */}
      <div className="mb-4">
        <FieldChart data={data.fields} />
      </div>

      {/* 発注方式 + 発注部局 + 落札率統計 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <ProcurementChart data={data.procurement} />
        <DepartmentTable data={data.departments} />
        <WinRateStatsCard data={data.winRateStats} />
      </div>

      {/* 落札業者ランキング */}
      <CompanyRanking data={data.companies} />

      {/* 自治体別（下部・重要度低） */}
      <div className="mt-4">
        <MunicipalityChart data={data.municipalities} />
      </div>
    </>
  );
}
