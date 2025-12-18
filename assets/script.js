// 年号 & 現在ページのナビ強調
(function () {
  // bodyタグの data-page 属性を元に、現在のナビゲーションリンクを特定
  const page = document.body.getAttribute("data-page");

  // Header Loading Logic
  const initHeader = () => {
    // フッターの年号
    const y = document.getElementById("year");
    if (y) {
      y.textContent = new Date().getFullYear();
    }

    const currentNavLink = document.querySelector(`[data-nav="${page}"]`);

    if (currentNavLink) {
      currentNavLink.setAttribute("aria-current", "page");
    }

    // Theme Logic
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
        if (value === 'white' || value === 'dark') {
          localStorage.setItem(THEME_KEY, value);
        }
      } catch (_) {
        /* storage might be unavailable */
      }
    };

    const getPreferredTheme = () => {
      const stored = readStoredTheme();
      return stored || 'dark';
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
  };

  // Load Header and then init
  const headerContainer = document.getElementById('global-header');
  if (headerContainer) {
    fetch('header.html')
      .then(response => response.text())
      .then(html => {
        headerContainer.innerHTML = html;
        initHeader();
        // ロゴの色反転など、画像関連の初期化も必要ならここで再実行
      })
      .catch(err => console.error('Failed to load header:', err));
  } else {
    // フォールバック: ヘッダーコンテナが無い場合でもテーマ機能などは動かす
    initHeader();
  }



  // スクロールアニメーション（IntersectionObserver）
  // デフォルトで主要要素に data-animate を付与
  const attachAnimate = (selector, type, delay) => {
    // お問い合わせページではスクロールアニメーションを無効化
    if (page === 'contact') return;

    document.querySelectorAll(selector).forEach((el, idx) => {
      if (!el.hasAttribute('data-animate')) {
        el.setAttribute('data-animate', type);
        if (typeof delay === 'number') {
          el.setAttribute('data-animate-delay', String(delay * idx));
        }
      }
    });
  };

  // アニメーション適用ルール


  // セクション内のカード
  const cardDelay = page === 'contact' ? 180 : 120;
  attachAnimate('.section .card', 'fade-up', cardDelay);

  // 活動紹介画像・ギャラリー
  attachAnimate('.showcase-list figure', 'fade-in', 120);
  attachAnimate('.gallery-grid img', 'fade-in', 120);

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

  // CONTACT: スクロール演出は維持（除外ロジックは撤回）

  // CONTACT: カスタムフォーム（GASへPOST送信）
  if (page === 'contact') {
    const form = document.getElementById('contact-form');
    if (form) {
      const submitBtn = form.querySelector('button[type="submit"]');
      const otherToggle = form.querySelector('[data-other-toggle]');
      const otherField = form.querySelector('[data-other-field]');
      const otherInput = form.querySelector('input[name="requestOther"]');
      const requestFieldset = form.querySelector('.form-fieldset');

      const getErrorEl = (name) => form.querySelector(`[data-error-for="${name}"]`);

      const setFieldError = (input, name, message) => {
        const el = getErrorEl(name);
        if (el) el.textContent = message || '';
        if (input) input.classList.toggle('is-invalid', Boolean(message));
      };

      const clearAllErrors = () => {
        form.querySelectorAll('[data-error-for]').forEach((el) => (el.textContent = ''));
        form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
      };

      const toggleOther = () => {
        const checked = Boolean(otherToggle && otherToggle.checked);
        if (otherField) otherField.classList.toggle('is-hidden', !checked);
        if (otherInput) otherInput.required = checked;
        if (!checked && otherInput) otherInput.value = '';
      };

      const readValue = (name) => {
        const input = form.elements.namedItem(name);
        if (!input) return '';
        if (input instanceof RadioNodeList) return input.value || '';
        return (input.value || '').trim();
      };

      const validate = () => {
        clearAllErrors();

        let firstInvalid = null;
        const markInvalid = (input, name, message) => {
          if (!firstInvalid && input) firstInvalid = input;
          setFieldError(input, name, message);
        };

        const nameEl = form.querySelector('#cf-name');
        const emailEl = form.querySelector('#cf-email');
        const eventEl = form.querySelector('#cf-event');
        const scheduleEl = form.querySelector('#cf-schedule');
        const venueEl = form.querySelector('#cf-venue');
        const audienceEl = form.querySelector('#cf-audience');

        if (!readValue('name')) markInvalid(nameEl, 'name', 'お名前を入力してください。');

        if (!readValue('email')) {
          markInvalid(emailEl, 'email', 'メールアドレスを入力してください。');
        } else if (emailEl && !emailEl.checkValidity()) {
          markInvalid(emailEl, 'email', 'メールアドレスの形式が正しくありません。');
        }

        if (!readValue('eventName')) markInvalid(eventEl, 'eventName', 'イベント名を入力してください。');
        if (!readValue('eventSchedule')) markInvalid(scheduleEl, 'eventSchedule', '開催日程を入力してください。');
        if (!readValue('venue')) markInvalid(venueEl, 'venue', '会場を入力してください。');
        if (!readValue('audience')) markInvalid(audienceEl, 'audience', '想定人数を入力してください。');

        const types = Array.from(form.querySelectorAll('input[name="requestType"]:checked')).map((el) => el.value);
        if (!types.length) {
          const err = getErrorEl('requestType');
          if (err) err.textContent = '依頼内容を1つ以上選択してください。';
          if (requestFieldset) requestFieldset.classList.add('is-invalid');
          if (!firstInvalid && requestFieldset) firstInvalid = requestFieldset;
        }

        if (otherInput && otherInput.required && !readValue('requestOther')) {
          markInvalid(otherInput, 'requestOther', '「その他」を選択した場合は内容を入力してください。');
        }

        if (firstInvalid) {
          if (firstInvalid instanceof HTMLElement && typeof firstInvalid.focus === 'function') {
            firstInvalid.focus();
          } else if (requestFieldset && typeof requestFieldset.scrollIntoView === 'function') {
            requestFieldset.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
          return false;
        }
        return true;
      };

      toggleOther();
      if (otherToggle) otherToggle.addEventListener('change', toggleOther);

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const endpoint = 'https://script.google.com/macros/s/AKfycbwheFaPhK8tAeYXE4kAK8epoCQnlQeBtHnad1P3eXVTvDPQIfvbY-e7k-ZnviIZcojWwA/exec';

        const schedule = readValue('eventSchedule');
        const venue = readValue('venue');
        const audience = readValue('audience');
        const otherText = readValue('requestOther');
        const selectedTypes = Array.from(form.querySelectorAll('input[name="requestType"]:checked')).map((el) => el.value);
        const typesForGas = selectedTypes.map((t) => (t === 'その他' && otherText ? `その他: ${otherText}` : t));

        // 送信先GAS（ユーザー提供スクリプト）に合わせたキー名へ整形
        const payload = {
          name: readValue('name'),
          email: readValue('email'),
          eventName: readValue('eventName'),
          eventDate: schedule,
          place: venue,
          people: audience,
          type: typesForGas,
          tel: readValue('tel'),
          remarks: readValue('remarks'),
          clientTimestamp: new Date().toISOString(),
        };

        const requestId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
          ? crypto.randomUUID()
          : `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;

        const originalBtnText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = '送信中...';
        }

        try {
          const body = JSON.stringify({ ...payload, requestId });

          let confirmed = false;
          try {
            const res = await fetch(endpoint, {
              method: 'POST',
              mode: 'cors',
              headers: { 'Content-Type': 'text/plain' },
              body,
            });
            const text = await res.text().catch(() => '');
            let json = null;
            try { json = text ? JSON.parse(text) : null; } catch (_) { }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            if (json && typeof json === 'object' && json.status === 'error') {
              throw new Error(json.message || 'Server returned error');
            }
            confirmed = true;
          } catch (err) {
            // CORSでレスポンスが読めない場合のみ no-cors で送信を試行
            if (!(err instanceof TypeError)) throw err;
            await fetch(endpoint, {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'text/plain' },
              body,
            });
          }

          alert(`${confirmed ? '送信しました' : '送信を試行しました（結果の確認ができません）'}。担当者より順次ご返信いたします。\n受付ID: ${requestId}`);
          form.reset();
          clearAllErrors();
          if (requestFieldset) requestFieldset.classList.remove('is-invalid');
          toggleOther();
        } catch (err) {
          const msg = err && typeof err.message === 'string' ? err.message : '';
          alert(`送信に失敗しました。${msg ? `\n${msg}` : ''}\n通信状況と送信先（GAS）の設定を確認してください。`);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText || '送信';
          }
        }
      });
    }
  }
})();
