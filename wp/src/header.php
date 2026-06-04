<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width">
  <meta name="format-detection" content="telephone=no" />
  <link rel="icon" type="image/svg+xml" href="<?php echo esc_url(ViteHelper::PUBLIC_URL); ?>/favicon.svg">
  <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>

  <header class="header">
    <p class="header__title">
      <a href="<?php echo esc_url(home_url('/')); ?>"><?php bloginfo('name'); ?></a>
    </p>
    <?php
    wp_nav_menu([
      'theme_location' => 'global',
      'container'      => 'nav',
      'container_attr' => ['aria-label' => 'グローバル'],
    ]);
    ?>
  </header>
