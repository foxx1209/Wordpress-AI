<modal-dialog class="p-mission__modal">
  <button type="button" class="p-mission__btn p-mission__btn--vision">
    <span class="p-mission__btn-text">OUR VISION</span>
    <div class="p-mission__btn-icon"></div>
  </button>

  <dialog class="c-modal" aria-label="OUR VISION">
    <div class="c-modal__inner">
      <button type="button" class="c-modal__close" data-modal-close aria-label="閉じる">
        <span class="c-modal__close-line"></span>
      </button>

      <div class="c-modal__bg" aria-hidden="true">
        <img src="<?php echo esc_url(get_theme_file_uri('assets/images/top/mission-vision-bg.png')); ?>" width="900" height="900" alt="" decoding="async" loading="lazy">
      </div>

      <h3 class="c-modal__title">
        OUR VISION </h3>
      <p class="c-modal__catch">
        関わるすべての人に、<br>
        「出会えてよかった」と<br class="u-sp">思われる会社へ
      </p>
      <div class="c-modal__body-wrapper">
        <p class="c-modal__body">
          社員、求職者、クライアント、協業先など、関わるすべての人から、</p>

        <p class="c-modal__body">「Linkがあったから前に進めた」 「Linkがなくなると困る」</p>
        <p class="c-modal__body">そう思われる存在を目指します。</p>
        <p class="c-modal__body">
          私たちは、売上や規模の拡大を目的
          にするのではなく、<br>届けられる価値
          と社会への良い影響を広げるために
          成長し続けます。
        </p>
      </div>
    </div>
  </dialog>
</modal-dialog>

<modal-dialog class="p-mission__modal">
  <button type="button" class="p-mission__btn p-mission__btn--value">
    <span class="p-mission__btn-text">OUR VALUE</span>
    <div class="p-mission__btn-icon --value"></div>
  </button>

  <dialog class="c-modal --value" aria-label="OUR VALUE">
    <div class="c-modal__inner --value">
      <button type="button" class="c-modal__close" data-modal-close aria-label="閉じる">
        <span class="c-modal__close-line --value"></span>
      </button>

      <h3 class="c-modal__title c-modal__title--value">Linkism</h3>
      <p class="c-modal__catch c-modal__catch--value c-modal__catch--sp">
        Linkで働く私たちが<br class="u-sp">
        大切にする、<br class="u-sp">
        7つの行動指針
      </p>
      <p class="c-modal__catch c-modal__catch--value c-modal__catch--pc">
        Linkで働く私たちが大切にする、7つの行動指針
      </p>

      <?php
      $mission_values = [
        ['color' => 'red', 'heading' => '健康を大切にする', 'textSp' => "心と身体の健康を、すべての活動の土台と考えます。<br class=\"u-sp\">自分自身を大切にし、仲間の<br class=\"u-pc\">状態に<br class=\"u-sp\">も気を配りながら、長く前向きに<br class=\"u-pc\">挑戦できる状態をつくります。", ],
        ['color' => 'yellow', 'heading' => '目の前の人に向き合う', 'textSp' => "相手の気持ちや状況を理解し、<br>本質的な課題に向き合います。",],
        ['color' => 'green', 'heading' => '可能性を信じる', 'textSp' => "人や企業がまだ気づいていない<br class=\"u-sp\">強みや<br class=\"u-pc\">可能性を見つけ、<br class=\"u-sp\">未来の選択肢を広げます。"],
        ['color' => 'blue', 'heading' => '信頼を積み重ねる', 'textSp' => "誠実な行動、感謝の姿勢、<br class=\"u-sp\">約束を守る姿勢を<br class=\"u-pc\">大切にし、<br class=\"u-sp\">長く信頼される関係を築きます。"],
        ['color' => 'yellow2', 'heading' => 'プロとして成長し続ける', 'textSp' => "知識・スキル・人間力を<br class=\"u-sp\">磨き続け、<br class=\"u-pc\">相手に必要とされる<br class=\"u-sp\">存在を目指します。",],
        ['color' => 'red2', 'heading' => '仲間と価値を広げる', 'textSp' => "一人で成果を出すのではなく、<br class=\"u-sp\">学びや知識を<br class=\"u-pc\">共有し、<br class=\"u-sp\">チーム全体でより大きな価値を<br class=\"u-sp\">生み<br class=\"u-pc\">出します。",],
        ['color' => 'blue', 'heading' => '挑戦を楽しむ', 'textSp' => "変化や新しい技術を前向きに<br class=\"u-sp\">受け入れ、<br class=\"u-pc\">より良い未来を<br class=\"u-sp\">つくるために挑戦し続けます。",],
      ];
      $mission_value_icons = [
        'red' => esc_url(get_theme_file_uri('assets/images/top/red1.png')),
        'yellow' => esc_url(get_theme_file_uri('assets/images/top/yellow1.png')),
        'green' => esc_url(get_theme_file_uri('assets/images/top/green1.png')),
        'blue' => esc_url(get_theme_file_uri('assets/images/top/blue1.png')),
        'yellow2' => esc_url(get_theme_file_uri('assets/images/top/yellow2.png')),
        'red2' => esc_url(get_theme_file_uri('assets/images/top/red2.png')),
        'blue2' => esc_url(get_theme_file_uri('assets/images/top/blue2.png')),
      ];
      ?>
      <ol class="c-value-list">
        <?php foreach ($mission_values as $value): ?>
          <li class="c-value-list__item">
            <img class="c-value-list__icon" src="<?php echo $mission_value_icons[$value['color']]; ?>" width="200" height="200" alt="" aria-hidden="true" loading="lazy">
            <div class="c-value-list__textarea">
              <p class="c-value-list__heading"><?php echo esc_html($value['heading']); ?></p>
              <p class="c-value-list__text"><?php echo wp_kses($value['textSp'], ['br' => ['class' => true]]); ?></p>
            </div>
          </li>
        <?php endforeach; ?>
      </ol>
    </div>
  </dialog>
</modal-dialog>
