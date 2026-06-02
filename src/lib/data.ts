import { createServerClient } from "./supabase";

// ─── チャートコンポーネント用型 ─────────────────────────

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

export type KashoPoint = {
  name: string;   // 課所名（県土整備事務所名）
  count: number;
  amount: number; // 万円
};

export type BigDealPoint = {
  year: number;
  ankenName: string;
  kashoName: string;
  plannedPrice: number; // 万円
  winner: string | null; // 落札業者名
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
  kashoRanking: KashoPoint[];
  bigDeals: BigDealPoint[];
};

// ─── 正規化済み生行データ型（クライアントサイド処理用）─────

export type RawRow = {
  source: "ken" | "city";
  year: number;
  date: string;
  issuer: string;    // 発注部局 or 調達機関名
  field: string;     // 分野分類
  amount: number | null;
  plannedPrice: number | null;
  winRate: number | null;
  surveyRate: number | null;
  futeki: boolean;
  company: string | null;
  procMethod: string;
  kashoName: string; // 課所名
  ankenName: string; // 調達案件名称
};

export type RawDataResult = {
  rows: RawRow[];
  kenIssuers: string[];   // ユニーク発注部局
  cityIssuers: string[];  // ユニーク自治体名
  allFields: string[];    // ユニーク分野分類
  allYears: number[];     // ユニーク年度
  latestDate: string | null; // 全データ中の最新開札日
};

// ─── ヘルパー ────────────────────────────────────────────

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

// 会計年度の月順
const FY_MONTH_ORDER = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];

// ─── 部局・分野の表示順 ─────────────────────────────────

export const CITY_ORDER = [
  "さいたま市", "川越市", "熊谷市", "川口市", "行田市",
  "秩父市", "所沢市", "飯能市", "加須市", "本庄市",
  "東松山市", "春日部市", "狭山市", "羽生市", "鴻巣市",
  "深谷市", "上尾市", "草加市", "越谷市", "蕨市",
  "戸田市", "入間市", "朝霞市", "志木市", "和光市",
  "新座市", "桶川市", "久喜市", "北本市", "八潮市",
  "富士見市", "三郷市", "蓮田市", "坂戸市", "幸手市",
  "鶴ヶ島市", "日高市", "吉川市", "ふじみ野市", "白岡市",
  "伊奈町", "三芳町", "毛呂山町", "滑川町", "嵐山町",
  "小川町", "川島町", "吉見町", "鳩山町", "ときがわ町",
  "横瀬町", "皆野町", "長瀞町", "小鹿野町", "東秩父村",
  "美里町", "神川町", "上里町", "寄居町", "宮代町",
  "杉戸町", "松伏町", "越谷・松伏水道企業団",
  "戸田ボートレース企業団", "秩父広域市町村圏組合",
  "児玉郡市広域市町村圏組合", "埼玉西部消防組合",
];

export const DEPT_ORDER = [
  "県土整備部",
  "下水道局",
  "企業局",
  "農林部",
  "都市整備部",
  "その他部局",
];

export const FIELD_ORDER = [
  "河川・砂防",
  "道路",
  "上水道",
  "下水道",
  "農業土木",
  "森林土木",
  "公園・緑地",
  "都市計画",
  "橋梁",
  "トンネル",
  "防災",
  "発注者支援",
  "施工監理",
  "測量",
  "地質地盤",
  "廃棄物",
  "測定・検査・調査",
  "設備設計",
  "補償",
  "その他",
];

export function sortByOrder(items: string[], order: string[]): string[] {
  return [...items].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b, "ja");
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

type DbRow = { [key: string]: unknown };

// ─── サーバーサイド: 全生データ取得 ───────────────────────

