import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "埼玉県 落札結果ダッシュボード | AnkenGet",
  description: "埼玉県の建設コンサルタント業務落札結果を可視化したダッシュボードです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
        {children}
      </body>
    </html>
  );
}
