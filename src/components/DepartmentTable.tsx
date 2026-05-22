import type { DepartmentPoint } from "@/lib/data";

type Props = { data: DepartmentPoint[] };

export default function DepartmentTable({ data }: Props) {
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div
      className="bg-white rounded-xl p-5"
      style={{ border: "1px solid var(--border)" }}
    >
      <h2 className="text-sm font-semibold mb-4 text-[#1a1a1a]">
        発注部局別（埼玉県）
      </h2>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between">
            <span className="text-xs text-[#1a1a1a] truncate max-w-[130px]">
              {d.name}
            </span>
            <div className="flex items-center gap-2">
              {/* ミニバー */}
              <div className="w-24 h-1.5 bg-[#f0ece4] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3b82f6] rounded-full"
                  style={{ width: `${(d.count / (data[0]?.count || 1)) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-[#1a1a1a] w-12 text-right">
                {d.count.toLocaleString()}件
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-[#6b7280] mt-3">合計 {total.toLocaleString()}件</p>
    </div>
  );
}
