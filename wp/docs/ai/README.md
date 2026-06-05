# AI 支援ワークフロー（Orelop WP）

wordpress-cloud から移植した **AI 時短用** のドキュメント・ツールです（**開発用・クライアント納品には含めません**）。  
環境の入口はルート **[README.md](../../README.md)**。Vite / CSS の詳細は **[ORELOP_TECHNICAL.md](../ORELOP_TECHNICAL.md)**。

## はじめに読むもの（かんたん）

1. **[CHAT_START.md](./CHAT_START.md)** … この文面をチャットに貼るだけ
2. AI の質問に答える
3. 「実装して」と頼む

くわしい説明: **[AI_CODING_README.md](./AI_CODING_README.md)**（3 ステップ版）

## セットアップ（初回のみ）

### Figma Developer MCP

Cursor の MCP 設定（`~/.cursor/mcp.json`）に Figma Developer MCP を追加し、API キーを設定してください。  
（リポジトリにはキーを含めません。）

動作確認: チャットで Figma URL を渡し、`get_figma_data` が使えるか確認。

### プロジェクト情報（マスター → README 同期）

1. **`.page-info/project.json`** にページごとの Figma URL・BEM ブロック・テンプレート・セクションクラスを記載
2. `npm run page-info:sync` で **`.page-info/README.md` を自動生成**（手で README の表を編集しない）
3. デザイン参照 PNG は `.page-info/designs/{slug}.png` に保存（Figma MCP `get_screenshot`）

```bash
npm run page-info:sync      # project.json → README.md
npm run page-info:check     # 同期漏れがあると終了コード 1（CI 向け）
```

## ワークフロー一覧

| 手順 | ファイル |
|------|----------|
| ページ情報（JSON→README） | [workflows/page-info.md](./workflows/page-info.md) |
| 新規案件の立ち上げ | [workflows/new-project.md](./workflows/new-project.md) |
| Figma → コーディング | `.cursor/rules/figma-design-system.mdc` |
| 画像の追加 | [workflows/figma-images.md](./workflows/figma-images.md) |
| お問い合わせ（CF7） | [workflows/contact-form.md](./workflows/contact-form.md) / CHAT_START |
| テスト環境 FTP | [workflows/deploy-test.md](./workflows/deploy-test.md) / `npm run deploy:test` |
| 完了後の品質チェック（**2周・厳守**） | [workflows/quality-checklist.md](./workflows/quality-checklist.md) |
| 指示の出し方 | [coding-instructions.md](./coding-instructions.md) |
| 安全ルール | [safety-rules.md](./safety-rules.md) |
| ブラウザ↔CSS 直編集 | [dev-inspector-setup.md](./dev-inspector-setup.md) |

## 自動化スクリプト

| コマンド | 説明 |
|----------|------|
| `npm run dev` | wp-env + Vite（既存・変更なし） |
| `npm run wp:post:create -- post-data/posts-sample.json` | JSON から投稿一括作成 |

投稿 JSON の形式は [post-data/README.md](../../post-data/README.md)。

## Cursor ルール

- `/.cursor/rules/ai-project.mdc` — 常時適用
- `/.cursor/rules/figma-design-system.mdc` — PHP/CSS 編集時

## 含めないもの（意図的）

- wordpress-cloud の SCSS/FLOCSS 専用コーディングルール（Orelop の vaultcss に置き換え）
- `yarn wp-init` 等、wp-env 構成が異なるスクリプトの上書き
- 未同梱だった `bin/` スクリプトの複製
