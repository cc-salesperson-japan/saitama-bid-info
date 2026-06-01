"use client";
import { useState, useMemo } from "react";
import type { BigDealPoint } from "@/lib/data";

type Props = { data: BigDealPoint[]; availableYears: number[] };

export default function BigDealsChart({ data, availableYears }: Props) {
  const defaultYear = availableYears.at(-1) ?? 0;
  const [year, setYear] = useState(defaultYear);

  const deals = useMemo(
    () =>
      data
        .filter((d) => d.year === year)
        .sort((a, b) => b.plannedPrice - a.plannedPrice)
        .slice(0, 10),
    [data, year]
  );

  if (data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-5" style={{ border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h2 className="text-sm font-semibold text-[#1a1a1a]">
          県土整備部 大型案件 TOP10
        </h2>
        <div className="flex gap-1">
          {availableYears.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                year === y
                  ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                  : "text-[#6b7280] border-[#e0dbd0] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
              }`}
            >
              {y}年度
            </button>
          ))}
        </div>
      </div>

      {deals.length === 0 ? (
        <p className="text-xs text-[#9ca3af] text-center py-8">
          {year}年度のデータがありません
        </p>
      ) : (
        <ol className="space-y-2">
          {deals.map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-xs py-1.5 border-b border-[#f0ece4] last:border-0">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                style={{
                  backgroundColor: i === 0 ? "#1d4ed8" : i < 3 ? "#93c5fd" : "#f0f4ff",
                  color: i < 3 ? "white" : "#3730a3",
                }}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[#1a1a1a] leading-relaxed line-clamp-2">{d.ankenName}</p>
                <p className="text-[#9ca3af] text-[10px] mt-0.5 truncate">{d.kashoName}</p>
              </div>
              <span className="font-semibold text-[#2563eb] shrink-0 whitespace-nowrap">
                {d.plannedPrice.toLocaleString()}万
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
