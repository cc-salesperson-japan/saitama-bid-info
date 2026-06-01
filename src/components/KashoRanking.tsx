"use client";
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { KashoPoint } from "@/lib/data";

type Mode = "count" | "amount";
type Props = { data: KashoPoint[] };

/** 冗長なプレフィックスを除去。ただし「県土整備部　道路環境課」はそのまま残す */
function cleanName(name: string): string {
  // まず "埼玉県" を除去
  const s = name.replace(/^埼玉県[\s　]*/u, "").trim();
  // "県土整備部 道路環境課" はそのまま残す（全角・半角スペース両対応）
  if (/^県土整備部[\s　]*道路環境課$/u.test(s)) return s;
  // それ以外は "県土整備部" も除去
  return s.replace(/^県土整備部[\s　]*/u, "").trim();
}

export default function KashoRanking({ data }: Props) {
  const [mode, setMode] = useState<Mode>("count");

  const sorted = useMemo(
    () =>
      [...data]
        .sort((a, b) => (mode === "count" ? b.count - a.count : b.amount - a.amount))
        .slice(0, 15)
        .map((d) => ({ ...d, displayName: cleanName(d.name) })),
    [data, mode]
  );

  if (data.length === 0) return null;

  const unit = mode === "count" ? "件" : "万円";

  return (
    <div className="bg-white rounded-xl p-5" style={{ border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-sm font-semibold text-[#1a1a1a]">
          県土整備事務所 発注件数・発注金額ランキング
        </h2>
        <div className="flex gap-1.5 shrink-0">
          {(
            [
              { key: "count",  label: "発注件数" },
              { key: "amount", label: "発注金額" },
            ] as { key: Mode; label: string }[]
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

      <ResponsiveContainer width="100%" height={sorted.length * 32 + 48}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 0, right: 60, left: 0, bottom: 24 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) =>
              mode === "count"
                ? `${v}`
                : `${v.toLocaleString()}`
            }
            label={{
              value: `（${unit}）`,
              position: "insideBottomRight",
              offset: 0,
              fontSize: 10,
              fill: "#9ca3af",
            }}
          />
          <YAxis
            type="category"
            dataKey="displayName"
            width={170}
            tick={{ fontSize: 11, fill: "#4b5563" }}
          />
          <Tooltip
            contentStyle={{ border: "1px solid #e8e0d4", borderRadius: 8, fontSize: 11 }}
            formatter={(v) =>
              mode === "count"
                ? [`${Number(v).toLocaleString()}件`, "発注件数"]
                : [`${Number(v).toLocaleString()}万円`, "発注金額"]
            }
            labelFormatter={(label) => label}
          />
          <Bar dataKey={mode === "count" ? "count" : "amount"} radius={[0, 3, 3, 0]}>
            {sorted.map((_, i) => (
              <Cell key={i} fill={i === 0 ? "#1d4ed8" : i < 3 ? "#2563eb" : "#93c5fd"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
