# チャットに貼るだけで始める

**やることは 2 つだけです。**

1. 下の枠内を**すべてコピー**して **Cursor または Claude Code** のチャットに貼る  
2. AI の質問に**そのまま答える**（分からない項目は「わからない」で OK）

あとは AI が `.page-info/project.json` を更新し、`npm run page-info:sync` まで行います。  
**コーディングは、あなたが「実装して」と言ってから**始めます。

**ページも、ヘッダー・フッター・CTA などのコンポーネントも、同じ流れ**です。

---

## コピー用：案件の最初（ここから）

```
【Orelop WP — 案件ヒアリング開始】

あなたはこのプロジェクトのセットアップ担当です。
今はコーディングしないでください。まず質問だけしてください。

手順:
1. 下の「質問リスト」を日本語で、ユーザーが答えやすいように**1つのメッセージ**にまとめて質問する
2. ユーザーが回答したら、`.page-info/project.json` に反映する
3. ターミナルで `npm run page-info:sync` を実行する
4. 更新内容を短く報告し、「この内容でよければ『実装して』と言ってください」と伝える
5. ユーザーが「実装して」と言うまで PHP/CSS の新規作成を始めない

質問リスト:
【サイト】
- プロジェクト名（サイト名）
- 特記事項

【共通コンポーネント】（複数ページで使い回すもの。なければ「なし」）
- ヘッダー（Figma URL・PC/SP）
- フッター（Figma URL・PC/SP）
- その他の共通パーツ（例: CTA、パンくず、セクション見出し、カード …）
  → 名前と Figma URL を列挙してもらう（わからないものはスキップ可）

【ページ】
- ページ一覧（TOP、会社概要 … 日本語でOK）
- 各ページの Figma URL（PC。あれば SP）

補足（AI が自動で埋める）:
- ヘッダー → components: slug `header`, template `src/header.php`, kind `layout`
- フッター → components: slug `footer`, template `src/footer.php`, kind `layout`
- その他パーツ → components: slug 英小文字, template `src/template/parts/c-{slug}.php`, kind `part`
- ページ → pages 配列（slug / page-{slug}.php 等）
- README.md は手編集しない

参照: docs/ai/workflows/interview-mode.md
```

## 案件の最初（ここまで）

---

## コピー用：コンポーネントだけ追加（ここから）

ページ情報はもうある。共通パーツだけ足したいとき用。

```
【Orelop WP — コンポーネント追加ヒアリング】

コーディングはまだしない。質問だけしてください。

1. 追加したいコンポーネント名（例: CTA、パンくず、セクション見出し）
2. 各コンポーネントの Figma URL（PC / SP）
3. どのページで使うか（例: 全ページ、TOPだけ、下層すべて）

回答後:
- `.page-info/project.json` の `components` に追加（既存は消さない）
- `npm run page-info:sync`
- サマリー報告。「実装して」と言われるまでコードを書かない

参照: docs/ai/workflows/interview-mode.md
```

## コンポーネントだけ追加（ここまで）

---

## 回答の例（ページ + コンポーネント）

```
プロジェクト名: 株式会社サンプル

共通コンポーネント:
- ヘッダー PC: https://www.figma.com/design/xxxxx/...?node-id=5-1
- フッター PC: わからない（TOPと同じ）
- CTA PC: https://www.figma.com/design/xxxxx/...?node-id=50-1（TOPと下層の末尾）
- パンくず: なし

ページ:
- TOP
- 会社概要
- お問い合わせ

Figma（ページ）:
- TOP PC: https://...
- 会社概要 PC: https://...
- お問い合わせ PC: https://...

特記事項: なし
```

---

## 実装を頼むときの例

**コンポーネント（1 つずつ）**

```
components の header を実装して
```

```
components の cta を実装して
```

**複数まとめて**

```
components の header と footer を実装して
```

**ページ（中身だけ）**

```
pages の about（会社概要）を実装して。header/footer/cta は触らないで
```

詳しい説明: [AI_CODING_README.md](./AI_CODING_README.md)
