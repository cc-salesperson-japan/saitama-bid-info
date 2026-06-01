import type { ShimeiPoint } from "@/lib/sanka-data";

type Props = { data: ShimeiPoint[] };

export default function ShimeiEstimator({ data }: Props) {
  return (
    <div className="bg-white rounded-xl p-5" style={{ border: "1px solid var(--border)" }}>
      <h2 className="text-sm font-semibold mb-1 text-[#1a1a1a]">⑨ 指名業者リスト推定</h2>
      <p className="text-xs text-[#6b7280] mb-4">
        指名競争案件への参加実績から「実質的な指名業者リスト」を逆算（埼玉県分）
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#e8e0d4]">
              <th className="text-left py-1.5 text-[#6b7280] font-normal w-6">#</th>
              <th className="text-left py-1.5 text-[#6b7280] font-normal">業者名</th>
              <th className="text-right py-1.5 text-[#6b7280] font-normal w-16">指名参加</th>
              <th className="text-right py-1.5 text-[#6b7280] font-normal w-14">総参加</th>
              <th className="text-right py-1.5 text-[#6b7280] font-normal w-14">指名率</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={d.company} className="border-b border-[#f0ece4] last:border-0">
                <td className="py-1.5 text-[#9ca3af]">{i + 1}</td>
                <td className="py-1.5 text-[#1a1a1a] truncate max-w-[200px]">{d.company}</td>
                <td className="py-1.5 text-right font-semibold text-[#1a1a1a]">{d.shimei_count}</td>
                <td className="py-1.5 text-right text-[#6b7280]">{d.total_count}</td>
                <td className="py-1.5 text-right" style={{ color: d.shimei_ratio >= 50 ? "#dc2626" : d.shimei_ratio >= 30 ? "#f97316" : "#6b7280" }}>
                  {d.shimei_ratio}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-[#9ca3af] mt-3">
        ※ 指名競争案件の入札経過から参加業者を集計。実際の指名通知書とは異なる場合があります。
      </p>
    </div>
  );
}
