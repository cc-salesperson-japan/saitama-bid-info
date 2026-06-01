import type { MatrixPoint } from "@/lib/sanka-data";

type Props = { data: MatrixPoint[] };

export default function CompanyKikanHeatmap({ data }: Props) {
  if (!data.length) return (
    <div className="bg-white rounded-xl p-5" style={{ border: "1px solid var(--border)" }}>
      <p className="text-xs text-[#6b7280]">データなし</p>
    </div>
  );

  const companies = [...new Set(data.map((d) => d.company))];
  const kikans    = [...new Set(data.map((d) => d.kikan_name))];
  const map = new Map(data.map((d) => [`${d.company}||${d.kikan_name}`, d.cnt]));
  const maxVal = Math.max(...data.map((d) => d.cnt));

  function color(v: number) {
    if (!v) return "#f8fafc";
    const t = v / maxVal;
    const r = Math.round(219 + (29  - 219) * t);
    const g = Math.round(234 + (78  - 234) * t);
    const b = Math.round(254 + (216 - 254) * t);
    return `rgb(${r},${g},${b})`;
  }

  return (
    <div className="bg-white rounded-xl p-5" style={{ border: "1px solid var(--border)" }}>
      <h2 className="text-sm font-semibold mb-1 text-[#1a1a1a]">② 業者×自治体 ヒートマップ</h2>
      <p className="text-xs text-[#6b7280] mb-4">参加件数（濃いほど多い）。上位20社×上位20機関</p>

      <div className="overflow-x-auto">
        <table className="text-[9px] border-collapse" style={{ minWidth: `${kikans.length * 36 + 140}px` }}>
          <thead>
            <tr>
              <th className="w-36 text-left px-1 py-1 text-[#6b7280] font-normal sticky left-0 bg-white z-10">業者名</th>
              {kikans.map((k) => (
                <th
                  key={k}
                  className="text-[#6b7280] font-normal px-0.5"
                  style={{ writingMode: "vertical-rl", width: 30, height: 80, verticalAlign: "bottom" }}
                >
                  {k.length > 8 ? k.slice(0, 7) + "…" : k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {companies.map((co) => (
              <tr key={co}>
                <td className="text-[#1a1a1a] px-1 py-0.5 truncate max-w-[140px] sticky left-0 bg-white z-10">
                  {co.length > 16 ? co.slice(0, 15) + "…" : co}
                </td>
                {kikans.map((k) => {
                  const v = map.get(`${co}||${k}`) ?? 0;
                  return (
                    <td
                      key={k}
                      title={v ? `${co} × ${k}: ${v}件` : undefined}
                      className="text-center"
                      style={{ backgroundColor: color(v), width: 30, height: 22 }}
                    >
                      {v > 0 && <span style={{ color: v / maxVal > 0.5 ? "white" : "#1e3a8a" }}>{v}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
