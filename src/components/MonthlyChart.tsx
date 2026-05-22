"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyPoint } from "@/lib/data";

const FY_COLORS: Record<number, string> = {
  2024: "#3b82f6",
  2025: "#22c55e",
  2026: "#f59e0b",
};

type Props = {
  data: MonthlyPoint[];
  years: number[];
};

export default function MonthlyChart({ data, years }: Props) {
  return (
    <div
      className="bg-white rounded-xl p-5 mb-4"
      style={{ border: "1px solid var(--border)" }}
    >
      <h2 className="text-sm font-semibold mb-4 text-[#1a1a1a]">
        月別 開札件数
      </h2>
      <div className="flex gap-4 mb-3">
        {years.map((fy) => (
          <div key={fy} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: FY_COLORS[fy] || "#94a3b8" }}
            />
            <span className="text-xs text-[#6b7280]">{fy}年度</span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barGap={2} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0ece4" vertical={false} />
          <XAxis
            dataKey="monthLabel"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            width={35}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid #e8e0d4",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value, name) => [
              `${Number(value ?? 0)}件`,
              String(name).replace("fy", "") + "年度",
            ]}
          />
          {years.map((fy) => (
            <Bar
              key={fy}
              dataKey={`fy${fy}`}
              name={`fy${fy}`}
              fill={FY_COLORS[fy] || "#94a3b8"}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
