-- =============================================
-- AnkenGet ダッシュボード用テーブル設計
-- Supabase SQL Editorに貼り付けて実行してください
-- =============================================

-- 埼玉県落札結果テーブル
CREATE TABLE ken_rakusatsu (
  id               BIGSERIAL PRIMARY KEY,
  取得日時           TEXT,
  入札方式           TEXT,
  調達案件名称        TEXT NOT NULL,
  案件番号           TEXT,
  開札日            DATE,
  年度              INTEGER,
  設計額            BIGINT,
  予定価格           BIGINT,
  調査基準価格        BIGINT,
  課所名            TEXT,
  発注部局           TEXT,
  落札業者名          TEXT,
  落札金額           BIGINT,
  参加業者数          INTEGER,
  分野分類           TEXT,
  発注方式           TEXT,
  不調              BOOLEAN DEFAULT FALSE,
  落札率            NUMERIC(5,3),
  調査価格率          NUMERIC(5,3)
);

-- 自治体落札結果テーブル
CREATE TABLE city_rakusatsu (
  id               BIGSERIAL PRIMARY KEY,
  調達機関名          TEXT NOT NULL,
  課所名            TEXT,
  調達案件名称        TEXT NOT NULL,
  入札方式           TEXT,
  開札日            DATE,
  年度              INTEGER,
  設計額            BIGINT,
  予定価格           BIGINT,
  調査基準価格        BIGINT,
  落札金額           BIGINT,
  落札業者名          TEXT,
  参加業者数          INTEGER,
  分野分類           TEXT,
  不調              BOOLEAN DEFAULT FALSE,
  落札率            NUMERIC(5,3),
  調査価格率          NUMERIC(5,3)
);

-- インデックス（フィルタ・集計を高速化）
CREATE INDEX idx_ken_年度        ON ken_rakusatsu(年度);
CREATE INDEX idx_ken_分野        ON ken_rakusatsu(分野分類);
CREATE INDEX idx_ken_発注部局     ON ken_rakusatsu(発注部局);
CREATE INDEX idx_ken_不調        ON ken_rakusatsu(不調);
CREATE INDEX idx_ken_落札業者     ON ken_rakusatsu(落札業者名);

CREATE INDEX idx_city_年度       ON city_rakusatsu(年度);
CREATE INDEX idx_city_分野       ON city_rakusatsu(分野分類);
CREATE INDEX idx_city_機関       ON city_rakusatsu(調達機関名);
CREATE INDEX idx_city_不調       ON city_rakusatsu(不調);
CREATE INDEX idx_city_落札業者    ON city_rakusatsu(落札業者名);

-- RLS（Row Level Security）：読み取りは全員OK
ALTER TABLE ken_rakusatsu  ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_rakusatsu ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read ken"
  ON ken_rakusatsu FOR SELECT USING (true);

CREATE POLICY "public read city"
  ON city_rakusatsu FOR SELECT USING (true);
