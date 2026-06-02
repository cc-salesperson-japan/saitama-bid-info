"use client";
import { useState } from "react";
import { YearFilter } from "./MembersDashboard";

type Point = { kikan_name: string; field: string; avg_competitors: number; total_cases: number };
type Props = { data: Point[]; years: number[]; year: string; onYearChange: (y: string) => void };

export default function CompetitionMatrix({ data, years, year, onYearChange }: Props) {
  const kikans = [...new Set(data.map((d) => d.kikan_name))].slice(0, 25);
  const fields = [...new Set(data.map((d) => d.field))];
  const [selKikan, setSelKikan] = useState<string | null>(null);
  const map = new Map(data.map((d) => [`${d.kikan_name}||${d.field}`, d]));
  const maxVal = Math.max(...data.map((d) => d.avg_competitors), 1);

  function bgColor(v: number | undefined) {
    if (!v) return "#f8fafc";
    const t = v / maxVal;
    return t > 0.7 ? "#dc2626" : t > 0.5 ? "#f97316" : t > 0.3 ? "#fbbf24" : t > 0.1 ? "#93c5fd" : "#dbeafe";
  }

  const displayKikans = selKikan ? [selKikan] : kikans;

  return (
    <div className="bg-white rounded-xl p-5" style={{ border: "1px solid var(--border)" }}>
      <h2 className="text-sm font-semibold mb-1 text-[#1a1a1a]">競合密度マトリックス（機関×分野）</h2>
      <p className="text-xs text-[#6b7280] mb-3">
        赤≥激戦 橙=高競合 黄=中競合 青=低競合。平均参加業者数
      </p>
      <YearFilter years={years} selected={year} onChange={onYearChange} />

      {data.length === 0 ? (
        <p className="text-xs text-[#9ca3af] text-center py-8">データなし</p>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-1">
            <button
              onClick={() => setSelKikan(null)}
              className={`text-[10px] px-2 py-0.5 rounded border cursor-pointer ${!selKikan ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "text-[#6b7280] border-[#e0dbd0]"}`}
            >全機関</button>
            {kikans.slice(0, 10).map((k) => (
              <button
                key={k}
                onClick={() => setSelKikan(k === selKikan ? null : k)}
                className={`text-[10px] px-2 py-0.5 rounded border cursor-pointer ${selKikan === k ? "bg-[#2563eb] text-white border-[#2563eb]" : "text-[#6b7280] border-[#e0dbd0]"}`}
              >
                {k.length > 8 ? k.slice(0, 7) + "…" : k}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="text-[9px] border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-white z-10 w-36" />
                  {fields.map((f) => (
                    <th
                      key={f}
                      className="text-[#6b7280] font-normal px-0.5"
                      style={{ writingMode: "vertical-rl", width: 28, height: 72, verticalAlign: "bottom" }}
                    >
                      {f.length > 7 ? f.slice(0, 6) + "…" : f}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayKikans.map((k) => (
                  <tr key={k}>
                    <td className="sticky left-0 bg-white z-10 py-0.5 px-1 text-[#1a1a1a] truncate max-w-[140px]">
                      {k.length > 14 ? k.slice(0, 13) + "…" : k}
                    </td>
                    {fields.map((f) => {
                      const d = map.get(`${k}||${f}`);
                      return (
                        <td
                          key={f}
                          title={d ? `${k} × ${f}: 平均${d.avg_competitors}社 (${d.total_cases}案件)` : undefined}
                          className="text-center text-[#1a1a1a]"
                          style={{ backgroundColor: bgColor(d?.avg_competitors), width: 28, height: 22 }}
                        >
                          {d && <span>{d.avg_competitors}</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
