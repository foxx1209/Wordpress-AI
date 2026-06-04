# CLAUDE.md — Dev Inspector WP

## 最優先タスク: GitHubリポジトリ作成＆プッシュ

このプロジェクトをGitHubの新しいリポジトリとして公開してください。

### 環境情報

| 項目 | 値 |
|------|------|
| **プロジェクトパス** | `/Users/yamamotoshuuhei/案件管理/開発拡張機能` |
| **GitHubユーザー** | `yamamotosyuhei` |
| **Git user.name** | `obbcode` |
| **Git user.email** | `obb173591@gmail.com` |
| **リポジトリ名** | `dev-inspector-wp` |
| **公開設定** | private（プライベート） |
| **認証** | macOS Keychain（`git push https://github.com/...` で自動認証される） |
| **gh CLI** | 未インストール。`brew install gh` → `gh auth login` で使えるようになる |

### 手順

```bash
# 0. gh CLIが未インストールなら先にインストール
brew install gh
gh auth login  # ブラウザ認証

# 1. プロジェクトディレクトリに移動
cd /Users/yamamotoshuuhei/案件管理/開発拡張機能

# 2. .gitignore は作成済み

# 3. Git初期化＋コミット
git init
git add -A
git commit -m "初回コミット: Dev Inspector WP — Chrome拡張 + CLIサーバー"

# 4. GitHubリポジトリ作成＋プッシュ
gh repo create yamamotosyuhei/dev-inspector-wp --private --source=. --push

# もし gh が使えない場合は手動で:
# GitHubでリポジトリを作成後:
# git remote add origin https://github.com/yamamotosyuhei/dev-inspector-wp.git
# git branch -M main
# git push -u origin main
```

---

## プロジェクト概要

ページ上の要素を選択して、SCSSファイルを直接編集できるChrome拡張＋CLIサーバーのツール。
任意のWebサイト（WordPress、Vite等）で動作する。

### ディレクトリ構成

```
開発拡張機能/
├── CLAUDE.md                   # この仕様書
├── README.md                   # 使い方ドキュメント
├── SETUP_GUIDE.md              # セットアップガイド
├── .gitignore                  # node_modules, .DS_Store除外
├── extension/                  # Chrome拡張機能（Manifest V3）
│   ├── manifest.json           # 拡張マニフェスト（v2.0.0）
│   ├── background.js           # Service Worker（タブ管理・注入）
│   ├── content.js              # メインUI＋ロジック（≈115KB, Vanilla JS）
│   └── icons/
│       └── icon128.png
├── server/                     # CLIサーバー（Node.js）
│   ├── bin.js                  # エントリポイント（CLI引数パース）
│   ├── index.js                # WebSocketサーバー本体（≈55KB）
│   ├── package.json            # 依存: ws, glob
│   └── package-lock.json
└── xserver-mcp/                # Xserver MCP連携（別ツール、含めるかは任意）
```

---

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| Chrome拡張 | Manifest V3, `chrome.scripting`, Document PiP API |
| サーバー | Node.js, WebSocket (`ws`), ファイルシステム操作 |
| 対象 | SCSS/CSS ファイル（FLOCSS設計を想定） |
| エディタ連携 | Antigravity / Cursor / VS Code |

---

## アーキテクチャ

```
Chrome拡張 (content.js)          サーバー (index.js)
┌──────────────────────┐        ┌──────────────────────┐
│ 要素選択 UI           │        │ SCSSファイル解析       │
│ CSSプロパティ表示      │  WS    │ プロパティ抽出         │
│ 値編集＋プレビュー     │◄──────►│ 正規表現ベース置換     │
│ ブレッドクラム         │        │ エディタ連携          │
│ HTML編集              │        │ HTMLテンプレート検索   │
└──────────────────────┘        └──────────────────────┘
   ブラウザ上で動作                  ローカルNode.jsプロセス
   ポート: ws://localhost:54321
```

### WebSocket通信プロトコル

| イベント | 方向 | 用途 |
|----------|------|------|
| `inspector:get-props` | 拡張→サーバー | SCSSプロパティ取得（className, nestedTag） |
| `inspector:props-result` | サーバー→拡張 | プロパティ一覧返却 |
| `inspector:save` | 拡張→サーバー | 変更保存（selector, property, value, mq, pseudo, shorthandPart, nestedTag） |
| `inspector:save-result` | サーバー→拡張 | 保存結果 |
| `inspector:add-prop` | 拡張→サーバー | 新プロパティ追加 |
| `inspector:del-prop` | 拡張→サーバー | プロパティ削除 |
| `inspector:add-class` | 拡張→サーバー | HTMLクラス追加 |
| `inspector:open-file` | 拡張→サーバー | エディタでファイルを開く |
| `inspector:open-html` | 拡張→サーバー | HTMLテンプレートを開く |

---

## サーバー主要機能 (server/index.js)

### SCSSプロパティ解析
- BEMクラス名（`.p-about__title`）からSCSSファイル内のブロックを検索
- `&__element` 形式のネスト記法にも対応
- `@include mq("md")` 内のレスポンシブプロパティも個別取得
- `::before` / `::after` 疑似要素のプロパティも取得

### 論理ショートハンド展開
- `padding-block: rem(80) rem(60)` → `padding-block-start` + `padding-block-end` に分割表示
- 保存時は逆マッピング（SCSSのショートハンド形式を維持）
- 対応: `padding-block`, `margin-block`, `padding-inline`, `margin-inline`

### ネストされたタグ対応
- `nestedTag` パラメータにより、クラスのない要素（`span` 等）のSCSSブロックを検索・編集

### CLI起動

```bash
node server/bin.js <projectRoot> [options]
# --port=54321         WebSocketポート
# --editor=antigravity エディタ（antigravity/cursor/code）
# --scss-dir=path      SCSSディレクトリ（デフォルト: 自動検出）
# --rem=css-var        rem変換方式
```

---

## Chrome拡張 主要機能 (extension/content.js)

| 機能 | 説明 |
|------|------|
| 要素選択 | クリックで選択、ホバーでハイライト |
| レイヤーピッカー | Alt+Clickで同一座標の全要素を表示 |
| SCSSプロパティ編集 | 値をcontenteditable で直接編集→Save |
| インラインプレビュー | 編集値をリアルタイムでプレビュー |
| PiPウィンドウ | Document Picture-in-Pictureで常に最前面 |
| HTML編集 | innerHTMLをテキストエリアで編集・保存 |
| 改行挿入 | テキスト内の任意位置に`<br>`挿入 |
| レスポンシブプリセット | ワンクリックで表示幅変更 |

### キーボードショートカット

| キー | 機能 |
|------|------|
| `Alt+W` | インスペクター ON/OFF |
| `↑/↓` | 値の増減（+1/-1） |
| `Shift+↑/↓` | 値の増減（+10/-10） |
| `Alt+↑/↓` | 値の増減（+0.1/-0.1） |
| `←/→` | 親/子要素ドリルダウン |
