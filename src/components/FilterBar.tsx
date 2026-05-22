"use client";
import { useState } from "react";

type Props = {
  // 年度
  year: string;
  onYearChange: (year: string) => void;
  // 発注者
  kenIssuers: string[];
  cityIssuers: string[];
  selectedIssuers: Set<string>;
  onIssuersChange: (s: Set<string>) => void;
  // 分野
  allFields: string[];
  selectedFields: Set<string>;
  onFieldsChange: (s: Set<string>) => void;
};

const YEARS = [
  { value: "all", label: "全期間" },
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
];

function SmallBtn({
  onClick,
  children,
  variant = "default",
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "blue" | "gray";
}) {
  const color =
    variant === "blue"
      ? "text-blue-600 hover:text-blue-800"
      : variant === "gray"
      ? "text-[#6b7280] hover:text-[#1a1a1a]"
      : "text-[#1a1a1a]";
  return (
    <button onClick={onClick} className={`text-xs ${color} cursor-pointer`}>
      {children}
    </button>
  );
}

export default function FilterBar({
  year,
  onYearChange,
  kenIssuers,
  cityIssuers,
  selectedIssuers,
  onIssuersChange,
  allFields,
  selectedFields,
  onFieldsChange,
}: Props) {
  const [issuerOpen, setIssuerOpen] = useState(false);
  const [fieldOpen, setFieldOpen] = useState(false);

  // ── 発注者ヘルパー ──
  const allIssuers = [...kenIssuers, ...cityIssuers];
  const issuerCount = allIssuers.filter((i) => selectedIssuers.has(i)).length;

  const toggleIssuer = (v: string) => {
    const next = new Set(selectedIssuers);
    next.has(v) ? next.delete(v) : next.add(v);
    onIssuersChange(next);
  };
  const toggleGroup = (list: string[], check: boolean) => {
    const next = new Set(selectedIssuers);
    list.forEach((v) => (check ? next.add(v) : next.delete(v)));
    onIssuersChange(next);
  };

  // ── 分野ヘルパー ──
  const fieldCount = allFields.filter((f) => selectedFields.has(f)).length;
  const toggleField = (v: string) => {
    const next = new Set(selectedFields);
    next.has(v) ? next.delete(v) : next.add(v);
    onFieldsChange(next);
  };

  // ── スタイル ──
  const pill = "px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer";
  const active = "bg-[#1a1a1a] text-white";
  const inactive = "bg-[#ede9e1] text-[#1a1a1a] hover:bg-[#ddd8cd]";
  const divider = <div className="border-t border-[#e0dbd0]" />;

  // 全選択判定ヘルパー
  const kenAll = kenIssuers.every((i) => selectedIssuers.has(i));
  const kenNone = kenIssuers.every((i) => !selectedIssuers.has(i));
  const cityAll = cityIssuers.every((i) => selectedIssuers.has(i));

  return (
    <div
      className="rounded-xl mb-4 overflow-hidden"
      style={{ border: "1px solid #e0dbd0", backgroundColor: "#f0ece4" }}
    >
      {/* ── 年度 ── */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <span className="text-xs font-semibold text-[#6b7280] w-10 shrink-0">
          年度
        </span>
        {YEARS.map((y) => (
          <button
            key={y.value}
            onClick={() => onYearChange(y.value)}
            className={`${pill} ${year === y.value ? active : inactive}`}
          >
            {y.label}
          </button>
        ))}
      </div>

      {divider}

      {/* ── 発注者 ── */}
      <div className="px-4 py-3">
        {/* ヘッダー行 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[#6b7280] w-10 shrink-0">
            発注者
          </span>
          <SmallBtn variant="blue" onClick={() => onIssuersChange(new Set(allIssuers))}>
            全選択
          </SmallBtn>
          <SmallBtn variant="gray" onClick={() => onIssuersChange(new Set())}>
            全クリア
          </SmallBtn>
          <span className="text-xs text-[#6b7280]">
            {issuerCount}/{allIssuers.length}件選択中
          </span>
          <button
            onClick={() => setIssuerOpen((v) => !v)}
            className="ml-auto text-xs text-[#6b7280] hover:text-[#1a1a1a] cursor-pointer flex items-center gap-1"
          >
            {issuerOpen ? "▲ 閉じる" : "▼ 展開"}
          </button>
        </div>

        {/* チェックボックス展開エリア */}
        {issuerOpen && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 埼玉県（左列） */}
            <div className="bg-white rounded-lg p-3" style={{ border: "1px solid #e0dbd0" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-[#1a1a1a]">
                  埼玉県（{kenIssuers.length}部局）
                </span>
                <SmallBtn variant="blue" onClick={() => toggleGroup(kenIssuers, true)}>
                  全選択
                </SmallBtn>
                <SmallBtn variant="gray" onClick={() => toggleGroup(kenIssuers, false)}>
                  クリア
                </SmallBtn>
              </div>
              {/* 全部局まとめて選択 */}
              <label className="flex items-center gap-1.5 mb-2 cursor-pointer border-b border-[#f0ece4] pb-2">
                <input
                  type="checkbox"
                  checked={kenAll}
                  ref={(el) => {
                    if (el) el.indeterminate = !kenAll && !kenNone;
                  }}
                  onChange={(e) => toggleGroup(kenIssuers, e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#1a1a1a]"
                />
                <span className="text-xs font-medium text-[#1a1a1a]">埼玉県（全部局）</span>
              </label>
              <div className="space-y-1.5">
                {kenIssuers.map((issuer) => (
                  <label key={issuer} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIssuers.has(issuer)}
                      onChange={() => toggleIssuer(issuer)}
                      className="w-3 h-3 accent-[#1a1a1a]"
                    />
                    <span className="text-xs text-[#1a1a1a]">{issuer}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 自治体（右列・スクロール） */}
            <div className="bg-white rounded-lg p-3" style={{ border: "1px solid #e0dbd0" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-[#1a1a1a]">
                  自治体（{cityIssuers.length}団体）
                </span>
                <SmallBtn variant="blue" onClick={() => toggleGroup(cityIssuers, true)}>
                  全選択
                </SmallBtn>
                <SmallBtn variant="gray" onClick={() => toggleGroup(cityIssuers, false)}>
                  クリア
                </SmallBtn>
              </div>
              {/* 全自治体まとめて選択 */}
              <label className="flex items-center gap-1.5 mb-2 cursor-pointer border-b border-[#f0ece4] pb-2">
                <input
                  type="checkbox"
                  checked={cityAll}
                  ref={(el) => {
                    if (el) {
                      const cityNone = cityIssuers.every((i) => !selectedIssuers.has(i));
                      el.indeterminate = !cityAll && !cityNone;
                    }
                  }}
                  onChange={(e) => toggleGroup(cityIssuers, e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#1a1a1a]"
                />
                <span className="text-xs font-medium text-[#1a1a1a]">自治体（全団体）</span>
              </label>
              {/* スクロール可能なチェックボックスリスト */}
              <div
                className="overflow-y-auto"
                style={{ maxHeight: "200px" }}
              >
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {cityIssuers.map((issuer) => (
                    <label key={issuer} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedIssuers.has(issuer)}
                        onChange={() => toggleIssuer(issuer)}
                        className="w-3 h-3 accent-[#1a1a1a] shrink-0"
                      />
                      <span className="text-xs text-[#1a1a1a] truncate">{issuer}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {divider}

      {/* ── 分野 ── */}
      <div className="px-4 py-3">
        {/* ヘッダー行 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[#6b7280] w-10 shrink-0">
            分野
          </span>
          <SmallBtn variant="blue" onClick={() => onFieldsChange(new Set(allFields))}>
            全選択
          </SmallBtn>
          <SmallBtn variant="gray" onClick={() => onFieldsChange(new Set())}>
            全クリア
          </SmallBtn>
          <span className="text-xs text-[#6b7280]">
            {fieldCount}/{allFields.length}件選択中
          </span>
          <button
            onClick={() => setFieldOpen((v) => !v)}
            className="ml-auto text-xs text-[#6b7280] hover:text-[#1a1a1a] cursor-pointer flex items-center gap-1"
          >
            {fieldOpen ? "▲ 閉じる" : "▼ 展開"}
          </button>
        </div>

        {/* チェックボックス展開エリア */}
        {fieldOpen && (
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {allFields.map((field) => (
              <label key={field} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFields.has(field)}
                  onChange={() => toggleField(field)}
                  className="w-3 h-3 accent-[#1a1a1a]"
                />
                <span className="text-xs text-[#1a1a1a]">{field}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
