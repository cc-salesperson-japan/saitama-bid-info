"use client";
import type { MembersData } from "@/lib/sanka-data";
import ParticipationRanking from "./ParticipationRanking";
import CompanyKikanHeatmap  from "./CompanyKikanHeatmap";
import WinRateRanking       from "./WinRateRanking";
import CompetitionDensity   from "./CompetitionDensity";
import CompetitionMatrix    from "./CompetitionMatrix";
import CompanyActivity      from "./CompanyActivity";
import NewEntrantTracker    from "./NewEntrantTracker";
import ShimeiEstimator      from "./ShimeiEstimator";

type Props = { data: MembersData };

export default function MembersDashboard({ data }: Props) {
  return (
    <div className="space-y-4">
      {/* ① 参加件数ランキング */}
      <ParticipationRanking data={data.participation} />

      {/* ②③⑤ ヒートマップ + 勝率 */}
      <CompanyKikanHeatmap data={data.matrix} />
      <WinRateRanking dataAll={data.winRateAll} dataQuality={data.winRateQuality} />

      {/* ④⑥ 競合密度 */}
      <CompetitionDensity data={data.density} />
      <CompetitionMatrix  data={data.compMatrix} />

      {/* ⑦ 業者活動 */}
      <CompanyActivity />

      {/* ⑧⑨ 新規参入 + 指名推定 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NewEntrantTracker data={data.newEntrants} />
        <ShimeiEstimator   data={data.shimei} />
      </div>
    </div>
  );
}
