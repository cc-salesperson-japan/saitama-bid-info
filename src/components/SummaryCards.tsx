import type { SummaryData } from "@/lib/data";

type Props = { data: SummaryData };

const fmt = (n: number) => n.toLocaleString("ja-JP");

/** ホバーで吹き出しを表示する「?」アイコン（純CSS、JSなし） */
function TooltipIcon({ text }: { text: string }) {
  return (
    <span className="relative group inline-flex items-center">
      <span
        className="ml-1 cursor-default text-[9px] text-[#9ca3af] border border-[#d1d5db] rounded-full w-3.5 h-3.5 inline-flex items-center justify-center leading-none select-none transition-colors group-hover:text-[#6b7280] group-hover:border-[#9ca3af]"
        aria-label={text}
      >
        ?
      </span>
      {/* 吹き出し本体 */}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-44 -translate-x-1/2 rounded-lg bg-[#1a1a1a] px-3 py-2 text-center text-xs leading-relaxed text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {text}
        {/* 下向き三角 */}
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#1a1a1a]" />
      </span>
    </span>
  );
}

export default function SummaryCards({ data }: Props) {
  const cards: {
    label: string;
    value: string;
    unit: string;
    color: string;
    tooltip?: string;
  }[] = [
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
      label: "平均落札率",
      value: data.avgWinRate != null ? data.avgWinRate.toFixed(1) : "—",
      unit: "%",
      color: "#1a1a1a",
      tooltip: "落札金額 ÷ 予定価格",
    },
    {
      label: "平均調査価格率",
      value: data.avgSurveyRate != null ? data.avgSurveyRate.toFixed(1) : "—",
      unit: "%",
      color: "#1a1a1a",
      tooltip: "調査基準等価格 ÷ 予定価格",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white rounded-xl p-4"
          style={{ border: "1px solid var(--border)" }}
        >
          <p className="text-xs text-[#6b7280] mb-1 flex items-center">
            {c.label}
            {c.tooltip && <TooltipIcon text={c.tooltip} />}
          </p>
          <p className="text-2xl font-bold leading-none" style={{ color: c.color }}>
            {c.value}
            <span className="text-sm font-normal ml-0.5">{c.unit}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
