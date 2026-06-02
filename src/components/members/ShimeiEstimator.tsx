"use client";
import { useState } from "react";

type Point      = { company: string; shimei_count: number; total_count: number; shimei_ratio: number };
type KikanPoint = { kikan_name: string; case_count: number };
type Props = { data: Point[]; byKikan: KikanPoint[] };
type SortKey = "shimei_count" | "shimei_ratio";

export default function ShimeiEstimator({ data, byKikan }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("shimei_count");
  const sorted = [...data].sort((a, b) => b[sortKey] - a[sortKey]);

  return (
    <div className="bg-white rounded-xl p-5 space-y-5" style={{ border: "1px solid var(--border)", minHeight: 300 }}>
      {/* 業者別 */}
      <div>
        <div className="flex items-center justify-between mb-1 gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-[#1a1a1a]">指名業者リスト推定</h2>
          <div className="flex gap-1.5">
            {([
              { k: "shimei_count", label: "指名参加数" },
              { k: "shimei_ratio", label: "指名率" },
            ] as { k: SortKey; label: string }[]).map(({ k, label }) => (
              <button key={k} onClick={() => setSortKey(k)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                  sortKey === k ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                               : "text-[#6b7280] border-[#e0dbd0] hover:border-[#1a1a1a]"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-[#6b7280] mb-3">埼玉県の指名競争案件への参加実績から逆算</p>

        {sorted.length === 0 ? (
          <p className="text-xs text-[#9ca3af] text-center py-4">データなし</p>
        ) : (
          <>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#e8e0d4]">
                  <th className="text-left py-1.5 text-[#6b7280] font-normal w-6">#</th>
                  <th className="text-left py-1.5 text-[#6b7280] font-normal">業者名</th>
                  <th className="text-right py-1.5 text-[#6b7280] font-normal w-16">指名参加</th>
                  <th className="text-right py-1.5 text-[#6b7280] font-normal w-14">指名率</th>
                </tr>
              </thead>
              <tbody>
                {sorted.slice(0, 20).map((d, i) => (
                  <tr key={d.company} className="border-b border-[#f0ece4] last:border-0">
                    <td className="py-1.5 text-[#9ca3af]">{i + 1}</td>
                    <td className="py-1.5 text-[#1a1a1a] truncate max-w-[180px]">{d.company}</td>
                    <td className="py-1.5 text-right font-semibold text-[#1a1a1a]">{d.shimei_count}</td>
                    <td className="py-1.5 text-right"
                      style={{ color: d.shimei_ratio >= 50 ? "#dc2626" : d.shimei_ratio >= 30 ? "#f97316" : "#6b7280" }}>
                      {d.shimei_ratio}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-[#9ca3af] mt-2">
              ※ 指名通知書の非公開情報のため参考値
            </p>
          </>
        )}
      </div>

      {/* 機関別指名件数 */}
      {byKikan.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-[#1a1a1a] mb-2">機関別 指名案件数</h3>
          <div className="space-y-1">
            {byKikan.slice(0, 10).map((d, i) => (
              <div key={d.kikan_name} className="flex items-center gap-2 py-1 border-b border-[#f0ece4] last:border-0">
                <span className="text-xs text-[#9ca3af] w-4 text-right shrink-0">{i + 1}</span>
                <span className="text-xs text-[#1a1a1a] flex-1 truncate">{d.kikan_name}</span>
                <span className="text-xs font-medium text-[#1a1a1a] shrink-0">{d.case_count}件</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
