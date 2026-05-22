import { createServerClient } from "./supabase";

// ─── 型定義 ────────────────────────────────────────────

export type SummaryData = {
  totalCases: number;
  totalAmount: number;   // 万円
  avgAmount: number;     // 万円
  futekiCount: number;
  avgWinRate: number | null;    // %
  avgSurveyRate: number | null; // %
};

export type MonthlyPoint = {
  monthLabel: string;
  [fy: string]: number | string;
};

export type FieldPoint = {
  name: string;
  count: number;
  amount: number; // 万円
};

export type MunicipalityPoint = {
  name: string;
  count: number;
};

export type ProcurementPoint = {
  method: string;
  count: number;
};

export type DepartmentPoint = {
  name: string;
  count: number;
};

export type WinRateStats = {
  kenAvgRate: number | null;
  kenMedianRate: number | null;
  cityAvgRate: number | null;
  cityMedianRate: number | null;
  kenAvgSurveyRate: number | null;
  cityAvgSurveyRate: number | null;
  kenNoPriceCount: number;
  cityNoPriceCount: number;
};

export type CompanyPoint = {
  name: string;
  count: number;
  totalAmount: number; // 万円
};

export type DashboardData = {
  years: number[];
  summary: SummaryData;
  monthly: MonthlyPoint[];
  fields: FieldPoint[];
  municipalities: MunicipalityPoint[];
  procurement: ProcurementPoint[];
  departments: DepartmentPoint[];
  winRateStats: WinRateStats;
  companies: CompanyPoint[];
};

// ─── ヘルパー ────────────────────────────────────────────

const isFuteki = (r: Record<string, unknown>) =>
  r["不調"] === true || r["不調"] === "true";

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function avg(arr: number[]): number | null {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null;
}

function pct(v: number | null): number | null {
  return v != null ? Math.round(v * 1000) / 10 : null;
}

function normalizeCompany(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    const branchKw = [
      "支店", "事務所", "営業所", "本店", "支社", "センター",
      "出張所", "事業所", "サービスセンター",
    ];
    if (branchKw.some((k) => last.includes(k))) {
      return parts.slice(0, -1).join(" ");
    }
  }
  return name.trim();
}

function normalizeProcurement(method: string): string {
  if (!method) return "その他";
  if (method.includes("総合評価")) return "総合評価";
  if (method.includes("一般競争")) return "一般競争（ダイレクト）";
  if (method.includes("指名競争")) return "指名競争";
  if (method.includes("プロポーザル") || method.includes("プロポ"))
    return "プロポーザル";
  if (method.includes("随意")) return "随意契約";
  return "その他";
}

// 会計年度の月順 (4月=1番目, ..., 3月=12番目)
const FY_MONTH_ORDER = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];

// ─── 内部型 ──────────────────────────────────────────────────────

type Row = { [key: string]: unknown };

// ─── データ取得 & 集計 ────────────────────────────────────────────

