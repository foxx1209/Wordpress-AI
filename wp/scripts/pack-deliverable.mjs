#!/usr/bin/env node
/**
 * クライアント納品用パッケージ（dist テーマのみ）
 * Usage: npm run deliver
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");
const outDir = join(root, "deliverable", "theme");
const releaseDir = join(root, "release");

if (!existsSync(distDir)) {
  console.error("[deliver] dist/ がありません。先に npm run build を実行してください。");
  process.exit(1);
}

rmSync(join(root, "deliverable"), { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

cpSync(distDir, outDir, { recursive: true });

const clientReadme = `# WordPress テーマ納品物

このフォルダを WordPress の \`wp-content/themes/\` にアップロードしてください。
フォルダ名は任意（例: サイト名）に変更してかまいません。

管理画面 → 外観 → テーマ から有効化してください。

## 含まれるもの

- ビルド済み PHP / CSS / JS / 画像（Vite 本番ビルド）

## 含まれないもの（開発用は別管理）

- ソースコード（src/）
- AI 用ドキュメント・設定
- Node.js / Docker 開発環境

`;

writeFileSync(join(root, "deliverable", "README.txt"), clientReadme, "utf8");

mkdirSync(releaseDir, { recursive: true });
const archiveName = "theme-deliverable.tar.gz";
const archivePath = join(releaseDir, archiveName);

const tar = spawnSync(
  "tar",
  ["-czf", archivePath, "-C", join(root, "deliverable"), "."],
  { stdio: "inherit" },
);

if (tar.status !== 0) {
  console.warn("[deliver] tar の作成に失敗しました。deliverable/ フォルダは利用できます。");
} else {
  console.log(`[deliver] アーカイブ: ${archivePath}`);
}

console.log(`[deliver] 納品フォルダ: ${outDir}`);
console.log("[deliver] 開発用ファイル（.cursor, docs/ai, .page-info 等）は含めていません。");
