"use client";
import { useState, useMemo } from "react";
import type { CompanyPoint } from "@/lib/data";

type SortMode = "count" | "amount";
type Props = { data: CompanyPoint[]; issuerLabel?: string };

export default function CompanyRanking({ data, issuerLabel = "全機関" }: Props) {
  const [mode, setMode] = useState<SortMode>("count");

  // モードに応じてソート → 上位20件に絞る
  const ranked = useMemo(() => {
    return [...data]
      .sort((a, b) =>
        mode === "count"
          ? b.count - a.count
          : b.totalAmount - a.totalAmount
      )
      .slice(0, 20);
  }, [data, mode]);

  const left  = ranked.slice(0, 10);
  const right = ranked.slice(10, 20);

  const modeLabel = mode === "count" ? "件数" : "金額";

  return (
    <div
      className="bg-white rounded-xl p-5"
      style={{ border: "1px solid var(--border)" }}
    >
      {/* タイトル + 切り替えボタン */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-sm font-semibold text-[#1a1a1a]">
          落札業者ランキング（{modeLabel}上位20・{issuerLabel}合算）
        </h2>
        <div className="flex gap-1.5 shrink-0">
          {(
            [
              { key: "count",  label: "受注件数" },
              { key: "amount", label: "受注金額" },
            ] as { key: SortMode; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                mode === key
                  ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                  : "text-[#6b7280] border-[#e0dbd0] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ランキング表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        {[left, right].map((col, ci) => (
          <div key={ci} className="space-y-1">
            {col.map((c, i) => {
              const rank = ci * 10 + i + 1;
              return (
                <div
                  key={c.name}
                  className="flex items-center gap-2 py-1.5 border-b border-[#f0ece4] last:border-0"
                >
                  <span className="text-xs text-[#6b7280] w-5 text-right shrink-0">
                    {rank}
                  </span>
                  <span className="text-xs text-[#1a1a1a] flex-1 truncate">
                    {c.name}
                  </span>
                  {/* 選択中の指標を強調 */}
                  <span
                    className={`text-xs w-12 text-right shrink-0 ${
                      mode === "count"
                        ? "font-semibold text-[#1a1a1a]"
                        : "text-[#6b7280]"
                    }`}
                  >
                    {c.count}件
                  </span>
                  <span
                    className={`text-xs w-20 text-right shrink-0 ${
                      mode === "amount"
                        ? "font-semibold text-[#f97316]"
                        : "text-[#f97316]"
                    }`}
                  >
                    {c.totalAmount.toLocaleString()}万
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
