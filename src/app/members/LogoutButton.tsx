"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/members/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs px-3 py-1.5 rounded-lg border transition-colors text-[#6b7280] hover:text-[#1a1a1a] cursor-pointer"
      style={{ borderColor: "var(--border)" }}
    >
      ログアウト
    </button>
  );
}
