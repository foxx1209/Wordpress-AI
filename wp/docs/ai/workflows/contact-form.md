# お問い合わせフォーム作成（CF7 + Figma）

Contact Form 7 を使う案件向け。Orelop の wp-env に CF7 を入れる場合は、ユーザー承認のうえ `plugins/` に追加する（既存プラグイン構成は勝手に壊さない）。

## 前提

- WordPress 起動（`npm run dev`）
- CF7 インストール・有効化
- 固定ページ `contact`（または指定スラッグ）
- Figma Developer MCP
- Playwright MCP（管理画面操作時）

## ユーザーから取得

| 項目 | 内容 |
|------|------|
| Figma URL（PC/SP） | node-id 付き |
| 管理画面 URL | 例: http://localhost:8080/wp-admin/ |
| ログイン | 既定 admin/password または `.env`（リポジトリにコミットしない） |
| メール文面 | あれば指定 |

## 絶対ルール

### カスタム UI の SVG

チェックボックス・ラジオ・セレクトの矢印は **ブラウザデフォルト禁止**。Figma から SVG を取得し CSS `background-image`（data URI 可）で実装。

手順:

1. Figma でアイコンノードを特定
2. `get_screenshot` / `get_design_context` で形状確認
3. SVG をダウンロードし CSS に反映

### CF7

- リアルタイムバリデーションは無効化し、送信時バリデーションに統一（案件ルールに合わせる）
- メタ更新は `update_post_meta` 等、管理画面と同等の API を使用

## 実装ファイル（目安）

- `src/page-contact.php` または固定ページテンプレート
- `src/styles/components/` にフォーム用 CSS
- CF7 ショートコードをテンプレートに配置

## 完了後

- `docs/ai/workflows/quality-checklist.md` のテキスト・Figma 照合を実施

（詳細な CSS スニペットは元の CONTACT 手順書を参照しつつ、数値は Figma MCP と `tokens.css` に合わせること。）
