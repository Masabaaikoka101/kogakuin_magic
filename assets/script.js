// 年号 & 現在ページのナビ強調
(function(){
  // フッターの年号を現在の年に更新
  const y = document.getElementById("year");
  if (y) {
    y.textContent = new Date().getFullYear();
  }

  // bodyタグの data-page 属性を元に、現在のナビゲーションリンクを特定
  const page = document.body.getAttribute("data-page");
  const currentNavLink = document.querySelector(`[data-nav="${page}"]`);

  // 該当するナビゲーションリンクがあれば、aria-current属性を設定してアクセシビリティを向上させる
  // ※ CSSでの見た目の強調は、style.css内の `body[data-page="..."]` の記述で実現されています
  if (currentNavLink) {
    currentNavLink.setAttribute("aria-current", "page");
  }
  const THEME_KEY = 'kms-theme';
  const root = document.documentElement;
  const modeToggle = document.querySelector('[data-mode-toggle]');
  const modeIcon = modeToggle ? modeToggle.querySelector('.mode-toggle__icon') : null;
  const swapTargets = Array.from(document.querySelectorAll('[data-src-dark][data-src-white]'));

  const readStoredTheme = () => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      return stored === 'white' || stored === 'dark' ? stored : null;
    } catch (_) {
      return null;
    }
  };

  const writeStoredTheme = (value) => {
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch (_) {
      /* storage might be unavailable */
    }
  };

  const getPreferredTheme = () => {
    const stored = readStoredTheme();
    if (stored) return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'white';
    }
    return 'dark';
  };

  const getCurrentThemeAttribute = () => {
    const attr = root.getAttribute('data-theme');
    return attr === 'white' || attr === 'dark' ? attr : null;
  };

  const updateToggleUi = (theme) => {
    if (!modeToggle) return;
    const isWhite = theme === 'white';
    modeToggle.setAttribute('aria-pressed', isWhite ? 'true' : 'false');
    modeToggle.classList.toggle('is-light', isWhite);
    modeToggle.setAttribute('aria-label', isWhite ? 'ライトモードをオフにする' : 'ライトモードをオンにする');
    modeToggle.setAttribute('title', isWhite ? 'ライトモードをオフにする' : 'ライトモードをオンにする');
    if (modeIcon) {
      if (modeIcon instanceof HTMLImageElement) {
        const nextSrc = isWhite ? modeIcon.getAttribute('data-src-white') : modeIcon.getAttribute('data-src-dark');
        if (nextSrc && modeIcon.getAttribute('src') !== nextSrc) {
          modeIcon.setAttribute('src', nextSrc);
        }
      } else {
        modeIcon.textContent = isWhite ? '☀' : '☾';
      }
    }
  };

  const swapThemeImages = (theme) => {
    swapTargets.forEach((img) => {
      if (!(img instanceof HTMLImageElement)) return;
      const nextSrc = theme === 'white' ? img.getAttribute('data-src-white') : img.getAttribute('data-src-dark');
      if (nextSrc && img.getAttribute('src') !== nextSrc) {
        img.setAttribute('src', nextSrc);
      }
    });
  };

  const applyTheme = (theme) => {
    const resolved = theme === 'white' ? 'white' : 'dark';
    root.setAttribute('data-theme', resolved);
    if (document.body) {
      document.body.setAttribute('data-theme', resolved);
    }
    swapThemeImages(resolved);
    updateToggleUi(resolved);
  };

  const initialTheme = getCurrentThemeAttribute() || getPreferredTheme();
  applyTheme(initialTheme);

  if (modeToggle) {
    modeToggle.addEventListener('click', () => {
      const currentAttr = getCurrentThemeAttribute() || 'dark';
      const current = currentAttr === 'white' ? 'white' : 'dark';
      const next = current === 'white' ? 'dark' : 'white';
      applyTheme(next);
      writeStoredTheme(next);
    });
  }

  if (window.matchMedia) {
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (event) => {
      const stored = readStoredTheme();
      if (stored) return;
      applyTheme(event.matches ? 'white' : 'dark');
    };
    if (media.addEventListener) {
      media.addEventListener('change', handleChange);
    } else if (media.addListener) {
      media.addListener(handleChange);
    }
  }


  // TOPページの不要なボタン（CTAのghostボタン）を削除
  const extraCta = document.querySelector('.cta-row .btn.ghost');
  if (extraCta) {
    extraCta.remove();
  }

  // HOME: about.html への遷移ボタン（ヒーローCTA）も不要
  if (page === 'home') {
    const primaryCta = document.querySelector('.cta-row .btn.primary');
    if (primaryCta) primaryCta.remove();
    const ghostCta = document.querySelector('.cta-row .btn.ghost');
    if (ghostCta) ghostCta.remove();

    // ヒーロー見出しの置換
    const heroTitle = document.querySelector('.hero > h1');
    if (heroTitle) {
      heroTitle.innerHTML = '<span>工学院大学</span><span>マジシャンズ・ソサエティ</span>';
    }

    // 本文を指示どおりに差し替え（ABOUTへの遷移リンクは置かない）
    const heroCopy = document.querySelector('.hero-copy');
    if (heroCopy) {
      heroCopy.innerHTML = [
        '<p>私たちはマジックやジャグリングを中心に、みんなで楽しく活動しています。</p>',
        '<p><strong>「すごい！」と言われる特技、身につけてみませんか？</strong></p>',
        '<p>ほとんどのメンバーが未経験からのスタート。先輩たちが優しく教えるので、誰でも必ずできるようになります！</p>',
        '<p>学園祭や地域のイベントで発表するチャンスもたくさんありますよ。</p>',
        '<p><strong>新メンバー、いつでも大歓迎です！</strong></p>',
        '<p><strong>＼SNSで活動の様子をチェック！／</strong><br>最新のショー情報や練習風景は、画面右上の公式SNSから！</p>'
      ].join('');
    }
  }

  // ABOUT: 本文のSNSカードやボタンを排除し、文面を簡潔に
  if (page === 'about') {
    const infoCard = document.querySelector('.page .card.info');
    if (infoCard) infoCard.remove();
    const firstCol = document.querySelector('.grid.two > div:first-child');
    if (firstCol) {
      const firstH2 = firstCol.querySelector('h2');
      const firstP = firstH2 ? firstH2.nextElementSibling : null;
      if (firstP && firstP.tagName && firstP.tagName.toLowerCase() === 'p') {
        const lines = [
          'マジシャンズ・ソサエティは、コインやカードマジック、ヨーヨー、ボールジャグリングなど、多彩なパフォーマンスで観客を魅了する部活です。',
          '学園祭やサロンステージでの発表はもちろん、地域のお祭りや保育園でのボランティア公演など、活躍の場は無限大。',
          'プロのマジシャンから直接指導を受けられる機会もあり、初心者でも自分のペースで楽しみながら、驚きと感動を与えるスキルを基礎からしっかりと身につけられます。',
          '好きな時に参加できる自由な雰囲気のなかで、あなたも一緒に魔法のような時間を届けませんか？'
        ];
        const parent = firstP.parentElement;
        const frag = document.createDocumentFragment();
        lines.forEach(t => { const p = document.createElement('p'); p.textContent = t; frag.appendChild(p); });
        parent.insertBefore(frag, firstP);
        parent.removeChild(firstP);
      }
    }
    // 活動内容を見る 等のCTAを削除
    document.querySelectorAll('.page .cta-row, .page a.btn').forEach(el => el.remove());
  }

  // スクロールアニメーション（IntersectionObserver）
  // デフォルトで主要要素に data-animate を付与（HTMLに未指定でも動作）
  const attachAnimate = (selector, type, delay) => {
    document.querySelectorAll(selector).forEach((el, idx) => {
      if (!el.hasAttribute('data-animate')) {
        el.setAttribute('data-animate', type);
        if (typeof delay === 'number') {
          el.setAttribute('data-animate-delay', String(delay * idx));
        }
      }
    });
  };
  // ページ共通/代表的な候補（ヒーローや見出しは除外）
  attachAnimate('.cta-row .btn.primary', 'fade-up', 120);
  if (page === 'contact') {
    attachAnimate('.section .card', 'fade-up', 180);
  } else {
    attachAnimate('.section .card', 'fade-up', 120);
  }
  // 活動例の画像（1枚ずつ表示）
  attachAnimate('.showcase-list img', 'fade-in', 120);
  attachAnimate('.gallery-grid img', 'fade-in', 120); // 互換: 既存クラスでも対応

  const animatedEls = document.querySelectorAll('[data-animate]');
  const show = el => el.setAttribute('data-in-view', 'true');

  if ('IntersectionObserver' in window && animatedEls.length) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          show(entry.target);
          io.unobserve(entry.target);
        }
      }
    }, { root: null, threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

    animatedEls.forEach((el) => {
      const delay = el.getAttribute('data-animate-delay');
      if (delay) {
        el.style.transitionDelay = `${parseInt(delay, 10)}ms`;
      }
      io.observe(el);
    });
  } else {
    // フォールバック: すぐ表示
    animatedEls.forEach(show);
  }

  // ABOUT: 画像の下にタイトル（figcaption）を動的追加
  if (page === 'about') {
    const list = document.querySelector('.showcase-list');
    if (list) {
      list.querySelectorAll('img').forEach((img) => {
        const p = img.parentElement;
        if (p && p.tagName && p.tagName.toLowerCase() === 'figure') return;
        const fig = document.createElement('figure');
        img.replaceWith(fig);
        fig.appendChild(img);
        const cap = document.createElement('figcaption');
        cap.textContent = img.getAttribute('alt') || '';
        fig.appendChild(cap);
      });
    }
  }

  // CONTACT: スクロール演出は維持（除外ロジックは撤回）

  // 連絡テンプレートのコピーボタン
  const copyButtons = document.querySelectorAll('[data-copy-target]');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sel = btn.getAttribute('data-copy-target');
      const target = sel ? document.querySelector(sel) : null;
      if (!target) return;
      const text = target.value || target.textContent || '';
      if (!text) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          btn.textContent = 'コピーしました';
          setTimeout(() => (btn.textContent = 'テンプレートをコピー'), 1200);
        });
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (_) {}
        document.body.removeChild(ta);
      }
    });
  });

  // Contact: チェックリストをテンプレ項目と統一
  if (page === 'contact') {
    // チェックリストを最小構成に
    const ul = document.querySelector('.checklist');
    if (ul) {
      ul.innerHTML = [
        'お名前',
        'メールアドレス',
        'イベント名',
        '開催日時',
        '会場（住所・最寄り）',
        '想定人数',
        '依頼内容（マジック／ジャグリング 等）',
      ].map(t => `<li>${t}</li>`).join('');
    }

    // テンプレート本文も最小構成・以前の宛名に戻す
    const ta = document.getElementById('contact-template');
    if (ta) {
      ta.rows = 16;
      ta.value = [
        '工学院大学マジシャンズ・ソサエティ様',
        '',
        '貴団体のウェブサイトを拝見し、ぜひ公演をお願いしたくご連絡いたしました。',
        'つきましては、下記の通りイベントを企画しておりますので、ご検討いただけますと幸いです。',
        '',
        '----------------------------------------------------',
        '・お名前：',
        '・メールアドレス：',
        '・イベント名：',
        '・開催日時：',
        '・会場（住所・最寄り）：',
        '・想定人数：',
        '・依頼内容（マジック／ジャグリング 等）：',
        '・電話番号（任意）：',
        '----------------------------------------------------',
        '',
        'ご多忙のところ恐れ入りますが、ご検討のほど何卒よろしくお願い申し上げます。',
        '',
        '（署名）',
        '団体名／ご氏名：',
        'メール：',
        '電話（任意）：'
      ].join('\n');
    }
  }
})();
