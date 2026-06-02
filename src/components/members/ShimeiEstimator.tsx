"use client";
import { useState } from "react";
import { YearFilter } from "./MembersDashboard";

type Point = { company: string; shimei_count: number; total_count: number; shimei_ratio: number };
type Props = { data: Point[]; years: number[]; year: string; onYearChange: (y: string) => void };

type SortKey = "shimei_count" | "shimei_ratio";

export default function ShimeiEstimator({ data, years, year, onYearChange }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("shimei_count");

  const sorted = [...data].sort((a, b) => b[sortKey] - a[sortKey]);

  return (
    <div className="bg-white rounded-xl p-5" style={{ border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-1 gap-3 flex-wrap">
        <h2 className="text-sm font-semibold text-[#1a1a1a]">指名業者リスト推定</h2>
        <div className="flex gap-1.5">
          {([
            { k: "shimei_count", label: "指名参加数" },
            { k: "shimei_ratio", label: "指名率" },
          ] as { k: SortKey; label: string }[]).map(({ k, label }) => (
            <button
              key={k}
              onClick={() => setSortKey(k)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                sortKey === k
                  ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                  : "text-[#6b7280] border-[#e0dbd0] hover:border-[#1a1a1a]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-[#6b7280] mb-3">
        埼玉県の指名競争案件への参加実績から「実質的な指名リスト」を逆算
      </p>
      <YearFilter years={years} selected={year} onChange={onYearChange} />

      {sorted.length === 0 ? (
        <p className="text-xs text-[#9ca3af] text-center py-8">データなし</p>
      ) : (
        <>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#e8e0d4]">
                <th className="text-left py-1.5 text-[#6b7280] font-normal w-6">#</th>
                <th className="text-left py-1.5 text-[#6b7280] font-normal">業者名</th>
                <th className="text-right py-1.5 text-[#6b7280] font-normal w-16">指名参加</th>
                <th className="text-right py-1.5 text-[#6b7280] font-normal w-14">総参加</th>
                <th className="text-right py-1.5 text-[#6b7280] font-normal w-14">指名率</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((d, i) => (
                <tr key={d.company} className="border-b border-[#f0ece4] last:border-0">
                  <td className="py-1.5 text-[#9ca3af]">{i + 1}</td>
                  <td className="py-1.5 text-[#1a1a1a] truncate max-w-[200px]">{d.company}</td>
                  <td className="py-1.5 text-right font-semibold text-[#1a1a1a]">{d.shimei_count}</td>
                  <td className="py-1.5 text-right text-[#6b7280]">{d.total_count}</td>
                  <td
                    className="py-1.5 text-right"
                    style={{ color: d.shimei_ratio >= 50 ? "#dc2626" : d.shimei_ratio >= 30 ? "#f97316" : "#6b7280" }}
                  >
                    {d.shimei_ratio}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-[#9ca3af] mt-3">
            ※ 埼玉県の指名競争案件の入札経過から参加業者を集計。実際の指名通知書とは異なる場合があります。
          </p>
        </>
      )}
    </div>
  );
}
