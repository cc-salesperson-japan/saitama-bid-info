import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const SITE_URL = "https://saitama-bid-info.vercel.app";
const TITLE = "埼玉県 落札結果ダッシュボード | AnkenGet";
const DESCRIPTION =
  "埼玉県の建設コンサルタント業務（設計・調査・測量）落札情報を無料で閲覧できるダッシュボードです。落札率・調査価格率・業者ランキングなどを可視化しています。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "埼玉県 落札結果ダッシュボード",
    title: TITLE,
    description: DESCRIPTION,
    locale: "ja_JP",
  },
  twitter: {
    card: "summary",
    site: "@cc_salesperson",
    creator: "@cc_salesperson",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const GA_ID = "G-2HTE14QKB2";

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
      {/* Google Analytics */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </html>
  );
}
