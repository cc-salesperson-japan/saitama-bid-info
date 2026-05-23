import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-sm">
        <p className="text-6xl font-bold text-[#2563eb]">404</p>
        <h1 className="text-lg font-semibold text-[#1a1a1a]">
          ページが見つかりません
        </h1>
        <p className="text-sm text-[#6b7280] leading-relaxed">
          お探しのページは移動または削除された可能性があります。
        </p>
        <Link
          href="/"
          className="inline-block mt-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: "#2563eb" }}
        >
          ダッシュボードへ戻る
        </Link>
      </div>
    </div>
  );
}
