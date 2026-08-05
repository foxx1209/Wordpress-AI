<?php
/*======================================
  Includes
======================================*/
require_once('lib/ViteHelper.php'); // こちらは削除しないでください。
require_once __DIR__ . '/lib/helpers.php';
require_once __DIR__ . '/post-types.php';



/*======================================
  テーマ定数
======================================*/
define('THEME_LAUNCH_YEAR', 2025); // サイトの公開年に変更してください



/*======================================
  初期設定
======================================*/
function theme_setup()
{

  /*
    Titleタグ
  ----------------------------------- */
  add_theme_support('title-tag');

  /*
    HTML5をサポート
  ----------------------------------- */
  $args = [
    'search-form',
    'comment-form',
    'comment-list',
    'gallery',
    'caption',
    'style',
    'script'
  ];
  add_theme_support('html5', $args);




  /*
    アイキャッチ画像
  ----------------------------------- */
  add_theme_support('post-thumbnails');


  /*
    カスタムメニュー
  ----------------------------------- */
  $locations = [
    'global' => 'Global Navigation'
  ];
  register_nav_menus($locations);
}
add_action('after_setup_theme', 'theme_setup');




/*======================================
  画質の劣化の無効化
======================================*/
add_filter('jpeg_quality', function ($arg) {
  return 100;
});
add_filter('big_image_size_threshold', '__return_false');


/*======================================
  不要な head内の要素削除
======================================*/
remove_action('wp_head', 'wp_generator');
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('wp_print_styles', 'print_emoji_styles');
remove_action('wp_head', 'rsd_link');
remove_action('wp_head', 'wlwmanifest_link');
remove_action('wp_head', 'feed_links_extra', 3);


/*======================================
  Contact Form 7: 自動 <p>/<br> 挿入を無効化（BEM マークアップをそのまま出力するため）
======================================*/
add_filter('wpcf7_autop_or_not', '__return_false');


/*======================================
  Contact Form 7: 送信ボタンの矢印アイコン（CF7フォーム本文は静的テキストのため
  get_theme_file_uri() をショートコード経由で呼び出す）
======================================*/
add_shortcode('contact_arrow_icon', function () {
  return sprintf(
    '<img src="%s" width="10" height="16" alt="" loading="lazy" decoding="async">',
    esc_url(get_theme_file_uri('assets/images/top/contact-arrow.svg'))
  );
});
