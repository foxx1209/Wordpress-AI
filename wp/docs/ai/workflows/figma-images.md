# 画像追加ワークフロー（Orelop WP）

## 1. Figma から取得

- Figma MCP `download_figma_images` で PNG/SVG を取得
- フレームに収まった画像を使う（原本のみだとレイアウトが崩れることがある）

## 2. 配置

| 用途 | パス |
|------|------|
| Vite ビルド対象 | `src/assets/images/` |
| テーマ直参照（public コピー） | `public/` → `ViteHelper::PUBLIC_URL()` |

`src/scripts/main.js` の `import.meta.glob(["../assets/images/**"])` で取り込まれる。

## 3. WebP 化（任意）

```bash
cwebp -q 80 input.png -o output.webp
```

Vite image optimizer 任せでも可。PHP ではビルド後パス（`dist/images/`）または `get_theme_file_uri` の運用に合わせる。

## 4. PHP 参照例

```php
<img src="<?php echo esc_url(get_theme_file_uri('images/example.webp')); ?>" alt="" width="" height="" loading="lazy">
```

装飾画像は `alt=""`。意味のある画像は適切な `alt` を付与。

## 注意

- SVG は Figma から取得（手書き禁止）
- `vite.config.ts` / プラグイン構成は変更しない
