# Dev Inspector — Chrome拡張 + CLIサーバー

ページ上の要素を検証し、SCSS/HTMLを直接編集できるインスペクターツール。
任意のWebサイト（WordPress含む）で動作します。

## セットアップ

### 1. サーバーインストール

```bash
cd server
npm install
```

### 2. Chrome拡張インストール

1. Chrome で `chrome://extensions` を開く
2. **デベロッパーモード** ON
3. 「パッケージ化されていない拡張機能を読み込む」→ `extension/` フォルダを選択

## 使い方

### 1. サーバー起動（プロジェクトごと）

```bash
node server/bin.js /path/to/your/project
```

### 2. Inspector起動

- Chrome ツールバーの **🔍 アイコン**をクリック
- または、ページ上で **Iキー** を押す

### 3. オプション

```bash
# エディタ指定（デフォルト: antigravity）
node server/bin.js /path/to/project --editor=cursor
node server/bin.js /path/to/project --editor=code

# ポート変更
node server/bin.js /path/to/project --port=12345

# SCSSディレクトリ指定
node server/bin.js /path/to/project --scss-dir=wp-content/themes/mytheme/scss
```

## 機能

| 機能 | 説明 |
|---|---|
| CSS値編集 | 値をクリックして直接編集 → Save |
| SCSS保存 | 変更がSCSSファイルに自動反映 |
| クラス追加 | HTMLにクラスを追加 |
| エディタ連携 | HTML/SCSSファイルをエディタで開く（画像はsrcパスでも検索） |
| PiPウィンドウ | 常に最前面のフローティングパネル |
| レスポンシブ | プリセット幅ボタン |

## 対応環境

- **ブラウザ**: Chrome 116+（Document PiP対応）
- **エディタ**: Antigravity（デフォルト）/ Cursor / VS Code
- **プロジェクト**: SCSS使用のWebサイト全般（Vite, WordPress等）
