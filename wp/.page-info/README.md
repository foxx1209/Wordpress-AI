# プロジェクト情報

> **このファイルは自動生成です。** 編集は [`project.json`](./project.json) で行い、`npm run page-info:sync` で反映してください。

AI はコーディング開始前に **必ず** `project.json` を読み、必要なら同期コマンドを実行してから [`README.md`](./README.md) を参照します。

## 環境情報

| 項目 | 値 |
|------|-----|
| **プロジェクト名** | （未設定） |
| **ローカル URL** | http://localhost:8080 |
| **開発コマンド** | `npm run dev` |
| **管理画面** | http://localhost:8080/wp-admin/ |
| **テーマ（開発）** | development（src/） |
| **本番 URL** | （未設定） |

## 特記事項

（なし）

---

## 共通コンポーネント

| # | 名前 | slug | 種別 | BEM | テンプレート | CSS | Figma | ステータス |
|---|------|------|------|-----|--------------|-----|-------|------------|
| 1 | ヘッダー | `header` | `layout` | `l-header` | `src/header.php` | `src/styles/components/header.css` | — | 未着手 |
| 2 | フッター | `footer` | `layout` | `l-footer` | `src/footer.php` | `src/styles/components/footer.css` | — | 未着手 |
| 3 | CTA（例・不要なら削除） | `cta` | `part` | `c-cta` | `src/template/parts/c-cta.php` | `src/styles/components/cta.css` | — | 未着手 |

## コンポーネント詳細（header / footer / 共通パーツ）

### 1. ヘッダー (`slug: header`)

| 項目 | 値 |
|------|-----|
| 種別 | layout（全ページ） |
| BEM | `l-header` |
| テンプレート | `src/header.php` |
| 使うページ | `all` |
| Figma PC | — |
| Figma SP | — |
| ステータス | 未着手 |

実装依頼例: `components の header を実装して`


### 2. フッター (`slug: footer`)

| 項目 | 値 |
|------|-----|
| 種別 | layout（全ページ） |
| BEM | `l-footer` |
| テンプレート | `src/footer.php` |
| 使うページ | `all` |
| Figma PC | — |
| Figma SP | — |
| ステータス | 未着手 |

実装依頼例: `components の footer を実装して`


### 3. CTA（例・不要なら削除） (`slug: cta`)

| 項目 | 値 |
|------|-----|
| 種別 | part（部品） |
| BEM | `c-cta` |
| テンプレート | `src/template/parts/c-cta.php` |
| 使うページ | `front-page`, `about` |
| Figma PC | — |
| Figma SP | — |
| ステータス | 未着手 |

実装依頼例: `components の cta を実装して`

**メモ**: ヒアリングで使わない場合は AI が削除してよい


---

## ページ一覧

| # | ページ名 | スラッグ | URL | BEM | Figma | PHP | CSS | パーツ | デザイン画像 | ステータス |
|---|----------|----------|-----|-----|-------|-----|-----|--------|--------------|------------|
| 1 | TOP | `front-page` | `/` | `p-top` | — | `src/front-page.php` | `src/styles/pages/front-page.css` | `src/template/parts/` | `.page-info/designs/front-page.png` | 未着手 |
| 2 | 会社概要 | `about` | `/about/` | `p-about` | — | `src/page-about.php` | `src/styles/pages/about.css` | — | `.page-info/designs/about.png` | 未着手 |
| 3 | お問い合わせ | `contact` | `/contact/` | `p-contact` | — | `src/page-contact.php` | `src/styles/pages/contact.css` | — | `.page-info/designs/contact.png` | 未着手 |

## ページ詳細（AI・実装用）

### 1. TOP (`front-page`)

| 項目 | 値 |
|------|-----|
| 種別 | front-page |
| ローカル URL | `http://localhost:8080/` |
| BEM ブロック | `p-top` |
| テンプレート | `src/front-page.php` |
| Figma PC | — |
| Figma SP | — |
| fileKey | `—` |
| nodeId（PC） | `—` |
| nodeId（SP） | `—` |
| ステータス | 未着手 |

**セクション / クラス**

- **MV**: `p-top__mv`


### 2. 会社概要 (`about`)

| 項目 | 値 |
|------|-----|
| 種別 | page |
| ローカル URL | `http://localhost:8080/about/` |
| BEM ブロック | `p-about` |
| テンプレート | `src/page-about.php` |
| Figma PC | — |
| Figma SP | — |
| fileKey | `—` |
| nodeId（PC） | `—` |
| nodeId（SP） | `—` |
| ステータス | 未着手 |

**セクション / クラス**

- （セクション未登録）


### 3. お問い合わせ (`contact`)

| 項目 | 値 |
|------|-----|
| 種別 | page |
| ローカル URL | `http://localhost:8080/contact/` |
| BEM ブロック | `p-contact` |
| テンプレート | `src/page-contact.php` |
| Figma PC | — |
| Figma SP | — |
| fileKey | `—` |
| nodeId（PC） | `—` |
| nodeId（SP） | `—` |
| ステータス | 未着手 |

**セクション / クラス**

- （セクション未登録）



---

## コーディング開始前（AI 必須）

1. [`project.json`](./project.json) を読む（マスターデータ）
2. `npm run page-info:sync` を実行し、この README と内容が一致しているか確認
3. 実装対象ページの **BEM・テンプレート・Figma URL** を上記から取得してからコーディング開始
4. 完了したら `project.json` の `status` を更新し、再度 `page-info:sync`

### 下層ページ（WordPress）

- 固定ページ: `src/page-{スラッグ}.php` + 管理画面でスラッグ一致
- 共通パーツ: `src/template/parts/`（`components` 一覧を参照）

### Figma URL の書き方（project.json）

- `figma.pc` / `figma.sp` に URL をそのまま記載
- `figmaMeta.fileKey` と `nodeIdPc`（`14001:8` 形式）は MCP 用に任意で記載

---

## AI ドキュメント

| 用途 | パス |
|------|------|
| マスターデータ | `.page-info/project.json` |
| 同期 | `npm run page-info:sync` |
| 索引 | `docs/ai/README.md` |
| 新規案件 | `docs/ai/workflows/new-project.md` |
| Figma 実装 | `.cursor/rules/figma-design-system.mdc` |
