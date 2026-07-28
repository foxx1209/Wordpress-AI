<?php get_header(); ?>

<?php get_template_part('template/top-bg'); ?>
<main>
  <section class="p-top__mv" data-mv>
    <div class="p-top__mv-inner">
      <div class="p-top__mv-title-wrapper">
        <p class="p-top__mv-ja">可能性をつなぎ、<br>豊かな未来をつくる</p>
        <picture class="p-top__mv-title-en">
          <source media="(max-width: 768px)" srcset="<?php echo get_template_directory_uri() ?>/assets/images/top/mv-title-sp.svg">
          <img src="<?php echo get_template_directory_uri() ?>/assets/images/top/mv-title-pc.svg" alt="" width="951" height="233" decoding="async" loading="lazy">
        </picture>
      </div>
    </div>
  </section>

  <div class="p-blur">
    <div class="p-blur__wrapper">
      <section class="p-mission">
        
      </section>
    </div>
  </div>

</main>

<?php get_footer(); ?>
