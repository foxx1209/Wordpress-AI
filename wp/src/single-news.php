<?php

/**
 * Single Template: NEWS 個別記事
 *
 * カスタム投稿タイプ "news" の個別ページテンプレート。
 * 記事本文は WordPress ブロックエディター（Gutenberg）のコンテンツを表示します。
 *
 * @package LinkTheme
 */

get_header();
?>

<main id="main-content" role="main" class="l-header-offset">

  <?php if (have_posts()) : ?>
    <?php while (have_posts()) : the_post(); ?>

      <article
        class="p-news-single"
        itemscope
        itemtype="https://schema.org/Article">
        <div class="l-container">

          <!-- 記事ヘッダー -->
          <header class="p-news-single__header">

            <!-- メタ情報（日付・カテゴリ） -->
            <div class="p-news-single__meta">
              <time
                class="p-news-single__date"
                datetime="<?php echo esc_attr(get_the_date('Y-m-d')); ?>"
                itemprop="datePublished">
                <?php echo esc_html(link_get_date('Y.m.d')); ?>
              </time>

              <?php
              $cat = link_get_news_category(get_the_ID());
              if ($cat) :
              ?>
                <span class="p-news-single__category">
                  <?php echo esc_html($cat->name); ?>
                </span>
              <?php endif; ?>
            </div>

            <!-- 記事タイトル（h1） -->
            <h1 class="p-news-single__title" itemprop="headline">
              <?php the_title(); ?>
            </h1>

          </header><!-- /.p-news-single__header -->

          <!-- 記事本文 -->
          <div class="p-news-single__body" itemprop="articleBody">
            <?php the_content(); ?>
          </div>

          <!-- ページネーション（記事本文内のページ分割） -->
          <?php
          wp_link_pages([
            'before' => '<nav class="p-news-single__page-links" aria-label="ページ分割ナビゲーション"><span>ページ:</span>',
            'after'  => '</nav>',
          ]);
          ?>

          <!-- ナビゲーション（一覧へ戻る） -->
          <nav class="p-news-single__nav" aria-label="記事ナビゲーション">
            <a
              href="<?php echo esc_url(get_post_type_archive_link('news') ?: home_url('/news/')); ?>"
              class="c-btn c-btn--outline">
              <span>一覧へ戻る</span>
            </a>
          </nav>

        </div><!-- /.l-container -->
      </article><!-- /.p-news-single -->

    <?php endwhile; ?>
  <?php endif; ?>

</main>

<?php get_footer(); ?>
