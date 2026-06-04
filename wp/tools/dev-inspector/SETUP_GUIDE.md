---
description: Dev Inspector Chrome拡張のセットアップ（AI自動実行用）
---

# Dev Inspector セットアップ指示書

この指示書を読み込んだAIエージェントは、以下の手順を **すべて自動で実行** すること。
ユーザーへの確認は Chrome拡張インストール（Step 4）のみ。それ以外はすべて自動実行する。

---

## 自動実行手順

### Step 1: 依存パッケージのインストール

以下を実行（初回のみ。`node_modules` が存在すればスキップ）:

```bash
cd ~/Downloads/dev-inspector/server && npm install
```

### Step 2: Dev Inspector サーバー起動

以下を **バックグラウンドで** 実行する：

```bash
node ~/Downloads/dev-inspector/server/bin.js <現在のプロジェクトルートパス>
```

**ルール：**
- `<現在のプロジェクトルートパス>` はユーザーのワークスペースのルートパスに置き換える
- エディタは自動判定する：
  - **Antigravity** を使用中 → オプション不要（デフォルト）
  - **Cursor** を使用中 → `--editor=cursor` を追加
  - **VS Code** を使用中 → `--editor=code` を追加
- SCSSディレクトリは自動検出される（通常オプション不要）
- 自動検出できない場合のみ `--scss-dir=path/to/scss` を追加
- サーバーが既に起動済み（ポート54321使用中）の場合はスキップ

### Step 3: 開発サーバー起動

プロジェクトの開発サーバーが未起動の場合のみ実行：

```bash
cd <プロジェクトルート> && yarn dev
# または npm run dev
```

### Step 4: Chrome拡張のインストール案内（ユーザー手動 — 初回のみ）

**初回のみ**、以下をユーザーに伝える：

1. Chromeで `chrome://extensions` を開く
2. 右上の「デベロッパーモード」をON
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `~/Downloads/dev-inspector/extension/` フォルダを選択
5. ツールバーのパズルアイコン🧩 → Dev Inspectorをピン留め

> ※ 拡張機能は **一度インストールすれば以後不要**。2回目以降はStep 2〜3だけでOK。

### Step 5: 動作確認の案内

以下をユーザーに伝える：

- Chromeで開発サーバーのページを開く（例: `http://localhost:5173`）
- **Iキー** でInspector起動 / **Qキー** で終了

---

## エディタ連携

「📂 エディタで開く」機能は `--editor` オプションに基づいて動作する：

| エディタ | オプション | 実行コマンド |
|---|---|---|
| **Antigravity** | デフォルト | `antigravity -r -g "${target}"` |
| **Cursor** | `--editor=cursor` | `cursor -g "${target}"` |
| **VS Code** | `--editor=code` | `code -g "${target}"` |

### 検索方法

- **SCSSファイル**: クラス名でSCSSファイル内を検索し、該当行でエディタを開く
- **HTMLファイル**: クラス名で検索。`<img>` 等のクラスがない要素は `src` 属性のファイル名でも検索

---

## ファイル構成

```
~/Downloads/dev-inspector/
├── server/
│   ├── package.json    # 依存パッケージ定義
│   ├── bin.js          # CLIエントリポイント
│   └── index.js        # WebSocketサーバー本体
├── extension/
│   ├── manifest.json   # Chrome拡張設定
│   ├── background.js   # アイコンクリック → content.js注入
│   ├── content.js      # Inspector本体（UI + WebSocket通信）
│   └── icons/icon128.png
└── SETUP_GUIDE.md      # この指示書
```

---

## UIカスタマイズ（プロジェクトに合わせた調整）

ユーザーの要望に応じて、Inspectorパネルの見た目をプロジェクトのCSS設計に合わせてカスタマイズすること。

### 対象ファイル

```
~/Downloads/dev-inspector/extension/content.js
```

CSSは `style.textContent` 内（69行目付近〜）にインラインで定義されている。

### カスタマイズ可能な項目

| 項目 | CSSセレクタ | 現在の値（例） | 説明 |
|---|---|---|---|
| **パネル全体のフォントサイズ** | `#__diPanel` | `font-size:15px` | パネル全体の基本フォントサイズ |
| **パネル幅** | `#__diPanel` | `width:520px` | パネルの横幅 |
| **プロパティ名の最小幅** | `.di-css-key` | `min-width:160px` | 左列（プロパティ名）の幅 |
| **プロパティ名の色** | `.di-css-key` | `color:#8a9cc7` | CSSプロパティ名の文字色 |
| **値の色** | `.di-css-val` | `color:#d4a853` | CSS値の文字色 |
| **セレクタ表示の色** | `.di-sel-value` | `color:#7ec8e3` | 選択要素のセレクタの文字色 |
| **数値の色（ボックスモデル）** | `.di-bm-val` | `color:#d4a853` | margin/padding等の数値色 |
| **ヘッダータイトル色** | `#__diHeader h3` | `color:#e8eaf0` | パネルヘッダーの文字色 |
| **背景グラデーション** | `#__diPanel` | `background:linear-gradient(...)` | パネル全体の背景色 |
| **ヘッダー背景** | `#__diHeader` | `background:linear-gradient(...)` | ヘッダー部分の背景色 |
| **ボーダー色** | `#__diPanel` | `border:1px solid #3a3d48` | パネル外枠のボーダー色 |
| **ホバー時のオーバーレイ色** | `#__diHoverOverlay` | `border-color / background` | 要素ホバー時の枠線・背景色 |
| **選択時のオーバーレイ色** | `#__diSelectedOverlay` | `border-color / background` | 要素選択時の枠線色 |
| **フォントファミリー** | `#__diPanel` | `font-family:'JetBrains Mono',...` | 使用するフォント |

### カスタマイズ手順

1. ユーザーから「フォントサイズを変えたい」「色を変えたい」等の要望を受ける
2. `content.js` の `style.textContent` 内の該当CSSを直接編集する
3. 変更後、ユーザーに Chrome拡張のリロード（`chrome://extensions` → リロードボタン）を案内する

### 注意事項

- CSSはすべて **1行のミニファイ形式** で記述されている。改行せずに編集すること
- `@media(max-width:768px)` 内にモバイル時のオーバーライドがある。必要に応じてそちらも調整する
- フォントを変更する場合は `@import url(...)` のGoogle Fontsリンクも更新する

---

## トラブルシューティング

| 症状 | 対処 |
|---|---|
| Inspector起動しない | Chrome拡張がインストール済みか確認 |
| 「Server disconnected」 | サーバーが起動していない → Step 2を実行 |
| SCSSが保存されない | サーバーのログでSCSS検出数を確認 |
| エディタが開かない | `--editor` オプションが正しいか確認 |
| スクロールで値が変わらない | 値をクリックしてフォーカスしてからスクロール |
| 画像の「エディタで開く」が動かない | Chrome拡張をリロード（`chrome://extensions`） |
