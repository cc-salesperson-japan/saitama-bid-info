import { createSupabaseServerClient } from "./supabase-server";
import { KENTO_OFFICES } from "./data";

// ─── 型定義 ──────────────────────────────────────────────────

/** 年度・分野・issuerを付与済みの参加業者行 */
export type AnnotatedSankaRow = {
  anken_no:   string;
  kikan_name: string;  // "埼玉県" or 市区町村名
  company:    string;
  year:       number | null;
  field:      string | null;
  issuer:     string;  // 無料ページと同じ粒度: 県土整備部/下水道局…/市区町村名
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
      anken_no: string; anken_name: string; kikan_name: string;
      company: string; kasho_name: string;
    }>(supabase, "sanka_gyosha", "anken_no,anken_name,kikan_name,company,kasho_name"),

    fetchAll<{
      "案件番号": string; "年度": number; "分野分類": string | null;
      "落札業者名": string | null; "発注方式": string | null; "入札方式": string | null;
    }>(supabase, "ken_rakusatsu", "案件番号,年度,分野分類,落札業者名,発注方式,入札方式"),

    // 統一スキーマ: city も発注方式・案件番号が揃ったため ken と同じ形式で取得可能
    fetchAll<{
      "調達機関名": string; "調達案件名称": string; "案件番号": string | null;
      "年度": number; "分野分類": string | null; "落札業者名": string | null;
      "入札方式": string | null; "発注方式": string | null;
    }>(supabase, "city_rakusatsu", "調達機関名,調達案件名称,案件番号,年度,分野分類,落札業者名,入札方式,発注方式"),
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

  // ── 埼玉県の部局・事務所を kasho_name から抽出するヘルパー ───────
  function extractDept(kasho: string): string {
    // まず県土整備部の各事務所を確認（課所名に事務所名が含まれる場合）
    for (const office of (KENTO_OFFICES as readonly string[])) {
      if (kasho.includes(office)) return office;
    }
    // 他の部局
    const OTHER_DEPTS = ["下水道局", "企業局", "農林部", "都市整備部"];
    for (const dept of OTHER_DEPTS) {
      if (kasho.includes(dept)) return dept;
    }
    // 県土整備部だが具体的な事務所が特定できない場合
    if (kasho.includes("県土整備")) return "県土整備部（その他）";
    return "その他部局";
  }

  // ── sanka 行に year / field / issuer を付与 ─────────────────
  const sankaRows: AnnotatedSankaRow[] = sankaRaw.map((r) => {
    // issuer: 埼玉県 → kasho_name から部局名を抽出、自治体 → kikan_name
    const issuer = r.kikan_name === "埼玉県"
      ? extractDept(r.kasho_name ?? "")
      : r.kikan_name;

    // まず ken JOIN（anken_no一致）
    const ken = kenMap.get(r.anken_no);
    if (ken) return { ...r, issuer, year: ken.year, field: ken.field };

    // 次に city JOIN（kikan_name + anken_name 一致）
    const city = cityMap.get(`${r.kikan_name}||${r.anken_name}`);
    if (city) return { ...r, issuer, year: city.year, field: city.field };

    return { ...r, issuer, year: null, field: null };
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

  // ── 指名競争案件（ken + city 両方）────────────────────────
  const shimeiCases: ShimeiCaseRow[] = [
    // 埼玉県：発注方式 or 入札方式に「指名」を含む
    ...kenMetaRaw
      .filter((r) =>
        (r["発注方式"] ?? "").includes("指名") ||
        (r["入札方式"] ?? "").includes("指名")
      )
      .map((r) => ({ anken_no: r["案件番号"], year: r["年度"] })),
    // 自治体：発注方式 or 入札方式に「指名」を含む（案件番号で照合）
    ...cityMetaRaw
      .filter((r) =>
        ((r["発注方式"] ?? r["入札方式"] ?? "").includes("指名")) && r["案件番号"]
      )
      .map((r) => ({ anken_no: r["案件番号"]!, year: r["年度"] })),
  ];

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
