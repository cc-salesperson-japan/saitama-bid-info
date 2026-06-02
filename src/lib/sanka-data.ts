import { createSupabaseServerClient } from "./supabase-server";

// ─── 型定義 ──────────────────────────────────────────────────

export type ParticipationPoint = { company: string; cnt: number };
export type MatrixPoint        = { company: string; kikan_name: string; cnt: number };
export type WinRatePoint       = { company: string; participations: number; wins: number; win_rate: number };
export type DensityPoint       = { kikan_name: string; avg_competitors: number; total_cases: number };
export type CompMatrixPoint    = { kikan_name: string; field: string; avg_competitors: number; total_cases: number };
export type ActivityPoint      = { kikan_name: string; cnt: number };
export type SearchCompanyPoint = { company: string; cnt: number };
export type NewEntrantPoint    = { company: string; first_year: number; recent_count: number };
export type ShimeiPoint        = { company: string; shimei_count: number; total_count: number; shimei_ratio: number };

export type MembersData = {
  participation:  ParticipationPoint[];
  matrix:         MatrixPoint[];
  winRateAll:     WinRatePoint[];
  winRateQuality: WinRatePoint[];
  density:        DensityPoint[];
  compMatrix:     CompMatrixPoint[];
  newEntrants:    NewEntrantPoint[];
  shimei:         ShimeiPoint[];
};

// ─── RPC ヘルパー（シンプルなクエリのみ）────────────────────

async function rpc<T>(name: string, params: Record<string, unknown> = {}): Promise<T[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc(name, params);
  if (error) {
    console.error(`RPC ${name} error:`, error.message);
    return [];
  }
  return (data ?? []) as T[];
}

