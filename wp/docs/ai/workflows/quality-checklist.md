# 品質チェックリスト（AI 必読・厳守）

> **AI（Cursor / Claude Code 等）への絶対指示**
>
> コーディング完了後、**このファイルを全行読み、すべてのチェック項目を実行すること。**  
> 1 つでもスキップした場合、品質不合格とみなす。  
> チェックは **2 周** 行い、1 周目で発見した問題を修正した後、2 周目で再確認する。
>
> **ブラウザは AI が開かない。**
> ブラウザ自動操作ツール（Playwright MCP、browser 系）は品質チェックでは使用禁止。  
> AI がブラウザを見ても正確な判断ができないため。  
> 品質チェックは **Figma MCP データ vs CSS/PHP コードの値照合** のみで行う。  
> **スクリーンショット目視（セクション 4）はユーザーが手動で行う。**

参照: [docs/ORELOP_TECHNICAL.md](../../ORELOP_TECHNICAL.md)（CSS・Vite）、[README.md](../../README.md)

---

## チェックの進め方

1. **1 周目**: 全項目をチェックし、問題があれば修正する
2. **2 周目**: 修正箇所を含めて全項目を再チェックする
3. **報告**: チェック結果をユーザーに報告する（✅ / ❌ でセクションごとに明示）
4. **ユーザーへ**: セクション 4（目視）をユーザーに依頼する

### 対象の特定

- `.page-info/project.json` の `pages` / `components` で今回実装した slug を確認
- 該当 PHP: `src/**/*.php`、CSS: `src/styles/**/*.css`

---

## 1. テキスト品質チェック

### 誤字・脱字（絶対 NG）

- [ ] すべてのテキストを Figma データと **1 文字ずつ** 照合した
- [ ] 漢字の誤変換がない（例: 「管理」→「館理」）
- [ ] カタカナの誤りがない
- [ ] 句読点の抜け・余分がない
- [ ] 改行位置が Figma と一致している（`<br>` の位置）

### 半角スペース（絶対 NG）

- [ ] **全角文字と全角文字の間**に不要な半角スペースがない
- [ ] **全角文字の前後**に意図しない半角スペースがない
- [ ] HTML タグとテキストの間に不要な半角スペースがない
- [ ] インライン SVG の後のテキストに余分なスペースがない

### 意図的なスペース（OK）

- [ ] 全角文字間の**全角スペース**は意図的（例:「新卒採用　募集要項」）
- [ ] 半角英数字間の半角スペースは正常（例:「STEP 01」）

### チェック方法

```bash
grep -Pn '[ぁ-んァ-ヶ一-龠] [ぁ-んァ-ヶ一-龠]' src/対象.php
```

---

## 2. レイアウト崩れチェック（絶対 NG）

> Figma MCP で PC / SP ノードをそれぞれ取得し、コード上の値と照合する。  
> ブレイクポイントは `src/styles/tokens/mediaqueries.css`（`--sm` 48rem / `--md` 48rem / `--lg` 64rem 等）と `tokens.css` の `--design-width-sm: 375` / `--design-width-lg: 1440` を参照。

### PC 表示（1440px 想定・案件で調整可）

- [ ] セクション間の余白が Figma と一致している
- [ ] インナー幅がルール通り（例: `max-width` + `padding-inline`、container コンポーネント）
- [ ] 横並びレイアウトが崩れていない（flex/grid の子がはみ出していない）
- [ ] テーブル行の term/data が正しく横並び
- [ ] カードの高さが揃っている（`align-items: stretch` 等）
- [ ] テキストが意図しない改行をしていない
- [ ] 画像がコンテナからはみ出していない
- [ ] 装飾（アシライ）の位置が Figma 通り
- [ ] z-index の重なり順が正しい
- [ ] border-radius が効いている（`overflow: hidden` との兼ね合い）

### SP 表示（375px 想定）

- [ ] 横並びが縦積みに切り替わっている
- [ ] テキストがはみ出していない（横スクロールなし）
- [ ] padding/margin が SP 用の値になっている（`@media (--md)` 内など）
- [ ] SP 非表示の装飾が `display: none` になっている
- [ ] フォントサイズが SP 用に縮小されている（`fluid()` 使用箇所含む）
- [ ] 画像がコンテナ幅に収まっている

