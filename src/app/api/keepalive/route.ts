import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * Supabase 無料プランの自動停止を防ぐキープアライブエンドポイント。
 * vercel.json で毎週火曜 12:00 JST（03:00 UTC）に自動呼び出し。
 */
export async function GET(request: Request) {
  // Vercel Cron からの呼び出しのみ許可
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const ts = new Date().toISOString();

  try {
    const supabase = createServerClient();

    // ken/city/sanka の3テーブルにアクセスして Supabase を活性化
    const [ken, city, sanka] = await Promise.all([
      supabase.from("ken_rakusatsu").select("id", { count: "exact", head: true }),
      supabase.from("city_rakusatsu").select("id", { count: "exact", head: true }),
      supabase.from("sanka_gyosha").select("id",  { count: "exact", head: true }),
    ]);

    const result = {
      ok: true,
      timestamp: ts,
      ken_count:   ken.count   ?? 0,
      city_count:  city.count  ?? 0,
      sanka_count: sanka.count ?? 0,
    };

    console.log("[keepalive]", JSON.stringify(result));
    return NextResponse.json(result);

  } catch (err) {
    console.error("[keepalive] error:", err);
    return NextResponse.json({ ok: false, timestamp: ts, error: String(err) }, { status: 500 });
  }
}
