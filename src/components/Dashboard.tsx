"use client";
import { useState, useMemo } from "react";
import type { RawDataResult, RawRow } from "@/lib/data";
import { computeDashboardData, sortByOrder, DEPT_ORDER, FIELD_ORDER, CITY_ORDER } from "@/lib/data";
import FilterBar from "./FilterBar";
import SummaryCards from "./SummaryCards";
import MonthlyChart from "./MonthlyChart";
import FieldChart from "./FieldChart";
import MunicipalityChart from "./MunicipalityChart";
import ProcurementChart from "./ProcurementChart";
import DepartmentTable from "./DepartmentTable";
import WinRateStatsCard from "./WinRateStats";
import CompanyRanking from "./CompanyRanking";
import KashoRanking from "./KashoRanking";
import BigDealsChart from "./BigDealsChart";

type Props = { rawData: RawDataResult };

// ── フィルター選択状態からラベル文字列を生成 ──────────────
function makeIssuerLabel(
  selectedIssuers: Set<string>,
  kenIssuers: string[],
  cityIssuers: string[]
): string {
  const total = kenIssuers.length + cityIssuers.length;
  if (selectedIssuers.size === 0) return "なし";
  if (selectedIssuers.size === total) return "全機関";

  const selKen = kenIssuers.filter((i) => selectedIssuers.has(i));
  const selCity = cityIssuers.filter((i) => selectedIssuers.has(i));

  const parts: string[] = [];

  // 埼玉県側
  if (selKen.length === kenIssuers.length) {
    parts.push("埼玉県");
  } else if (selKen.length === 1) {
    parts.push(selKen[0]);
  } else if (selKen.length > 1) {
    parts.push(`${selKen[0]}ほか`);
  }

  // 自治体側
  if (selCity.length === cityIssuers.length) {
    parts.push("全自治体");
  } else if (selCity.length === 1) {
    parts.push(selCity[0]);
  } else if (selCity.length > 1) {
    parts.push(`${selCity[0]}ほか`);
  }

  return parts.join("・") || "なし";
}

export default function Dashboard({ rawData }: Props) {
  const { rows, kenIssuers, cityIssuers, allFields, allYears } = rawData;

  // ── 表示順でソート ────────────────────────────────────────
  const sortedKenIssuers = useMemo(
    () => sortByOrder(kenIssuers, DEPT_ORDER),
    [kenIssuers]
  );
  const sortedCityIssuers = useMemo(
    () => sortByOrder(cityIssuers, CITY_ORDER),
    [cityIssuers]
  );
  const sortedFields = useMemo(
    () => sortByOrder(allFields, FIELD_ORDER),
    [allFields]
  );

  // ── フィルター状態 ────────────────────────────────────────
  const [year, setYear] = useState("all");
  const [selectedIssuers, setSelectedIssuers] = useState<Set<string>>(
    () => new Set([...kenIssuers, ...cityIssuers])
  );
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    () => new Set(allFields)
  );

  // ── フィルタ適用 ──────────────────────────────────────────
  const filteredRows = useMemo(() => {
    return rows.filter((r: RawRow) => {
      if (year !== "all" && r.year !== parseInt(year)) return false;
      if (!selectedIssuers.has(r.issuer)) return false;
      if (!selectedFields.has(r.field)) return false;
      return true;
    });
  }, [rows, year, selectedIssuers, selectedFields]);

  // ── 集計 ─────────────────────────────────────────────────
  const data = useMemo(
    () => computeDashboardData(filteredRows),
    [filteredRows]
  );

  const chartYears = useMemo(
    () => (year === "all" ? allYears : data.years),
    [year, allYears, data.years]
  );

  // ── 発注者ラベル（タイトル用） ─────────────────────────────
  const issuerLabel = useMemo(
    () => makeIssuerLabel(selectedIssuers, sortedKenIssuers, sortedCityIssuers),
    [selectedIssuers, sortedKenIssuers, sortedCityIssuers]
  );

  return (
    <>
      <FilterBar
        year={year}
        onYearChange={setYear}
        kenIssuers={sortedKenIssuers}
        cityIssuers={sortedCityIssuers}
        selectedIssuers={selectedIssuers}
        onIssuersChange={setSelectedIssuers}
        allFields={sortedFields}
        selectedFields={selectedFields}
        onFieldsChange={setSelectedFields}
      />

      <SummaryCards data={data.summary} />

      <MonthlyChart data={data.monthly} years={chartYears} issuerLabel={issuerLabel} />

      <div className="mb-4">
        <FieldChart data={data.fields} issuerLabel={issuerLabel} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <ProcurementChart data={data.procurement} issuerLabel={issuerLabel} />
        <DepartmentTable data={data.departments} />
        <WinRateStatsCard data={data.winRateStats} />
      </div>

      <CompanyRanking data={data.companies} issuerLabel={issuerLabel} />

      {/* 県土整備事務所ランキング + 大型案件 */}
      {(data.kashoRanking.length > 0 || data.bigDeals.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-2">
            <KashoRanking data={data.kashoRanking} />
          </div>
          <div>
            <BigDealsChart data={data.bigDeals} availableYears={chartYears} />
          </div>
        </div>
      )}

      {/* 自治体別案件数は一時停止（重要度低） */}
      {/* <div className="mt-4">
        <MunicipalityChart data={data.municipalities} />
      </div> */}
    </>
  );
}
