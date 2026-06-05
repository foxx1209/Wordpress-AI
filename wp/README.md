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
- [Node.js](https://nodejs.org/) **22.22.1**（`package.json` の `engines` / Volta と一致）
- [npm](https://www.npmjs.com/) **10.9.4**
- **AI エディタ** … [Cursor](https://cursor.com/) または [Claude Code](https://docs.anthropic.com/en/docs/claude-code) のどちらでも可

---

## 同じ環境を再現する（重要）

`npm install` だけでは **Node パッケージ（`node_modules`）** が揃うだけです。  
`docs/`・`plugins/`・`README.md`・`CLAUDE.md`・`src/` などは **Git リポジトリの中身** なので、別途クローンが必要です。

| 揃うもの | 方法 |
|----------|------|
| `node_modules`（Vite, wp-env 等） | `npm ci`（`package-lock.json` どおり） |
| `docs/`・`docs/ai/` | **Git clone**（同じコミット） |
| `README.md`・`CLAUDE.md` | **Git clone** |
| `plugins/`・`src/`・`.wp-env.json` 等 | **Git clone** |
| WordPress 本体・一部プラグイン | `npm run dev` 時に wp-env が自動取得 |

### 手順（別マシン・別メンバー）

```bash
git clone https://github.com/foxx1209/Wordpress-AI.git
cd Wordpress-AI   # リポジトリのルート（wp フォルダの中身が直下にある場合は cd wp）

npm ci            # npm install より再現性が高い（推奨）
npm run dev
```

**`npm install` と `npm ci` の違い**

- `npm ci` … `package-lock.json` を**そのまま**使う。今の環境と**最も同じ** `node_modules` になる
- `npm install` … lock を元に入れるが、条件によっては lock が更新されることがある

### Git に含まれる主なもの（npm では入らない）

```
README.md          … このファイル
CLAUDE.md          … Claude Code 用ルール
docs/              … 技術ドキュメント・AI 手順
plugins/           … wp-env にマウントするプラグイン置き場
src/               … テーマ本体
.page-info/        … 案件情報
.cursor/rules/     … Cursor 用ルール
.wp-env.json       … WordPress ローカル環境設定
package-lock.json  … 依存の完全なロック（必ずコミットすること）
```

`plugins/` の空フォルダや CF7 などは、案件ごとに中身を入れるか、wp-env / `wp plugin install` で追加します（`.wp-env.json` 参照）。

---

## よく使うコマンド

| コマンド | 用途 |
|----------|------|
| `npm run dev` | 開発開始（http://localhost:8080） |
| `npm run build` | 本番用テーマを `dist/` に生成 |
| `npm run deliver` | **クライアント納品用**（`dist` のみパッケージ） |
| `npm run deploy:test` | **テスト環境 FTP**（`dist/` をアップロード） |
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

## 品質チェック（実装後）

実装が終わったら、AI にチェックリストどおり **2 周** 確認してもらいます。  
詳細な項目一覧: [docs/ai/workflows/quality-checklist.md](docs/ai/workflows/quality-checklist.md)

### 誰が何をするか

| 担当 | やること |
|------|----------|
| **AI** | Figma MCP と PHP/CSS を照合（2 周）。**ブラウザは開かない** |
| **あなた** | AI の報告を確認 + **ブラウザで目視**（Figma と並べて見る） |

### 手順

**1. 実装後、チャットに貼る**

```
docs/ai/workflows/quality-checklist.md に従って品質チェックを2周実行して報告して。
対象: pages の about
ブラウザは開かないで。
```

`about` はチェックしたいページの slug（`front-page` / `contact` 等）に変えてください。  
コンポーネントなら `対象: components の header` のように書きます。

**2. AI の ✅ / ❌ を確認**

❌ があれば「直して」と頼み、再度 2 周チェックしてもらいます。

**3. あなたがブラウザで目視**

```bash
npm run dev
```

http://localhost:8080/ など（`.page-info/project.json` の `path` 参照）を、PC 1440px / SP 375px で Figma と比較します。

**4. OK なら進捗を更新**

`project.json` の `status` を `"完了"` に → `npm run page-info:sync`

### タイミング

- ページ 1 枚終わるたび（TOP、下層…）
- header / footer 実装後
- 納品前（ページごとに依頼しても、まとめて依頼しても可）

---

---

## お問い合わせ（Contact Form 7）

Figma + CF7 でお問い合わせページを作る手順: [docs/ai/workflows/contact-form.md](docs/ai/workflows/contact-form.md)

### 手順（概要）

1. [CHAT_START.md](docs/ai/CHAT_START.md) の「**お問い合わせ CF7**」を貼る → AI が質問
2. CF7 プラグインを有効化（初回）
3. 「実装して」と依頼
4. 品質チェック（上記セクション）

依頼例:

```
docs/ai/workflows/contact-form.md に従ってお問い合わせを実装して。
pages の contact。header/footer は触らないで。
```

---

## テスト環境へデプロイ（FTP）

**やっていること:** パソコンで作ったテーマ（`dist/` フォルダ）を、**テスト用サーバー**の WordPress テーマフォルダに丸ごとコピーする。  
FileZilla で手動アップロードする作業を、`npm run deploy:test` 1 コマンドでやるイメージです。

```
あなたの PC                    テストサーバー
┌─────────────┐   FTP で送信   ┌──────────────────────────┐
│ wp/dist/    │  ──────────►  │ .../wp-content/themes/   │
│ (ビルド済)  │               │     あなたのテーマ名/     │
└─────────────┘               └──────────────────────────┘
                                      ↓
                              ブラウザでテスト URL を開く
```

**重要:** アップロードするのは `src/` ではなく **`dist/`**（`npm run build` の結果）だけです。

---

### 初回だけ（3 ステップ）

**① lftp を入れる**（FTP 用コマンド。1 回だけ）

```bash
brew install lftp
```

**② 設定ファイルを作る**

プロジェクトフォルダ（`wp/`）で:

```bash
cp .deploy-test.json.example .deploy-test.json
```

**③ `.deploy-test.json` を編集**

エディタで開き、サーバー情報を入れます（**このファイルは Git に上げない**）。

```json
{
  "host": "sv12345.xserver.jp",
  "user": "xserverのFTPユーザー名",
  "password": "FTPパスワード",
  "remotePath": "/ドメイン名/public_html/テストサイト/wp-content/themes/テーマフォルダ名/",
  "localPath": "dist",
  "sslVerify": false,
  "filezillaSiteName": ""
}
```

| 項目 | 何を入れる？ |
|------|----------------|
| `host` | FTP サーバー（Xserver なら `xxx.xserver.jp` など） |
| `user` / `password` | FTP の ID / パスワード（FileZilla と同じ） |
| `remotePath` | **サーバー上のテーマフォルダ**までのパス（末尾 `/` 推奨） |
| `localPath` | そのまま `dist` で OK |
| `sslVerify` | Xserver 等でエラーが出たら `false` |

**`remotePath` の調べ方（FileZilla 利用者）**

1. FileZilla でテスト環境に接続
2. 右側（サーバー）で `wp-content/themes/テーマ名/` を開く
3. アドレスバーに表示されるパスをコピー → `remotePath` に貼る

例: `/example.com/public_html/test.example.com/wp-content/themes/my-theme/`

**FileZilla の保存済み接続を使う場合**

パスワードを JSON に書きたくないとき:

```json
{
  "filezillaSiteName": "FileZillaのサイトマネージャー名",
  "remotePath": "/.../wp-content/themes/テーマ名/",
  "localPath": "dist",
  "sslVerify": false
}
```

`host` / `user` / `password` は FileZilla から自動読み込みします。

---

### 2 回目以降（これだけ）

```bash
cd /path/to/wp
npm run deploy:test
```

内部の流れ:

1. `npm run build` … `dist/` を最新化  
2. `lftp` … `dist/` 全体をサーバーの `remotePath` にアップロード  

**すでに build 済みで dist だけ上げたい:**

```bash
npm run deploy:test -- --no-build
```

**コマンドだけ確認（送信しない）:**

```bash
npm run deploy:test -- --dry-run
```

---

### デプロイ後

1. テストサイトの URL をブラウザで開く（キャッシュ削除 or スーパーリロード）
2. 見た目が変わらなければ `remotePath` が間違っていることが多い

---

### AI に任せる

[CHAT_START.md](docs/ai/CHAT_START.md) の「**テスト環境デプロイ**」をチャットに貼る → FTP 情報を質問される → 設定後 `npm run deploy:test` まで実行してもらえる。

くわしいトラブルシュート: [docs/ai/workflows/deploy-test.md](docs/ai/workflows/deploy-test.md)

---

## その他の開発機能

| 機能 | 使い方 |
|------|--------|
| **案件マスター** | `.page-info/project.json`（AI が更新）→ `npm run page-info:sync` |
| **投稿のダミーデータ** | `npm run wp:post:create -- post-data/posts-sample.json` |
| **DB エクスポート / インポート** | `npm run wp:export` / `npm run wp:import` |
| **ブラウザで CSS 微調整** | [docs/ai/dev-inspector-setup.md](docs/ai/dev-inspector-setup.md) |
| **お問い合わせ（CF7）** | [workflows/contact-form.md](./workflows/contact-form.md) / CHAT_START「CF7」 |
| **テスト環境 FTP** | `npm run deploy:test` / [workflows/deploy-test.md](./workflows/deploy-test.md) |
| **品質チェック（2周）** | 上の「品質チェック」 / [quality-checklist.md](docs/ai/workflows/quality-checklist.md) |
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
