import type { CompanyPoint } from "@/lib/data";

type Props = { data: CompanyPoint[] };

export default function CompanyRanking({ data }: Props) {
  // 10件ずつ左右に分割
  const left = data.slice(0, 10);
  const right = data.slice(10, 20);

  return (
    <div
      className="bg-white rounded-xl p-5"
      style={{ border: "1px solid var(--border)" }}
    >
      <h2 className="text-sm font-semibold mb-4 text-[#1a1a1a]">
        落札業者ランキング（件数上位20・県＋自治体合算）
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        {[left, right].map((col, ci) => (
          <div key={ci} className="space-y-1">
            {col.map((c, i) => {
              const rank = ci * 10 + i + 1;
              return (
                <div
                  key={c.name}
                  className="flex items-center gap-2 py-1.5 border-b border-[#f0ece4] last:border-0"
                >
                  <span className="text-xs text-[#6b7280] w-5 text-right">
                    {rank}
                  </span>
                  <span className="text-xs text-[#1a1a1a] flex-1 truncate">
                    {c.name}
                  </span>
                  <span className="text-xs font-medium text-[#1a1a1a] w-10 text-right">
                    {c.count}件
                  </span>
                  <span className="text-xs text-[#f97316] w-20 text-right">
                    {c.totalAmount.toLocaleString()}万
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
