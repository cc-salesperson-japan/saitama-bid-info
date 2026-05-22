import type { SummaryData } from "@/lib/data";

type Props = { data: SummaryData };

const fmt = (n: number) => n.toLocaleString("ja-JP");

export default function SummaryCards({ data }: Props) {
  const cards = [
    {
      label: "総案件数",
      value: fmt(data.totalCases),
      unit: "件",
      color: "#1a1a1a",
    },
    {
      label: "落札金額合計",
      value: fmt(data.totalAmount),
      unit: "万円",
      color: "#1a1a1a",
    },
    {
      label: "平均落札金額",
      value: fmt(data.avgAmount),
      unit: "万円",
      color: "#1a1a1a",
    },
    {
      label: "不調件数",
      value: fmt(data.futekiCount),
      unit: "件",
      color: "#f97316",
    },
    {
      label: "平均落札率",
      value: data.avgWinRate != null ? data.avgWinRate.toFixed(1) : "—",
      unit: "%",
      color: "#1a1a1a",
    },
    {
      label: "平均調査価格率",
      value: data.avgSurveyRate != null ? data.avgSurveyRate.toFixed(1) : "—",
      unit: "%",
      color: "#1a1a1a",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white rounded-xl p-4"
          style={{ border: "1px solid var(--border)" }}
        >
          <p className="text-xs text-[#6b7280] mb-1">{c.label}</p>
          <p className="text-2xl font-bold leading-none" style={{ color: c.color }}>
            {c.value}
            <span className="text-sm font-normal ml-0.5">{c.unit}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
