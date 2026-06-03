"use client";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import type { FieldPoint } from "@/lib/data";

const FIELD_COLORS: Record<string, string> = {
  "河川・砂防":     "#22c55e",
  道路:             "#f59e0b",
  上水道:           "#3b82f6",
  下水道:           "#06b6d4",
  農業土木:         "#a16207",
  森林土木:         "#84cc16",
  造園:             "#10b981",
  都市計画:         "#8b5cf6",
  鋼コン:           "#ef4444",
  トンネル:         "#7c3aed",
  防災:             "#dc2626",
  発注者支援:       "#ec4899",
  施工監理:         "#f97316",
  測量:             "#eab308",
  地質地盤:         "#6366f1",
  廃棄物:           "#78716c",
  "測定・検査・調査": "#64748b",
  設備設計:         "#14b8a6",
  補償:             "#d97706",
  その他:           "#94a3b8",
};

function getColor(name: string): string {
  return FIELD_COLORS[name] ?? "#94a3b8";
}

type Props = { data: FieldPoint[]; issuerLabel?: string };

export default function FieldChart({ data, issuerLabel = "全機関" }: Props) {
  const [mode, setMode] = useState<"count" | "amount">("count");

  const sorted = [...data].sort((a, b) =>
    mode === "count" ? b.count - a.count : b.amount - a.amount
  );

  // 分野数に応じて高さを自動調整（1行30px + 余白）
  const chartHeight = Math.max(400, sorted.length * 30 + 60);

  return (
    <div
      className="bg-white rounded-xl p-5"
      style={{ border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#1a1a1a]">
          業種分野別　発注件数・発注金額（{issuerLabel}）
        </h2>
        <div className="flex gap-1">
          {(["count", "amount"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                mode === m
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-[#f0ece4] text-[#1a1a1a] hover:bg-[#ddd8cd]"
              }`}
            >
              {m === "count" ? "発注件数" : "発注金額"}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={sorted}
          layout="vertical"
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={85}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid #e8e0d4",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => {
              const n = Number(value ?? 0);
              return mode === "count"
                ? [`${n}件`, "件数"]
                : [`${n.toLocaleString()}万円`, "金額"];
            }}
          />
          <Bar dataKey={mode === "count" ? "count" : "amount"} radius={[0, 3, 3, 0]}>
            {sorted.map((entry) => (
              <Cell key={entry.name} fill={getColor(entry.name)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
