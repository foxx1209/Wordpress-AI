<?php
/*
Plugin Name: Admin Bar Position
Version: 1.1.4
Author: Nakashima Masahiro
Author URI: http://www.kigurumi.asia
Plugin URI: http://www.kigurumi.asia
Description: Admin Bar go to bottom!
 */

if (!class_exists("AdminBarPosition")) {
    class AdminBarPosition
    {

        public function __construct()
        {
            add_theme_support('admin-bar', array('callback' => '__return_false'));
            add_action('wp_head', array($this, 'adminbar_print_css'));
            add_action('wp_enqueue_scripts', array($this, 'adminbar_script'));
        }

        public function adminbar_print_css()
        {
            if (is_user_logged_in()) {
                echo <<< EOM
<style>
#wpadminbar{
    top:auto;
    bottom: 0;
}
</style>
EOM;
            }
        }

        public function adminbar_script()
        {
            if (is_user_logged_in()) {
                wp_enqueue_script('jquery');
                wp_enqueue_script('adminbar-position.js', untrailingslashit( plugins_url( '', __FILE__ ) ) . '/js/scripts.js');
        }
    }
}
new AdminBarPosition();
}
