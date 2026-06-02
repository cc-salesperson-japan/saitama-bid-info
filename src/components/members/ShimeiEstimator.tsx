"use client";
import { useState } from "react";

type Point = { company: string; shimei_count: number; total_count: number; shimei_ratio: number };
type Props = { data: Point[] };
type SortKey = "shimei_count" | "shimei_ratio";

export default function ShimeiEstimator({ data }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("shimei_count");
  const sorted = [...data].sort((a, b) => b[sortKey] - a[sortKey]);
  const left  = sorted.slice(0, 15);
  const right = sorted.slice(15, 30);

  return (
    <div className="bg-white rounded-xl p-5" style={{ border: "1px solid var(--border)", minHeight: 300 }}>
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
      <p className="text-xs text-[#6b7280] mb-4">
        埼玉県の指名競争案件への参加実績から「実質的な指名リスト」を逆算
      </p>

      {sorted.length === 0 ? (
        <p className="text-xs text-[#9ca3af] text-center py-8">データなし</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {[left, right].map((col, ci) => (
              <div key={ci}>
                <div className="flex text-[10px] text-[#9ca3af] pb-1 border-b border-[#e8e0d4] mb-1">
                  <span className="w-5" />
                  <span className="flex-1">業者名</span>
                  <span className="w-14 text-right">指名参加</span>
                  <span className="w-14 text-right">指名率</span>
                </div>
                {col.map((d, i) => (
                  <div key={d.company} className="flex items-center py-1.5 border-b border-[#f0ece4] last:border-0 text-xs">
                    <span className="text-[#9ca3af] w-5 text-right shrink-0">{ci * 15 + i + 1}</span>
                    <span className="text-[#1a1a1a] flex-1 truncate mx-2">{d.company}</span>
                    <span className="font-semibold text-[#1a1a1a] w-14 text-right shrink-0">{d.shimei_count}</span>
                    <span className="w-14 text-right shrink-0"
                      style={{ color: d.shimei_ratio >= 50 ? "#dc2626" : d.shimei_ratio >= 30 ? "#f97316" : "#6b7280" }}>
                      {d.shimei_ratio}%
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[#9ca3af] mt-3">
            ※ 埼玉県の指名競争案件の入札経過から集計。実際の指名通知書とは異なる場合があります。
          </p>
        </>
      )}
    </div>
  );
}
