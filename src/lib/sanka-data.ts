import { createSupabaseServerClient } from "./supabase-server";

// ─── 型定義 ──────────────────────────────────────────────────

export type ParticipationPoint    = { company: string; cnt: number };
export type MatrixPoint           = { company: string; kikan_name: string; cnt: number };
export type WinRatePoint          = { company: string; participations: number; wins: number; win_rate: number };
export type DensityPoint          = { kikan_name: string; avg_competitors: number; total_cases: number };
export type CompMatrixPoint       = { kikan_name: string; field: string; avg_competitors: number; total_cases: number };
export type ActivityPoint         = { kikan_name: string; cnt: number };
export type SearchCompanyPoint    = { company: string; cnt: number };
export type NewEntrantPoint       = { company: string; first_year: number; recent_count: number };
export type ShimeiPoint           = { company: string; shimei_count: number; total_count: number; shimei_ratio: number };

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

// ─── RPC 呼び出し ─────────────────────────────────────────────

async function rpc<T>(name: string, params: Record<string, unknown> = {}): Promise<T[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc(name, params);
  if (error) {
    console.error(`RPC ${name} error:`, error.message);
    return [];
  }
  return (data ?? []) as T[];
}

export async function fetchMembersData(): Promise<MembersData> {
  const [
    participation,
    matrix,
    winRateAll,
    winRateQuality,
    density,
    compMatrix,
    newEntrants,
    shimei,
  ] = await Promise.all([
    rpc<ParticipationPoint>("members_participation_ranking", { lim: 30 }),
    rpc<MatrixPoint>("members_company_kikan_matrix", { top_n: 20 }),
    rpc<WinRatePoint>("members_win_rate_ranking", { min_count: 1 }),
    rpc<WinRatePoint>("members_win_rate_ranking", { min_count: 10 }),
    rpc<DensityPoint>("members_competition_density"),
    rpc<CompMatrixPoint>("members_competition_matrix"),
    rpc<NewEntrantPoint>("members_new_entrants"),
    rpc<ShimeiPoint>("members_shimei_companies", { lim: 30 }),
  ]);

  return {
    participation,
    matrix,
    winRateAll,
    winRateQuality,
    density,
    compMatrix,
    newEntrants,
    shimei,
  };
}

export async function fetchCompanyActivity(company: string): Promise<ActivityPoint[]> {
  return rpc<ActivityPoint>("members_company_activity", { cname: company });
}

export async function searchCompanies(query: string): Promise<SearchCompanyPoint[]> {
  if (query.length < 2) return [];
  return rpc<SearchCompanyPoint>("members_search_companies", { query, lim: 20 });
}
