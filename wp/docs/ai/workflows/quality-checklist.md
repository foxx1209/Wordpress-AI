# 品質チェックリスト（AI 必読）

コーディング完了後、**全項目を 2 周** 実行する。1 周目で修正 → 2 周目で再確認。

## ブラウザについて

- 品質の**数値照合**は Figma MCP vs コードを優先
- ブラウザ自動操作はユーザー指示がある場合のみ（Playwright 等）
- 目視確認はユーザーが行う想定でよい

## 1. テキスト品質

- [ ] Figma テキストと 1 文字ずつ照合
- [ ] 不要な半角スペース（全角間）がない

```bash
grep -Pn '[ぁ-んァ-ヶ一-龠] [ぁ-んァ-ヶ一-龠]' src/対象.php
```

## 2. レイアウト（Figma 値 vs CSS）

- [ ] padding / margin / gap
- [ ] フォント（family, weight, size, line-height）
- [ ] 色・border・radius・shadow
- [ ] PC（例: 1440px）/ SP（例: 375px）のブレイクポイント（`--md` 等）が意図通り

Orelop では `rem()` ヘルパーの代わりに `--torem` / `fluid()` / 具体 px を使用している場合、**Figma px と CSS 計算結果**を対応づけて確認する。

## 3. Figma MCP 手順

1. `get_figma_data` でノード取得
2. スタイル・レイアウト値を CSS / PHP と照合
3. 画像・SVG は `download_figma_images` 済みか

## 4. HTML / アクセシビリティ

- [ ] 見出し階層（h1 は 1 ページ 1 つ）
- [ ] `img` の `alt`
- [ ] markuplint 対象ファイルに明らかな違反がない

## 5. Orelop / プロジェクト CSS 準拠

- [ ] `src/styles/tokens/tokens.css` の変数を優先使用
- [ ] README のネスティング・vaultcss ルール
- [ ] biome / stylelint で既存設定に反しない

（wordpress-cloud 固有の SCSS/FLOCSS 項目は適用しない。）

## 6. 機能

- [ ] リンク先・フォーム送信・ACF 等、案件で必要な動作

## 7. 二重チェック（2 周目）

- [ ] 修正の regression なし
- [ ] テキスト・レイアウト・Figma 値を再確認

## 絶対 NG

| # | 項目 |
|---|------|
| 1 | 誤字脱字 |
| 2 | 不要な半角スペース |
| 3 | 明らかなレイアウト崩れ |
| 4 | Figma 値と明確に不一致 |
| 5 | リンク切れ・画像欠落 |
| 6 | z-index の意図と逆 |

## 報告形式

ユーザーに ✅ / ❌ でセクションごとに報告する。
