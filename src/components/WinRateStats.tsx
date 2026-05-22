import type { WinRateStats } from "@/lib/data";

type Props = { data: WinRateStats };

function StatRow({
  label,
  value,
  unit = "%",
}: {
  label: string;
  value: number | null;
  unit?: string;
}) {
  return (
    <div className="flex justify-between items-baseline py-1.5 border-b border-[#f0ece4] last:border-0">
      <span className="text-xs text-[#6b7280]">{label}</span>
      <span className="text-sm font-bold text-[#1a1a1a]">
        {value != null ? `${value}${unit}` : "—"}
      </span>
    </div>
  );
}

function CountRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-baseline py-1.5 border-b border-[#f0ece4] last:border-0">
      <span className="text-xs text-[#6b7280]">{label}</span>
      <span className="text-sm font-bold text-[#f97316]">
        {value.toLocaleString()}件
      </span>
    </div>
  );
}

export default function WinRateStatsCard({ data }: Props) {
  return (
    <div
      className="bg-white rounded-xl p-5"
      style={{ border: "1px solid var(--border)" }}
    >
      <h2 className="text-sm font-semibold mb-3 text-[#1a1a1a]">
        落札率・調査価格率
      </h2>
      <StatRow label="県 落札率（平均）" value={data.kenAvgRate} />
      <StatRow label="県 落札率（中央値）" value={data.kenMedianRate} />
      <StatRow label="自治体 落札率（平均）" value={data.cityAvgRate} />
      <StatRow label="自治体 落札率（中央値）" value={data.cityMedianRate} />
      <StatRow label="県 調査価格率（平均）" value={data.kenAvgSurveyRate} />
      <StatRow label="自治体 調査価格率（平均）" value={data.cityAvgSurveyRate} />
      <div className="mt-2">
        <CountRow label="予定価格非公開（県）" value={data.kenNoPriceCount} />
        <CountRow label="予定価格非公開（自治体）" value={data.cityNoPriceCount} />
      </div>
    </div>
  );
}
