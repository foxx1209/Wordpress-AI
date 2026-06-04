# ページ情報の管理（project.json → README）

## 仕組み

| ファイル | 役割 |
|----------|------|
| `.page-info/project.json` | **マスター**（人間・AI が編集） |
| `.page-info/README.md` | **自動生成**（`page-info:sync` の出力） |
| `.page-info/project.schema.json` | JSON の型定義（参考） |

コーディング開始前に AI は `project.json` を読み、`page-info:sync` で README を揃えてから実装します。

## ページの追加例

`project.json` の `pages` にオブジェクトを追加:

```json
{
  "name": "採用",
  "slug": "recruit",
  "path": "/recruit/",
  "type": "page",
  "bemBlock": "p-recruit",
  "template": "src/page-recruit.php",
  "templateParts": ["src/template/parts/section-cta.php"],
  "css": ["src/styles/pages/recruit.css"],
  "figma": {
    "pc": "https://www.figma.com/design/XXXX/...?node-id=1-2",
    "sp": "https://www.figma.com/design/XXXX/...?node-id=3-4"
  },
  "figmaMeta": {
    "fileKey": "XXXX",
    "nodeIdPc": "1:2",
    "nodeIdSp": "3:4"
  },
  "sections": [
    { "name": "ヒーロー", "bemBlock": "p-recruit__hero", "figmaNodeId": "10:20" },
    { "name": "FAQ", "bemBlock": "p-recruit__faq", "figmaNodeId": "10:80" }
  ],
  "designImage": ".page-info/designs/recruit.png",
  "status": "未着手",
  "notes": "CTA は共通パーツを流用"
}
```

反映:

```bash
npm run page-info:sync
```

## セクション / クラス名

ページ全体の BEM は `bemBlock`（例: `p-recruit`）。  
セクション単位は `sections[]` に `bemBlock` と任意で `figmaNodeId` を書く。AI は実装時にこの一覧を優先する。

## ステータス更新

実装完了後:

```json
"status": "完了"
```

を `project.json` で更新 → `npm run page-info:sync`

## AI への依頼例

```
project.json を読んで page-info:sync 実行後、pages[2]（お問い合わせ）を Figma 通りに実装して。
```
