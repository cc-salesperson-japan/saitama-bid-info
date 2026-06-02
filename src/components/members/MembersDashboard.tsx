"use client";
import { useState, useMemo } from "react";
import type { AnnotatedSankaRow, WinDataRow, ShimeiCaseRow, MembersRawData } from "@/lib/sanka-data";
import ParticipationRanking from "./ParticipationRanking";
import CompanyKikanHeatmap  from "./CompanyKikanHeatmap";
import WinRateRanking       from "./WinRateRanking";
import CompetitionDensity   from "./CompetitionDensity";
import CompetitionMatrix    from "./CompetitionMatrix";
import CompanyActivity      from "./CompanyActivity";
import NewEntrantTracker    from "./NewEntrantTracker";
import ShimeiEstimator      from "./ShimeiEstimator";

type Props = { data: MembersRawData };

// ─── 集計関数 ─────────────────────────────────────────────────

function calcParticipation(rows: AnnotatedSankaRow[], limit = 30) {
  const m = new Map<string, number>();
  rows.forEach((r) => m.set(r.company, (m.get(r.company) ?? 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
    .map(([company, cnt]) => ({ company, cnt }));
}

function calcMatrix(rows: AnnotatedSankaRow[], topN = 20) {
  const compCnt  = new Map<string, number>();
  const kikanCnt = new Map<string, number>();
  rows.forEach((r) => {
    compCnt.set(r.company, (compCnt.get(r.company) ?? 0) + 1);
    kikanCnt.set(r.kikan_name, (kikanCnt.get(r.kikan_name) ?? 0) + 1);
  });
  const topCos   = new Set([...compCnt.entries()].sort((a,b)=>b[1]-a[1]).slice(0,topN).map(([k])=>k));
  const topKikans = new Set([...kikanCnt.entries()].sort((a,b)=>b[1]-a[1]).slice(0,topN).map(([k])=>k));
  const m = new Map<string, number>();
  rows.forEach((r) => {
    if (!topCos.has(r.company) || !topKikans.has(r.kikan_name)) return;
    const key = `${r.company}||${r.kikan_name}`;
    m.set(key, (m.get(key) ?? 0) + 1);
  });
  return [...m.entries()].map(([key, cnt]) => {
    const sep = key.indexOf("||");
    return { company: key.slice(0, sep), kikan_name: key.slice(sep + 2), cnt };
  });
}

function calcWinRate(rows: AnnotatedSankaRow[], winRows: WinDataRow[], minCount: number) {
  const partMap = new Map<string, number>();
  rows.forEach((r) => partMap.set(r.company, (partMap.get(r.company) ?? 0) + 1));
  const winMap = new Map<string, number>();
  winRows.forEach((r) => winMap.set(r.company, (winMap.get(r.company) ?? 0) + 1));
  return [...partMap.entries()]
    .filter(([, cnt]) => cnt >= minCount)
    .map(([company, participations]) => {
      const wins = winMap.get(company) ?? 0;
      return { company, participations, wins, win_rate: Math.round((wins / participations) * 1000) / 10 };
    })
    .sort((a, b) => b.win_rate - a.win_rate || b.participations - a.participations)
    .slice(0, 50);
}

function calcDensity(rows: AnnotatedSankaRow[]) {
  const caseCoMap   = new Map<string, Set<string>>();
  const caseKikanMap = new Map<string, string>();
  rows.forEach((r) => {
    const key = `${r.anken_no}||${r.kikan_name}`;
    if (!caseCoMap.has(key)) { caseCoMap.set(key, new Set()); caseKikanMap.set(key, r.kikan_name); }
    caseCoMap.get(key)!.add(r.company);
  });
  const agg = new Map<string, { sum: number; count: number }>();
  caseCoMap.forEach((cos, key) => {
    const kikan = caseKikanMap.get(key)!;
    if (!agg.has(kikan)) agg.set(kikan, { sum: 0, count: 0 });
    const a = agg.get(kikan)!; a.sum += cos.size; a.count++;
  });
  return [...agg.entries()]
    .map(([kikan_name, { sum, count }]) => ({
      kikan_name, avg_competitors: Math.round(sum / count * 10) / 10, total_cases: count,
    }))
    .sort((a, b) => b.avg_competitors - a.avg_competitors);
}

function calcCompMatrix(rows: AnnotatedSankaRow[]) {
  const caseMap = new Map<string, { kikan: string; field: string; cos: Set<string> }>();
  rows.forEach((r) => {
    if (!r.field) return;
    const key = `${r.anken_no}||${r.kikan_name}`;
    if (!caseMap.has(key)) caseMap.set(key, { kikan: r.kikan_name, field: r.field, cos: new Set() });
    caseMap.get(key)!.cos.add(r.company);
  });
  const agg = new Map<string, { sum: number; count: number }>();
  caseMap.forEach(({ kikan, field, cos }) => {
    const key = `${kikan}||${field}`;
    if (!agg.has(key)) agg.set(key, { sum: 0, count: 0 });
    const a = agg.get(key)!; a.sum += cos.size; a.count++;
  });
  return [...agg.entries()]
    .filter(([, { count }]) => count >= 2)
    .map(([key, { sum, count }]) => {
      const sep = key.indexOf("||");
      return { kikan_name: key.slice(0, sep), field: key.slice(sep + 2),
        avg_competitors: Math.round(sum / count * 10) / 10, total_cases: count };
    })
    .sort((a, b) => b.avg_competitors - a.avg_competitors);
}

function calcNewEntrants(allRows: AnnotatedSankaRow[], filteredRows: AnnotatedSankaRow[]) {
  // 全期間のデータで「初登場年度」を算出（year=nullは除外）
  const compYearsAll = new Map<string, Set<number>>();
  allRows.forEach((r) => {
    if (!r.year) return;
    if (!compYearsAll.has(r.company)) compYearsAll.set(r.company, new Set());
    compYearsAll.get(r.company)!.add(r.year);
  });

  // フィルター後の最大年度
  const filteredYears: number[] = [];
  filteredRows.forEach((r) => { if (r.year) filteredYears.push(r.year); });
  if (!filteredYears.length) return [];
  const maxYear = Math.max(...filteredYears);

  // 全期間データで「初年度 = maxYear」の業者
  const results: { company: string; first_year: number; recent_count: number }[] = [];
  compYearsAll.forEach((years, company) => {
    if (Math.min(...years) !== maxYear) return;
    const recent = filteredRows.filter((r) => r.company === company).length;
    if (recent > 0) results.push({ company, first_year: maxYear, recent_count: recent });
  });
  return results.sort((a, b) => b.recent_count - a.recent_count).slice(0, 30);
}

function calcShimei(rows: AnnotatedSankaRow[], shimeiCases: ShimeiCaseRow[]) {
  const shimeiSet = new Set(shimeiCases.map((c) => c.anken_no));
  const totalMap  = new Map<string, number>();
  const shimeiMap = new Map<string, number>();
  rows.forEach((r) => {
    totalMap.set(r.company, (totalMap.get(r.company) ?? 0) + 1);
    if (shimeiSet.has(r.anken_no)) shimeiMap.set(r.company, (shimeiMap.get(r.company) ?? 0) + 1);
  });
  return [...shimeiMap.entries()]
    .map(([company, shimei_count]) => {
      const total_count = totalMap.get(company) ?? shimei_count;
      return { company, shimei_count, total_count,
        shimei_ratio: Math.round(shimei_count / total_count * 1000) / 10 };
    })
    .sort((a, b) => b.shimei_count - a.shimei_count)
    .slice(0, 30);
}

function calcShimeiByKikan(rows: AnnotatedSankaRow[], shimeiCases: ShimeiCaseRow[]) {
  const shimeiSet = new Set(shimeiCases.map((c) => c.anken_no));
  const kikanCases = new Map<string, Set<string>>();
  rows.forEach((r) => {
    if (!shimeiSet.has(r.anken_no)) return;
    if (!kikanCases.has(r.kikan_name)) kikanCases.set(r.kikan_name, new Set());
    kikanCases.get(r.kikan_name)!.add(r.anken_no);
  });
  return [...kikanCases.entries()]
    .map(([kikan_name, cases]) => ({ kikan_name, case_count: cases.size }))
    .sort((a, b) => b.case_count - a.case_count);
}

// ─── ダッシュボード本体 ──────────────────────────────────────

export default function MembersDashboard({ data }: Props) {
  const { sankaRows, winRows, shimeiCases, availableYears } = data;
  const [year, setYear] = useState("all");

  const filteredSanka = useMemo(
    () => year === "all" ? sankaRows : sankaRows.filter((r) => r.year === parseInt(year)),
    [sankaRows, year]
  );
  const filteredWin = useMemo(
    () => year === "all" ? winRows : winRows.filter((r) => r.year === parseInt(year)),
    [winRows, year]
  );
  const filteredShimei = useMemo(
    () => year === "all" ? shimeiCases : shimeiCases.filter((r) => r.year === parseInt(year)),
    [shimeiCases, year]
  );

  const participation  = useMemo(() => calcParticipation(filteredSanka, 30), [filteredSanka]);
  const matrix         = useMemo(() => calcMatrix(filteredSanka, 20), [filteredSanka]);
  const winRateAll     = useMemo(() => calcWinRate(filteredSanka, filteredWin, 1), [filteredSanka, filteredWin]);
  const winRateQuality = useMemo(() => calcWinRate(filteredSanka, filteredWin, 10), [filteredSanka, filteredWin]);
  const density        = useMemo(() => calcDensity(filteredSanka), [filteredSanka]);
  const compMatrix     = useMemo(() => calcCompMatrix(filteredSanka), [filteredSanka]);
  const newEntrants    = useMemo(() => calcNewEntrants(sankaRows, filteredSanka), [sankaRows, filteredSanka]);
  const shimei         = useMemo(() => calcShimei(filteredSanka, filteredShimei), [filteredSanka, filteredShimei]);
  const shimeiByKikan  = useMemo(() => calcShimeiByKikan(filteredSanka, filteredShimei), [filteredSanka, filteredShimei]);

  return (
    <div className="space-y-4">
      {/* 年度フィルター（ページ上部に固定） */}
      <div
        className="bg-white rounded-xl px-5 py-3 flex items-center gap-4 flex-wrap sticky top-0 z-20 shadow-sm"
        style={{ border: "1px solid var(--border)" }}
      >
        <span className="text-xs font-semibold text-[#1a1a1a] shrink-0">期間：</span>
        <div className="flex flex-wrap gap-1.5">
          {["all", ...availableYears.map(String)].map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                year === y
                  ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                  : "text-[#6b7280] border-[#e0dbd0] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
              }`}
            >
              {y === "all" ? "全期間" : `${y}年度`}
            </button>
          ))}
        </div>
        <span className="text-xs text-[#9ca3af] ml-auto shrink-0">
          延べ参加 {filteredSanka.length.toLocaleString()}件
          {year !== "all" && ` / 全期間 ${sankaRows.length.toLocaleString()}件`}
        </span>
      </div>

      <ParticipationRanking data={participation} />
      <CompanyKikanHeatmap  data={matrix} />
      <WinRateRanking dataAll={winRateAll} dataQuality={winRateQuality} />
      <CompetitionDensity   data={density} />
      <CompetitionMatrix    data={compMatrix} />
      <CompanyActivity />
      {/* 新規参入トラッカーは精度改善まで非表示 */}
      {/* <NewEntrantTracker data={newEntrants} maxYear={Math.max(...availableYears)} /> */}
      <ShimeiEstimator data={shimei} />
    </div>
  );
}
