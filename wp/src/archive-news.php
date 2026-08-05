<?php

/**
 * Archive Template: NEWS 一覧
 *
 * カスタム投稿タイプ "news" のアーカイブページテンプレート。
 * URL: /news/
 *
 * @package LinkTheme
 */

get_header();
?>

<main id="main-content" role="main" class="l-header-offset">

  <section class="p-news-archive l-section" aria-labelledby="news-archive-heading">
    <div class="l-container">

      <!-- セクション見出し -->
      <header class="c-section-heading">
        <h1 id="news-archive-heading">
          <span class="c-section-heading__en">NEWS</span>
          <span class="c-section-heading__ja">お知らせ</span>
        </h1>
      </header>

      <!-- 記事一覧 -->
      <?php if (have_posts()) : ?>

        <div class="p-news__archive-list">
          <?php while (have_posts()) : the_post(); ?>
            <?php
            $post_id = get_the_ID();
            $thumb   = link_get_thumbnail_url($post_id, 'large', '');
            $date    = link_get_date('Y.m.d', $post_id);
            $cat     = link_get_news_category($post_id);
            ?>
            <a
              href="<?php the_permalink(); ?>"
              class="c-news-card"
              aria-label="<?php echo esc_attr(get_the_title()); ?>">

              <?php if ($thumb) : ?>
                <img
                  class="c-news-card__thumbnail"
                  src="<?php echo esc_url($thumb); ?>"
                  alt=""
                  width="195"
                  height="140"
                  loading="lazy">
              <?php else : ?>
                <div
                  class="c-news-card__thumbnail c-news-card__thumbnail--placeholder"
                  aria-hidden="true">
                  <span>No Image</span>
                </div>
              <?php endif; ?>

              <div class="c-news-card__body">
                <div class="c-news-card__meta">
                  <time
                    class="c-news-card__date"
                    datetime="<?php echo esc_attr(get_the_date('Y-m-d')); ?>">
                    <?php echo esc_html($date); ?>
                  </time>
                  <?php if ($cat) : ?>
                    <span class="c-news-card__category">
                      <?php echo esc_html($cat->name); ?>
                    </span>
                  <?php endif; ?>
                </div>

                <h2 class="c-news-card__title"><?php the_title(); ?></h2>

                <p class="c-news-card__excerpt">
                  <?php echo esc_html(wp_trim_words(get_the_excerpt(), 40, '...')); ?>
                </p>

                <span class="c-news-card__arrow" aria-hidden="true">
                  <?php link_inline_svg('icon-arrow.svg'); ?>
                </span>
              </div><!-- /.c-news-card__body -->

            </a><!-- /.c-news-card -->
          <?php endwhile; ?>
        </div><!-- /.p-news__list -->

        <!-- ページネーション -->
        <?php
        global $wp_query;
        $pagination = link_pagination($wp_query);
        if ($pagination) :
        ?>
          <nav class="p-news-archive__pagination" aria-label="記事ページナビゲーション">
            <?php
            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
            echo $pagination;
            ?>
          </nav>
        <?php endif; ?>

      <?php else : ?>
        <p class="p-news__empty">現在、お知らせはありません。</p>
      <?php endif; ?>

    </div><!-- /.l-container -->
  </section>

</main>

<?php get_footer(); ?>