export async function fetchAllRawData(): Promise<RawDataResult> {
  const supabase = createServerClient();

  // Supabaseのデフォルト上限（1000行）を超えるためページネーション
  const fetchAll = async (table: string, select: string): Promise<DbRow[]> => {
    const PAGE = 1000;
    const all: DbRow[] = [];
    let from = 0;
    for (;;) {
      const { data, error } = await supabase
        .from(table)
        .select(select)
        .range(from, from + PAGE - 1);
      if (error || !data?.length) break;
      all.push(...(data as unknown as DbRow[]));
      if (data.length < PAGE) break;
      from += PAGE;
    }
    return all;
  };

  const citySelect =
    "調達機関名,入札方式,開札日,年度,予定価格,落札金額,落札業者名,分野分類,不調,落札率,調査価格率,課所名,調達案件名称";
  const kenSelect =
    "入札方式,開札日,年度,発注部局,発注方式,予定価格,落札金額,落札業者名,分野分類,不調,落札率,調査価格率,課所名,調達案件名称";

  const [cityRes, kenRes] = await Promise.all([
    fetchAll("city_rakusatsu", citySelect),
    fetchAll("ken_rakusatsu", kenSelect),
  ]);

  const cityRows: RawRow[] = cityRes.map((r) => ({
    source: "city" as const,
    year: (r["年度"] as number) || 0,
    date: (r["開札日"] as string) || "",
    issuer: (r["調達機関名"] as string) || "その他",
    field: (r["分野分類"] as string) || "その他",
    amount: r["落札金額"] as number | null,
    plannedPrice: r["予定価格"] as number | null,
    winRate: r["落札率"] as number | null,
    surveyRate: r["調査価格率"] as number | null,
    futeki: r["不調"] === true || r["不調"] === "true",
    company: r["落札業者名"] as string | null,
    procMethod: normalizeProcurement((r["入札方式"] || "") as string),
    kashoName: (r["課所名"] as string) || "",
    ankenName: (r["調達案件名称"] as string) || "",
  }));

  const kenRows: RawRow[] = kenRes.map((r) => ({
    source: "ken" as const,
    year: (r["年度"] as number) || 0,
    date: (r["開札日"] as string) || "",
    issuer: (r["発注部局"] as string) || "その他部局",
    field: (r["分野分類"] as string) || "その他",
    amount: r["落札金額"] as number | null,
    plannedPrice: r["予定価格"] as number | null,
    winRate: r["落札率"] as number | null,
    surveyRate: r["調査価格率"] as number | null,
    futeki: r["不調"] === true || r["不調"] === "true",
    company: r["落札業者名"] as string | null,
    procMethod: normalizeProcurement(
      ((r["発注方式"] || r["入札方式"] || "") as string)
    ),
    kashoName: (r["課所名"] as string) || "",
    ankenName: (r["調達案件名称"] as string) || "",
  }));

  const rows = [...cityRows, ...kenRows];

  const kenIssuers = [...new Set(kenRows.map((r) => r.issuer))]
    .filter(Boolean)
    .sort();
  const cityIssuers = [...new Set(cityRows.map((r) => r.issuer))]
    .filter(Boolean)
    .sort();
  const allFields = [...new Set(rows.map((r) => r.field))]
    .filter(Boolean)
    .sort();
  const allYears = ([
    ...new Set(rows.map((r) => r.year)),
  ] as number[])
    .filter(Boolean)
    .sort((a, b) => a - b);

  // 全データ中の最新開札日
  const latestDate = rows
    .map((r) => r.date)
    .filter(Boolean)
    .sort()
    .at(-1) ?? null;

  return { rows, kenIssuers, cityIssuers, allFields, allYears, latestDate };
}

// ─── クライアントサイド: フィルタ済み行から集計 ───────────

