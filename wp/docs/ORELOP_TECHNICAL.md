# Orelop WP（技術ドキュメント）

> **入口はルートの [README.md](../README.md)**（AI コーディング・納品・よく使うコマンド）。  
> このファイルは Docker / Vite / CSS の詳細用です。クライアント納品には含めません（`.gitattributes` 参照）。

![screenshot](https://github.com/hilosiva/orelop-wp/blob/main/src/screenshot.png)

## 概要

Orelop WP は、俺流の WordPress テーマ開発環境です。
WordPress の環境には「[wp-env](https://ja.wordpress.org/team/handbook/block-editor/reference-guides/packages/packages-env/)」を利用し、フロントエンドツールには「[Vite](https://ja.vitejs.dev/)」を利用しているため、オールインワンで高速に WordPress のテーマを開発することが可能です。


## 準備

Orelop WP を利用するには、あらかじめ以下のツールをマシンにインストールしておいて下さい。

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/ja) >= 22.12.0


## インストール

1. ターミナルを開き、「Orelop WP」を初期化したいディレクトリに移動します。

```bash
cd /path/to/project-directory
```

2. 以下のコマンドを実行して、「Orelop WP」をインストールします。

■ pnpm（推奨）
```bash
pnpm create orelop@latest
```

■ npm
```bash
npm create orelop@latest
```

■ yarn
```bash
yarn create orelop@latest
```

プロジェクト名を聞かれるのでプロジェクト名を入力してエンターしてください。
続いて、利用する CSS のプリプロセッサーやフレームワーク（Sass や Tailwind CSS）や、
JavaScript のライブラリ（GSAP や Lenis、Rola）などを任意で選択してください。


## スタートページの削除

初期状態ではウェルカムページが表示されます。実際の開発を始める前に以下の手順でスタートページを削除してください。

1. `src/template/welcome.php` を削除する
2. `src/front-page.php` を開き、`welcome.php` を include している箇所を削除する（または実際のコンテンツに置き換える）


## 開発用サーバーの起動

以下のコマンドで WordPress の環境と開発用サーバーを起動できます。

■ pnpm（推奨）
```
pnpm dev
```

■ npm
```
npm run dev
```

■ yarn
```
yarn dev
```

※初回は WordPress の環境を構築するため時間が掛かります。

開発環境は、[http://localhost:8080](http://localhost:8080) で立ち上がります。

WordPress の管理画面は、[http://localhost:8080/wp-admin/](http://localhost:8080/wp-admin/) でアクセスできます。

- ユーザ名：admin
- パスワード：password

### WordPress のサーバーが立ち上がったかを確認する

以下のコマンドで、サーバーが立ち上がっているかを確認できます。

```
docker ps
```

### WordPress の環境を変更する

デフォルトでは、WordPress の日本語の最新版がインストールされます。

ルートディレクトリにある「.wp-env.json」を編集することで、インストールする WordPress のバージョンや、利用する PHP のバージョンなどを変更することができます。

設定方法は、[wp-env](https://ja.wordpress.org/team/handbook/block-editor/reference-guides/packages/packages-env/) の Web ページでご確認ください。

WordPress を構築後に「.wp-env.json」を編集した場合は、WordPress のサーバーを停止後に、以下のコマンドで環境をアップデートする必要があります。

■ pnpm（推奨）
```
pnpm wp:update
```

■ npm
```
npm run wp:update
```

■ yarn
```
yarn wp:update
```

### WordPress のサーバーを停止

開発を中断するなど、WordPress の環境を停止するには以下のコマンドを実行します。

■ pnpm（推奨）
```
pnpm wp:stop
```

■ npm
```
npm run wp:stop
```

■ yarn
```
yarn wp:stop
```

### WordPress のサーバーを破棄する

開発が終了したなどにより、WordPress の環境を破棄する場合は、以下のコマンドを実行することで、Docker イメージごと削除することができます。

■ pnpm（推奨）
```
pnpm wp:destroy
```

■ npm
```
npm run wp:destroy
```

■ yarn
```
yarn wp:destroy
```


## WordPress テーマの作成

WordPress テーマの PHP ファイルは「src」ディレクトリに配置して下さい。

※「functions.php」の冒頭にある `require_once('lib/ViteHelper.php');` と、その読み込み先である「lib」ディレクトリ内の「ViteHelper.php」は削除しないでください。Vite の manifest を読んでアセットパスを解決するために必要なファイルです。

### header.php のカスタマイズ

`src/header.php` にはサイト名リンク（`bloginfo('name')`）とグローバルナビ（`wp_nav_menu()`）が含まれています。

ナビゲーションメニューを表示するには、WP 管理画面の「外観」→「メニュー」からメニューを作成し、「グローバル」ロケーションに割り当ててください。

### footer.php のカスタマイズ

`src/functions.php` に定義されている `THEME_LAUNCH_YEAR` 定数（初期値: `2025`）をサイトの公開年に変更してください。コピーライト表示などに使用されます。

```php
define('THEME_LAUNCH_YEAR', 2025); // サイトの公開年に変更してください
```

### Public ディレクトリ内のアセット

「Public」ディレクトリ内に保存したファイルは、ビルド後に納品用テーマディレクトリとして「dist」ディレクトリにコピーされます。従って開発時とディレクトリの構造が変わるため、以下のいずれかの対策を講じて下さい。

- 「Public」ディレクトリ内にある画像ファイルなどを本番サーバーのルートディレクトリにアップロード
- 「Public」ディレクトリ内のファイルを参照するファイルパスの冒頭に `ViteHelper::PUBLIC_URL()` を利用してパスを補完する

```php
<link rel="icon" href="<?php echo esc_url(ViteHelper::PUBLIC_URL()); ?>/favicon.ico">
```


## CSS/Sass の開発

「Orelop WP」は、CSS、Sass のどちらの開発にも対応しています。
（Sass を利用する場合はインストール時にオプションで「Sass」を選択してください。）

CSS で開発するには「src/styles/」ディレクトリ内にある「global.css」を利用し、
Sass で開発する場合は、「global.css」を「global.scss」に変更してください。

なお、ファイル名を変更する場合は、エントリーポイントである「src/scripts/main.js」内で読み込んでいる CSS のファイル名も変更してください。

例：css を「global.scss」に変更

```js
// import "../styles/global.css";
import "../styles/global.scss";
```


### ベースCSS

「global.css」にはデフォルトで以下の記述により俺流のベーススタイルの CSS を読み込んでいます。

```css
@import "vaultcss";
```

これにより、俺流のリセットや便利なカスタムプロパティなどが利用できます。

不必要な場合は削除してください。
また、reset のみ利用したい場合には、以下のように reset スタイルのみ読み込むことも可能です。

```css
@import "vaultcss/reset";
```


### ネスティングルール

「Orelop WP」は、「[CSS Nesting Module](https://www.w3.org/TR/css-nesting-1/)」に対応しているため、スタイルルールのネスト（入れ子）が利用できます。

例

```css
.hero__figure {
  height: 100vh;

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
```

### カスタムメディアクエリ

カスタムメディアクエリを使うことも可能です。

`vaultcss init` を実行すると `src/styles/tokens/mediaqueries.css` が生成されます。このファイルには `/* @vaultcss mediaqueries */` マーカーが含まれており、`vite-plugin-vaultcss` がプロジェクトルートから3階層以内を自動でスキャンして検出・登録します。

ブレークポイントをカスタマイズしたい場合は、`src/styles/tokens/mediaqueries.css` を直接編集してください。

`vite.config.ts` の `vaultcss()` オプションで追加・上書きすることも可能です。

```ts
export default defineConfig({
  plugins: [
    vaultcss({
      customMedia: {
        "--sm": "(width >= 640px)",
        "--lg": "(width >= 1024px)",
      },
    }),
  ],
})
```

カスタムメディアクエリを登録することで、以下のように少ない記述量でレスポンシブ対応が可能です。

```css
.section {
  display: block grid;
  grid-template-columns: repeat(var(--cols, 1), minmax(0, 1fr));

  @media (--md) {
    --cols: 2;
  }

  @media (--lg) {
    --cols: 3;
  }
}
```


### @import

`@import` による、CSS ファイルの分割にも対応しています。

例：「base」ディレクトリ内の「reset.css」と「components」ディレクトリ内の「hero.css」の読み込み

```css
@layer settings, base, general, vendors, components;

@import "base/reset.css" layer(base);
@import "components/hero.css" layer(components);
```

Sass の場合は、glob パターンによる読み込みにも対応しています。

例：「foundation」ディレクトリと「layout」ディレクトリ内にあるすべての .scss ファイルの読み込み

```scss
@use "foundation/**/*.scss";
@use "layout/**/*.scss";
```

### 分割したCSSファイルで画像を参照する

`@import` で読み込む分割ファイルに `background-image` などで画像を参照する場合、相対パスはバンドル時に元ファイルの位置を基準に解決しようとするためパスが壊れることがあります。
`@` エイリアスを使うと、Vite がビルド時に `src/` からのパスとして正しく解決してくれます。

```css
/* ❌ 相対パスはバンドル後にパスが壊れる場合がある */
.hero {
  background-image: url("../../assets/images/hero.jpg");
}

/* ✅ @ エイリアスを使うと src/ からのパスでViteが解決してくれる */
.hero {
  background-image: url("@/assets/images/hero.jpg");
}
```

### オリジナル関数

CSS ファイル内では、下記のオリジナル関数が利用可能です。

- `fluid()` : 最小値・最大値から `clamp()` / `max()` / `min()` / `calc()` を生成

```css
/* 基本（clamp 出力） */
p {
  font-size: fluid(16px 24px);
  /* → clamp(1rem, calc(.878641rem + .517799vi), 1.5rem) */
}

/* snap モード: カンプサイズ基準で外挿 */
.catch {
  font-size: fluid(40px 80px, snap);
}

/* 上限なし */
.hero {
  font-size: fluid(24px 48px, free-max);
}
```

| キーワード | 出力 | 説明 |
|---|---|---|
| （なし） | `clamp()` | 上下限あり（デフォルト） |
| `snap` | `clamp()` | カンプサイズを基点に外挿 |
| `fit` | `clamp()` | global snap 時に classic に戻す |
| `free-max` | `max()` | 上限なし |
| `free-min` | `min()` | 下限なし |
| `free` | `calc()` のみ | 上下限なし |

最小値と最大値には `px` または `rem` が使えます。

オプションを変更する場合は、`vite.config.ts` で `vaultcss()` に指定します。

詳細は、[lightningcss-plugin-fluid](https://github.com/hilosiva/lightningcss-plugins) をご確認ください。

```ts
export default defineConfig({
  plugins: [
    vaultcss({
      fluid: {
        minViewPort: 375,   // 対応幅の最小（px）
        maxViewPort: 1920,  // 対応幅の最大（px）
        baseFontSize: 16,   // px → rem 変換の基準
        unit: "vi",         // 使用する単位（規定値: "vi"）
        minCompSize: 440,   // snap モード: カンプ最小幅（px）
        maxCompSize: 1440,  // snap モード: カンプ最大幅（px）
        mode: "snap",       // 全体を snap モードに（省略時は inline snap のみ）
      }
    }),
  ],
})
```


## JavaScript の開発

JavaScript の開発は「src/scripts/」ディレクトリ内の「main.js」を利用して下さい。

このファイルが「Orelop WP」のエントリーポイントとなっています。


## 納品データの準備

以下のコマンドを実行すると、「dist」ディレクトリが作成され、納品用のテーマファイルが生成されます。

■ pnpm（推奨）
```
pnpm build
```

■ npm
```
npm run build
```

■ yarn
```
yarn build
```

ビルドを行うと、「src/assets/images/」ディレクトリ内の画像ファイルを最適化（圧縮や、WebP ファイルなどの生成）を行い、ハッシュ値をつけて「dist/assets/images/」内に配置されます。

画像の圧縮率や、生成するフォーマットなどに関しては、[@hilosiva/vite-plugin-image-optimizer](https://github.com/hilosiva/vite-plugins/tree/main/packages/vite-plugin-image-optimizer) を利用しているため、同パッケージのオプションで設定して下さい。

PHP ファイルや、css ファイル内の画像ファイルのパスは自動でファイルパスが置き換わります。（WebP が利用できるブラウザで閲覧した場合、「.jpg」や「.png」ファイルは WebP ファイルがレスポンスされます。）

.scss ファイルや .css ファイルは、「dist/assets/styles/」内に「index-[ハッシュ値].css」というファイル名で配置されます。

.js ファイルは「dist/assets/scripts/」内に「main-[ハッシュ値].js」というファイル名で配置されます。


## 納品データのプレビュー

以下のコマンドを実行すると、「dist」ディレクトリをテーマフォルダとして、サーバーが立ち上がります。

■ pnpm（推奨）
```
pnpm preview
```

■ npm
```
npm run preview
```

■ yarn
```
yarn preview
```


## データベースのエクスポート

以下のコマンドを実行すると、「sql/」ディレクトリに「wpenv.sql」という SQL ファイルがエクスポートされます。

■ pnpm（推奨）
```
pnpm wp:export
```

■ npm
```
npm run wp:export
```

■ yarn
```
yarn wp:export
```


## データベースのインポート

以下のコマンドを実行すると、「sql/」ディレクトリにある「wpenv.sql」という SQL ファイルをインポートします。

■ pnpm（推奨）
```
pnpm wp:import
```

■ npm
```
npm run wp:import
```

■ yarn
```
yarn wp:import
```


## AI コーディング・納品

→ ルート [README.md](../README.md) を参照（開発用ファイルはクライアント納品から除外）。


## ライセンス

[GNU General Public License v3 or later](https://www.gnu.org/licenses/gpl-3.0.html)
