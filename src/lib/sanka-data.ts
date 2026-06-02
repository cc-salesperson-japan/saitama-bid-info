import { createSupabaseServerClient } from "./supabase-server";

// ─── 型定義 ──────────────────────────────────────────────────

/** 年度・分野を付与済みの参加業者行 */
export type AnnotatedSankaRow = {
  anken_no:   string;
  kikan_name: string;
  company:    string;
  year:       number | null;
  field:      string | null;
};

/** 勝率計算用（落札業者・年度） */
export type WinDataRow = { company: string; year: number };

/** 指名競争案件（埼玉県のみ） */
export type ShimeiCaseRow = { anken_no: string; year: number };

/** fetchMembersData の戻り値 */
export type MembersRawData = {
  sankaRows:      AnnotatedSankaRow[];
  winRows:        WinDataRow[];
  shimeiCases:    ShimeiCaseRow[];
  availableYears: number[];
};

// ─── 旧型（⑦ RPC 用に残す）────────────────────────────────
export type ActivityPoint      = { kikan_name: string; cnt: number };
export type SearchCompanyPoint = { company: string; cnt: number };

// ─── REST APIページネーション取得 ────────────────────────────

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

// ─── メインデータ取得 ─────────────────────────────────────────

export async function fetchMembersData(): Promise<MembersRawData> {
  const supabase = await createSupabaseServerClient();

  // 並列取得
  // city_rakusatsu には案件番号がないため (調達機関名+調達案件名称) でJOIN
  const [sankaRaw, kenMetaRaw, cityMetaRaw] = await Promise.all([
    fetchAll<{
      anken_no: string; anken_name: string; kikan_name: string; company: string;
    }>(supabase, "sanka_gyosha", "anken_no,anken_name,kikan_name,company"),

    fetchAll<{
      "案件番号": string; "年度": number; "分野分類": string | null;
      "落札業者名": string | null; "発注方式": string | null; "入札方式": string | null;
    }>(supabase, "ken_rakusatsu", "案件番号,年度,分野分類,落札業者名,発注方式,入札方式"),

    fetchAll<{
      "調達機関名": string; "調達案件名称": string; "年度": number;
      "分野分類": string | null; "落札業者名": string | null; "入札方式": string | null;
    }>(supabase, "city_rakusatsu", "調達機関名,調達案件名称,年度,分野分類,落札業者名,入札方式"),
  ]);

  // ── JOINマップ構築 ─────────────────────────────────────────

  // ken: anken_no → { year, field }
  const kenMap = new Map<string, { year: number; field: string | null }>();
  for (const r of kenMetaRaw) {
    if (r["案件番号"]) kenMap.set(r["案件番号"], { year: r["年度"], field: r["分野分類"] });
  }

  // city: "kikan||anken_name" → { year, field }
  const cityMap = new Map<string, { year: number; field: string | null }>();
  for (const r of cityMetaRaw) {
    const key = `${r["調達機関名"]}||${r["調達案件名称"]}`;
    cityMap.set(key, { year: r["年度"], field: r["分野分類"] });
  }

  // ── sanka 行に year / field を付与 ───────────────────────────
  const sankaRows: AnnotatedSankaRow[] = sankaRaw.map((r) => {
    // まず ken JOIN（anken_no一致）
    const ken = kenMap.get(r.anken_no);
    if (ken) return { ...r, year: ken.year, field: ken.field };

    // 次に city JOIN（kikan_name + anken_name 一致）
    const city = cityMap.get(`${r.kikan_name}||${r.anken_name}`);
    if (city) return { ...r, year: city.year, field: city.field };

    return { ...r, year: null, field: null };
  });

  // ── 落札業者データ（勝率計算用）────────────────────────────
  const winRows: WinDataRow[] = [
    ...kenMetaRaw
      .filter((r) => r["落札業者名"])
      .map((r) => ({ company: r["落札業者名"]!, year: r["年度"] })),
    ...cityMetaRaw
      .filter((r) => r["落札業者名"])
      .map((r) => ({ company: r["落札業者名"]!, year: r["年度"] })),
  ];

  // ── 指名競争案件（埼玉県のみ）────────────────────────────
  const shimeiCases: ShimeiCaseRow[] = kenMetaRaw
    .filter(
      (r) =>
        (r["発注方式"] ?? "").includes("指名") ||
        (r["入札方式"] ?? "").includes("指名")
    )
    .map((r) => ({ anken_no: r["案件番号"], year: r["年度"] }));

  // ── 利用可能な年度 ──────────────────────────────────────────
  const yearSet = new Set<number>();
  sankaRows.forEach((r) => { if (r.year) yearSet.add(r.year); });
  const availableYears = [...yearSet].sort((a, b) => a - b);

  return { sankaRows, winRows, shimeiCases, availableYears };
}

// ─── ⑦ インタラクティブ検索（ブラウザ側 RPC）──────────────────

async function rpc<T>(name: string, params: Record<string, unknown> = {}): Promise<T[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc(name, params);
  if (error) { console.error(`RPC ${name}:`, error.message); return []; }
  return (data ?? []) as T[];
}

export async function fetchCompanyActivity(company: string): Promise<ActivityPoint[]> {
  return rpc<ActivityPoint>("members_company_activity", { cname: company });
}

export async function searchCompanies(query: string): Promise<SearchCompanyPoint[]> {
  if (query.length < 2) return [];
  return rpc<SearchCompanyPoint>("members_search_companies", { query, lim: 20 });
}
