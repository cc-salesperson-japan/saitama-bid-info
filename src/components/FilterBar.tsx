"use client";
import { useRouter } from "next/navigation";

type Props = {
  year: string;
  issuer: string;
};

const YEARS = [
  { value: "all", label: "全期間" },
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
];

const ISSUERS = [
  { value: "all", label: "全機関" },
  { value: "ken", label: "埼玉県" },
  { value: "city", label: "自治体" },
];

export default function FilterBar({ year, issuer }: Props) {
  const router = useRouter();

  const navigate = (newYear: string, newIssuer: string) => {
    router.push(`/?year=${newYear}&issuer=${newIssuer}`);
  };

  const btnBase =
    "px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer";
  const btnActive = "bg-[#1a1a1a] text-white";
  const btnInactive = "bg-[#ede9e1] text-[#1a1a1a] hover:bg-[#ddd8cd]";

  return (
    <div
      className="flex flex-wrap items-center gap-4 px-4 py-3 rounded-xl mb-4"
      style={{ backgroundColor: "#f0ece4", border: "1px solid #e0dbd0" }}
    >
      {/* 年度フィルタ */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-[#6b7280] mr-1">㊥ 年度</span>
        {YEARS.map((y) => (
          <button
            key={y.value}
            onClick={() => navigate(y.value, issuer)}
            className={`${btnBase} ${year === y.value ? btnActive : btnInactive}`}
          >
            {y.label}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-[#d0cbc0]" />

      {/* 発注者フィルタ */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-[#6b7280] mr-1">㊥ 発注者</span>
        {ISSUERS.map((i) => (
          <button
            key={i.value}
            onClick={() => navigate(year, i.value)}
            className={`${btnBase} ${issuer === i.value ? btnActive : btnInactive}`}
          >
            {i.label}
          </button>
        ))}
      </div>
    </div>
  );
}
