# 新規プロジェクト開始（AI 自律実行）

Orelop WP をベースに、Figma からの実装案件を立ち上げる手順です。

## Phase 1: 情報収集（ユーザーに 1 回質問）

```
【必須】
1. プロジェクト名
2. Figma URL 一覧（ページ名と URL、PC/SP あれば両方）
3. ローカル URL（通常 http://localhost:8080）
4. サイト種別: WordPress / 静的のみ 等

【WordPress】
5. 管理画面 URL・ログイン（既定: admin / password）

【任意】
6. 本番 URL
7. 特記事項
```

## Phase 2: セットアップ（AI 自動）

### 2-1. `.page-info/project.json` を編集 → README 同期

- `project`（案件名・URL 等）
- `components`（header / footer の BEM・テンプレート・Figma）
- `pages`（各ページの `figma.pc` / `figma.sp`、`bemBlock`、`template`、`sections[]`）
- 編集後 **必ず** `npm run page-info:sync`（README.md は自動生成・直接編集しない）

### 2-2. デザイン参照画像

- Figma MCP `get_screenshot` で各ページを取得
- `.page-info/designs/{slug}.png` に保存

### 2-3. トークン（必要時のみ）

- Figma から主要色・フォントを取得
- `src/styles/tokens/tokens.css` に**追記**（既存トークンは削除しない）

### 2-4. 開発環境確認

```bash
npm run dev
```

- テーマ `development` が有効か
- `http://localhost:8080` で表示できるか

## Phase 2.5: ルール読み込み

| 優先 | ファイル |
|------|----------|
| 1 | `README.md`（CSS / PHP / Vite） |
| 2 | `.cursor/rules/figma-design-system.mdc` |
| 3 | `docs/ai/workflows/quality-checklist.md`（完了時用・把握のみ可） |

## Phase 3: 共通コンポーネント

- 全ページ Figma を横断し header / footer / CTA 等を先に実装
- `src/template/parts/` に分割
- **TOP または確認用ページに一覧配置し、ユーザー確認で一旦停止**

## Phase 4: ページ実装（TOP + 下層すべて）

`.page-info/README.md` の **ページ一覧の行ごと** に実施する（TOP だけでは終わらない）。

### 固定ページ（会社概要・採用・お問い合わせ 等）

1. `src/page-{スラッグ}.php` を新規作成（例: `page-about.php` → URL `/about/`）
2. セクションは `get_template_part('template/parts/...')` で共通化
3. ページ固有 CSS を追加し `global.css` から読み込み
4. WP 管理画面で固定ページを作成し、スラッグを一致させる
5. Figma MCP → 実装 → `.page-info` のステータスを「完了」

### 一覧・詳細（ニュース・実績 等）

- 一覧: `home.php` / `archive-{type}.php` / `page-{slug}.php` のいずれか（案件構成に合わせる）
- 詳細: `single.php` / `single-{type}.php`
- 一覧も `.page-info` に 1 行追加し、Figma URL を記載する

### AI への依頼の切り方

- 一度に全ページは重いので、**「.page-info #2 を実装」** のように 1 ページずつ指示してよい
- 共通 header/footer は Phase 3 完了後は「変更しない」と明記する

## Phase 5: 品質

- `docs/ai/workflows/quality-checklist.md` を **2 周** 実行して報告

## 含めない（Orelop 非対応）

- `~/案件対応/_templates/` や `.coding-md/` への依存
- wordpress-cloud の `gulpfile` / 別ポート `8888` 前提の手順
