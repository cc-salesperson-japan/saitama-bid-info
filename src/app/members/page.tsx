import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { fetchMembersData } from "@/lib/sanka-data";
import MembersDashboard from "@/components/members/MembersDashboard";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/members/login");

  const membersData = await fetchMembersData();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6" style={{ minHeight: "100vh" }}>
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: "#2563eb" }}
            >
              メンバー限定
            </span>
            <h1 className="text-lg font-bold text-[#1a1a1a]">
              埼玉県　参加業者分析ダッシュボード
            </h1>
          </div>
          <p className="text-xs text-[#6b7280]">{user.email} でログイン中</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-xs text-[#6b7280] hover:text-[#1a1a1a] transition-colors underline underline-offset-2"
          >
            無料ダッシュボードへ
          </a>
          <LogoutButton />
        </div>
      </div>

      {/* ダッシュボード */}
      <MembersDashboard data={membersData} />

      <p className="text-xs text-center text-[#9ca3af] mt-8 pb-4">
        Powered by AnkenGet｜参加業者データ：46,004件
      </p>
    </div>
  );
}