export async function fetchDashboardData(
  year: string,
  issuer: string
): Promise<DashboardData> {
  const supabase = createServerClient();

  const shouldFetchKen = issuer === "all" || issuer === "ken";
  const shouldFetchCity = issuer === "all" || issuer === "city";
  const yearFilter = year !== "all" ? parseInt(year) : null;

  // city_rakusatsu の必要カラムだけ取得
  const citySelect =
    "調達機関名,入札方式,開札日,年度,予定価格,落札金額,落札業者名,分野分類,不調,落札率,調査価格率";
  // ken_rakusatsu の必要カラムだけ取得
  const kenSelect =
    "入札方式,開札日,年度,発注部局,発注方式,予定価格,落札金額,落札業者名,分野分類,不調,落札率,調査価格率";

  // 並列フェッチ
  const [cityRes, kenRes, cityAllRes, kenAllRes] = await Promise.all([
    // フィルタあり（summary / field / company 用）
    shouldFetchCity
      ? supabase
          .from("city_rakusatsu")
          .select(citySelect)
          .then((r) => {
            const d = (r.data || []) as unknown as Row[];
            return yearFilter ? d.filter((x) => x["年度"] === yearFilter) : d;
          })
      : Promise.resolve([]),

    shouldFetchKen
      ? supabase
          .from("ken_rakusatsu")
          .select(kenSelect)
          .then((r) => {
            const d = (r.data || []) as unknown as Row[];
            return yearFilter ? d.filter((x) => x["年度"] === yearFilter) : d;
          })
      : Promise.resolve([]),

    // 全期間（monthly chart / municipality / ken stats 用）
    supabase
      .from("city_rakusatsu")
      .select("調達機関名,開札日,年度,不調,落札率,調査価格率,予定価格")
      .then((r) => (r.data || []) as unknown as Row[]),

    supabase
      .from("ken_rakusatsu")
      .select("開札日,年度,発注部局,発注方式,不調,落札率,調査価格率,予定価格")
      .then((r) => (r.data || []) as unknown as Row[]),
  ]);

  const cityData = cityRes as Row[];
  const kenData = kenRes as Row[];
  const cityAll = (cityAllRes as Row[]) ?? [];
  const kenAll = (kenAllRes as Row[]) ?? [];

  const combined = [...cityData, ...kenData];

  // ── 利用可能な年度一覧 ──
  const years = [...new Set([...cityAll, ...kenAll].map((r) => r["年度"] as number))]
    .filter(Boolean)
    .sort();

  // ── Summary ──
  const amounts = combined
    .map((r) => r["落札金額"] as number | null)
    .filter((v): v is number => v != null && v > 0);
  const totalAmount = amounts.reduce((s, v) => s + v, 0);
  const winRates = combined
    .filter((r) => !isFuteki(r))
    .map((r) => r["落札率"] as number | null)
    .filter((v): v is number => v != null);
  const surveyRates = combined
    .filter((r) => !isFuteki(r))
    .map((r) => r["調査価格率"] as number | null)
    .filter((v): v is number => v != null);

  const summary: SummaryData = {
    totalCases: combined.length,
    totalAmount: Math.round(totalAmount / 10000),
    avgAmount: amounts.length ? Math.round(totalAmount / amounts.length / 10000) : 0,
    futekiCount: combined.filter(isFuteki).length,
    avgWinRate: pct(avg(winRates)),
    avgSurveyRate: pct(avg(surveyRates)),
  };

  // ── Monthly chart（常に全年度・issuerフィルタのみ）──
  const monthlySource = [
    ...(shouldFetchCity ? cityAll : []),
    ...(shouldFetchKen ? kenAll : []),
  ];
  const monthlyMap: Record<string, Record<number, number>> = {};
  FY_MONTH_ORDER.forEach((m) => {
    monthlyMap[`${m}月`] = {};
  });
  monthlySource.forEach((r) => {
    if (!r["開札日"]) return;
    const m = new Date(r["開札日"] as string).getMonth() + 1;
    const fy = r["年度"] as number;
    const key = `${m}月`;
    if (monthlyMap[key]) {
      monthlyMap[key][fy] = (monthlyMap[key][fy] || 0) + 1;
    }
  });
  const monthly: MonthlyPoint[] = FY_MONTH_ORDER.map((m) => {
    const key = `${m}月`;
    const point: MonthlyPoint = { monthLabel: key };
    years.forEach((fy) => {
      point[`fy${fy}`] = monthlyMap[key]?.[fy] || 0;
    });
    return point;
  });

  // ── 分野別 ──
  const fieldMap: Record<string, { count: number; amount: number }> = {};
  combined.forEach((r) => {
    const field = (r["分野分類"] as string) || "その他";
    if (!fieldMap[field]) fieldMap[field] = { count: 0, amount: 0 };
    fieldMap[field].count++;
    const amt = r["落札金額"] as number | null;
    if (amt) fieldMap[field].amount += amt;
  });
  const fields: FieldPoint[] = Object.entries(fieldMap)
    .map(([name, { count, amount }]) => ({
      name,
      count,
      amount: Math.round(amount / 10000),
    }))
    .sort((a, b) => b.count - a.count);

  // ── 自治体別（常に全期間の city_rakusatsu）──
  const muniMap: Record<string, number> = {};
  cityAll.forEach((r) => {
    const name = r["調達機関名"] as string;
    if (name) muniMap[name] = (muniMap[name] || 0) + 1;
  });
  const municipalities: MunicipalityPoint[] = Object.entries(muniMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // ── 発注方式（常に ken_rakusatsu 全期間）──
  const procMap: Record<string, number> = {};
  kenAll.forEach((r) => {
    const method = normalizeProcurement(
      (r["発注方式"] || r["入札方式"] || "") as string
    );
    procMap[method] = (procMap[method] || 0) + 1;
  });
  const procurement: ProcurementPoint[] = Object.entries(procMap)
    .map(([method, count]) => ({ method, count }))
    .sort((a, b) => b.count - a.count);

  // ── 発注部局（常に ken_rakusatsu 全期間）──
  const deptMap: Record<string, number> = {};
  kenAll.forEach((r) => {
    const dept = (r["発注部局"] as string) || "その他部局";
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });
  const departments: DepartmentPoint[] = Object.entries(deptMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // ── 落札率・調査価格率統計 ──
  const kenRates = kenAll
    .filter((r) => !isFuteki(r) && r["落札率"] != null)
    .map((r) => r["落札率"] as number);
  const cityRates = cityAll
    .filter((r) => !isFuteki(r) && r["落札率"] != null)
    .map((r) => r["落札率"] as number);
  const kenSurveyRates = kenAll
    .filter((r) => r["調査価格率"] != null)
    .map((r) => r["調査価格率"] as number);
  const citySurveyRates = cityAll
    .filter((r) => r["調査価格率"] != null)
    .map((r) => r["調査価格率"] as number);

  const winRateStats: WinRateStats = {
    kenAvgRate: pct(avg(kenRates)),
    kenMedianRate: pct(median(kenRates)),
    cityAvgRate: pct(avg(cityRates)),
    cityMedianRate: pct(median(cityRates)),
    kenAvgSurveyRate: pct(avg(kenSurveyRates)),
    cityAvgSurveyRate: pct(avg(citySurveyRates)),
    kenNoPriceCount: kenAll.filter((r) => r["予定価格"] == null).length,
    cityNoPriceCount: cityAll.filter((r) => r["予定価格"] == null).length,
  };

  // ── 落札業者ランキング ──
  const companyMap: Record<string, { count: number; amount: number }> = {};
  combined.forEach((r) => {
    if (isFuteki(r)) return;
    const rawName = r["落札業者名"] as string | null;
    if (!rawName) return;
    const name = normalizeCompany(rawName);
    if (!name) return;
    if (!companyMap[name]) companyMap[name] = { count: 0, amount: 0 };
    companyMap[name].count++;
    const amt = r["落札金額"] as number | null;
    if (amt) companyMap[name].amount += amt;
  });
  const companies: CompanyPoint[] = Object.entries(companyMap)
    .map(([name, { count, amount }]) => ({
      name,
      count,
      totalAmount: Math.round(amount / 10000),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return {
    years,
    summary,
    monthly,
    fields,
    municipalities,
    procurement,
    departments,
    winRateStats,
    companies,
  };
}
