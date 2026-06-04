# WordPress テーマ開発プロジェクト

Orelop WP（Vite + WordPress）をベースにしたテーマ開発環境です。  
**この README が最初に読む入口**です。

| 読者 | 読むもの |
|------|----------|
| **誰でも（AI コーディング）** | 下の「AI でコーディング」 |
| **開発者（環境構築・CSS）** | [docs/ORELOP_TECHNICAL.md](docs/ORELOP_TECHNICAL.md) |
| **クライアント（納品物）** | 下の「クライアントへの納品」 |

---

## 必要なもの

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/) 22.12 以上
- **AI エディタ** … [Cursor](https://cursor.com/) または [Claude Code](https://docs.anthropic.com/en/docs/claude-code) のどちらでも可

---

## よく使うコマンド

| コマンド | 用途 |
|----------|------|
| `npm run dev` | 開発開始（http://localhost:8080） |
| `npm run build` | 本番用テーマを `dist/` に生成 |
| `npm run deliver` | **クライアント納品用**（`dist` のみパッケージ） |
| `npm run page-info:sync` | 案件情報 JSON → README 反映 |
| `npm run wp:post:create -- post-data/posts-sample.json` | ダミー投稿の一括作成 |

管理画面: http://localhost:8080/wp-admin/（初期: `admin` / `password`）

---

## AI でコーディング（いちばんかんたんな使い方）

JSON を自分で書く必要はありません。

### 手順（3 ステップ）

1. **[docs/ai/CHAT_START.md](docs/ai/CHAT_START.md)** を開く  
2. 「**案件の最初**」の枠をすべてコピーして **Cursor または Claude Code** のチャットに貼る  
3. AI の質問に答える（サイト名・ページ名・Figma URL など）

AI が `.page-info/project.json` にまとめ、`npm run page-info:sync` で一覧を更新します。  
**「実装して」と言うまでコードは書きません。**

### 実装を頼むとき（例）

```
components の header と footer を実装して
```

```
pages の front-page（TOP）を実装して
```

```
pages の about を実装して。header/footer は触らないで
```

### ページ・コンポーネント・下層

| 種類 | 例 | いつ |
|------|-----|------|
| ヘッダー・フッター | `components の header` | 最初に 1 回 |
| CTA・パンくずなど | `components の cta` | 必要なら |
| TOP | `pages の front-page` | 共通パーツのあと |
| 下層（会社概要など） | `pages の about` | 1 ページずつ |

くわしい説明: [docs/ai/AI_CODING_README.md](docs/ai/AI_CODING_README.md)

### Figma を読ませるには

| ツール | 設定場所 |
|--------|----------|
| **Cursor** | `~/.cursor/mcp.json` に Figma Developer MCP |
| **Claude Code** | Claude Code の MCP 設定に Figma Developer MCP（公式ドキュメントに従って追加） |

未設定でもヒアリング・`project.json` 更新・実装依頼は可能です。Figma から自動で寸法を取るときだけ MCP が必要です。

### Claude Code を使う場合

- プロジェクト直下の **[CLAUDE.md](CLAUDE.md)** を自動で参照します（Cursor の `.cursor/rules` と同じ役割）
- 手順・貼り付け文は Cursor と**同じ**（[CHAT_START.md](docs/ai/CHAT_START.md)）
- ターミナルで `npm run dev` / `npm run page-info:sync` などを実行できます

### コンポーネントだけ後から足す

[CHAT_START.md](docs/ai/CHAT_START.md) の「**コンポーネントだけ追加**」を貼る。

---

## その他の開発機能

| 機能 | 使い方 |
|------|--------|
| **案件マスター** | `.page-info/project.json`（AI が更新）→ `npm run page-info:sync` |
| **投稿のダミーデータ** | `npm run wp:post:create -- post-data/posts-sample.json` |
| **DB エクスポート / インポート** | `npm run wp:export` / `npm run wp:import` |
| **ブラウザで CSS 微調整** | [docs/ai/dev-inspector-setup.md](docs/ai/dev-inspector-setup.md) |
| **お問い合わせ（CF7）** | [docs/ai/workflows/contact-form.md](docs/ai/workflows/contact-form.md) |
| **品質チェック（AI 用）** | [docs/ai/workflows/quality-checklist.md](docs/ai/workflows/quality-checklist.md) |
| **CSS / Vite の詳細** | [docs/ORELOP_TECHNICAL.md](docs/ORELOP_TECHNICAL.md) |

AI 関連の一覧: [docs/ai/README.md](docs/ai/README.md)

---

## クライアントへの納品

クライアントに渡すのは **ビルド済みテーマだけ** にしてください。  
開発用・AI 用のファイルは含めません。

### 納品コマンド（推奨）

```bash
npm run deliver
```

実行内容:

1. `npm run build` で `dist/` を生成  
2. `deliverable/theme/` にテーマのみコピー  
3. `release/theme-deliverable.tar.gz` を作成（任意）

**渡すもの:** `deliverable/` または `release/theme-deliverable.tar.gz`  
**渡さないもの:** `src/`, `docs/ai/`, `.page-info/`, `.cursor/`, `tools/`, `scripts/` など

一覧は [.deliverableignore](.deliverableignore) を参照。

### Git でソースを渡す場合

開発用ファイルを除いたアーカイブ:

```bash
git archive --format=zip HEAD -o release/source-for-client.zip
```

`.gitattributes` の `export-ignore` により、AI 用・開発専用パスは自動で除外されます。

### 開発用だがクライアントに不要なもの

| パス | 用途 |
|------|------|
| `.cursor/` | AI ルール |
| `.page-info/` | 案件・Figma 管理 |
| `docs/ai/` | AI 手順書 |
| `tools/dev-inspector/` | ブラウザ連携ツール |
| `scripts/` | 同期・投稿作成・納品パック |
| `post-data/` | ダミー投稿 JSON |
| `.mcp.json` | 開発用 MCP |

---

## フォルダ構成（ざっくり）

```
├── src/              … 開発中のテーマ（PHP / CSS / JS）
├── dist/             … 本番ビルド出力（gitignore）
├── deliverable/      … 納品用出力（gitignore）
├── public/           … 静的ファイル（favicon 等）
├── .page-info/       … 案件情報（AI・開発用）
├── docs/
│   ├── ai/           … AI 手順（開発用）
│   └── ORELOP_TECHNICAL.md … 環境の詳細
└── README.md         … このファイル
```

---

## ライセンス

[GNU General Public License v3 or later](https://www.gnu.org/licenses/gpl-3.0.html)
