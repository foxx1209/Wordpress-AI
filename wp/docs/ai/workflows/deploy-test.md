# テスト環境デプロイ（FTP / lftp）

Orelop WP の **本番ビルド `dist/`** をテストサーバーの WordPress テーマディレクトリへアップロードします。

## クイックスタート

### 1. lftp をインストール（初回のみ）

```bash
brew install lftp
```

### 2. 設定ファイルを作る

```bash
cp .deploy-test.json.example .deploy-test.json
```

`.deploy-test.json` を編集（**git にコミットしない**）:

```json
{
  "host": "ftp.example.com",
  "user": "your-user",
  "password": "your-password",
  "remotePath": "/example.com/public_html/test/wp-content/themes/theme-name/",
  "localPath": "dist",
  "sslVerify": false,
  "filezillaSiteName": ""
}
```

| 項目 | 説明 |
|------|------|
| `remotePath` | サーバー上の **テーマフォルダ**（末尾 `/` 推奨） |
| `localPath` | 通常 `dist`（`npm run build` の出力） |
| `sslVerify` | Xserver 等で証明書エラーなら `false` |
| `filezillaSiteName` | 設定すると FileZilla から host/user/pass を読む（下記） |

### 3. デプロイ

```bash
npm run deploy:test
```

- 内部で `npm run build` → `lftp mirror` で `dist/` をアップロード

**ビルド済みの dist だけ上げる:**

```bash
npm run deploy:test -- --no-build
```

**コマンド確認のみ:**

```bash
npm run deploy:test -- --dry-run
```

---

## FileZilla から認証情報を使う（任意）

`.deploy-test.json`:

```json
{
  "filezillaSiteName": "Xserver-テスト",
  "remotePath": "/.../wp-content/themes/theme-name/",
  "localPath": "dist",
  "sslVerify": false
}
```

FileZilla のサイトマネージャー名（`<Name>`）と一致させます。

```
~/Library/Application Support/FileZilla/sitemanager.xml
```

パスワードは base64。スクリプトが自動デコードします。

---

## AI への依頼例

```
docs/ai/workflows/deploy-test.md に従ってテスト環境にデプロイして。
.deploy-test.json は既に設定済み。
```

設定が未完了なら AI に質問させる:

[CHAT_START.md](../CHAT_START.md) の「テスト環境デプロイ」を貼る。

---

## 手動 lftp（個別ファイル）

軽微な修正時は `dist/` 内のファイルだけ:

```bash
lftp -u "ユーザー,パスワード" FTPホスト -e "\
  set ssl:verify-certificate no; \
  put dist/page-contact.php -o /リモートパス/page-contact.php; \
  quit"
```

画像ディレクトリ:

```bash
lftp -u "ユーザー,パスワード" FTPホスト -e "\
  set ssl:verify-certificate no; \
  mirror --reverse --verbose dist/images /リモートパス/images; \
  quit"
```

> `--delete` はサーバー側の余分なファイルも消す。**初回以外は付けない**方が安全。

---

## Orelop との対応

| wordpress-cloud | Orelop WP |
|-----------------|-----------|
| `yarn build:wp` | `npm run build` |
| `wordpress/themes/wp-template/` | **`dist/`**（本番テーマ） |
| 開発中の編集 | `src/`（デプロイしない） |

テスト環境にも **ビルド済み `dist/`** を上げます。`src/` を直接 FTP しないでください。

---

## 注意事項

- `.deploy-test.json` / `.env` にパスワードを入れたら **コミットしない**
- デプロイ後はブラウザキャッシュをクリアして確認
- 本番デプロイ前はバックアップを取る
- ローカル開発再開: `npm run dev`（`development` テーマ）

---

## トラブルシュート

| 症状 | 対処 |
|------|------|
| SSL 証明書エラー | `"sslVerify": false` |
| lftp not found | `brew install lftp` |
| dist なし | `npm run build` |
| 403 / パス違い | `remotePath` が `wp-content/themes/テーマ名/` か確認 |
