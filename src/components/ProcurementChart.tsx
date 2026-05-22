"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { ProcurementPoint } from "@/lib/data";

const METHOD_COLORS: Record<string, string> = {
  総合評価: "#3b82f6",
  "一般競争（ダイレクト）": "#8b5cf6",
  指名競争: "#22c55e",
  随意契約: "#f59e0b",
  プロポーザル: "#ec4899",
  その他: "#94a3b8",
};

type Props = { data: ProcurementPoint[]; issuerLabel?: string };

export default function ProcurementChart({ data, issuerLabel = "全機関" }: Props) {
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div
      className="bg-white rounded-xl p-5"
      style={{ border: "1px solid var(--border)" }}
    >
      <h2 className="text-sm font-semibold mb-1 text-[#1a1a1a]">
        発注方式（{issuerLabel}）
      </h2>

      {/* 埼玉県データなし時のメッセージ */}
      {data.length === 0 ? (
        <p className="text-xs text-[#6b7280] text-center py-12 leading-relaxed">
          このグラフは埼玉県の発注データが対象です。
          <br />
          発注者フィルターで埼玉県の部局を
          <br />
          1つ以上選択してください。
        </p>
      ) : (
        <>
          {/* 凡例 */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
            {data.map((d) => (
              <div key={d.method} className="flex items-center gap-1">
                <div
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: METHOD_COLORS[d.method] ?? "#94a3b8" }}
                />
                <span className="text-xs text-[#6b7280]">
                  {d.method}{" "}
                  {total ? Math.round((d.count / total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>

          {/* ドーナツ */}
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="method"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {data.map((d) => (
                  <Cell
                    key={d.method}
                    fill={METHOD_COLORS[d.method] ?? "#94a3b8"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  border: "1px solid #e8e0d4",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value, name) => [`${Number(value ?? 0)}件`, String(name)]}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* 件数テーブル */}
          <div className="mt-2 space-y-1">
            {data.map((d) => (
              <div
                key={d.method}
                className="flex justify-between text-xs py-0.5"
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: METHOD_COLORS[d.method] ?? "#94a3b8" }}
                  />
                  <span className="text-[#1a1a1a]">{d.method}</span>
                </div>
                <span className="font-medium text-[#1a1a1a]">
                  {d.count.toLocaleString()}件
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
