"use client";
import { useState } from "react";
import { YearFilter } from "./MembersDashboard";

type Point = { company: string; participations: number; wins: number; win_rate: number };
type Props = {
  dataAll: Point[]; dataQuality: Point[];
  years: number[]; year: string; onYearChange: (y: string) => void;
};

export default function WinRateRanking({ dataAll, dataQuality, years, year, onYearChange }: Props) {
  const [mode, setMode] = useState<"all" | "quality">("quality");
  const data = mode === "all" ? dataAll : dataQuality;

  return (
    <div className="bg-white rounded-xl p-5" style={{ border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-1 gap-3 flex-wrap">
        <h2 className="text-sm font-semibold text-[#1a1a1a]">勝率ランキング</h2>
        <div className="flex gap-1.5">
          {([
            { k: "quality", label: "10件以上参加" },
            { k: "all",     label: "全業者" },
          ] as const).map(({ k, label }) => (
            <button
              key={k}
              onClick={() => setMode(k)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                mode === k
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
        落札件数 ÷ 参加件数 ＝ 勝率。
        {mode === "quality" ? "参加10件以上の業者のみ表示（精度重視）" : "参加1件以上の全業者"}
      </p>
      <YearFilter years={years} selected={year} onChange={onYearChange} />

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#e8e0d4]">
              <th className="text-left py-1.5 text-[#6b7280] font-normal w-6">#</th>
              <th className="text-left py-1.5 text-[#6b7280] font-normal">業者名</th>
              <th className="text-right py-1.5 text-[#6b7280] font-normal w-14">参加</th>
              <th className="text-right py-1.5 text-[#6b7280] font-normal w-14">落札</th>
              <th className="text-right py-1.5 text-[#6b7280] font-normal w-16">勝率</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 30).map((d, i) => (
              <tr key={d.company} className="border-b border-[#f0ece4] last:border-0">
                <td className="py-1 text-[#9ca3af]">{i + 1}</td>
                <td className="py-1 text-[#1a1a1a] truncate max-w-[200px]">{d.company}</td>
                <td className="py-1 text-right text-[#6b7280]">{d.participations}</td>
                <td className="py-1 text-right text-[#6b7280]">{d.wins}</td>
                <td
                  className="py-1 text-right font-semibold"
                  style={{ color: d.win_rate >= 50 ? "#166534" : d.win_rate >= 20 ? "#1d4ed8" : "#6b7280" }}
                >
                  {d.win_rate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
