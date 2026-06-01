import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // セッション更新（必須）
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === "/members/login";

  // 未認証 → ログインページへリダイレクト
  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL("/members/login", request.url));
  }

  // 認証済みでログインページにいる → 会員ページへ
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/members", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/members/:path*"],
};
