# プロジェクト情報

> **このファイルは自動生成です。** 編集は [`project.json`](./project.json) で行い、`npm run page-info:sync` で反映してください。

AI はコーディング開始前に **必ず** `project.json` を読み、必要なら同期コマンドを実行してから [`README.md`](./README.md) を参照します。

## 環境情報

| 項目 | 値 |
|------|-----|
| **プロジェクト名** | （未設定） |
| **ローカル URL** | http://localhost:8080 |
| **開発コマンド** | `npm run dev` |
| **管理画面** | http://localhost:8080/wp-admin/ |
| **テーマ（開発）** | development（src/） |
| **本番 URL** | （未設定） |

## 特記事項

（なし）

---

## 共通コンポーネント

| # | 名前 | slug | 種別 | BEM | テンプレート | CSS | Figma | ステータス |
|---|------|------|------|-----|--------------|-----|-------|------------|
| 1 | ヘッダー | `header` | `layout` | `p-header` | `src/header.php` | `src/styles/components/header.css` | [PC](https://www.figma.com/design/ckXVIwQA8GTjVZMDNWSfW9/Link%E6%A7%98%E3%80%80%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E7%94%A8--%E3%82%B3%E3%83%94%E3%83%BC-?node-id=1-12722) / [SP](https://www.figma.com/design/ckXVIwQA8GTjVZMDNWSfW9/Link%E6%A7%98%E3%80%80%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E7%94%A8--%E3%82%B3%E3%83%94%E3%83%BC-?node-id=2001-4) | 完了 |
| 2 | フッター | `footer` | `layout` | `l-footer` | `src/footer.php` | `src/styles/components/footer.css` | [PC](https://www.figma.com/design/C6MgyCnjDgWsz0sQEAeXBs/Link%E6%A7%98%E3%80%80%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E7%94%A8--%E3%82%B3%E3%83%94%E3%83%BC-?node-id=2001-6) / [SP](https://www.figma.com/design/C6MgyCnjDgWsz0sQEAeXBs/Link%E6%A7%98%E3%80%80%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E7%94%A8--%E3%82%B3%E3%83%94%E3%83%BC-?node-id=2001-7) | 完了 |
| 3 | タイトル（英語見出し＋日本語サブタイトル） | `title` | `part` | `c-title` | `src/template/parts/c-title.php` | `src/styles/components/title.css` | [SP](https://www.figma.com/design/S1vJVhcf1FGR31nbHGy0vM/Link%E6%A7%98%E3%80%80%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E7%94%A8--%E3%82%B3%E3%83%94%E3%83%BC-?node-id=1-5388) | 完了 |
| 4 | CTA（例・不要なら削除） | `cta` | `part` | `c-cta` | `src/template/parts/c-cta.php` | `src/styles/components/cta.css` | — | 未着手 |

## コンポーネント詳細（header / footer / 共通パーツ）

### 1. ヘッダー (`slug: header`)

| 項目 | 値 |
|------|-----|
| 種別 | layout（全ページ） |
| BEM | `p-header` |
| テンプレート | `src/header.php` |
| 使うページ | `all` |
| Figma PC | https://www.figma.com/design/ckXVIwQA8GTjVZMDNWSfW9/Link%E6%A7%98%E3%80%80%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E7%94%A8--%E3%82%B3%E3%83%94%E3%83%BC-?node-id=1-12722 |
| Figma SP | https://www.figma.com/design/ckXVIwQA8GTjVZMDNWSfW9/Link%E6%A7%98%E3%80%80%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E7%94%A8--%E3%82%B3%E3%83%94%E3%83%BC-?node-id=2001-4 |
| ステータス | 完了 |

実装依頼例: `components の header を実装して`

**メモ**: ブレイクポイント: --header-nav(60rem/960px)。PC navの文字が改行しない最小幅でSPに切替。SPドロワーメニューは http://linkosk.xsrv.jp/ のメニュー構造・開閉挙動を踏襲。採用情報/お知らせは未実装ページのため # リンク仮置き。

### 2. フッター (`slug: footer`)

| 項目 | 値 |
|------|-----|
| 種別 | layout（全ページ） |
| BEM | `l-footer` |
| テンプレート | `src/footer.php` |
| 使うページ | `all` |
| Figma PC | https://www.figma.com/design/C6MgyCnjDgWsz0sQEAeXBs/Link%E6%A7%98%E3%80%80%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E7%94%A8--%E3%82%B3%E3%83%94%E3%83%BC-?node-id=2001-6 |
| Figma SP | https://www.figma.com/design/C6MgyCnjDgWsz0sQEAeXBs/Link%E6%A7%98%E3%80%80%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E7%94%A8--%E3%82%B3%E3%83%94%E3%83%BC-?node-id=2001-7 |
| ステータス | 完了 |

実装依頼例: `components の footer を実装して`

**メモ**: PC/SPでリンクにあったURLラベルと実際のノード幅が逆だったため（node-id=2001-7が幅375のSP用、2001-6が幅1440のPC用）、実際の寸法を優先してfigmaMetaを設定。ロゴはヘッダーで既に書き出し済みの assets/images/header/logo.svg（160x58）を再利用（footer側のFigma書き出しロゴもほぼ同一サイズだったため新規書き出しはしていない）。会社住所はPC/SPでテキスト構造が異なり（PC:「株式会社Link」＋郵便番号・住所を1行、SP:社名行なしで郵便番号・住所を2行）、同じ段落内でu-pc/u-sp出し分けのspanで対応。認定バッジ2種（セキュリティ対策自己宣言＝security-action.png、健康経営優良法人2026＝kenko-yuryo-badge.png）をFigmaからPNGで書き出したが、「健康経営優良法人／KENKO Investment for Health」のタイトル文字がbadge画像自体のフラット書き出し（download_assetsのrawImages/export both）には含まれておらず、白文字テキストがそのFigmaレイヤーの一部として個別にラスタライズされない挙動を確認（get_screenshotで背景を暗色にして初めて視認できた）。そのためbusiness__service.cssのwebmarketing flow iconと同じ手法（Python/PILでフッター全体のスクリーンショットから該当領域を切り出し、輝度→アルファ変換で白文字のみを透過PNGとして復元）でタイトル文字だけを別画像(kenko-yuryo-title.png, 210x36)として抽出し、バッジ画像の上に position:absolute（top:60.7%などパーセンテージ指定でPC/SP共通の1枚をそのまま拡大縮小）で重ねて配置。区切り線はFigma上は白1pxの単純な直線ベクター(Vector 565)だったため画像化せず<hr>+border-block-startで実装。コピーライトの年はFigma上「© 2026」だったが、functions.phpの既存定数THEME_LAUNCH_YEAR（サイト公開年、現在2025）をハードコードせず引き続き使用し、末尾のドメイン表記のみFigma通り「link-osk.co.jp」の固定文字列にした（bloginfo('name')だとサイトタイトルになりFigmaの意図と異なるため）。PC/SPで余白・バッジサイズ等はmission.css等と同じcalc(px*torem)固定+fluid(768px 1440px,fit)方式。

### 3. タイトル（英語見出し＋日本語サブタイトル） (`slug: title`)

| 項目 | 値 |
|------|-----|
| 種別 | part（部品） |
| BEM | `c-title` |
| テンプレート | `src/template/parts/c-title.php` |
| 使うページ | — |
| Figma PC | — |
| Figma SP | https://www.figma.com/design/S1vJVhcf1FGR31nbHGy0vM/Link%E6%A7%98%E3%80%80%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E7%94%A8--%E3%82%B3%E3%83%94%E3%83%BC-?node-id=1-5388 |
| ステータス | 完了 |

実装依頼例: `components の title を実装して`

**メモ**: get_template_part('template/parts/c-title', null, ['en' => 'REASON', 'ja' => '私たちが選ばれる理由']) で呼び出す汎用の見出しコンポーネント（英語+日本語2行構成）。Figmaノードは375px幅のSPアートボード上の値（en: 40px Mundial Black letter-spacing 2px / ja: 15px Noto Sans JP Bold opacity 70% letter-spacing 3px）のみ取得。PC側の拡大値は未提供のため、PCブレイクポイント向けのfluidサイズは未実装（PC個別ノードが判明次第、mission.cssのp-mission__titleに倣ってfluid()を追加）。まだどのページにも未配置。

### 4. CTA（例・不要なら削除） (`slug: cta`)

| 項目 | 値 |
|------|-----|
| 種別 | part（部品） |
| BEM | `c-cta` |
| テンプレート | `src/template/parts/c-cta.php` |
| 使うページ | `front-page`, `about` |
| Figma PC | — |
| Figma SP | — |
| ステータス | 未着手 |

実装依頼例: `components の cta を実装して`

**メモ**: ヒアリングで使わない場合は AI が削除してよい


---

## ページ一覧

| # | ページ名 | スラッグ | URL | BEM | Figma | PHP | CSS | パーツ | デザイン画像 | ステータス |
|---|----------|----------|-----|-----|-------|-----|-----|--------|--------------|------------|
| 1 | TOP | `front-page` | `/` | `p-top` | [PC](https://www.figma.com/design/ckXVIwQA8GTjVZMDNWSfW9/Link%E6%A7%98%E3%80%80%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E7%94%A8--%E3%82%B3%E3%83%94%E3%83%BC-?node-id=2005-5) / [SP](https://www.figma.com/design/ckXVIwQA8GTjVZMDNWSfW9/Link%E6%A7%98%E3%80%80%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E7%94%A8--%E3%82%B3%E3%83%94%E3%83%BC-?node-id=2005-6) | `src/front-page.php` | `src/styles/components/p-top-fv.css`<br>`src/styles/components/mission.css`<br>`src/styles/components/buziness.css`<br>`src/styles/components/business-detail.css`<br>`src/styles/components/company.css`<br>`src/styles/components/news.css` | `src/template/parts/` | `.page-info/designs/front-page.png` | 進行中 |
| 2 | 会社概要 | `about` | `/about/` | `p-about` | — | `src/page-about.php` | `src/styles/pages/about.css` | — | `.page-info/designs/about.png` | 未着手 |
| 3 | お問い合わせ | `contact` | `/contact/` | `p-contact` | — | `src/page-contact.php` | `src/styles/pages/contact.css` | — | `.page-info/designs/contact.png` | 未着手 |

## ページ詳細（AI・実装用）

### 1. TOP (`front-page`)

| 項目 | 値 |
|------|-----|
| 種別 | front-page |
| ローカル URL | `http://localhost:8080/` |
| BEM ブロック | `p-top` |
| テンプレート | `src/front-page.php` |
| Figma PC | https://www.figma.com/design/ckXVIwQA8GTjVZMDNWSfW9/Link%E6%A7%98%E3%80%80%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E7%94%A8--%E3%82%B3%E3%83%94%E3%83%BC-?node-id=2005-5 |
| Figma SP | https://www.figma.com/design/ckXVIwQA8GTjVZMDNWSfW9/Link%E6%A7%98%E3%80%80%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E7%94%A8--%E3%82%B3%E3%83%94%E3%83%BC-?node-id=2005-6 |
| fileKey | `ckXVIwQA8GTjVZMDNWSfW9` |
| nodeId（PC） | `2005:5` |
| nodeId（SP） | `2005:6` |
| ステータス | 進行中 |

**セクション / クラス**

- **MV**: `p-top__mv` — node `2005:5`
- **MISSION**: `p-mission` — node `2018:12`
- **BUSINESS**: `p-buziness` — node `2045:24`
- **BUSINESS_DETAIL**: `p-business-detail` — node `2056:36 / 2056:34 / 2056:35`
- **SERVICE（アゲキャリ／Link Agent RPO）**: `p-service` — node `2074:43`
- **SCOPE_FLOW（Webマーケティング事業）**: `p-business__service` — node `2100:55`
- **COMPANY（会社情報）**: `p-company` — node `2112:63`
- **NEWS（お知らせ）**: `p-news` — node `2117:66`
- **CONTACT（お問い合わせ）**: `p-contact` — node `2128:68`

**メモ**: SERVICE セクション実装済み（同Figmaファイル S1vJVhcf1FGR31nbHGy0vM、PC node 2074:43 / SP node 2074:44、スライド1件分のデザインは node 2074:45）：HR事業（business-detail__item--hr）に続けて、白い角丸カード2枚（①求職者向け＝アゲキャリ／②法人向け＝Link Agent(RPO)）を p-business__content 内（front-page.php 108行目〜）に配置。カード先頭に「求職者向け｜若年層特化型転職支援サービス」等の緑グラデーションタグ（linear-gradient(90deg,#009a3f,#57d72e)、HR事業と同系色）をposition:absoluteでカード上辺に半分被せる形で配置。カード①内部はロゴ（service-agecari-logo.png）＋紹介文＋イラスト（service-agecari-illust.png）→ REASON（c-titleコンポーネント初回配置、REASON/私たちが選ばれる理由）＋3つの特徴カード（アイコンPNG@2x：service-reason-icon1〜3.png）→ USER VOICE（c-title）＋転職成功者の声スライダー、の順。カード②はロゴ代わりに「Link Agent（RPO）」の文字見出し（font-mobo、color #64b932）＋紹介文＋イラスト（service-linkagent-illust.png）のみ（REASON/VOICEなし）。イラスト・ロゴ・アイコン・アバターは全てFigmaから2倍でPNG書き出し（src/assets/images/top/service-*.png）。スライダーはSplide（@splidejs/splide、既にpackage.jsonに依存あり、今回が初使用）を type:loop, perPage:1 で使用し、src/scripts/modules/voice-slider.jsで初期化、CSSは@splidejs/splide/css/coreの素の状態からp-service__voice-*で完全独自スタイリング（矢印はFigma書き出しSVGを左右反転して流用、ページネーションドット・スライドカード四隅の緑ドットはCSSで実装）。5件の口コミ（A/R/K/O/T さん）のアバターイラスト・本文・年代性別バッジは各スライド個別（Figmaノード 23:393,23:632,23:655,23:726,23:752 個別書き出し）。CSSは src/styles/components/service.css に分離、mission.css の構造（BEM・torem・fluid()）を踏襲しつつ、ユーザー指示により実測コンプ幅（375px/1440px）以外の中間幅を vaultcss の fluid(min max, 375px 1440px) で連続的に可変化（buziness.css/mission.cssのSP=calc()固定+PC=fluid(768,1440)方式ではなく、business-detail.cssと同じ375-1440連続方式を採用）。注意点：①タイトルコンポーネント c-title (title.css) の日本語サブタイトル letter-spacing が 0.02em になっていたバグを本タスクで確認したFigma値（SP:3px/15px, PC:3.6px/18px ≒ いずれも0.2em）に基づき 0.2em に修正（c-title初のページ配置に伴う修正、他画面が本コンポーネントを使う場合は影響を受ける点に留意）。②Figma上、SP側（node 2074:44）にのみ「USER VOICE / 転職成功者の声」の見出しノードが存在せず（PC側 node 2074:43 には有り）、他カードの抜け漏れ前例（BUSINESSセクション注意点①）と同様にFigma側の作成漏れと判断し、SPでもPCと同じc-titleを表示している。③法人向けカードのタグラベルがFigma SP側で誤って「求職者向け」のテキストのまま複製されていた（PC側は正しく「法人向け」）ため、内容（Link Agent RPO＝法人向けRPOサービス）と整合するPC側の文言を正としてSP/PC共通で採用。④カード全体・タグピル・吹き出し等のpadding/gap/box-shadowの一部はFigmaの絶対座標から近似値で算出（他セクション同様、目視で違和感のない範囲に丸め）。 MV の shape-bg（リングSVGアニメーション）、mv-en/mv-ja（PC/SPでcoding済み・768pxで切替）を実装。PC見出しは「LINKING POSSIBILITIES」、SPは「FORWARD TOGETHER」とFigma側でコピーが異なるため別要素で出し分け。MISSION セクション実装済み：タイトル（OUR MISSION）は Figma から書き出した PNG。ボタン内タイトル（OUR VISION/OUR VALUE）とプラスアイコンは通常テキスト＋CSS疑似要素（画像不使用、2回目の指示で画像から変更）。ボタンはモーダル（OUR VISION: SP node 2019:16 / PC node 2026:32、OUR VALUE=Linkism: SP node 2019:17（≒2026:35） / PC node 2026:33）。モーダルは vaultscript の createModal（<modal-dialog> カスタム要素、直下の <button> と <dialog> をトグル）を使用し、閉じるボタンは <dialog> 直下ボタンではないため src/scripts/modules/modal.js で外側ボタンの click() を発火させて閉じる工夫をした（http://linkosk.xsrv.jp/ のドロワー開閉挙動を参考にした開閉パターンを踏襲）。PCモーダルはSPと別デザイン（大判カード・OUR VALUEはジグザグ配置）で @media (--md) 上書き。1440px〜1920px間は p-mission のオフセット/ボタンサイズ等を vaultcss の fluid(min max, 1440px 1920px, fit) で可変化（グローバル mode:"snap" のため fit で通常clamp()に戻し、減少方向の値は free で calc() のみ出力）。BUSINESS セクション実装済み（別Figmaファイル S1vJVhcf1FGR31nbHGy0vM の node 2045:24(PC)/2045:25(SP)）：3枚の事業カード（HR/IT・DX/Webマーケティング）を PHP 配列でループ生成（src/front-page.php）、CSS は src/styles/components/buziness.css に分離し mission.css と同じ「base=calc(SP px*torem)固定、@media(--md)=fluid(SP px PC px,768px 1440px,free)」方式で375px⇄1440pxの中間幅を可変化。SPは通し番号+テキストを2カラム（テキスト左/イラスト右）、PCは1カラム中央寄せに配置を横→縦に切替。カード上部にはみ出す連番（01/02/03）はposition:absoluteでカード上端をまたぐ配置。イラストはFigmaから書き出したPNG（@2x, src/assets/images/top/business-illust-*.png）、ボタンの丸矢印アイコンはFigmaから書き出したSVG（カード色ごとに3種、business-btn-arrow-*.svg）。ボタンのグラデーションは3色（HR:緑 #009A3F→#57D72E／IT・DX:青 #50B5FF→#0039D0／Webマーケティング:赤茶 #972800→#F80800）。注意点：①SPのIT/DX事業カードはFigma上に「IT/DX事業」という単体ラベルテキストが存在しなかった（HR/Webマーケティングカードには存在）ため、他カードとの一貫性のためSP版でも同ラベルを追加している（Figma側の抜け漏れの可能性、要デザイナー確認）。②セクション自体の上下padding（padding-block-start/end）は本Figmaファイルがbusinessセクション単体の書き出しでMISSIONセクションとの実際の間隔が計測できなかったため暫定値。③カード内の余白・行間の一部はFigmaの絶対座標から近似値で算出（厳密なピクセル一致ではなく目視で違和感のない範囲に丸め）。BUSINESS_DETAIL セクション実装済み（同Figmaファイル、PC node 2056:36(HR)/2056:34(IT・DX)/2056:35(Webマーケティング)、SP node 2058:37/2058:38/2058:39）：BUSINESS の下に続く、事業ごとの大判イラスト付き紹介ブロックを PHP 配列でループ生成（src/front-page.php、p-blur の外＝ブラー背景の対象外）。CSS は src/styles/components/business-detail.css に分離。ユーザー指示により、コンプ幅（375px/1440px）以外の全幅を vaultcss の fluid(min max, 375px 1440px, free) で連続的に可変化する方式を採用（mission.css/buziness.css の「SP=calc()固定・PC=fluid(768px 1440px)」方式とは異なり、レイアウト自体が変わるプロパティ（grid-template-columns 等）のみ @media (--md) で切替）。レイアウトは CSS Grid の grid-template-areas で構成し、番号(number)/ラベル(label)/事業名(name)/イラスト(illust)/本文(desc) の5要素を SP=1カラム縦積み中央寄せ、PC=テキスト1カラム+イラスト1カラムの2カラムに再配置（HTML の記述順は number→label→name→desc→illust固定、視覚順のみ grid-area で制御）。事業名(name)はグラデーションテキスト（HR:緑 #009A3F→#57D72E／IT・DX:青 #36A5F7→#0039D0／Webマーケティング:赤 #BD1515→#F80800、background-clip:text）。フォントは Figma 上で「MOBO」という専用フォントが指定されていたため tokens.css に --font-mobo を追加（mundial 同様、Web フォントの実体は未同梱でフォールバック依存）。イラストは Figma 上でPC/SP別々にクロップ・構成されていたため、各アイテムにつき PC用/SP用の2枚を書き出し（@2x, business-detail-illust-{hr,itdx,webmarketing}-{pc,sp}.png）、u-pc/u-sp で出し分け。注意点：①Figma上でこの3ブロックは巨大キャンバス上に絶対配置され、直近の親フレームがページ全体（BUSINESSセクションや無関係な他セクションと同階層）だったため、実際のセクション上下padding・アイテム間gapは対応する専用フレームが存在せず暫定値。②各アイテムの文言・数値見出し(01/02/03)・グラデーション色はFigmaノードから直接取得したが、フォントサイズ・字間・行間の細部（例:事業名のPC版が「HR/事業」で2種類のフォントサイズに分かれている等）は3アイテムで共通のコンポーネントとして扱うため単純化・統一している。SCOPE_FLOW セクション実装済み（同Figmaファイル、PC node 2100:55 / SP node 2100:54）：Webマーケティング事業（business-detail__item--webmarketing）に続けて、HR/IT・DX事業と同じ白い角丸カード（p-business__service-card--webmarketing、タグピルなし）を p-business__content 内に配置。カード内部は SCOPE（c-title、ご支援可能媒体（一部））＋ FLOW（c-title、ご支援の流れ）の2ブロックのみ（intro/REASON/VOICEなし）。SCOPEはLINE/Instagram/X/Google/Yahoo!のアイコンが中央のLINKロゴへ線でつながるハブ図で、Figma上は多数の小さなベクター線パーツで構成されていたため、背景の角丸グレーボックス＋アイコン＋接続線＋キャプション文言を丸ごと1枚のPNG（@2x、透過なし・矩形いっぱいに図柄が敷き詰められている）としてPC/SP個別に書き出し（service-webmarketing-scope-{pc,sp}.png）、コンテナ側に border-radius+overflow:hidden を掛けて四隅の白抜けをクリップする方式で対応（Figma書き出しAPIがノードの四隅を不透明白で塗って返す仕様のため）。FLOWは4ステップ（市場調査／施策提案／WEB集客支援実行／効果測定改善提案）を実在のHTML（p-business__service-flow-list > p-business__service-flow-item、背景色#f4f4f4の角丸ボックス＋アイコン画像＋タイトル・本文の実テキスト）で再構築し、PCは横並び、SPは縦積みで、間に矢印画像（service-webmarketing-flow-arrow.png、SPはCSSで90deg回転）を配置。既存のitdx flow-diagram（1枚に丸ごとテキストまで焼き込む方式）とは異なり、アイコンのみ個別書き出しにしてテキストは実文字のまま残す方式を採用（アクセシビリティ・保守性を優先）。アイコン4種（市場調査＝人物+虫眼鏡／施策提案＝電球+手／WEB集客支援実行＝ブラウザ+メガホン／効果測定改善提案＝書類+虫眼鏡）と矢印は、Figma書き出しが単色線画にもかかわらず不透明白背景で返ってきたため、Python(PIL)でグレースケール値から不透明白背景を透過アルファへ復元（luminance→alpha変換、線画の実色を保持）する後処理を行ってから配置。CSSは既存の src/styles/components/business__service.css に追記（新規ファイルは作らず）。注意点：①Figma上、このカードにはHR/IT・DX事業カードのような緑・青のタグピル（求職者向け／法人向け等）が存在しないため、そのままタグなしで実装している。②SCOPEボックス・FLOWリストの最大幅はいずれもFigma実測値（1033px）に合わせて統一。③box-shadowや余白の細部は他カード同様、Figmaの絶対座標からの近似値。④実装後にPlaywrightでPC(1440px)/SP(375px)双方の描画を目視確認済み（コンソールエラーは既存の未解決フォント404（MOBO.woff2）のみで、本タスクによる新規エラーなし）。追加修正2件：①ユーザー指示により、SCOPE_FLOWカードのクラスを共通 `.p-business__service-card`＋modifier（`--webmarketing`）方式から、独立クラス `.p-business__service-webmarketing` に分離・再構築（見た目は既存の白背景・角丸・box-shadow・paddingを維持したままCSSごと複製し、HR/IT・DXカードとは独立させた）。②Figma node 1:8218（flow1_sp）を再取得したところ、SP版の `p-business__service-flow-item` は PC版と同じ「タイトル→アイコン→本文」の縦積み中央寄せではなく、「アイコンを左、タイトル＋本文を右」に横並びさせるレイアウトだと判明（実測値：アイコン x=70,y=10526,w=70.66,h=67.84／タイトル・本文は left=158 で揃い、カード左端からアイコンまでの余白と、本文右端からカード右端までの余白が非対称）。`.p-business__service-flow-item` をSPは `display:grid; grid-template-columns:auto 1fr; grid-template-areas:"icon title" "icon text"` に変更し、PC（`@media (--md)`）側で従来通り `display:flex; flex-direction:column; text-align:center` に戻す形に修正（HTMLのDOM順序＝タイトル→アイコン→本文は変更せず、grid-areaのみで視覚順を制御）。COMPANY セクション実装済み（同Figmaファイル S1vJVhcf1FGR31nbHGy0vM、PC node 2112:63 / SP node 2112:64）：SCOPE_FLOWに続けて、会社情報の定義テーブルを front-page.php 375行目〜に配置。タイトルはc-titleコンポーネントを再利用（en: COMPANY / ja: 会社情報）。テーブルは `<dl class="p-company__table">` の中に `.p-company__row`（dt+dd）を10行（企業名/設立/資本金/所在地/支社所在地/代表取締役/事業内容/厚生労働大臣許認可番号/法務顧問/連絡先）PHP配列でループ生成し、各行上部＋テーブル最下部に1pxの罫線（border-block-start、色#282828）を配置（Figma上は行間に同色の極細SVG罫線(Vector31等)が個別に敷かれていたが、単純な水平線のため画像化せずCSSのborderで再現）。ラベル列幅・フォントサイズ・行のpadding等はbusiness-detail.cssと同じ「コンプ幅(375px/1440px)以外の全幅をfluid(min max,375px 1440px)で連続可変化」方式を採用（新規 src/styles/components/company.css、global.cssにpages層で追加インポート）。注意点：①PC側Figmaのセクション見出し英字が「CAMPANY」という誤字だった（SP側は正しく「COMPANY」）ため、正しい表記に統一してSP/PC共通で「COMPANY」を採用。②連絡先の内容がSP側Figma（node 2112:64）にはMail/Telの2行のみで、PC側Figma（node 2112:63）には「採用に関するお問い合わせ／06-7653-8192」の2行が追加されていた（他セクションで前例のあるFigma側SP作成漏れと判断し、SP/PC共通で4行とも表示）。③支社所在地の住所表記がPC側Figmaのみ「大深町６−３８」と全角数字/ハイフンになっていた（SP側は半角「大深町6-38」）ため、実在住所として半角表記に統一。④行の縦paddingや罫線位置はFigmaの絶対座標からの近似値（他セクション同様、目視で違和感のない範囲に丸め）。NEWS セクション実装済み（同Figmaファイル、PC node 2117:66 / SP node 2116:65）：COMPANYに続けて、p-blur の外に新規 `<section class="p-news">` を front-page.php 末尾に配置（NEWSは白背景の単純なリストのためブラー背景対象外と判断）。タイトルはc-titleコンポーネントを再利用（en: NEWS / ja: お知らせ）。一覧は実際の `news` カスタム投稿タイプ（post-types.php で登録済み）を `WP_Query`（`posts_per_page: 3`）で新着順に取得し、サムネイル（`has_post_thumbnail()` で分岐、無い場合は Figma のダミー写真を書き出した `news-thumb.jpg` をプレースホルダーとして表示）／タイトル／抜粋（`wp_trim_words`, 40語）／`news_category` タクソノミーの1件目（未設定時は「お知らせ」固定表示）／日付（`Y.n.j` 形式、Figma表記「2025.4.20」に合わせゼロ埋めなし）をカード化。カードは `.p-news__card` を CSS Grid の `grid-template-areas` で構成し、SP=`"thumb thumb" "body arrow"`（サムネイル上・本文と丸矢印ボタンを下段）、PC(`@media (--md)`)=`"thumb body arrow"`（左サムネイル・中央本文・右丸矢印ボタンの横並び）に切替（business-detail.cssと同様のgrid-area切替パターン）。丸矢印アイコンはFigmaの円(Ellipse 31)+矢印(Vector 576)を1つに合成済みの書き出し（"Group 59"相当）をそのまま `news-arrow.svg` として書き出し・使用（3件とも共通アイコンとして再利用、Figma上SP側にはこのアイコンがカード中央寄りに配置されていたが、他カードとの一貫性・タップしやすさを優先しPC同様カード右下寄せに統一）。サイズ・余白は mission.css/buziness.css と同じ「SP=calc(px*torem)固定、PC=fluid(px px,768px 1440px,fit)」方式を採用（新規 src/styles/components/news.css、global.cssにpages層で追加インポート）。カード間の区切り線は1px solid rgb(40 40 40 / 15%)で実装（Figma上の罫線(Vector 577/578)はPC側ノードのみに存在し色情報が取得できなかったため、company.cssの罫線同系色をベースに半透明で近似）。日付・カテゴリピルのフォントはFigma上「Be Vietnam Pro」指定だったが、本プロジェクト未導入のWebフォントのため新規追加はせず、既存トークン `--font-poppins`（Regular/Medium ウェイトともfont-face.cssに定義済み）で代替。最下部「もっと見る」ボタンは黒背景ピル型ボタンとして実装し、リンク先は `get_post_type_archive_link('news')`（404.phpの実装パターンを踏襲、取得失敗時は `/news/` にフォールバック）。投稿が0件の場合は一覧・ボタンごと非表示（`WP_Query::have_posts()` で分岐）。注意点：①Figma上、SP側ノード(2116:65)には「もっと見る」ボタンが含まれておらず、PC側ノード(2117:66)にのみ存在したため、他セクション同様のFigma側作成漏れと判断しSP/PC共通で表示している。②カード内padding・グリッドgapの一部はFigmaの絶対座標からの近似値（目視で違和感のない範囲に丸め）。③サムネイルはFigma書き出しの元画像（4096px幅の高解像度ストック写真）を700pxへリサイズ（実表示幅294px/195pxに対し2倍以上を確保）した上で `src/assets/images/top/news-thumb.jpg` として書き出し、投稿にアイキャッチが無い場合のプレースホルダーとして使用。CONTACT セクション実装済み（同Figmaファイル、PC node 2128:68 / SP node 2128:67）：NEWSの下、p-blur の中に front-page.php 末尾（499行目〜）で新規 `<section class="p-contact">` を配置。白い角丸カード（p-business__service-card等と同系のradius/box-shadow、SP:17px/6 8 19.8 rgba(.25)→PC:31px/4 8 33.4 rgba(.18)）の中に、c-titleコンポーネント（en: CONTACT / ja: お問い合わせ）＋実際に動作する Contact Form 7 フォーム（新規作成、投稿ID 139、管理画面名「お問い合わせ（TOPページ）」）を配置。フィールドはお問い合わせ種別（ラジオ3択、1番目をdefault:1でチェック済みに）／お名前／メールアドレス／携帯電話番号／お問い合わせ内容（テキストエリア）の5つ＋送信ボタン「お問い合わせを確定する」。docs/ai/workflows/contact-form.md の手順に従い、CF7フォーム本文には p-contact__row/p-contact__label/p-contact__field 等のBEMラッパーdivを直接エディタ側に記述（front-page.php側は `echo do_shortcode(do_shortcode('[contact-form-7 id="139"]'))` のみ）。ラジオ・矢印アイコンはFigmaから取得したベクター実測値（Ellipse35=外枠円/Ellipse46=内側赤丸/Vector564=送信ボタン矢印）を使用：ラジオはcheckbox/radioのブラウザデフォルト外観を使わないという絶対ルールに従い、appearance:noneのCSS背景image（data URI、Figma実測円のパス値そのまま）でチェック前後を出し分け。送信ボタンの矢印（contact-arrow.svg）はCF7フォーム本文が静的テキストでPHPを実行できないため、functions.phpに独自ショートコード`[contact_arrow_icon]`を追加しget_theme_file_uri()経由で解決（front-page.php側でdo_shortcodeを二重適用することで、CF7が返すHTML内の当該ショートコードも展開される）。送信時のみバリデーション表示・ラジオのラベルクリック対応は、同ドキュメント記載のCSS（`.wpcf7-form:not(.invalid):not(.unaccepted) .wpcf7-not-valid-tip{display:none}`等）とJS（src/scripts/modules/contact-form.js、MutationObserver＋ラベルclickでinput連動）をそのまま採用。CF7自体の自動<p>/<br>挿入（wpautop）はBEM構造と競合するため`add_filter('wpcf7_autop_or_not','__return_false')`でグローバル無効化（functions.php、現状CF7利用はこのフォームのみのため影響なし）。メール設定はクライアント指定が無いため同ドキュメントの工程3デフォルトに従い、管理者宛て（[_site_admin_email]、Reply-To:[your-email]）と自動返信（[your-email]宛て、Reply-To:[_site_admin_email]）の2通を設定。注意点：①CF7 6.1.6で `[text* name placeholder "..." autocomplete:xxx]` の順（quoted optionの後にcolon-option）だとタグが正しくパースされず生の `[text...]` 文字列がそのまま出力される具体的なバグを確認したため、`autocomplete:xxx placeholder "..."`の順（colon-optionを先）に統一して回避（CF7側の既知の制約、今後同種フィールド追加時も同じ順序を守ること）。②card内の余白・行間・グリッド寸法はFigmaの絶対座標（同ファイル内の巨大キャンバス上のY座標）からの差分計算による近似値（他セクション同様、目視で違和感のない範囲に丸め）。

### 2. 会社概要 (`about`)

| 項目 | 値 |
|------|-----|
| 種別 | page |
| ローカル URL | `http://localhost:8080/about/` |
| BEM ブロック | `p-about` |
| テンプレート | `src/page-about.php` |
| Figma PC | — |
| Figma SP | — |
| fileKey | `—` |
| nodeId（PC） | `—` |
| nodeId（SP） | `—` |
| ステータス | 未着手 |

**セクション / クラス**

- （セクション未登録）


### 3. お問い合わせ (`contact`)

| 項目 | 値 |
|------|-----|
| 種別 | page |
| ローカル URL | `http://localhost:8080/contact/` |
| BEM ブロック | `p-contact` |
| テンプレート | `src/page-contact.php` |
| Figma PC | — |
| Figma SP | — |
| fileKey | `—` |
| nodeId（PC） | `—` |
| nodeId（SP） | `—` |
| ステータス | 未着手 |

**セクション / クラス**

- （セクション未登録）



---

## コーディング開始前（AI 必須）

1. [`project.json`](./project.json) を読む（マスターデータ）
2. `npm run page-info:sync` を実行し、この README と内容が一致しているか確認
3. 実装対象ページの **BEM・テンプレート・Figma URL** を上記から取得してからコーディング開始
4. 完了したら `project.json` の `status` を更新し、再度 `page-info:sync`

### 下層ページ（WordPress）

- 固定ページ: `src/page-{スラッグ}.php` + 管理画面でスラッグ一致
- 共通パーツ: `src/template/parts/`（`components` 一覧を参照）

### Figma URL の書き方（project.json）

- `figma.pc` / `figma.sp` に URL をそのまま記載
- `figmaMeta.fileKey` と `nodeIdPc`（`14001:8` 形式）は MCP 用に任意で記載

---

## AI ドキュメント

| 用途 | パス |
|------|------|
| マスターデータ | `.page-info/project.json` |
| 同期 | `npm run page-info:sync` |
| 索引 | `docs/ai/README.md` |
| 新規案件 | `docs/ai/workflows/new-project.md` |
| Figma 実装 | `.cursor/rules/figma-design-system.mdc` |
