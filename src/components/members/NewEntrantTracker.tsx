import { YearFilter } from "./MembersDashboard";

type Point = { company: string; first_year: number; recent_count: number };
type Props = { data: Point[]; years: number[]; year: string; onYearChange: (y: string) => void };

export default function NewEntrantTracker({ data, years, year, onYearChange }: Props) {
  const maxYear = data[0]?.first_year;

  return (
    <div className="bg-white rounded-xl p-5" style={{ border: "1px solid var(--border)" }}>
      <h2 className="text-sm font-semibold mb-1 text-[#1a1a1a]">新規参入トラッカー</h2>
      <p className="text-xs text-[#6b7280] mb-3">
        {maxYear ? `${maxYear}年度に初登場した業者（前年度以前に参加実績なし）` : "データを読み込み中"}
      </p>
      <YearFilter years={years} selected={year} onChange={onYearChange} />

      {data.length === 0 ? (
        <p className="text-xs text-[#9ca3af] text-center py-8">該当データなし</p>
      ) : (
        <div className="grid grid-cols-1 gap-0.5">
          {data.slice(0, 20).map((d, i) => (
            <div key={d.company} className="flex items-center gap-2 py-1.5 border-b border-[#f0ece4] last:border-0">
              <span className="text-xs text-[#9ca3af] w-5 text-right shrink-0">{i + 1}</span>
              <span className="text-xs text-[#1a1a1a] flex-1 truncate">{d.company}</span>
              <span className="text-xs text-[#2563eb] font-medium shrink-0">{d.recent_count}件</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
