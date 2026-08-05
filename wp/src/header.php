<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width">
  <meta name="format-detection" content="telephone=no" />
  <link rel="icon" type="image/svg+xml" href="<?php echo esc_url(ViteHelper::PUBLIC_URL); ?>/favicon.svg">
  <link rel="stylesheet" href="https://use.typekit.net/qka0nwv.css">
  <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
  <?php
  $header_logo_src = esc_url(get_theme_file_uri('assets/images/header/logo.svg'));
  $header_contact_icon_src = esc_url(get_theme_file_uri('assets/images/header/icon-contact.svg'));
  $header_nav_items = [
    ['label' => '会社概要', 'href' => home_url('/about/')],
    ['label' => '事業内容', 'href' => home_url('/#business')],
    ['label' => '採用情報', 'href' => '#'],
    ['label' => 'お知らせ', 'href' => '#'],
  ];
  ?>
  <header class="p-header" id="site-header">
    <div class="p-header__inner">
      <p class="p-header__logo">
        <a href="<?php echo esc_url(home_url('/')); ?>" aria-label="<?php bloginfo('name'); ?> トップページへ">
          <img src="<?php echo $header_logo_src; ?>" width="160" height="58" alt="<?php bloginfo('name'); ?>">
        </a>
      </p>

      <nav class="p-header__nav" aria-label="グローバルナビゲーション">
        <ul class="p-header__nav-list">
          <?php foreach ($header_nav_items as $item): ?>
            <li class="p-header__nav-item">
              <a class="p-header__nav-link" href="<?php echo esc_url($item['href']); ?>"><?php echo esc_html($item['label']); ?></a>
            </li>
          <?php endforeach; ?>
        </ul>
      </nav>

      <div class="p-header__cta">
        <a href="<?php echo esc_url(home_url('/#contact')); ?>" class="p-header__contact-btn">
          <img class="p-header__contact-icon" src="<?php echo $header_contact_icon_src; ?>" width="24" height="22" alt="" aria-hidden="true">
          <span class="p-header__contact-text">お問い合わせ</span>
        </a>
      </div>

      <button
        type="button"
        class="p-header__hamburger"
        data-drawer-open
        aria-label="メニューを開く"
        aria-expanded="false"
        aria-controls="drawer-nav">
        <img src="<?php echo esc_url(get_theme_file_uri('assets/images/header/icon-hamburger.svg')); ?>" width="44" height="44" alt="">
      </button>
    </div>
  </header>

  <div
    class="p-drawer"
    id="drawer-nav"
    aria-hidden="true"
    role="dialog"
    aria-modal="true"
    aria-label="ナビゲーションメニュー"
    data-drawer>
    <div class="p-drawer__overlay" data-drawer-overlay aria-hidden="true"></div>

    <div class="p-drawer__panel" tabindex="-1" data-drawer-panel>
      <button type="button" class="p-drawer__close" data-drawer-close aria-label="メニューを閉じる">
        <span aria-hidden="true">&times;</span>
      </button>

      <p class="p-drawer__logo">
        <img src="<?php echo $header_logo_src; ?>" width="97" height="35" alt="<?php bloginfo('name'); ?>">
      </p>

      <nav aria-label="モバイルナビゲーション">
        <ul class="p-drawer__nav-list">
          <?php foreach ($header_nav_items as $item): ?>
            <li>
              <a class="p-drawer__nav-link" href="<?php echo esc_url($item['href']); ?>"><?php echo esc_html($item['label']); ?></a>
            </li>
          <?php endforeach; ?>
        </ul>
      </nav>

      <div class="p-drawer__cta">
        <a href="<?php echo esc_url(home_url('/#contact')); ?>" class="p-drawer__contact-btn">
          <img class="p-drawer__contact-icon" src="<?php echo $header_contact_icon_src; ?>" width="24" height="22" alt="" aria-hidden="true">
          <span class="p-drawer__contact-text">お問い合わせ</span>
        </a>
      </div>
    </div>
  </div>
