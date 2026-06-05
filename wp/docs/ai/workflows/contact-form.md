# お問い合わせフォーム作成（CF7 + Figma）— Orelop WP

Figma デザインに基づき、Contact Form 7（CF7）でお問い合わせページを作成する。  
Figma MCP でデザイン取得、Playwright MCP で WP 管理画面操作（任意）。

**Orelop パス**

| 種類 | パス |
|------|------|
| ページ PHP | `src/page-contact.php` |
| CSS | `src/styles/components/contact-form.css` 等 → `global.css` から import |
| JS | `src/scripts/main.js` または `src/scripts/contact-form.js` |
| 管理画面 | http://localhost:8080/wp-admin/ |
| ローカル URL | http://localhost:8080/contact/ |

案件情報: `.page-info/project.json` の `pages`（slug: `contact`）

---

## 前提条件

- `npm run dev` で WordPress 起動
- **Contact Form 7** インストール・有効化（下記）
- Figma Developer MCP
- Playwright MCP（管理画面を AI が操作する場合）
- 固定ページスラッグ `contact`（または案件指定）

### CF7 のインストール（初回・ユーザー承認後）

```bash
npm run wp:start
npx wp-env run cli wp plugin install contact-form-7 --activate
```

または `plugins/` に CF7 をマウント（`.wp-env.json` は勝手に書き換えない）。

---

## 必要な情報（ユーザー / ヒアリング）

| 項目 | 説明 |
|------|------|
| Figma URL（PC/SP） | `project.json` の contact ページ |
| 管理画面 URL | http://localhost:8080/wp-admin/ |
| ログイン | `.env` の `WP_USER` / `WP_PASS`（`.env.example` 参照）または手動ログイン |
| メールテンプレート | クライアント指定があれば最優先 |

---

## 絶対ルール

### 1. チェックボックス・ラジオ・セレクトの SVG は Figma から（スキップ禁止）

ブラウザデフォルトのチェック・矢印は使わない。Figma MCP で SVG を取得し CSS `background-image`（data URI 可）で実装。

1. Figma でアイコンノードを特定
2. `get_screenshot` / `get_design_context`
3. SVG ダウンロード → data URI
4. `src/styles/tokens/tokens.css` の色変数を優先

```css
input[type="checkbox"] {
  display: block;
  appearance: none;
  width: 24px;
  height: 24px;
  border: 1px solid var(--color-border, #d1d5db);
  border-radius: 4px;
  background-color: #fff;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 14px 14px;
  cursor: pointer;
}

input[type="checkbox"]:checked {
  background-image: url("data:image/svg+xml,...");
}
```

```css
select {
  appearance: none;
  padding-right: 40px;
  background-image: url("data:image/svg+xml,...");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 24px 24px;
}
```

リセットで `input[type="checkbox"] { display: none; }` がある場合は **上書き**。

### 2. バリデーションは送信時のみ（リアルタイム禁止）

```css
.wpcf7-form:not(.invalid):not(.unaccepted) .wpcf7-not-valid-tip {
  display: none;
}

.wpcf7-form:not(.invalid):not(.unaccepted) .wpcf7-not-valid {
  border-color: transparent;
}
```

```javascript
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1 && node.classList && node.classList.contains("wpcf7-not-valid-tip")) {
            var form = node.closest(".wpcf7-form");
            if (form && !form.classList.contains("invalid") && !form.classList.contains("unaccepted")) {
              node.remove();
              var wrap = node.parentElement;
              if (wrap) {
                var control = wrap.querySelector(".wpcf7-not-valid");
                if (control) control.classList.remove("wpcf7-not-valid");
              }
            }
          }
        });
      });
    });
    document.querySelectorAll(".wpcf7-form").forEach(function (form) {
      observer.observe(form, { childList: true, subtree: true });
    });
  });
})();
```

### 3. メール設定はクライアント指示を最優先

指示がなければ下記デフォルト。**推測で作らない。**

---

## 実行工程

### 工程1: Figma 取得

- フィールド一覧・色・タイポ・寸法
- **チェック・ラジオ・セレクトの SVG**

### 工程2: CF7 フォーム（Playwright または手動）

