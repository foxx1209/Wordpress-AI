<?php

/**
 * Page Template: RECRUIT 採用情報
 *
 * /recruit/ 用の採用情報ページ。
 *
 * @package LinkTheme
 */

get_header();
?>

<main id="main-content" role="main" class="l-header-offset">

  <section class="p-news-archive p-recruit-page l-section" aria-labelledby="recruit-heading">
    <div class="l-container">

      <!-- セクション見出し -->
      <header class="c-section-heading">
        <h1 id="recruit-heading">
          <span class="c-section-heading__en">RECRUIT</span>
          <span class="c-section-heading__ja">採用情報</span>
        </h1>
      </header>

      <div class="p-recruit-page__content">
        <p class="p-recruit-page__coming">Coming soon</p>
        <p class="p-recruit-page__wantedly">Wantedly掲載準備中</p>

        <a
          href="<?php echo esc_url(home_url('/')); ?>"
          class="p-recruit-page__back">
          <span>トップページに戻る</span>
          <span class="p-recruit-page__back-icon" aria-hidden="true">
            <?php link_inline_svg('icon-arrow.svg'); ?>
          </span>
        </a>
      </div>

    </div><!-- /.l-container -->
  </section>

</main>

<?php get_footer(); ?>