### タブレット（768px 付近）

- [ ] ブレイクポイント切り替え時にレイアウトが崩れない
- [ ] 中間幅でコンテンツが見切れない

### 描画結果シミュレーション（見落とし厳禁）

> **CSS 値が Figma と数値一致しても、描画結果が一致するとは限らない。**  
> 必ず以下の計算を行い、Figma 通りのサイズになるか検証する。

- [ ] **固定幅要素**: `width` を指定した要素に、親の `align-items` / `grid-template-columns: 1fr` / 子の `width: 100%` が上書きしていないか
- [ ] **SP 幅計算**: ビューポート幅 → セクション padding → 内側 padding → 実描画幅を計算し、固定幅要素が収まるか
  - 例: `390 - 20*2 - 24*2 = 302px` → 240px 固定は収まる ✅
  - 例: 同条件で `width: 100%` → 302px に伸びる → Figma が 240px なら ❌
- [ ] **flex/grid sizing**: Figma の `hug` → `width: auto`、`fill` → `width: 100%` or `flex: 1` の混同がないか
- [ ] **align-items と子 width**: `align-items: center` の親で子に `width: 100%` があると stretch 相当にならないか確認

---

## 3. Figma デザイン完全一致チェック

### Figma MCP 確認手順

```
1. Figma Developer MCP で対象ノードのデータを取得（get_figma_data）
2. 以下を実装コードと照合:
   - padding / margin / gap
   - font-family / font-weight / font-size / line-height
   - color（テキスト・背景・ボーダー）
   - border-radius / border-width
   - box-shadow
   - width / height（固定値の場合）
3. 画像・SVG は download_figma_images 済みか
```

### 値の照合チェック

- [ ] **padding**: Figma px → CSS（`calc(N * var(--torem))` / `fluid()` / 具体値）が正しい
- [ ] **margin / gap**: 同上
- [ ] **font-family**: Figma → `var(--font-*)` / `tokens.css` が正しい
- [ ] **font-weight**: Figma 値（400/700 等）と一致
- [ ] **font-size**: Figma px → `fluid()` または `--font-*` と一致
- [ ] **line-height**: Figma 倍率と一致
- [ ] **color**: Figma hex ↔ `var(--color-*)` または hex が一致
- [ ] **border**: 太さ・色・style が一致
- [ ] **border-radius**: Figma 値と一致
- [ ] **box-shadow**: 値が完全一致

### MCP 詳細手順

```
1. get_figma_data(fileKey, nodeId) でノード取得
2. スタイル・レイアウト情報から padding, gap, font, fill を読み取る
3. src/ 内の CSS / PHP と 1 つずつ照合
```

---

## 4. スクリーンショット目視チェック（ユーザー実施・AI は実施しない）

> AI はこのセクションを**実行しない**。完了報告時にユーザーへ依頼する。

### PC（1440px 幅）

- [ ] 各セクションのスクリーンショットを Figma と並べて比較（**ユーザー**）
- [ ] 余白・タイポ・色・アイコン・ボタン形状（**ユーザー**）

### SP（375px 幅）

- [ ] SP デザインと比較（**ユーザー**）
- [ ] 横スクロールがないこと（**ユーザー**）

### 確認 URL（Orelop 標準）

- 開発: http://localhost:8080/（`npm run dev` 起動中）
- ページ URL は `.page-info/project.json` の `path` を参照

### セクション単位の例

対象ページの**すべてのセクション**を個別に確認する。

```
□ ヒーロー + パンくず
□ 本文ブロック
□ FAQ / アコーディオン
□ CTA
□ フッター（共通コンポーネント）
```

---

## 5. HTML 構造チェック

- [ ] セマンティックタグ（`section`, `nav`, `ul/li` 等）を正しく使用
- [ ] 見出し階層（h1 → h2 → h3、h1 は 1 ページ 1 つ）
- [ ] すべての `<img>` に `alt`（装飾は `alt=""`）
- [ ] `aria-hidden`, `aria-label` 等が適切
- [ ] 不要な `<div>` ラッパーがない
- [ ] リストは `ul/ol/li`（div 代用していない）
- [ ] **markuplint** で PHP に明らかな違反がない

```bash
npm run lint:php
```

---

## 6. CSS ルール準拠チェック（Orelop WP / vaultcss）

