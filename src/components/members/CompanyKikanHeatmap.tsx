type Point = { company: string; kikan_name: string; cnt: number };
type Props = {
  data: Point[];
  title: string;
  subtitle?: string;
  pinFirst?: string;
};

function sortKikans(kikans: string[], data: Point[], pinFirst?: string): string[] {
  const total = new Map<string, number>();
  data.forEach((d) => total.set(d.kikan_name, (total.get(d.kikan_name) ?? 0) + d.cnt));
  return [...kikans].sort((a, b) => {
    if (pinFirst) {
      if (a === pinFirst) return -1;
      if (b === pinFirst) return  1;
    }
    return (total.get(b) ?? 0) - (total.get(a) ?? 0);
  });
}

function warmColor(v: number, maxVal: number): string {
  if (!v) return "#fafafa";
  const t = Math.min(v / maxVal, 1);
  const r = Math.round(254 + (180 - 254) * t);
  const g = Math.round(215 + (30  - 215) * t);
  const b = Math.round(170 + (20  - 170) * t);
  return `rgb(${r},${g},${b})`;
}

export default function CompanyKikanHeatmap({ data, title, subtitle, pinFirst }: Props) {
  if (!data.length) return (
    <div className="bg-white rounded-xl p-5" style={{ border: "1px solid var(--border)", minHeight: 240 }}>
      <h2 className="text-sm font-semibold mb-1 text-[#1a1a1a]">{title}</h2>
      <p className="text-xs text-[#9ca3af] text-center py-8">データなし</p>
    </div>
  );

  const companies = [...new Set(data.map((d) => d.company))];
  const rawKikans = [...new Set(data.map((d) => d.kikan_name))];
  const kikans    = sortKikans(rawKikans, data, pinFirst);
  const map       = new Map(data.map((d) => [`${d.company}||${d.kikan_name}`, d.cnt]));
  const maxVal    = Math.max(...data.map((d) => d.cnt));

  return (
    <div className="bg-white rounded-xl p-5" style={{ border: "1px solid var(--border)" }}>
      <h2 className="text-sm font-semibold mb-1 text-[#1a1a1a]">{title}</h2>
      <p className="text-xs text-[#6b7280] mb-4">{subtitle ?? "参加件数（濃いほど多い）"}</p>
      <div className="overflow-x-auto w-full">
        <table className="text-[9px] border-collapse w-full">
          <thead>
            <tr>
              <th className="w-40 text-left px-1 py-1 text-[#6b7280] font-normal sticky left-0 bg-white z-10">業者名</th>
              {kikans.map((k) => (
                <th key={k} className="text-[#6b7280] font-normal px-0.5 flex-1"
                  style={{ writingMode: "vertical-rl", minWidth: 26, height: 80, verticalAlign: "bottom" }}>
                  {k.length > 8 ? k.slice(0, 7) + "…" : k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {companies.map((co) => (
              <tr key={co}>
                <td className="text-[#1a1a1a] px-1 py-0.5 sticky left-0 bg-white z-10 max-w-[160px]">
                  <span className="block truncate">{co.length > 18 ? co.slice(0, 17) + "…" : co}</span>
                </td>
                {kikans.map((k) => {
                  const v = map.get(`${co}||${k}`) ?? 0;
                  return (
                    <td key={k} title={v ? `${co} × ${k}: ${v}件` : undefined}
                      className="text-center" style={{ backgroundColor: warmColor(v, maxVal), height: 22 }}>
                      {v > 0 && <span style={{ color: v / maxVal > 0.6 ? "white" : "#7c2d12" }}>{v}</span>}
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
