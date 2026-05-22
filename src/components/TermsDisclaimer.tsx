"use client";
import { useState } from "react";

export default function TermsDisclaimer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8 border-t border-[#e0dbd0] pt-6">
      {/* 開閉ボタン */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-[#1a1a1a] transition-colors cursor-pointer mx-auto"
      >
        <span className="underline underline-offset-2">
          免責事項・利用規約
        </span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          className="mt-4 rounded-xl p-5 text-xs text-[#4b5563] leading-relaxed space-y-4"
          style={{ backgroundColor: "#f9f7f3", border: "1px solid #e0dbd0" }}
        >
          <section>
            <h3 className="font-semibold text-[#1a1a1a] mb-1">本サービスについて</h3>
            <p>
              本サービス「埼玉県 落札結果ダッシュボード」は、AnkenGet が運営する情報提供サービスです。
              建設コンサルタント業務（設計・調査・測量等）の入札・落札情報を可視化することを目的としています。
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-[#1a1a1a] mb-1">データの出典・正確性について</h3>
            <p>
              掲載データは、埼玉県電子入札システム（埼玉県入札情報公開システム）から取得・加工したものです。
              分野の分類・金額の換算・業者名の名寄せ等については独自の加工処理を行っており、
              データの正確性・完全性・最新性を保証するものではありません。
              正確な情報については埼玉県の公式発表をご確認ください。
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-[#1a1a1a] mb-1">著作権・禁止事項</h3>
            <p>
              本サービスのコンテンツ（デザイン・集計データ・分析・表示形式等）の著作権は AnkenGet に帰属します。
              無断での複写・転載・二次配布・商業利用を禁止します。
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-[#1a1a1a] mb-1">免責事項</h3>
            <p>
              本サービスの利用により生じた損害（直接・間接を問わず）について、AnkenGet は一切の責任を負いません。
              本サービスは予告なく内容を変更・停止・終了する場合があります。
              また、システム障害・メンテナンス等により一時的に利用できない場合があります。
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-[#1a1a1a] mb-1">個人情報・プライバシー</h3>
            <p>
              本サービスはユーザーの個人情報を収集しません。
              アクセス解析等のために Cookie を使用する場合があります。
            </p>
          </section>

          <p className="text-[#9ca3af]">
            © AnkenGet. All rights reserved. |{" "}
            データ出典：埼玉県電子入札システム
          </p>
        </div>
      )}
    </div>
  );
}