`.env` の `WP_USER` / `WP_PASS` でログイン。

1. お問い合わせ → コンタクトフォーム → 新規
2. フォーム HTML（BEM 例: `p-contact__row`）

```html
<div class="p-contact__row">
<div class="p-contact__label">
<span class="p-contact__labelText">お名前</span>
<span class="p-contact__required">必須</span>
</div>
<div class="p-contact__field">
[text* your-name]
</div>
</div>
```

| Figma | CF7 |
|-------|-----|
| テキスト必須 | `[text* name]` |
| テキスト任意 | `[text name]` |
| メール | `[email* name]` |
| 電話 | `[tel* name]` |
| テキストエリア | `[textarea* name]` |
| チェック | `[checkbox* name use_label_element "値"]` |
| セレクト | `[select name first_as_label "ラベル" "値"]` |
| 送信 | `[submit "送信する"]` |

### 工程3: メール設定

#### メール(1) 管理者（デフォルト）

| 項目 | 値 |
|------|-----|
| 送信先 | `[_site_admin_email]` |
| 題名 | `[_site_title] お問い合わせ: [your-name]様` |

#### メール(2) 自動返信（デフォルト）

```
[your-name] 様

この度はお問い合わせいただき、誠にありがとうございます。
以下の内容で受け付けました。

（全フィールドタグ）

※このメールは自動送信です。

[_site_title]
[_site_url]
```

### 工程4: PHP（Orelop）

`src/page-contact.php`:

```php
<?php
/**
 * Template Name: Contact
 */
get_header(); ?>
<main class="l-main">
  <section class="p-contact">
    <div class="p-contact__inner">
      <h1 class="p-contact__title">お問い合わせ</h1>
      <p class="p-contact__description">説明文</p>
      <?php echo do_shortcode('[contact-form-7 id="XXX" title="お問い合わせ"]'); ?>
    </div>
  </section>
</main>
<?php get_footer(); ?>
```

固定ページスラッグ `contact` を管理画面で作成。

### 工程5: CSS（vaultcss / tokens）

- Figma 値を `tokens.css` またはページ CSS に反映
- SP: `@media (--md)` / `fluid()`（[ORELOP_TECHNICAL.md](../../ORELOP_TECHNICAL.md)）
- タップ 44px 以上、横スクロールなし

### 工程6: 検証

- [quality-checklist.md](./quality-checklist.md) を 2 周
- チェック ON/OFF・セレクト矢印が Figma 一致
- 送信時のみバリデーション

---

## CF7 更新時の注意（必読）

**`set_properties()` + `save()` は使わない**（確認画面・フォーム HTML が壊れる）。

```php
// ✅
update_post_meta($form_id, '_mail', $mail_array);
update_post_meta($form_id, '_mail_2', $mail_2_array);

// ❌ フォーム破壊の原因
// $cf->set_properties($props);
// $cf->save();
```

フォーム HTML 更新: `$wpdb->update()` + `update_post_meta(..., '_form', ...)`

---

## ラジオボタン: ラベルクリック

```javascript
document.querySelectorAll(".wpcf7-list-item-label").forEach(function (label) {
  label.addEventListener("click", function () {
    var item = label.closest(".wpcf7-list-item");
    if (!item) return;
    var radio = item.querySelector('input[type="radio"]');
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
});
```

```css
.wpcf7-list-item label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  width: 100%;
}
```

---

## チェックリスト

- [ ] Figma 取得（SVG 含む）
- [ ] CF7 作成・保存
- [ ] メール(1)(2) 設定
- [ ] `src/page-contact.php` + CSS + JS
- [ ] カスタム checkbox / select 矢印
- [ ] 送信時のみバリデーション
- [ ] [quality-checklist.md](./quality-checklist.md) 2 周
- [ ] `project.json` contact の status → 完了 → `page-info:sync`

---

## AI 依頼

[CHAT_START.md](../CHAT_START.md) の「お問い合わせ（CF7）」を貼るか:

```
docs/ai/workflows/contact-form.md に従ってお問い合わせを実装して。
pages の contact。header/footer は触らないで。
```
