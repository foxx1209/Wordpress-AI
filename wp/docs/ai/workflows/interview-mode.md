# ヒアリングモード（AI 向け）

## トリガー

| ユーザーが貼った文 | モード |
|------------------|--------|
| `【Orelop WP — 案件ヒアリング開始】` | 案件全体（ページ + コンポーネント） |
| `【Orelop WP — コンポーネント追加ヒアリング】` | components のみ追加 |

いずれも **フェーズ 1 は質問のみ**。コーディング禁止。

---

## フェーズ 1: 質問（1 メッセージにまとめる）

### 案件ヒアリング

- プロジェクト名・特記事項
- **共通コンポーネント**（ヘッダー、フッター、その他パーツ名 + Figma URL）
- ページ一覧 + 各ページ Figma URL

「CTA やパンくずはありますか？」と聞き、あれば名前と URL を集める。

### コンポーネント追加のみ

- 追加する名前
- Figma URL
- 使うページ（`usedOn`: `all` または `front-page`, `about` 等）

---

## フェーズ 2: project.json へ反映

### components（共通パーツ）

| 種類 | kind | slug 例 | template 例 | bemBlock 例 |
|------|------|---------|-------------|-------------|
| ヘッダー | layout | header | src/header.php | l-header |
| フッター | layout | footer | src/footer.php | l-footer |
| CTA | part | cta | src/template/parts/c-cta.php | c-cta |
| パンくず | part | breadcrumb | src/template/parts/c-breadcrumb.php | c-breadcrumb |
| セクション見出し | part | section-title | src/template/parts/c-section-title.php | c-section-title |

ルール:

- ユーザーが挙げたパーツごとに `components[]` に 1 オブジェクト
- `slug` は英小文字 kebab（日本語名から AI が提案）
- `css`: `src/styles/components/{slug}.css`（layout は header.css 等）
- `figma.pc` / `figma.sp` を設定。空でも可
- `usedOn`: `["all"]` またはページ slug の配列
- 回答に無い例示コンポーネント（project.json の「例」）は削除してよい
- **既存 components を上書き削除しない**（追加・更新のみ）

### pages（ページ）

（従来どおり）

- slug, path, template, bemBlock, figma, status: 未着手

### 仕上げ

1. `npm run page-info:sync`
2. サマリー（components 件数 + pages 件数）
3. 実装依頼の例を提示:
   - `components の header を実装して`
   - `components の cta を実装して`
   - `pages の about を実装して（header/footer は触らない）`

---

## フェーズ 3: コーディング

「実装して」「○○を作って」などの明示後のみ開始。

### components の実装

- `components[].template` に PHP を作成・更新
- `components[].css` を作成し `global.css` から import（既存パターンに合わせる）
- `kind: layout` → get_header / get_footer から読まれるファイル
- `kind: part` → `get_template_part('template/parts/c-cta')` 等。pages 実装時に include
- 完了: 該当 `status` → `完了` → sync

### pages の実装

- `pages[]` の figma / bemBlock / sections を参照
- **デフォルト**: header.php / footer.php / 他 components は変更しない
- ページ内で part を使う: `get_template_part` で `components` に登録済みのパスを使う
- 完了: status 更新 → sync

---

## 追加入力

| ユーザー | AI の動き |
|----------|-----------|
| ページを追加 | ページ名 + Figma を質問 → pages 追加 → sync |
| コンポーネントを追加 | コンポーネント追加ヒアリング → components 追加 → sync |
