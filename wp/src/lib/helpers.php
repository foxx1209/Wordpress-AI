<?php

/**
 * テーマ共通ヘルパー関数
 *
 * @package LinkTheme
 */

/**
 * アイキャッチ画像のURLを取得する
 *
 * @param int|WP_Post $post_id 投稿ID
 * @param string      $size    画像サイズ
 * @param string      $default サムネイルが無い場合のフォールバックURL
 * @return string
 */
function link_get_thumbnail_url($post_id, $size = 'large', $default = '')
{
    $thumbnail_url = get_the_post_thumbnail_url($post_id, $size);

    return $thumbnail_url ?: $default;
}

/**
 * 投稿の日付をフォーマットして取得する
 *
 * @param string           $format  日付フォーマット
 * @param int|WP_Post|null $post_id 投稿ID（省略時はループ内の現在の投稿）
 * @return string
 */
function link_get_date($format = 'Y.m.d', $post_id = null)
{
    return get_the_date($format, $post_id);
}

/**
 * NEWSカテゴリ（news_category タクソノミー）の最初のタームを取得する
 *
 * @param int|WP_Post $post_id 投稿ID
 * @return WP_Term|null
 */
function link_get_news_category($post_id)
{
    $terms = get_the_terms($post_id, 'news_category');

    if (empty($terms) || is_wp_error($terms)) {
        return null;
    }

    return $terms[0];
}

/**
 * WP_Query に対応したページネーションHTMLを取得する
 *
 * @param WP_Query|null $query 対象のクエリ（省略時はグローバル $wp_query）
 * @return string
 */
function link_pagination($query = null)
{
    global $wp_query;

    $query = $query instanceof WP_Query ? $query : $wp_query;
    $total = isset($query->max_num_pages) ? (int) $query->max_num_pages : 0;

    if ($total < 2) {
        return '';
    }

    $current = max(1, (int) get_query_var('paged'), (int) get_query_var('page'));

    return (string) paginate_links([
        'base'      => str_replace((string) PHP_INT_MAX, '%#%', esc_url(get_pagenum_link(PHP_INT_MAX))),
        'format'    => '',
        'current'   => $current,
        'total'     => $total,
        'prev_text' => '«',
        'next_text' => '»',
        'type'      => 'list',
    ]);
}

/**
 * テーマ内のSVGファイルをインラインで出力する
 *
 * @param string $filename SVGファイル名
 * @param string $dir      テーマルートからのアイコンディレクトリ
 * @return void
 */
function link_inline_svg($filename, $dir = 'assets/icons')
{
    $file = get_theme_file_path(trailingslashit($dir) . basename($filename));

    if (!file_exists($file)) {
        return;
    }

    // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    echo file_get_contents($file);
}
