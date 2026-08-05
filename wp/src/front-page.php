<?php get_header(); ?>

<?php get_template_part('template/top-bg'); ?>
<main>
  <section class="p-top__mv" data-mv>
    <div class="p-top__mv-inner">
      <hgroup class="p-top__mv-title-wrapper">
        <h1 class="p-top__mv-ja">可能性をつなぎ、<br>豊かな未来をつくる</h1>
        <p class="p-top__mv-en">FORWARD<br>TOGETHER
        </p>
      </hgroup>
    </div>
  </section>

  <div class="p-blur">
    <div class="p-blur__wrapper">
      <section class="p-mission" id="mission">
        <div class="p-mission__inner l-inner">
          <h2 class="p-mission__title js-title-reveal">
            <span class="visually-hidden">OUR MISSION</span>
            <span aria-hidden="true"><?php echo link_char_reveal('OUR MISSION'); ?></span>
          </h2>

          <p class="p-mission__lead">可能性をつなぎ、<br class="p-mission__lead-break">豊かな未来をつくる</p>

          <p class="p-mission__text">
            Linkは、人・企業・機会・想いをつなぐことで、<br>まだ見えていない可能性をひらき、<br>人と企業、そして社会に、豊かな未来をつくります。
          </p>

          <div class="p-mission__buttons">
            <?php get_template_part('template/modal'); ?>
          </div>
        </div>
      </section>
      <section class="p-buziness" id="business">
        <div class="p-buziness__inner l-inner">
          <div class="p-buziness__heading">
            <h2 class="p-buziness__title js-title-reveal">
              <span class="visually-hidden">BUSINESS</span>
              <span aria-hidden="true"><?php echo link_char_reveal('BUSINESS'); ?></span>
            </h2>
            <p class="p-buziness__subtitle">事業内容</p>
          </div>

          <?php
          $business_items = [
            [
              'no' => '01',
              'modifier' => 'hr',
              'lead' => "転職支援サービス<br>転職代行サービス",
              'name' => 'HR事業',
              'illust' => 'business1.png',
              'illustW' => 262,
              'illustH' => 175,
            ],
            [
              'no' => '02',
              'modifier' => 'itdx',
              'lead' => "システム<br class=\"u-pc\">エンジニア<br class=\"u-sp\">リングサービス",
              'name' => 'IT/DX事業',
              'illust' => 'business2.png',
              'illustW' => 190,
              'illustH' => 190,
            ],
            [
              'no' => '03',
              'modifier' => 'webmarketing',
              'lead' => "ブランド認知や<br class=\"u-sp\">集客支援<br class=\"u-pc\">サービス",
              'name' => "Web<br class=\"u-sp\">マーケティング<br>事業",
              'illust' => 'business3.png',
              'illustW' => 181,
              'illustH' => 181,
            ],
          ];
          ?>


          <ul class="p-buziness__list js-fadein">
            <?php foreach ($business_items as $item): ?>
              <li class="p-buziness__card p-buziness__card--<?php echo esc_attr($item['modifier']); ?>">
                <span class="p-buziness__number"><?php echo esc_html($item['no']); ?></span>

                <div class="p-buziness__head">
                  <div class="p-buziness__info">
                    <p class="p-buziness__lead"><?php echo wp_kses($item['lead'], ['br' => ['class' => true]]); ?></p>
                    <p class="p-buziness__name"><?php echo wp_kses($item['name'], ['br' => ['class' => true]]); ?></p>
                  </div>
                  <img class="p-buziness__illust" src="<?php echo esc_url(get_theme_file_uri('assets/images/top/' . $item['illust'])); ?>" width="<?php echo esc_attr($item['illustW']); ?>" height="<?php echo esc_attr($item['illustH']); ?>" alt="" loading="lazy" decoding="async">
                </div>

                <a href="#" class="p-buziness__btn">
                  <span class="p-buziness__btn-text">詳しくはこちら</span>
                  <span class="p-buziness__btn-icon">
                    <img src="<?php echo esc_url(get_theme_file_uri('assets/images/top/business-btn-arrow-' . $item['modifier'] . '.svg')); ?>" width="19" height="19" alt="" aria-hidden="true">
                  </span>
                </a>
              </li>
            <?php endforeach; ?>
          </ul>
          <div class="p-arrow">
            <img src="<?php echo esc_url(get_theme_file_uri('assets/images/top/arrow.png')) ?>" width="118" height="458" alt="" aria-hidden="true" decoding="async" loading="lazy">
          </div>

          <div class="p-business__contents">
            <div class="p-business__content">
              <div class="p-business-detail__item p-business-detail__item--hr js-fadein">
                <span class="p-business-detail__number">01</span>
                <p class="p-business-detail__label">転職支援サービス/転職代行サービス</p>
                <p class="p-business-detail__name">HR事業</p>
                <p class="p-business-detail__desc">職を探す若者、採用に困る法人の皆様、<br class="u-sp">それぞれに対し<br class="u-pc">弊社のリソースを活かし、最適な支援を行なっていきます。</p>
                <div class="p-business-detail__illust">
                  <img src="<?php echo esc_url(get_theme_file_uri('assets/images/top/business4.png')); ?>" width="474" height="360" alt="" loading="lazy" decoding="async">
                </div>
              </div>

              <?php
              $service_reasons = [
                [
                  'title' => "20代〜30代若手特化<br>エージェント",
                  'icon' => 'service-reason-icon1.png',
                  'text' => '一般の転職サイトには載っていない非公開求人や、未経験歓迎の企業求人を多数ご紹介。ご経験を活かす転職から、成長業界へのチャレンジもサポートします。',
                ],
                [
                  'title' => 'プロのアドバイザー<br class="u-sp">による<br class="u-pc">転職支援',
                  'icon' => 'service-reason-icon2.png',
                  'text' => '転職支援のプロが、最新の採用トレンドや企業情報をもとに無料でサポート。あなたに合った進め方を一緒に考えます。',
                ],
                [
                  'title' => "市場価値を高める<br>キャリア形成をサポート",
                  'icon' => 'service-reason-icon3.png',
                  'text' => '今回の転職支援だけでなく、3〜5年後を見据えた戦略的なキャリア設計をご提案。将来も市場で強みとなるキャリア形成をサポートします。',
                ],
              ];

              $service_voices = [
                [
                  'name' => 'A',
                  'badge' => '20代/男性',
                  'avatar' => 'service-voice-avatar1.png',
                  'w' => 146,
                  'h' => 146,
                  'text' => '初めての転職活動で不安しかなかった中、親身になって話を聞いてくれたTさんの存在に救われました。未経験でもチャレンジできるんだと自信を持てたのは、サポートがあったからです！',
                ],
                [
                  'name' => 'R',
                  'badge' => '20代/男性',
                  'avatar' => 'service-voice-avatar2.png',
                  'w' => 146,
                  'h' => 146,
                  'text' => '転職は孤独なものだと思っていましたが、いつもLINEで相談に乗ってくれたAさんのおかげで、心が折れずに済みました。自分一人ではたどり着けなかった今の環境に本当に感謝しています。',
                ],
                [
                  'name' => 'O',
                  'badge' => '20代/女性',
                  'avatar' => 'service-voice-avatar3.png',
                  'w' => 147,
                  'h' => 150,
                  'text' => '転職サイトだけでは分からない業界のリアルを教えてもらい、自分に合った仕事選びができました。Nさんのアドバイスがなければ、ミスマッチな転職をしていたかもしれません。',
                ],
                [
                  'name' => 'K',
                  'badge' => '20代/女性',
                  'avatar' => 'service-voice-avatar4.png',
                  'w' => 206,
                  'h' => 206,
                  'text' => '初めての転職活動で不安しかなかった中、親身になって話を聞いてくれたTさんの存在に救われました。未経験でもチャレンジできるんだと自信を持てたのは、サポートがあったからです！',
                ],
                [
                  'name' => 'T',
                  'badge' => '20代/男性',
                  'avatar' => 'service-voice-avatar5.png',
                  'w' => 146,
                  'h' => 146,
                  'text' => '未経験からエンジニア業界への挑戦は無謀かも…と思っていましたが、Mさんが将来像を一緒に描いてくれたことで決意できました。諦めなくて本当に良かったです！',
                ],
              ];
              ?>

              <div class="p-business__service js-fadein">
                <div class="p-business__service-card p-business__service-card--agecari">
                  <div class="p-business__service-tag js-fadein">
                    <span class="p-business__service-tag-badge">求職者向け</span>
                    <span class="p-business__service-tag-divider" aria-hidden="true"></span>
                    <span class="p-business__service-tag-desc">若年層特化型転職支援サービス</span>
                  </div>

                  <div class="p-business__service-intro js-fadein">
                    <h3 class="p-business__service-logo">
                      <img src="<?php echo esc_url(get_theme_file_uri('assets/images/top/service-agecari-logo.png')); ?>" width="323" height="71" alt="アゲキャリ" loading="lazy" decoding="async">
                    </h3>
                    <img class="p-business__service-intro-illust" src="<?php echo esc_url(get_theme_file_uri('assets/images/top/service-agecari-illust.png')); ?>" width="477" height="348" alt="" loading="lazy" decoding="async">
                    <p class="p-business__service-intro-text">『アゲキャリ』は20代・30代を中心とした若年層に特化したキャリア支援<br class="u-sp">サービスです。<br class="u-sp">豊富な職種に対応し、個々の志向や経験に合わせた丁寧なキャリア提案を行っております。<br class="u-pc">キャリアカウンセリングと最適なマッチングを提供しています。月間2,000名超の候補者が利用しています。</p>
                  </div>

                  <div class="p-business__service-reason">
                    <?php get_template_part('template/parts/c-title', null, ['en' => 'REASON', 'ja' => '私たちが選ばれる理由']); ?>
                    <ul class="p-business__service-reason-list js-fadein">
                      <?php foreach ($service_reasons as $reason): ?>
                        <li class="p-business__service-reason-item">
                          <p class="p-business__service-reason-title"><?php echo wp_kses($reason['title'], ['br' => ['class' => true]]); ?></p>
                          <img class="p-business__service-reason-icon" src="<?php echo esc_url(get_theme_file_uri('assets/images/top/' . $reason['icon'])); ?>" width="157" height="157" alt="" loading="lazy" decoding="async">
                          <p class="p-business__service-reason-text"><?php echo wp_kses($reason['text'], ['br' => ['class' => true]]); ?></p>
                        </li>
                      <?php endforeach; ?>
                    </ul>
                  </div>

                  <div class="p-business__voice">
                    <?php get_template_part('template/parts/c-title', null, ['en' => 'USER VOICE', 'ja' => '転職成功者の声']); ?>

                    <div class="splide p-business__voice-slider" role="region" aria-label="転職成功者の声">
                      <div class="splide__track js-fadein">
                        <ul class="splide__list">
                          <?php foreach ($service_voices as $voice): ?>
                            <li class="splide__slide p-business__voice-slide">
                              <span class="p-business__voice-dot p-business__voice-dot--tl" aria-hidden="true"></span>
                              <span class="p-business__voice-dot p-business__voice-dot--tr" aria-hidden="true"></span>
                              <span class="p-business__voice-dot p-business__voice-dot--bl" aria-hidden="true"></span>
                              <span class="p-business__voice-dot p-business__voice-dot--br" aria-hidden="true"></span>
                              <div class="p-business__voice-avatar">
                                <img src="<?php echo esc_url(get_theme_file_uri('assets/images/top/' . $voice['avatar'])); ?>" width="<?php echo esc_attr($voice['w']); ?>" height="<?php echo esc_attr($voice['h']); ?>" alt="" loading="lazy" decoding="async">
                              </div>
                              <div class="p-business__voice-body">
                                <p class="p-business__voice-name"><span class="p-business__voice-name-en"><?php echo esc_html($voice['name']); ?></span>さん<span class="p-business__voice-badge"><?php echo esc_html($voice['badge']); ?></span></p>
                                <p class="p-business__voice-text"><?php echo esc_html($voice['text']); ?></p>
                              </div>
                            </li>
                          <?php endforeach; ?>
                        </ul>
                      </div>

                      <div class="splide__arrows p-business__voice-arrows">
                        <button class="splide__arrow splide__arrow--prev p-business__voice-arrow p-business__voice-arrow--prev" type="button">
                          <img src="<?php echo esc_url(get_theme_file_uri('assets/images/top/slide-arrow.png')); ?>" width="18" height="41" alt="前のスライド" loading="lazy" decoding="async">
                        </button>
                        <button class="splide__arrow splide__arrow--next p-business__voice-arrow p-business__voice-arrow--next" type="button">
                          <img src="<?php echo esc_url(get_theme_file_uri('assets/images/top/slide-arrow.png')); ?>" width="18" height="41" alt="次のスライド" loading="lazy" decoding="async">
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="p-business__service-card p-business__service-card--linkagent">
                  <div class="p-business__service-tag js-fadein">
                    <span class="p-business__service-tag-badge">法人向け</span>
                    <span class="p-business__service-tag-divider" aria-hidden="true"></span>
                    <span class="p-business__service-tag-desc">若年層特化型転職支援サービス</span>
                  </div>

                  <div class="p-business__service-intro">
                    <h3 class="p-business__service-brand-title">Link Agent<span class="p-business__service-brand-title-sub">（RPO）</span></h3>
                    <img class="p-business__service-intro-illust p-business__service-intro-illust--linkagent" src="<?php echo esc_url(get_theme_file_uri('assets/images/top/service-linkagent-illust.png')); ?>" width="423" height="292" alt="" loading="lazy" decoding="async">
                    <p class="p-business__service-intro-text p-business__service-intro-text--linkagent">採用戦略の立案および実行をトータルにご支援します。採用手法やチャネルの選定をはじめ、採用にかかわるプロセスの様々なシーンを最適化し、求める人材の採用成功を目指します。</p>
                  </div>
                </div>
              </div>

            </div>
            <div class="p-business__content">
              <div class="p-business-detail__item p-business-detail__item--itdx js-fadein">
                <span class="p-business-detail__number">02</span>
                <p class="p-business-detail__label">システムエンジニアリングサービス/<br>開発受託サービス</p>
                <p class="p-business-detail__name">IT/DX事業</p>
                <p class="p-business-detail__desc">IT/webシステムの設計〜運用の<br class="u-sp">全体、ソフトウェア開発に<br>お困りの会社様へ業務効率をアップさせる最適なご提案と<br class="u-pc">支援をいたします。</p>
                <div class="p-business-detail__illust">
                  <img src="<?php echo esc_url(get_theme_file_uri('assets/images/top/business5.png')); ?>" width="445" height="341" alt="" loading="lazy" decoding="async">
                </div>
              </div>

              <div class="p-business__service-card p-business__service-card--itdx-ses">
                <div class="p-business__service-tag p-business__service-tag--blue js-fadein">
                  <span class="p-business__service-tag-full">IT/webシステム全体に<br class="u-sp">お困りの方向け</span>
                </div>

                <div class="p-business__service-intro js-fadein">
                  <h3 class="p-business__service-heading">システム<br>エンジニアリングサービス</h3>
                  <p class="p-business__service-intro-text">IT/webシステムの設計、構築、開発、及び運用並びに保守<br class="u-pc">などの領域で幅広いサービスを提供し、クライアントの<br class="u-sp">ニーズに合った効果的な技術の実現を支援します。</p>
                </div>

                <div class="p-business__service-flow js-fadein">
                  <?php get_template_part('template/parts/c-title', null, ['en' => 'FLOW', 'ja' => 'ご支援の流れ']); ?>
                  <div class="p-business__service-flow-diagram">
                    <img class="" src="<?php echo esc_url(get_theme_file_uri('assets/images/top/service-itdx-flow-pc.png')); ?>" width="899" height="591" alt="ご依頼企業様からのご相談・ご依頼を受け、Link SES teamが駐在開発でエンジニアを企業様へ派遣し、マネジメントを行う流れ" loading="lazy" decoding="async">
                  </div>
                </div>
              </div>

              <div class="p-business__service-card p-business__service-card--itdx-dev">
                <div class="p-business__service-tag p-business__service-tag--blue js-fadein">
                  <span class="p-business__service-tag-full">ソフトウェア開発に<br class="u-sp">お困りの方向け</span>
                </div>

                <div class="p-business__service-intro js-fadein">
                  <h3 class="p-business__service-heading p-business__service-heading--itdx-dev">開発受託サービス</h3>
                  <img class="p-business__service-intro-illust p-business__service-intro-illust--itdx-dev" src="<?php echo esc_url(get_theme_file_uri('assets/images/top/service-itdx-software.png')); ?>" width="433" height="277" alt="" loading="lazy" decoding="async">
                  <p class="p-business__service-intro-text p-business__service-intro-text--itdx-dev">当社の受託開発では、幅広い業界やプロジェクトに対して、カスタムソフトウェアおよびアプリケーションの開発を行っています。お客様のニーズに合わせて、高品質なソフトウェアソリューションを提供します。</p>
                </div>
              </div>

            </div>
            <div class="p-business__content">
              <div class="p-business-detail__item p-business-detail__item--webmarketing js-fadein">
                <span class="p-business-detail__number">03</span>
                <p class="p-business-detail__label">ブランド認知や集客支援サービス</p>
                <p class="p-business-detail__name">Web<br class="u-sp">マーケティング<br class="u-sp">事業</p>
                <p class="p-business-detail__desc">ブランド認知や集客を支援する戦略立案・広告運用・デジタル施策を実行。市場調査から広告キャンペーンまで幅広く対応し、クライアントの成長を後押しします。</p>
                <div class="p-business-detail__illust">
                  <img src="<?php echo esc_url(get_theme_file_uri('assets/images/top/business6.png')); ?>" width="380" height="380" alt="" loading="lazy" decoding="async">
                </div>
              </div>

              <div class="p-business__service-webmarketing">
                <div class="p-business__service-scope js-fadein">
                  <?php get_template_part('template/parts/c-title', null, ['en' => 'SCOPE', 'ja' => 'ご支援可能媒体（一部）']); ?>
                  <div class="p-business__service-scope-box js-fadein">
                    <img class="p-business__service-scope-illust u-pc" src="<?php echo esc_url(get_theme_file_uri('assets/images/top/service-webmarketing-scope-pc.png')); ?>" width="1033" height="484" alt="LINE、Instagram、X、Google、Yahoo!など、内容に応じ様々な媒体での支援を行っていきます" loading="lazy" decoding="async">
                    <img class="p-business__service-scope-illust u-sp" src="<?php echo esc_url(get_theme_file_uri('assets/images/top/service-webmarketing-scope-sp.png')); ?>" width="292" height="281" alt="LINE、Instagram、X、Google、Yahoo!など、内容に応じ様々な媒体での支援を行っていきます" loading="lazy" decoding="async">
                  </div>
                </div>

                <div class="p-business__service-flow js-fadein">
                  <?php get_template_part('template/parts/c-title', null, ['en' => 'FLOW', 'ja' => 'ご支援の流れ']); ?>

                  <?php
                  $webmarketing_flow_steps = [
                    [
                      'title' => '市場調査',
                      'icon' => 'service-webmarketing-flow-icon1.png',
                      'iconW' => 90,
                      'iconH' => 86,
                      'text' => "競合の洗い出しや<br>市場ポジションなど<br class=\"u-pc\">を調査・分析",
                    ],
                    [
                      'title' => '施策提案',
                      'icon' => 'service-webmarketing-flow-icon2.png',
                      'iconW' => 95,
                      'iconH' => 94,
                      'text' => "SEO/SNS/広告運用<br class=\"u-pc\">など最適な集客施策<br class=\"u-pc\">をご提案",
                    ],
                    [
                      'title' => 'WEB集客<br class=\"u-pc\">支援実行',
                      'icon' => 'service-webmarketing-flow-icon3.png',
                      'iconW' => 93,
                      'iconH' => 69,
                      'text' => "ご提案した施策の<br class=\"u-pc\">実行まで一貫して<br class=\"u-pc\">ご支援",
                    ],
                    [
                      'title' => '効果測定<br class=\"u-pc\">改善提案',
                      'icon' => 'service-webmarketing-flow-icon4.png',
                      'iconW' => 86,
                      'iconH' => 81,
                      'text' => "施策の効果を数値で<br class=\"u-pc\">管理し改善のご提案<br class=\"u-pc\">をすることも",
                    ],
                  ];
                  $webmarketing_flow_count = count($webmarketing_flow_steps);
                  ?>

                  <div class="p-business__service-flow-list js-fadein">
                    <?php foreach ($webmarketing_flow_steps as $index => $step): ?>
                      <div class="p-business__service-flow-item">
                        <p class="p-business__service-flow-title"><?php echo wp_kses($step['title'], ['br' => ['class' => true]]); ?></p>
                        <img class="p-business__service-flow-icon" src="<?php echo esc_url(get_theme_file_uri('assets/images/top/' . $step['icon'])); ?>" width="<?php echo esc_attr($step['iconW']); ?>" height="<?php echo esc_attr($step['iconH']); ?>" alt="" loading="lazy" decoding="async">
                        <p class="p-business__service-flow-text"><?php echo wp_kses($step['text'], ['br' => ['class' => true]]); ?></p>
                      </div>
                      <?php if ($index < $webmarketing_flow_count - 1): ?>
                        <span class="p-business__service-flow-arrow" aria-hidden="true">
                          <img src="<?php echo esc_url(get_theme_file_uri('assets/images/top/service-flow-arrow.png')); ?>" width="68" height="18" alt="" loading="lazy" decoding="async">
                        </span>
                      <?php endif; ?>
                    <?php endforeach; ?>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section class="p-news" id="news">
        <div class="p-news__inner l-inner">
          <?php get_template_part('template/parts/c-title', null, ['en' => 'NEWS', 'ja' => 'お知らせ']); ?>

          <?php
          $news_query = new WP_Query([
            'post_type'           => 'news',
            'posts_per_page'      => 3,
            'post_status'         => 'publish',
            'no_found_rows'       => true,
            'ignore_sticky_posts' => true,
          ]);
          ?>

          <?php if ($news_query->have_posts()): ?>
            <ul class="p-news__list js-fadein">
              <?php while ($news_query->have_posts()): $news_query->the_post(); ?>
                <?php
                $news_terms = get_the_terms(get_the_ID(), 'news_category');
                $news_cat   = (!empty($news_terms) && !is_wp_error($news_terms)) ? $news_terms[0]->name : 'お知らせ';
                ?>
                <li class="p-news__item">
                  <a href="<?php the_permalink(); ?>" class="p-news__card">
                    <div class="p-news__thumb">
                      <?php if (has_post_thumbnail()): ?>
                        <?php echo get_the_post_thumbnail(get_the_ID(), 'medium_large', ['class' => 'p-news__thumb-img', 'alt' => '', 'loading' => 'lazy', 'decoding' => 'async']); ?>
                      <?php else: ?>
                        <img class="p-news__thumb-img" src="<?php echo esc_url(get_theme_file_uri('assets/images/top/news-thumb.jpg')); ?>" width="700" height="378" alt="" loading="lazy" decoding="async">
                      <?php endif; ?>
                    </div>

                    <div class="p-news__body">
                      <h3 class="p-news__title"><?php the_title(); ?></h3>
                      <p class="p-news__excerpt"><?php echo esc_html(wp_trim_words(get_the_excerpt(), 40, '...')); ?></p>
                      <div class="p-news__meta">
                        <span class="p-news__category"><?php echo esc_html($news_cat); ?></span>
                        <time class="p-news__date" datetime="<?php echo esc_attr(get_the_date('Y-m-d')); ?>"><?php echo esc_html(get_the_date('Y.n.j')); ?></time>
                      </div>
                    </div>

                    <span class="p-news__arrow" aria-hidden="true">
                      <img src="<?php echo esc_url(get_theme_file_uri('assets/images/top/news-arrow.svg')); ?>" width="47" height="47" alt="" loading="lazy" decoding="async">
                    </span>
                  </a>
                </li>
              <?php endwhile; ?>
            </ul>

            <?php
            wp_reset_postdata();
            $news_archive_url = get_post_type_archive_link('news') ?: home_url('/news/');
            ?>
            <div class="p-news__more">
              <a href="<?php echo esc_url($news_archive_url); ?>" class="p-news__more-btn">
                <span class="p-news__more-text">もっと見る</span>
                <span class="p-news__more-icon" aria-hidden="true">
                  <img src="<?php echo esc_url(get_theme_file_uri('assets/images/top/news-more-arrow.svg')); ?>" width="10" height="16" alt="" loading="lazy" decoding="async">
                </span>
              </a>
            </div>
          <?php endif; ?>
        </div>
      </section>

      <section class="p-company" id="company">
        <div class="p-company__inner l-inner">
          <?php get_template_part('template/parts/c-title', null, ['en' => 'COMPANY', 'ja' => '会社情報']); ?>

          <?php
          $company_items = [
            [
              'label' => '企業名',
              'value' => '株式会社Link',
            ],
            [
              'label' => '設立',
              'value' => '2023年1月',
            ],
            [
              'label' => '資本金',
              'value' => '2,000万円',
            ],
            [
              'label' => '所在地',
              'value' => "〒531-0071<br>大阪市北区中津3丁目<br class=\"u-sp\">6-21 S＆SⅢビル4F",
            ],
            [
              'label' => '支社所在地',
              'value' => "〒530-0011<br>大阪府大阪市北区大深町6-38<br>グラングリーン大阪 北館6F",
            ],
            [
              'label' => '代表取締役',
              'value' => '河原 誠弥',
            ],
            [
              'label' => '事業内容',
              'value' => "HR事業<br>IT/DX事業<br>Webマーケティング事業",
            ],
            [
              'label' => '厚生労働大臣許認可番号',
              'value' => "27-ユ-304031<br>派27-305208",
            ],
            [
              'label' => '法務顧問',
              'value' => '賢誠総合法律事務所',
            ],
            [
              'label' => '連絡先',
              'value' => "Mail：info＠link-osk.co.jp<br>Tel：06-6372-5333<br>採用に関するお問い合わせ<br>06-7653-8192",
            ],
          ];
          ?>

          <dl class="p-company__table js-fadein">
            <?php foreach ($company_items as $item): ?>
              <div class="p-company__row">
                <dt class="p-company__label"><?php echo esc_html($item['label']); ?></dt>
                <dd class="p-company__value"><?php echo wp_kses($item['value'], ['br' => ['class' => true]]); ?></dd>
              </div>
            <?php endforeach; ?>
          </dl>
        </div>
      </section>



      <section class="p-contact" id="contact">
        <div class="p-contact__inner l-inner">
          <div class="p-contact__card js-fadein">
            <?php get_template_part('template/parts/c-title', null, ['en' => 'CONTACT', 'ja' => 'お問い合わせ']); ?>
            <?php echo do_shortcode(do_shortcode('[contact-form-7 id="139" title="お問い合わせ（TOPページ）"]')); ?>
          </div>
        </div>
      </section>

    </div>
  </div>
  <section class="p-catch js-fadein">
    <hgroup class="p-catch__wrapper p-top__mv-title-wrapper">
      <h1 class="p-top__mv-ja">可能性をつなぎ、<br>豊かな未来をつくる</h1>
      <p class="p-top__mv-en">FORWARD<br>TOGETHER
      </p>
    </hgroup>
  </section>
</main>

<?php get_footer(); ?>
