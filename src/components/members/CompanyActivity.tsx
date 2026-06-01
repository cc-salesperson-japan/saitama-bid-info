"use client";
import { useState, useTransition } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { fetchCompanyActivityClient as fetchCompanyActivity, searchCompaniesClient as searchCompanies } from "@/lib/sanka-data-client";
import type { ActivityPoint, SearchCompanyPoint } from "@/lib/sanka-data";

export default function CompanyActivity() {
  const [query,    setQuery]    = useState("");
  const [options,  setOptions]  = useState<SearchCompanyPoint[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [activity, setActivity] = useState<ActivityPoint[]>([]);
  const [pending,  startTrans]  = useTransition();

  async function handleSearch(q: string) {
    setQuery(q);
    if (q.length < 2) { setOptions([]); return; }
    const res = await searchCompanies(q);
    setOptions(res);
  }

  async function handleSelect(company: string) {
    setSelected(company);
    setQuery(company);
    setOptions([]);
    startTrans(async () => {
      const res = await fetchCompanyActivity(company);
      setActivity(res);
    });
  }

  return (
    <div className="bg-white rounded-xl p-5" style={{ border: "1px solid var(--border)" }}>
      <h2 className="text-sm font-semibold mb-1 text-[#1a1a1a]">⑦ 業者の活動分布</h2>
      <p className="text-xs text-[#6b7280] mb-4">業者名を検索して、どの機関に何件参加しているかを確認</p>

      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="業者名を入力（例：日本水工）"
          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
          style={{ border: "1px solid var(--border)", backgroundColor: "#faf7f2" }}
        />
        {options.length > 0 && (
          <ul className="absolute z-20 w-full bg-white rounded-lg shadow-lg border border-[#e8e0d4] mt-1 max-h-48 overflow-y-auto">
            {options.map((o) => (
              <li
                key={o.company}
                onClick={() => handleSelect(o.company)}
                className="px-3 py-2 text-xs cursor-pointer hover:bg-[#f0f4ff] flex justify-between"
              >
                <span className="text-[#1a1a1a] truncate flex-1 mr-2">{o.company}</span>
                <span className="text-[#9ca3af] shrink-0">{o.cnt}件参加</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pending && <p className="text-xs text-[#9ca3af] text-center py-4">読み込み中…</p>}

      {!pending && selected && activity.length === 0 && (
        <p className="text-xs text-[#9ca3af] text-center py-4">データが見つかりません</p>
      )}

      {!pending && activity.length > 0 && (
        <>
          <p className="text-xs text-[#6b7280] mb-3">
            <span className="font-semibold text-[#1a1a1a]">{selected}</span> の機関別参加件数
            （合計 {activity.reduce((s, d) => s + d.cnt, 0)}件）
          </p>
          <ResponsiveContainer width="100%" height={Math.max(240, activity.length * 28 + 20)}>
            <BarChart data={activity} layout="vertical" margin={{ top: 0, right: 50, left: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="kikan_name" width={170} tick={{ fontSize: 10, fill: "#4b5563" }} />
              <Tooltip
                contentStyle={{ border: "1px solid #e8e0d4", borderRadius: 8, fontSize: 11 }}
                formatter={(v) => [`${v}件`]}
              />
              <Bar dataKey="cnt" fill="#2563eb" radius={[0, 3, 3, 0]}
                label={{ position: "right", fontSize: 10, fill: "#6b7280" }} />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}

      {!pending && !selected && (
        <p className="text-xs text-[#9ca3af] text-center py-8">
          業者名を入力して検索してください
        </p>
      )}
    </div>
  );
}
