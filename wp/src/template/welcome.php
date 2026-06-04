<?php
// orelop:welcome — このファイルを削除して index.php の get_template_part('template/welcome') を書き換えてください
$mode = ViteHelper::IS_DEVELOPMENT ? "development" : "production";
?>

<style>
  .welcome {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: grid;
    place-items: center;
    font-family: ui-sans-serif, system-ui, sans-serif;
    color: #fff;
    background:
      radial-gradient(ellipse at 20% 60%, rgba(56, 127, 209, 0.18) 0%, transparent 55%),
      radial-gradient(ellipse at 80% 30%, rgba(157, 47, 208, 0.14) 0%, transparent 55%),
      #060612;
  }

  .welcome__inner {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 3rem;
    width: 100%;
    max-width: 48rem;
    padding: 4rem 5vi;
    overflow-y: auto;
    max-height: 100dvh;
  }

  .welcome__tag {
    display: inline-block;
    padding: 0.3rem 0.9rem;
    font-family: ui-monospace, monospace;
    font-size: 0.7rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    border: 1px solid #2a2a4e;
    border-radius: 100vmax;
  }

  .welcome__logo svg {
    inline-size: clamp(15rem, 44vw, 32rem);
    block-size: auto;
    animation: welcome-logo-glow 6s ease-in-out infinite alternate;
  }

  @keyframes welcome-logo-glow {
    from { filter: drop-shadow(0 0 4px rgba(56, 127, 209, 0.3)); }
    to { filter: drop-shadow(0 0 8px rgba(157, 47, 208, 0.15)); }
  }

  .welcome__sub {
    margin-top: 0.75rem;
    font-family: ui-monospace, monospace;
    font-size: 0.875rem;
    color: #888;
    letter-spacing: 0.02em;
  }

  .welcome__mode {
    display: inline-block;
    margin-top: 0.5rem;
    padding: 0.2rem 0.6rem;
    font-family: ui-monospace, monospace;
    font-size: 0.7rem;
    border-radius: 0.25rem;
    background: #0a0a18;
    border: 1px solid #2a2a4e;
  }

  .welcome__mode--development { color: #4ade80; border-color: #166534; }
  .welcome__mode--production  { color: #60a5fa; border-color: #1e3a5f; }

  .welcome__stack-label,
  .welcome__posts-label {
    margin-bottom: 0.75rem;
    font-family: ui-monospace, monospace;
    font-size: 0.65rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }

  .welcome__stack-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .welcome__stack-list li {
    padding: 0.3rem 0.8rem;
    font-family: ui-monospace, monospace;
    font-size: 0.75rem;
    color: #999;
    background: #0a0a18;
    border: 1px solid #2a2a4e;
    border-radius: 0.375rem;
  }

  .welcome__posts-list {
    display: grid;
    gap: 0.5rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .welcome__posts-list li a {
    display: block;
    padding: 0.5rem 0.8rem;
    font-size: 0.8rem;
    color: #888;
    background: #0a0a18;
    border: 1px solid #1a1a2e;
    border-radius: 0.375rem;
    text-decoration: none;
    transition: color 0.2s, border-color 0.2s;
  }

  .welcome__posts-list li a:hover {
    color: #ccc;
    border-color: #2a2a4e;
  }

  .welcome__footer {
    padding-top: 1.5rem;
    border-top: 1px solid #1a1a2e;
    font-size: 0.8rem;
    color: #555;
  }

  .welcome__footer code {
    font-family: ui-monospace, monospace;
    color: #387fd1;
  }
</style>

<section class="welcome">
  <div class="welcome__inner">
    <header>
      <span class="welcome__tag">✦ WordPress Template</span>
    </header>

    <div>
      <div class="welcome__logo">
        <img src="<?php echo esc_url(THEME_URL . '/assets/images/orelop.svg'); ?>" alt="orelop" />
      </div>
      <p class="welcome__sub">v4.0.4 — Your development environment is ready.</p>
      <span class="welcome__mode welcome__mode--<?php echo esc_attr($mode); ?>">
        <?php echo esc_html($mode); ?> mode
      </span>
    </div>

    <div>
      <p class="welcome__stack-label">Stack</p>
      <ul class="welcome__stack-list">
        <li>Vite 7</li>
        <li>WordPress</li>
        <li>PHP</li>
        <li>VaultCSS</li>
        <li>VaultScript</li>
        <li>TypeScript</li>
        <li>Biome</li>
        <li>Stylelint</li>
        <li>Markuplint</li>
        <li>Markuplint PHP</li>
      </ul>
    </div>

    <?php
    $recent_posts = new WP_Query([
      'posts_per_page' => 5,
      'post_status'    => 'publish',
    ]);
    if ($recent_posts->have_posts()) : ?>
      <div>
        <p class="welcome__posts-label">Recent Posts</p>
        <ul class="welcome__posts-list">
          <?php while ($recent_posts->have_posts()) : $recent_posts->the_post(); ?>
            <li>
              <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
            </li>
          <?php endwhile; wp_reset_postdata(); ?>
        </ul>
      </div>
    <?php endif; ?>

    <footer class="welcome__footer">
      <code>template/welcome.php</code> を削除して開発をはじめましょう
    </footer>
  </div>
</section>
