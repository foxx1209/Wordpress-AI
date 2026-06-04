# AI 安全使用ルール（全プロジェクト共通）

すべての操作に優先する。ユーザーから明示的に許可されない限り違反しない。

## 1. 絶対に実行してはいけないコマンド

- `rm -rf` / `rm -r` — 再帰削除禁止。単一 `rm` も確認
- `git reset --hard`, `git push --force`, `git checkout .`, `git clean -f`, `git branch -D`
- `DROP TABLE`, `DELETE FROM`（WHERE なし）

## 2. 保護対象ファイル

変更・削除前にユーザー確認:

- `.env`, `.wp-env.json`, `vite.config.ts`, `package.json`, `.mcp.json`
- `sql/`, CI 設定

## 3. 機密情報

- API キー・パスワードをコードやログに出さない
- `git add .` は使わずファイルを指定

## 4. 変更手順

- 変更前に対象ファイルを読む
- 大規模変更は計画を提示して承認
- 依頼範囲外の「ついで改善」禁止
- **Orelop のコア設定は案件理由がなく書き換えない**

## 5. Git

- コミットはユーザー指示時のみ
- `--no-verify` 禁止

## 6. 依存関係

- `npm install` で新パッケージ追加前に確認（既存 devDependencies の変更も同様）

## 7. 判断に迷ったら

- 実行可否をユーザーに確認
