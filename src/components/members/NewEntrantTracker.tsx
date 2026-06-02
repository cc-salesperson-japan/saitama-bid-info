type Point = { company: string; first_year: number; recent_count: number };
type Props = { data: Point[]; maxYear: number };

export default function NewEntrantTracker({ data, maxYear }: Props) {
  return (
    <div className="bg-white rounded-xl p-5" style={{ border: "1px solid var(--border)", minHeight: 240 }}>
      <h2 className="text-sm font-semibold mb-1 text-[#1a1a1a]">新規参入トラッカー</h2>
      <p className="text-xs text-[#6b7280] mb-1">
        {maxYear}年度に初登場した業者（全期間データで判定）
      </p>
      <p className="text-[10px] text-[#9ca3af] mb-4">
        ※ 自治体案件の年度特定が不完全なため参考値
      </p>
      {data.length === 0 ? (
        <p className="text-xs text-[#9ca3af] text-center py-8">該当データなし</p>
      ) : (
        <div className="space-y-0.5">
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