- [ ] **BEM 記法**: 案件で採用時 `.p-xxx__yyy` / `.c-xxx` / `.l-xxx`（`project.json` の `bemBlock` と一致）
- [ ] **CSS Nesting**: メディアクエリ・疑似クラスのネストは README 準拠。過剰な深いネストなし
- [ ] **トークン優先**: `src/styles/tokens/tokens.css` の `var(--*)` を使用（ハードコード hex は例外のみ）
- [ ] **fluid / レスポンシブ**: `fluid()`、`@media (--md)` 等が Figma PC/SP と対応
- [ ] **padding 方向**: `padding-block` / `padding-inline` を優先
- [ ] **margin 中央寄せ**: `margin-inline: auto`（`margin: 0 auto` は避ける）
- [ ] **インナー幅**: container / max-width + padding-inline がデザイン通り
- [ ] **biome / stylelint**: 既存設定に反しない

```bash
npm run lint:style
```

---

## 7. 機能チェック

- [ ] リンク先が正しい（ヘッダー、CTA、パンくず等）
- [ ] URL パラメータが正しく動作する（案件で必要な場合）
- [ ] アコーディオンの開閉（実装している場合）
- [ ] hover 効果（CSS `:hover` が Figma 意図と一致）
- [ ] お問い合わせフォーム送信（CF7 利用時）
- [ ] `ViteHelper.php` / アセットパスが壊れていない

---

## 8. 二重チェック（2 周目）

1 周目の全チェックと修正完了後:

- [ ] 1 周目で修正した箇所が正しく反映されている
- [ ] 修正が他箇所に影響していない（regression）
- [ ] テキスト品質: 誤字・半角スペース（再確認）
- [ ] レイアウト: PC/SP の Figma 照合（再確認）
- [ ] Figma 値: 修正箇所の数値（再確認）

---

## 9. 参考コマンド

### ローカル URL（Orelop）

```
http://localhost:8080/          … TOP
http://localhost:8080/about/    … 下層（slug による）
```

### Dev Inspector（ユーザーが微調整する場合）

[dev-inspector-setup.md](../dev-inspector-setup.md) 参照。品質チェック本体は AI がブラウザを開かない。

### Figma MCP

```
get_figma_data → レイアウト・スタイル値を CSS/PHP と照合
get_screenshot → ユーザー目視用（AI の自動判定には使わない）
```

---

## 絶対 NG リスト（1 つでもあれば不合格）

| # | 項目 | 説明 |
|---|------|------|
| 1 | 誤字・脱字 | Figma テキストと 1 文字でも異なる |
| 2 | 不要な半角スペース | 全角文字間の半角スペース |
| 3 | レイアウト崩れ（PC） | セクションの崩壊・はみ出し・重なり |
| 4 | レイアウト崩れ（SP） | 横スクロール・要素はみ出し |
| 5 | Figma 値の不一致 | padding / font-size 等が明らかに異なる |
| 6 | リンク切れ | 404 になるリンク |
| 7 | 画像の表示崩れ | 表示されない・比率が崩れる |
| 8 | z-index 崩壊 | 重なり順が設計と異なる |
| 9 | AI がブラウザで判定 | 品質合格報告をブラウザ頼みにした |

---

## 報告テンプレート（AI がユーザーに送る）

```
## 品質チェック結果（1周目 / 2周目）

| セクション | 結果 |
|------------|------|
| 1. テキスト | ✅ / ❌ |
| 2. レイアウト | ✅ / ❌ |
| 3. Figma 一致 | ✅ / ❌ |
| 4. 目視（ユーザー依頼） | ⏳ 未実施 |
| 5. HTML | ✅ / ❌ |
| 6. CSS 準拠 | ✅ / ❌ |
| 7. 機能 | ✅ / ❌ |

修正した箇所:（あれば）
ユーザーへのお願い: セクション4をブラウザで目視確認してください（URL: ...）
```

---

## AI への依頼例（ユーザー）

```
pages の about の実装が終わったので、
docs/ai/workflows/quality-checklist.md に従って品質チェックを2周実行して報告して。
ブラウザは開かないで。
```

---

*このチェックリストは [docs/ORELOP_TECHNICAL.md](../../ORELOP_TECHNICAL.md) の CSS ルールと併用すること。*
