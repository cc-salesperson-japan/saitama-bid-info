import { createSupabaseBrowserClient } from "./supabase-browser";
import type { ActivityPoint, SearchCompanyPoint } from "./sanka-data";

/** ブラウザ（クライアントコンポーネント）からRPC呼び出し */
export async function fetchCompanyActivityClient(company: string): Promise<ActivityPoint[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("members_company_activity", { cname: company });
  if (error) { console.error(error.message); return []; }
  return (data ?? []) as ActivityPoint[];
}

export async function searchCompaniesClient(query: string): Promise<SearchCompanyPoint[]> {
  if (query.length < 2) return [];
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("members_search_companies", { query, lim: 20 });
  if (error) { console.error(error.message); return []; }
  return (data ?? []) as SearchCompanyPoint[];
}
