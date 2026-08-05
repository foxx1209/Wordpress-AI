<?php
/**
 * カスタム投稿タイプ・タクソノミーの登録
 *
 * @package LinkTheme
 */

declare( strict_types=1 );

/**
 * NEWS カスタム投稿タイプ
 *
 * アーカイブ: /news/
 * 個別記事:   /news/{post-slug}/
 */
add_action( 'init', function (): void {

    register_post_type(
        'news',
        [
            'label'               => 'NEWS',
            'labels'              => [
                'name'               => 'NEWS（お知らせ）',
                'singular_name'      => 'NEWS記事',
                'add_new'            => '新規追加',
                'add_new_item'       => '新しいNEWS記事を追加',
                'edit_item'          => 'NEWS記事を編集',
                'new_item'           => '新しいNEWS記事',
                'view_item'          => 'NEWS記事を表示',
                'search_items'       => 'NEWS記事を検索',
                'not_found'          => 'NEWS記事が見つかりません',
                'not_found_in_trash' => 'ゴミ箱にNEWS記事はありません',
                'all_items'          => 'すべてのNEWS記事',
                'menu_name'          => 'NEWS',
                'name_admin_bar'     => 'NEWS記事',
            ],
            'public'              => true,
            'publicly_queryable'  => true,
            'show_ui'             => true,
            'show_in_menu'        => true,
            'show_in_nav_menus'   => true,
            'show_in_rest'        => true,   // ブロックエディター対応
            'query_var'           => true,
            'rewrite'             => [
                'slug'       => 'news',
                'with_front' => false,
            ],
            'capability_type'     => 'post',
            'has_archive'         => 'news',
            'hierarchical'        => false,
            'menu_position'       => 5,
            'menu_icon'           => 'dashicons-megaphone',
            'supports'            => [
                'title',
                'editor',
                'thumbnail',
                'excerpt',
                'author',
                'revisions',
            ],
        ]
    );

    /**
     * NEWSカテゴリ タクソノミー
     */
    register_taxonomy(
        'news_category',
        'news',
        [
            'label'             => 'カテゴリ',
            'labels'            => [
                'name'              => 'NEWSカテゴリ',
                'singular_name'     => 'NEWSカテゴリ',
                'search_items'      => 'カテゴリを検索',
                'all_items'         => 'すべてのカテゴリ',
                'edit_item'         => 'カテゴリを編集',
                'update_item'       => 'カテゴリを更新',
                'add_new_item'      => '新しいカテゴリを追加',
                'new_item_name'     => '新しいカテゴリ名',
                'menu_name'         => 'カテゴリ',
            ],
            'hierarchical'      => true,
            'public'            => true,
            'show_ui'           => true,
            'show_admin_column' => true,
            'show_in_rest'      => true,
            'rewrite'           => [
                'slug'       => 'news/category',
                'with_front' => false,
            ],
        ]
    );
} );

/**
 * パーマリンク変更時の flush_rewrite_rules
 * テーマ有効化時にパーマリンクをリセット
 */
add_action( 'after_switch_theme', function (): void {
    flush_rewrite_rules();
} );