// ─── REST APIページネーション取得 ────────────────────────────
// PostgREST は日本語カラム名を URL エンコードして正しく処理する

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function fetchAll<T>(
  supabase: SupabaseClient,
  table: string,
  select: string
): Promise<T[]> {
  const PAGE = 1000;
  const all: T[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + PAGE - 1);
    if (error || !data?.length) break;
    all.push(...(data as unknown as T[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

// ─── 生データ取得（③⑤⑥⑧ 用）────────────────────────────────

type KenMetaRow  = { "案件番号": string; "年度": number; "分野分類": string | null; "落札業者名": string | null };
type CityMetaRow = { "案件番号": string; "年度": number; "分野分類": string | null; "落札業者名": string | null };
type SankaRow    = { anken_no: string; kikan_name: string; company: string };

// ─── TypeScript 集計ロジック ─────────────────────────────────

/** ③/⑤ 勝率ランキング */
function computeWinRate(
  participation: ParticipationPoint[],
  kenMeta: KenMetaRow[],
  cityMeta: CityMetaRow[],
  minCount: number
): WinRatePoint[] {
  const winMap = new Map<string, number>();
  for (const row of [...kenMeta, ...cityMeta]) {
    const w = row["落札業者名"];
    if (w) winMap.set(w, (winMap.get(w) ?? 0) + 1);
  }

  return participation
    .filter((p) => p.cnt >= minCount)
    .map((p) => {
      const wins = winMap.get(p.company) ?? 0;
      return {
        company:       p.company,
        participations: p.cnt,
        wins,
        win_rate: Math.round((wins / p.cnt) * 1000) / 10,
      };
    })
    .sort((a, b) => b.win_rate - a.win_rate || b.participations - a.participations)
    .slice(0, 50);
}

/** ⑥ 競合密度マトリックス（機関×分野） */
function computeCompMatrix(
  sanka: SankaRow[],
  kenMeta: KenMetaRow[],
  cityMeta: CityMetaRow[]
): CompMatrixPoint[] {
  // anken_no → field マップ
  const fieldMap = new Map<string, string>();
  for (const row of [...kenMeta, ...cityMeta]) {
    const k = row["案件番号"];
    const f = row["分野分類"];
    if (k && f) fieldMap.set(k, f);
  }

  // 案件ごとの参加業者セット
  const caseMap = new Map<string, { kikan: string; field: string; companies: Set<string> }>();
  for (const row of sanka) {
    const field = fieldMap.get(row.anken_no);
    if (!field) continue;
    const key = `${row.anken_no}||${row.kikan_name}`;
    if (!caseMap.has(key)) {
      caseMap.set(key, { kikan: row.kikan_name, field, companies: new Set() });
    }
    caseMap.get(key)!.companies.add(row.company);
  }

  // kikan×field ごとに集計
  const aggMap = new Map<string, { sum: number; count: number }>();
  for (const { kikan, field, companies } of caseMap.values()) {
    const key = `${kikan}||${field}`;
    if (!aggMap.has(key)) aggMap.set(key, { sum: 0, count: 0 });
    const agg = aggMap.get(key)!;
    agg.sum   += companies.size;
    agg.count += 1;
  }

  return Array.from(aggMap.entries())
    .filter(([, agg]) => agg.count >= 2)
    .map(([key, { sum, count }]) => {
      const sep = key.indexOf("||");
      return {
        kikan_name:      key.slice(0, sep),
        field:           key.slice(sep + 2),
        avg_competitors: Math.round(sum / count * 10) / 10,
        total_cases:     count,
      };
    })
    .sort((a, b) => b.avg_competitors - a.avg_competitors);
}

/** ⑧ 新規参入トラッカー */
function computeNewEntrants(
  sanka: SankaRow[],
  kenMeta: KenMetaRow[],
  cityMeta: CityMetaRow[]
): NewEntrantPoint[] {
  const yearMap = new Map<string, number>();
  for (const row of [...kenMeta, ...cityMeta]) {
    const k = row["案件番号"];
    if (k && row["年度"]) yearMap.set(k, row["年度"]);
  }

  const companyYears = new Map<string, Set<number>>();
  for (const row of sanka) {
    const year = yearMap.get(row.anken_no);
    if (!year) continue;
    if (!companyYears.has(row.company)) companyYears.set(row.company, new Set());
    companyYears.get(row.company)!.add(year);
  }

  const allYears: number[] = [];
  companyYears.forEach((yrs) => yrs.forEach((y) => allYears.push(y)));
  if (!allYears.length) return [];
  const maxYear = Math.max(...allYears);

  const results: NewEntrantPoint[] = [];
  companyYears.forEach((years, company) => {
    if (Math.min(...years) !== maxYear) return;
    const recentCount = sanka.filter(
      (r) => r.company === company && yearMap.get(r.anken_no) === maxYear
    ).length;
    results.push({ company, first_year: maxYear, recent_count: recentCount });
  });

  return results.sort((a, b) => b.recent_count - a.recent_count).slice(0, 50);
}

// ─── メインデータ取得 ─────────────────────────────────────────

export async function fetchMembersData(): Promise<MembersData> {
  const supabase = await createSupabaseServerClient();

  // ①②④⑦⑨ → RPC で取得（日本語JOIN不要）
  // ③⑤⑥⑧ → REST API + TypeScript 集計（encoding 問題を回避）
  const [
    participation,       // ① 参加件数（表示用 top30）
    participationFull,   // ③⑤ 勝率計算用（top500）
    matrix,              // ②
    density,             // ④
    shimei,              // ⑨
    kenMeta,             // ③⑤⑥⑧ 用 ken生データ
    cityMeta,            // ③⑤⑥⑧ 用 city生データ
    sankaAll,            // ⑥⑧ 用 sanka生データ
  ] = await Promise.all([
    rpc<ParticipationPoint>("members_participation_ranking", { lim: 30 }),
    rpc<ParticipationPoint>("members_participation_ranking", { lim: 500 }),
    rpc<MatrixPoint>("members_company_kikan_matrix", { top_n: 20 }),
    rpc<DensityPoint>("members_competition_density"),
    rpc<ShimeiPoint>("members_shimei_companies", { lim: 30 }),
    fetchAll<KenMetaRow>(
      supabase, "ken_rakusatsu",
      "案件番号,年度,分野分類,落札業者名"
    ),
    fetchAll<CityMetaRow>(
      supabase, "city_rakusatsu",
      "案件番号,年度,分野分類,落札業者名"
    ),
    fetchAll<SankaRow>(
      supabase, "sanka_gyosha",
      "anken_no,kikan_name,company"
    ),
  ]);

  return {
    participation,
    matrix,
    density,
    shimei,
    winRateAll:     computeWinRate(participationFull, kenMeta, cityMeta, 1),
    winRateQuality: computeWinRate(participationFull, kenMeta, cityMeta, 10),
    compMatrix:     computeCompMatrix(sankaAll, kenMeta, cityMeta),
    newEntrants:    computeNewEntrants(sankaAll, kenMeta, cityMeta),
  };
}

// ─── ⑦ インタラクティブ検索（ブラウザ側 RPC 呼び出し）──────────

export async function fetchCompanyActivity(company: string): Promise<ActivityPoint[]> {
  return rpc<ActivityPoint>("members_company_activity", { cname: company });
}

export async function searchCompanies(query: string): Promise<SearchCompanyPoint[]> {
  if (query.length < 2) return [];
  return rpc<SearchCompanyPoint>("members_search_companies", { query, lim: 20 });
}
