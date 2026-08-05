<?php

/**
 * 404 Not Found Template
 *
 * @package LinkTheme
 */

get_header();
?>

<main id="main-content" role="main" class="l-header-offset">

  <section class="p-404 l-section" aria-labelledby="error-heading">
    <div class="l-container">
      <div class="p-404__inner">

        <p class="p-404__code" aria-hidden="true">404</p>

        <h1 class="p-404__heading" id="error-heading">
          ページが見つかりません
        </h1>

        <p class="p-404__body">
          お探しのページは存在しないか、移動または削除された可能性があります。<br>
          URLをご確認のうえ、再度アクセスしてください。
        </p>

        <div class="p-404__actions">
          <a href="<?php echo esc_url(home_url('/')); ?>" class="c-btn c-btn--primary">
            <span>トップページへ戻る</span>
            <?php link_inline_svg('icon-arrow.svg'); ?>
          </a>

          <?php
          $news_url = get_post_type_archive_link('news') ?: home_url('/news/');
          ?>
          <a href="<?php echo esc_url($news_url); ?>" class="c-btn c-btn--outline">
            <span>お知らせ一覧を見る</span>
            <?php link_inline_svg('icon-arrow.svg'); ?>
          </a>
        </div>

      </div><!-- /.p-404__inner -->
    </div><!-- /.l-container -->
  </section>

</main>

<?php get_footer(); ?>
