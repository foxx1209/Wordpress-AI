# Claude Code 向けプロジェクト指示

このファイルは Claude Code が自動で読みます。Cursor の `.cursor/rules/ai-project.mdc` と同じ方針です。

## ベース（変更禁止）

- `package.json` の既存スクリプト、`vite.config.ts`、`.wp-env.json`、`ViteHelper.php` は案件都合で書き換えない
- スタイルは `src/styles/tokens/` と [docs/ORELOP_TECHNICAL.md](docs/ORELOP_TECHNICAL.md)

## ヒアリング（ユーザーが CHAT_START を貼ったとき）

`docs/ai/workflows/interview-mode.md` に従う。

1. 質問だけ（1 メッセージ）。コーディングしない
2. 回答を `.page-info/project.json` に反映
3. `npm run page-info:sync` を実行
4. ユーザーが「実装して」と言うまで待つ

貼り付け文: [docs/ai/CHAT_START.md](docs/ai/CHAT_START.md)

## コーディング開始時

1. `.page-info/project.json` を読む
2. `npm run page-info:sync`
3. 対象の `components` または `pages` を確認してから実装
4. Figma 実装: [docs/ai/workflows/figma-images.md](docs/ai/workflows/figma-images.md)、[.cursor/rules/figma-design-system.mdc](.cursor/rules/figma-design-system.mdc) の内容に従う

## 安全

[docs/ai/safety-rules.md](docs/ai/safety-rules.md) を優先。

## 入口

ルート [README.md](README.md)
