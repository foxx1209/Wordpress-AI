<?php

/**
 * c-title component
 *
 * $args:
 *   en (string) 英語タイトル
 *   ja (string) 日本語サブタイトル
 */
$en = $args['en'] ?? '';
$ja = $args['ja'] ?? '';
?>
<div class="c-title js-title-reveal">
  <h2 class="c-title__en">
    <span class="visually-hidden"><?php echo esc_html($en); ?></span>
    <span class="c-title__chars" aria-hidden="true"><?php echo link_char_reveal($en); ?></span>
  </h2>
  <p class="c-title__ja">
    <span class="visually-hidden"><?php echo esc_html($ja); ?></span>
    <span class="c-title__chars" aria-hidden="true"><?php echo link_char_reveal($ja); ?></span>
  </p>
</div>
