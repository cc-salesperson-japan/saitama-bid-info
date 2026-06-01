import type { ParticipationPoint } from "@/lib/sanka-data";

type Props = { data: ParticipationPoint[] };

export default function ParticipationRanking({ data }: Props) {
  const left  = data.slice(0, 15);
  const right = data.slice(15, 30);
  const max   = data[0]?.cnt ?? 1;

  return (
    <div className="bg-white rounded-xl p-5" style={{ border: "1px solid var(--border)" }}>
      <h2 className="text-sm font-semibold mb-1 text-[#1a1a1a]">① 参加件数ランキング</h2>
      <p className="text-xs text-[#6b7280] mb-4">落札ではなく「入札に参加した回数」のランキング</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        {[left, right].map((col, ci) => (
          <div key={ci} className="space-y-1">
            {col.map((d, i) => {
              const rank = ci * 15 + i + 1;
              const pct  = (d.cnt / max) * 100;
              return (
                <div key={d.company} className="flex items-center gap-2 py-1">
                  <span className="text-xs text-[#6b7280] w-5 text-right shrink-0">{rank}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="text-xs text-[#1a1a1a] truncate flex-1 mr-2">{d.company}</span>
                      <span className="text-xs font-semibold text-[#1a1a1a] shrink-0">{d.cnt}件</span>
                    </div>
                    <div className="h-1 rounded-full bg-[#f0f4ff]">
                      <div
                        className="h-1 rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: rank <= 3 ? "#1d4ed8" : "#93c5fd" }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