export function computeDashboardData(rows: RawRow[]): DashboardData {
  // フィルタ後データ内の年度一覧
  const years = ([...new Set(rows.map((r) => r.year))] as number[])
    .filter(Boolean)
    .sort((a, b) => a - b);

  // ── Summary ──
  const amounts = rows
    .map((r) => r.amount)
    .filter((v): v is number => v != null && v > 0);
  const totalAmount = amounts.reduce((s, v) => s + v, 0);
  const winRates = rows
    .filter((r) => !r.futeki)
    .map((r) => r.winRate)
    .filter((v): v is number => v != null);
  const surveyRates = rows
    .filter((r) => !r.futeki)
    .map((r) => r.surveyRate)
    .filter((v): v is number => v != null);

  const summary: SummaryData = {
    totalCases: rows.length,
    totalAmount: Math.round(totalAmount / 10000),
    avgAmount: amounts.length
      ? Math.round(totalAmount / amounts.length / 10000)
      : 0,
    futekiCount: rows.filter((r) => r.futeki).length,
    avgWinRate: pct(avg(winRates)),
    avgSurveyRate: pct(avg(surveyRates)),
  };

  // ── 月別グラフ ──
  const monthlyMap: Record<string, Record<number, number>> = {};
  FY_MONTH_ORDER.forEach((m) => {
    monthlyMap[`${m}月`] = {};
  });
  rows.forEach((r) => {
    if (!r.date) return;
    const m = new Date(r.date).getMonth() + 1;
    const fy = r.year;
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
  rows.forEach((r) => {
    const field = r.field || "その他";
    if (!fieldMap[field]) fieldMap[field] = { count: 0, amount: 0 };
    fieldMap[field].count++;
    if (r.amount) fieldMap[field].amount += r.amount;
  });
  const fields: FieldPoint[] = Object.entries(fieldMap)
    .map(([name, { count, amount }]) => ({
      name,
      count,
      amount: Math.round(amount / 10000),
    }))
    .sort((a, b) => b.count - a.count);

  // ── 自治体別 ──
  const muniMap: Record<string, number> = {};
  rows
    .filter((r) => r.source === "city")
    .forEach((r) => {
      if (r.issuer) muniMap[r.issuer] = (muniMap[r.issuer] || 0) + 1;
    });
  const municipalities: MunicipalityPoint[] = Object.entries(muniMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // ── 発注方式（県・自治体ともに入札方式を集計）──
  const procMap: Record<string, number> = {};
  rows.forEach((r) => {
    procMap[r.procMethod] = (procMap[r.procMethod] || 0) + 1;
  });
  const procurement: ProcurementPoint[] = Object.entries(procMap)
    .map(([method, count]) => ({ method, count }))
    .sort((a, b) => b.count - a.count);

  // ── 発注部局 ──
  const deptMap: Record<string, number> = {};
  rows
    .filter((r) => r.source === "ken")
    .forEach((r) => {
      const dept = r.issuer || "その他部局";
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });
  const departments: DepartmentPoint[] = Object.entries(deptMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // ── 落札率・調査価格率統計 ──
  const kenRows = rows.filter((r) => r.source === "ken");
  const cityRowsData = rows.filter((r) => r.source === "city");

  const kenRates = kenRows
    .filter((r) => !r.futeki && r.winRate != null)
    .map((r) => r.winRate as number);
  const cityRates = cityRowsData
    .filter((r) => !r.futeki && r.winRate != null)
    .map((r) => r.winRate as number);
  const kenSurveyRates = kenRows
    .filter((r) => r.surveyRate != null)
    .map((r) => r.surveyRate as number);
  const citySurveyRates = cityRowsData
    .filter((r) => r.surveyRate != null)
    .map((r) => r.surveyRate as number);

  const winRateStats: WinRateStats = {
    kenAvgRate: pct(avg(kenRates)),
    kenMedianRate: pct(median(kenRates)),
    cityAvgRate: pct(avg(cityRates)),
    cityMedianRate: pct(median(cityRates)),
    kenAvgSurveyRate: pct(avg(kenSurveyRates)),
    cityAvgSurveyRate: pct(avg(citySurveyRates)),
    kenNoPriceCount: kenRows.filter((r) => r.plannedPrice == null).length,
    cityNoPriceCount: cityRowsData.filter((r) => r.plannedPrice == null).length,
  };

  // ── 落札業者ランキング ──
  const companyMap: Record<string, { count: number; amount: number }> = {};
  rows
    .filter((r) => !r.futeki && r.company)
    .forEach((r) => {
      const name = normalizeCompany(r.company!);
      if (!name) return;
      if (!companyMap[name]) companyMap[name] = { count: 0, amount: 0 };
      companyMap[name].count++;
      if (r.amount) companyMap[name].amount += r.amount;
    });
  // 50件渡してコンポーネント側で「件数順／金額順」を切り替え
  const companies: CompanyPoint[] = Object.entries(companyMap)
    .map(([name, { count, amount }]) => ({
      name,
      count,
      totalAmount: Math.round(amount / 10000),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);

  // ── 県土整備事務所ランキング ──
  const kashoMap: Record<string, { count: number; amount: number }> = {};
  rows
    .filter((r) => r.source === "ken" && r.issuer === "県土整備部" && r.kashoName)
    .forEach((r) => {
      const k = r.kashoName;
      if (!kashoMap[k]) kashoMap[k] = { count: 0, amount: 0 };
      kashoMap[k].count++;
      if (r.amount) kashoMap[k].amount += r.amount;
    });
  const kashoRanking: KashoPoint[] = Object.entries(kashoMap)
    .map(([name, { count, amount }]) => ({
      name,
      count,
      amount: Math.round(amount / 10000),
    }))
    .sort((a, b) => b.count - a.count);

  // ── 大型案件ランキング（年度ごと上位10件）──
  const bigDealsRaw = rows
    .filter(
      (r) =>
        r.source === "ken" &&
        r.issuer === "県土整備部" &&
        r.plannedPrice &&
        r.ankenName
    )
    .map((r) => ({
      year: r.year,
      ankenName: r.ankenName,
      kashoName: r.kashoName || "",
      plannedPrice: Math.round(r.plannedPrice! / 10000),
      winner: r.company || null,
    }));
  const bigDealsByYear: Record<number, typeof bigDealsRaw> = {};
  bigDealsRaw.forEach((d) => {
    if (!bigDealsByYear[d.year]) bigDealsByYear[d.year] = [];
    bigDealsByYear[d.year].push(d);
  });
  const bigDeals: BigDealPoint[] = Object.values(bigDealsByYear).flatMap((arr) =>
    arr.sort((a, b) => b.plannedPrice - a.plannedPrice).slice(0, 10)
  );

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
    kashoRanking,
    bigDeals,
  };
}
