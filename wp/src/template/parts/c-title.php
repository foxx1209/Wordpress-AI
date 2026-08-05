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
<div class="c-title">
  <h2 class="c-title__en"><?php echo esc_html($en); ?></h2>
  <p class="c-title__ja"><?php echo esc_html($ja); ?></p>
</div>
