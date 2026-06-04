---
description: Dev Inspectorサーバーを起動してChrome拡張と接続する
---

# Dev Inspector 起動ワークフロー（AI実行用）

このワークフローは、Dev Inspector Chrome拡張用のWebSocketサーバーを起動し、
現在のプロジェクトでCSS検証・SCSS編集機能を有効にする。

## 前提条件

- `/Users/yamamotoshuuhei/Downloads/dev-inspector/server/` にサーバーが存在
- Chrome拡張「Dev Inspector」がインストール済み（`chrome://extensions` で確認）
- 未インストールの場合: Chrome → デベロッパーモードON → 「パッケージ化されていない拡張機能を読み込む」→ `/Users/yamamotoshuuhei/Downloads/dev-inspector/extension/` を選択

## 実行手順

// turbo-all

### 1. 現在のワークスペースを特定

ユーザーのアクティブなワークスペースのルートパスを確認する。

### 2. Dev Inspectorサーバーを起動

別ターミナルで以下を実行（プロジェクトルートを引数に渡す）:

```bash
node /Users/yamamotoshuuhei/Downloads/dev-inspector/server/bin.js <プロジェクトルートパス>
```

出力に以下が表示されれば成功:
```
📂 SCSS root: /path/to/styles (XX files)
✅ WebSocket server listening on ws://localhost:54321
```

### 3. 開発サーバーが未起動の場合は起動

```bash
yarn dev
```
または `npm run dev` など、プロジェクトの開発サーバーコマンドを実行。

### 4. ユーザーに案内

以下をユーザーに伝える:
- Chromeで開発サーバーのURL（例: `http://localhost:5173`）を開く
- ツールバーのDev Inspectorアイコンをクリック、または **Iキー** で起動
- **Qキー** で終了

## オプション引数

```bash
# SCSSディレクトリを明示指定（自動検出できない場合）
node /Users/yamamotoshuuhei/Downloads/dev-inspector/server/bin.js /path/to/project --scss-dir=src/styles

# ポート変更（デフォルト: 54321）
node /Users/yamamotoshuuhei/Downloads/dev-inspector/server/bin.js /path/to/project --port=12345
```

## トラブルシューティング

- **「Server disconnected」と表示される**: サーバーが起動していない → 手順2を再実行
- **SCSSが見つからない**: `--scss-dir` オプションでSCSSディレクトリを明示指定
- **ポート競合**: `--port=54322` など別ポートを指定（content.jsのポートも変更が必要）
