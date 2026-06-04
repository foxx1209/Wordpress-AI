# Dev Inspector セットアップ（Orelop WP）

ブラウザ上で要素を選び、対応する CSS/SCSS をエディタで開いて編集する Chrome 拡張 + ローカルサーバーです。

## 初回

```bash
cd tools/dev-inspector/server
npm install
cd ../../..
```

## 起動（AI / 開発者）

```bash
node tools/dev-inspector/server/bin.js . --scss-dir=src/styles --editor=cursor --rem-mode=css-var
```

別ターミナルで WordPress + Vite:

```bash
npm run dev
```

## Chrome 拡張

1. `chrome://extensions/` → デベロッパーモード ON
2. 「パッケージ化されていない拡張機能を読み込む」
3. `tools/dev-inspector/extension` を指定

ショートカット: `Alt+W`（要素選択）, `Alt+E`（編集パネル）— `manifest.json` 参照。

## Orelop 向け設定

- スタイル探索: `src/styles/**/*.css`（Sass 利用時は `.scss` も可）
- ローカル URL: 通常 `http://localhost:8080`
- `rem-mode=css-var` は `tokens.css` の `--torem` 運用向け

## 注意

- `vite.config.ts` やテーマ PHP は Dev Inspector から変更しない（スタイル・HTML の微調整用）
- サーバーは開発時のみ起動
