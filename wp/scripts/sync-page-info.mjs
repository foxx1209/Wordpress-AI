#!/usr/bin/env node
/**
 * .page-info/project.json → README.md を再生成
 * Usage: node scripts/sync-page-info.mjs [--check]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pageInfoDir = join(root, ".page-info");
const jsonPath = join(pageInfoDir, "project.json");
const readmePath = join(pageInfoDir, "README.md");
const checkOnly = process.argv.includes("--check");

const data = JSON.parse(readFileSync(jsonPath, "utf8"));
const { project, components = [], pages = [] } = data;

const link = (url, label) => {
  if (!url?.trim()) return "—";
  const text = label || "Figma";
  return `[${text}](${url.trim()})`;
};

const figmaCell = (figma) => {
  if (!figma) return "—";
  const pc = figma.pc?.trim();
  const sp = figma.sp?.trim();
  if (pc && sp) return `${link(pc, "PC")} / ${link(sp, "SP")}`;
  if (pc) return link(pc, "PC");
  if (sp) return link(sp, "SP");
  return "—";
};

const list = (arr) => (arr?.length ? arr.map((s) => `\`${s}\``).join("<br>") : "—");

const md = `# プロジェクト情報

> **このファイルは自動生成です。** 編集は [\`project.json\`](./project.json) で行い、\`npm run page-info:sync\` で反映してください。

AI はコーディング開始前に **必ず** \`project.json\` を読み、必要なら同期コマンドを実行してから [\`README.md\`](./README.md) を参照します。

## 環境情報

| 項目 | 値 |
|------|-----|
| **プロジェクト名** | ${project.name || "（未設定）"} |
| **ローカル URL** | ${project.localUrl || "http://localhost:8080"} |
| **開発コマンド** | \`${project.devCommand || "npm run dev"}\` |
| **管理画面** | ${project.adminUrl || "—"} |
| **テーマ（開発）** | ${project.theme || "development（src/）"} |
| **本番 URL** | ${project.productionUrl?.trim() || "（未設定）"} |

## 特記事項

${project.notes?.trim() || "（なし）"}

---

## 共通コンポーネント

| # | 名前 | slug | 種別 | BEM | テンプレート | CSS | Figma | ステータス |
|---|------|------|------|-----|--------------|-----|-------|------------|
${components
  .map(
    (c, i) =>
      `| ${i + 1} | ${c.name} | \`${c.slug || "—"}\` | \`${c.kind || "part"}\` | \`${c.bemBlock}\` | \`${c.template}\` | ${list(c.css)} | ${figmaCell(c.figma)} | ${c.status || "未着手"} |`,
  )
  .join("\n")}

## コンポーネント詳細（header / footer / 共通パーツ）

${components
  .map((c, i) => {
    const n = i + 1;
    const meta = c.figmaMeta || {};
    const used = c.usedOn?.length ? c.usedOn.map((s) => `\`${s}\``).join(", ") : "—";
    return `### ${n}. ${c.name} (\`slug: ${c.slug || "—"}\`)

| 項目 | 値 |
|------|-----|
| 種別 | ${c.kind === "layout" ? "layout（全ページ）" : "part（部品）"} |
| BEM | \`${c.bemBlock}\` |
| テンプレート | \`${c.template}\` |
| 使うページ | ${used} |
| Figma PC | ${c.figma?.pc?.trim() ? c.figma.pc : "—"} |
| Figma SP | ${c.figma?.sp?.trim() ? c.figma.sp : "—"} |
| ステータス | ${c.status || "未着手"} |

実装依頼例: \`components の ${c.slug || c.name} を実装して\`

${c.notes?.trim() ? `**メモ**: ${c.notes}\n` : ""}`;
  })
  .join("\n")}

---

## ページ一覧

| # | ページ名 | スラッグ | URL | BEM | Figma | PHP | CSS | パーツ | デザイン画像 | ステータス |
|---|----------|----------|-----|-----|-------|-----|-----|--------|--------------|------------|
${pages
  .map((p, i) => {
    const path = p.path || (p.slug === "front-page" ? "/" : `/${p.slug}/`);
    return `| ${i + 1} | ${p.name} | \`${p.slug}\` | \`${path}\` | \`${p.bemBlock}\` | ${figmaCell(p.figma)} | \`${p.template}\` | ${list(p.css)} | ${list(p.templateParts)} | \`${p.designImage || "—"}\` | ${p.status || "未着手"} |`;
  })
  .join("\n")}

## ページ詳細（AI・実装用）

${pages
  .map((p, i) => {
    const n = i + 1;
    const meta = p.figmaMeta || {};
    const sections =
      p.sections?.length > 0
        ? p.sections
            .map(
              (s) =>
                `- **${s.name}**: \`${s.bemBlock}\`${s.figmaNodeId ? ` — node \`${s.figmaNodeId}\`` : ""}`,
            )
            .join("\n")
        : "- （セクション未登録）";

    return `### ${n}. ${p.name} (\`${p.slug}\`)

| 項目 | 値 |
|------|-----|
| 種別 | ${p.type || "page"} |
| ローカル URL | \`${(project.localUrl || "http://localhost:8080").replace(/\/$/, "")}${p.path || "/"}\` |
| BEM ブロック | \`${p.bemBlock}\` |
| テンプレート | \`${p.template}\` |
| Figma PC | ${p.figma?.pc?.trim() ? p.figma.pc : "—"} |
| Figma SP | ${p.figma?.sp?.trim() ? p.figma.sp : "—"} |
| fileKey | \`${meta.fileKey || "—"}\` |
| nodeId（PC） | \`${meta.nodeIdPc || "—"}\` |
| nodeId（SP） | \`${meta.nodeIdSp || "—"}\` |
| ステータス | ${p.status || "未着手"} |

**セクション / クラス**

${sections}

${p.notes?.trim() ? `**メモ**: ${p.notes}\n` : ""}`;
  })
  .join("\n")}

---

## コーディング開始前（AI 必須）

1. [\`project.json\`](./project.json) を読む（マスターデータ）
2. \`npm run page-info:sync\` を実行し、この README と内容が一致しているか確認
3. 実装対象ページの **BEM・テンプレート・Figma URL** を上記から取得してからコーディング開始
4. 完了したら \`project.json\` の \`status\` を更新し、再度 \`page-info:sync\`

### 下層ページ（WordPress）

- 固定ページ: \`src/page-{スラッグ}.php\` + 管理画面でスラッグ一致
- 共通パーツ: \`src/template/parts/\`（\`components\` 一覧を参照）

### Figma URL の書き方（project.json）

- \`figma.pc\` / \`figma.sp\` に URL をそのまま記載
- \`figmaMeta.fileKey\` と \`nodeIdPc\`（\`14001:8\` 形式）は MCP 用に任意で記載

---

## AI ドキュメント

| 用途 | パス |
|------|------|
| マスターデータ | \`.page-info/project.json\` |
| 同期 | \`npm run page-info:sync\` |
| 索引 | \`docs/ai/README.md\` |
| 新規案件 | \`docs/ai/workflows/new-project.md\` |
| Figma 実装 | \`.cursor/rules/figma-design-system.mdc\` |
`;

const existing = readFileSync(readmePath, "utf8");
if (checkOnly) {
  if (existing === md) {
    console.log("[page-info:sync] README.md は project.json と一致しています");
    process.exit(0);
  }
  console.error("[page-info:sync] README.md が古いです。npm run page-info:sync を実行してください");
  process.exit(1);
}

writeFileSync(readmePath, md, "utf8");
console.log(`[page-info:sync] ${readmePath} を更新しました（ページ ${pages.length} 件、コンポーネント ${components.length} 件）`);
