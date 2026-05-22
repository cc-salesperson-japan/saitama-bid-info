"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import type { MunicipalityPoint } from "@/lib/data";

type Props = { data: MunicipalityPoint[] };

export default function MunicipalityChart({ data }: Props) {
  return (
    <div
      className="bg-white rounded-xl p-5 h-full"
      style={{ border: "1px solid var(--border)" }}
    >
      <h2 className="text-sm font-semibold mb-4 text-[#1a1a1a]">
        自治体別 案件数（上位15）
      </h2>
      <ResponsiveContainer width="100%" height={Math.max(380, data.length * 26 + 40)}>
        <BarChart data={data} layout="vertical" barCategoryGap="20%">
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
            width={72}
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
            formatter={(value) => [`${Number(value ?? 0)}件`, "件数"]}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[0, 3, 3, 0]}>
            <LabelList
              dataKey="count"
              position="right"
              style={{ fontSize: 11, fill: "#6b7280" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
