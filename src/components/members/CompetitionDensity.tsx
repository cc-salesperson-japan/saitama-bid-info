import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

type Point = { kikan_name: string; avg_competitors: number; total_cases: number };
type Props = { data: Point[] };

export default function CompetitionDensity({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.avg_competitors - a.avg_competitors).slice(0, 20);

  return (
    <div className="bg-white rounded-xl p-5" style={{ border: "1px solid var(--border)", minHeight: 300 }}>
      <h2 className="text-sm font-semibold mb-1 text-[#1a1a1a]">競合密度（機関別 平均参加業者数）</h2>
      <p className="text-xs text-[#6b7280] mb-4">1案件あたりの平均参加業者数。多いほど競争が激しい</p>
      {sorted.length === 0 ? (
        <p className="text-xs text-[#9ca3af] text-center py-8">データなし</p>
      ) : (
        <ResponsiveContainer width="100%" height={sorted.length * 30 + 20}>
          <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 50, left: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="kikan_name" width={160} tick={{ fontSize: 10, fill: "#4b5563" }} />
            <Tooltip contentStyle={{ border: "1px solid #e8e0d4", borderRadius: 8, fontSize: 11 }}
              formatter={(v, _, { payload }) => [`平均 ${v}社 / 全${payload.total_cases}案件`, "競合密度"]} />
            <Bar dataKey="avg_competitors" radius={[0, 3, 3, 0]}
              label={{ position: "right", fontSize: 10, fill: "#6b7280" }}>
              {sorted.map((d, i) => (
                <Cell key={i} fill={
                  d.avg_competitors >= 15 ? "#dc2626"
                  : d.avg_competitors >= 10 ? "#f97316"
                  : d.avg_competitors >= 5  ? "#2563eb" : "#93c5fd"
                } />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
