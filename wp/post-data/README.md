# 投稿一括作成

`post-data/*.json` から WordPress 投稿を作成します。事前に `npm run dev` または `npm run wp:start` で wp-env を起動してください。

## 使い方

```bash
npm run wp:post:create -- post-data/posts-sample.json
npm run wp:post:create -- post-data/posts-news.json
```

## JSON 形式

```json
[
  {
    "title": "投稿タイトル",
    "content": "本文",
    "status": "publish",
    "postType": "post",
    "categories": [1],
    "tags": "タグ1,タグ2",
    "author": 1
  }
]
```

- `title`（必須）
- `status`: `publish` | `draft` | `pending`（省略時 `publish`）
- `postType`: 省略時 `post`
- `categories`: ID の配列または `"1,2"`
- `tags`: カンマ区切り文字列

## サンプル

- `posts-sample.json` — 基本サンプル
- `posts-news.json` — ニュース風ダミー（wordpress-cloud より移植）

カテゴリ ID は管理画面で作成後、実 ID に合わせて JSON を編集してください。
