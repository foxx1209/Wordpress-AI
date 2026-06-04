# AI によるコーディング手順（かんたん版）

JSON を自分で書く必要は**ありません**。  
**チャットに文面を貼る → AI が質問 → あなたが答える → AI が反映**、だけ覚えれば OK です。

---

## 3 ステップだけ

| 順番 | あなたがすること |
|------|------------------|
| 1 | [CHAT_START.md](./CHAT_START.md) の「コピー用」をチャットに貼る |
| 2 | AI の質問に答える（Figma URL をコピペするだけでも可） |
| 3 | 内容を確認して「実装して」と頼む（ページは 1 枚ずつで OK） |

AI が裏で `.page-info/project.json` を更新し、`npm run page-info:sync` で README も作ります。

---

## ステップ 1：チャットに貼る

👉 開く: **[CHAT_START.md](./CHAT_START.md)**

「コピー用（ここから）」〜「（ここまで）」をすべてコピーして、Cursor のチャットに貼り付けてください。

---

## ステップ 2：質問に答える

AI がだいたい次のことを聞きます。

- サイト（プロジェクト）の名前
- ページの名前（TOP、会社概要、お問い合わせ …）
- 各ページの **Figma の URL**
- ヘッダー・フッターの Figma URL（なければ「わからない」）
- その他メモ

### 回答例（コピーして書き換えて OK）

```
プロジェクト名: 株式会社サンプル

ページ:
- TOP
- 会社概要
- お問い合わせ

Figma:
- TOP PC: https://www.figma.com/design/xxxxx/...?node-id=1-2
- 会社概要 PC: https://www.figma.com/design/xxxxx/...?node-id=10-20
- お問い合わせ PC: https://www.figma.com/design/xxxxx/...?node-id=20-30
- ヘッダー: https://www.figma.com/design/xxxxx/...?node-id=5-1
- フッター: わからない

特記事項: なし
```

答えたあと、AI が「`project.json` を更新しました」と報告します。  
`.page-info/README.md` は自動で作られるので、**自分では触らなくて大丈夫**です。

---

## ステップ 3：実装を頼む

準備ができたら、チャットで短く頼みます。  
**コンポーネントもページも同じ**です（`project.json` の `components` / `pages` を見て実装）。

### コンポーネント（header / footer / CTA など）

```
components の header を実装して
```

```
components の header と footer を実装して
```

```
components の cta を実装して
```

### ページ（中身だけ）

```
pages の front-page（TOP）を実装して
```

```
pages の about（会社概要）を実装して。header/footer/cta は触らないで
```

1 つ終わるごとに http://localhost:8080 で確認すると安心です。

開発サーバーが止まっていたら:

```bash
npm run dev
```

---

## ヘッダー・フッター・CTA など（コンポーネント）

| 種類 | 登録場所 | いつ実装？ |
|------|----------|------------|
| ヘッダー・フッター | `components`（kind: layout） | 最初に 1 回 |
| CTA・パンくずなど | `components`（kind: part） | ページより先 or ページと一緒 |
| ページ固有の中身 | `pages` | コンポーネントのあと |

ヒアリングのとき「CTA ありますか？」と聞かれたら、名前と Figma URL を答えるだけで OK。  
あとから足すときは [CHAT_START.md](./CHAT_START.md) の「コンポーネントだけ追加」を貼る。

下層ページを頼むときは **「header/footer/cta は触らないで」** と書くと安全です。

---

## ページをあとから増やす

チャットで:

```
ページを追加したい。採用ページを追加して。
Figma: https://www.figma.com/design/...
```

AI が質問 → 回答 → `project.json` 更新 → sync までしてくれます。

---

## 初回だけ必要なもの

- Docker + `npm run dev` でサイトが開けること
- Cursor に **Figma Developer MCP**（Figma からデザインを読むため）

MCP の設定方法はルート [README.md](../../README.md) の「AI 支援ワークフロー」を参照。

---

## 自分で JSON を直したい人向け

`.page-info/project.json` を直接編集 → `npm run page-info:sync`

詳細: [workflows/page-info.md](./workflows/page-info.md)

---

## 関連リンク

| 内容 | ファイル |
|------|----------|
| **チャットに貼る文** | [CHAT_START.md](./CHAT_START.md) |
| AI の動き方（内部） | [workflows/interview-mode.md](./workflows/interview-mode.md) |
| 索引 | [README.md](./README.md) |
