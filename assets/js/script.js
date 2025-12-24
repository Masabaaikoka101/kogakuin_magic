// 年号 & 現在ページのナビ強調
(function () {
  // bodyタグの data-page 属性を元に、現在のナビゲーションリンクを特定
  const page = document.body.getAttribute("data-page");

  // Header Loading Logic
  const initHeader = () => {
    const y = document.getElementById("year");
    if (y) {
      y.textContent = new Date().getFullYear();
    }

    const currentNavLink = document.querySelector(`[data-nav="${page}"]`);
    if (currentNavLink) {
      currentNavLink.setAttribute("aria-current", "page");
    }


  };

  // Load Header and then init
  const headerContainer = document.getElementById('global-header');
  if (headerContainer) {
    fetch('header.html')
      .then(response => response.text())
      .then(html => {
        headerContainer.innerHTML = html;
        window.dispatchEvent(new CustomEvent('kms:header-loaded'));
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

  // First View Video Overlay (Home Only)
  if (page === 'home') {
    const firstViewKey = 'firstViewPlayed';
    const releasePendingState = () => document.documentElement.removeAttribute('data-first-view');

    let hasPlayed = false;
    try {
      hasPlayed = !!sessionStorage.getItem(firstViewKey);
    } catch (_) { }

    if (hasPlayed) {
      releasePendingState();
    } else {
      const overlay = document.createElement('video');
      overlay.className = 'first-view-overlay';
      overlay.autoplay = true;
      overlay.muted = true;
      overlay.playsInline = true;
      overlay.controls = false;
      overlay.preload = 'auto';
      // Poster Image
      overlay.poster = 'assets/images/landing-intro-poster.png';
      
      Object.assign(overlay.style, {
        position: 'fixed', inset: '0', width: '100vw', height: '100vh',
        objectFit: 'cover', background: '#000', zIndex: '9999',
        transition: 'opacity 0.6s ease' // Fade out transition
      });

      // WebM (Recommended)
      const webmSource = document.createElement('source');
      webmSource.src = 'assets/videos/landing-intro.webm';
      webmSource.type = 'video/webm';

      // MP4 Fallback (if exists)
      // Note: kept landing-intro.mp4 logic just in case, though file might be removed. 
      // User requested switch to webm mainly.
      // const mp4Source = document.createElement('source');
      // mp4Source.src = 'assets/videos/landing-intro.mp4';
      // mp4Source.type = 'video/mp4';

      overlay.appendChild(webmSource);
      // overlay.appendChild(mp4Source); 

      const teardown = () => {
        // Fade out
        overlay.style.opacity = '0';
        setTimeout(() => {
          releasePendingState();
          try { overlay.remove(); } catch (_) { }
        }, 600); // Wait for transition
      };

      overlay.addEventListener('ended', () => {
        try { sessionStorage.setItem(firstViewKey, '1'); } catch (_) { }
        teardown();
      });
      overlay.addEventListener('error', () => {
        // If critical video error, remove immediately
        releasePendingState();
        try { overlay.remove(); } catch (_) {}
      });

      try {
        document.body.appendChild(overlay);
        overlay.load();
        const p = overlay.play();
        if (p !== undefined) {
          p.catch(() => {
             // Autoplay blocked handling -> just remove overlay or show static?
             // For now, just remove to show site
             teardown();
          });
        }
      } catch (_) {
        teardown();
      }
    }
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

      const performanceFields = document.getElementById('performance-fields');
      const remarksLabel = document.getElementById('label-remarks');
      const modeRadios = form.querySelectorAll('input[name="formMode"]');

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

      const updateFormMode = () => {
        const mode = readValue('formMode'); // 'performance' or 'general'
        const isPerformance = mode === 'performance';

        if (performanceFields) {
          performanceFields.classList.toggle('is-hidden', !isPerformance);
          // 必須属性の切り替え
          performanceFields.querySelectorAll('[required], [data-required-cache]').forEach(el => {
            if (!isPerformance) {
              if (el.hasAttribute('required')) {
                el.removeAttribute('required');
                el.setAttribute('data-required-cache', 'true');
              }
            } else {
              if (el.getAttribute('data-required-cache') === 'true') {
                el.setAttribute('required', '');
                el.removeAttribute('data-required-cache');
              }
            }
          });
        }

        if (remarksLabel) {
          remarksLabel.innerHTML = isPerformance
            ? 'その他連絡事項 <span class="opt">任意</span>'
            : 'お問い合わせ内容 <span class="req">必須</span>';

          const remarksInput = document.getElementById('cf-remarks');
          if (remarksInput) {
            if (!isPerformance) {
              remarksInput.required = true;
              remarksInput.placeholder = 'お問い合わせ内容をご記入ください';
            } else {
              remarksInput.required = false;
              remarksInput.placeholder = '任意：当日の流れ、設備（マイク/音響など）、NG事項、補足など';
            }
          }
        }

        // モード切替時にエラーをクリア
        clearAllErrors();
      };

      modeRadios.forEach(radio => radio.addEventListener('change', updateFormMode));
      toggleOther();
      if (otherToggle) otherToggle.addEventListener('change', toggleOther);

      // 初期化
      updateFormMode();

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
        const budgetEl = form.querySelector('#cf-budget');

        if (!readValue('name')) markInvalid(nameEl, 'name', 'お名前を入力してください。');

        const mode = readValue('formMode');
        const isPerformance = mode === 'performance';

        if (!readValue('email')) {
          markInvalid(emailEl, 'email', 'メールアドレスを入力してください。');
        } else if (emailEl && !emailEl.checkValidity()) {
          markInvalid(emailEl, 'email', 'メールアドレスの形式が正しくありません。');
        }

        if (isPerformance) {
          if (!readValue('eventName')) markInvalid(eventEl, 'eventName', 'イベント名を入力してください。');
          if (!readValue('eventSchedule')) markInvalid(scheduleEl, 'eventSchedule', '開催日程を入力してください。');
          if (!readValue('venue')) markInvalid(venueEl, 'venue', '会場を入力してください。');
          if (!readValue('audience')) markInvalid(audienceEl, 'audience', '想定人数を入力してください。');
          if (!readValue('budget')) markInvalid(budgetEl, 'budget', '出演料（ご予算）を入力してください。');

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
        } else {
          // 一般お問い合わせの場合、remarks（お問い合わせ内容）が必須
          const remarksEl = form.querySelector('#cf-remarks');
          if (!readValue('remarks')) markInvalid(remarksEl, 'remarks', 'お問い合わせ内容を入力してください。');
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

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validate()) return;

        // Note: Replace this URL with your updated Web App URL if it changes
        const endpoint = 'https://script.google.com/macros/s/AKfycbwheFaPhK8tAeYXE4kAK8epoCQnlQeBtHnad1P3eXVTvDPQIfvbY-e7k-ZnviIZcojWwA/exec';

        const schedule = readValue('eventSchedule');
        const venue = readValue('venue');
        const audience = readValue('audience');
        const budget = readValue('budget');
        const otherText = readValue('requestOther');
        const selectedTypes = Array.from(form.querySelectorAll('input[name="requestType"]:checked')).map((el) => el.value);
        const typesForGas = selectedTypes.map((t) => (t === 'その他' && otherText ? `その他: ${otherText}` : t));

        // 送信先GAS（ユーザー提供スクリプト）に合わせたキー名へ整形
        const payload = {
          formType: readValue('formMode'),
          name: readValue('name'),
          email: readValue('email'),
          eventName: readValue('eventName'),
          eventDate: schedule,
          place: venue,
          people: audience,
          budget: budget,
          type: typesForGas,
          tel: readValue('tel'),
          remarks: readValue('remarks'),
          clientTimestamp: new Date().toISOString(),
        };

        const originalBtnText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = '送信中...';
        }

        try {
          const body = JSON.stringify({ ...payload });

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

          alert(`${confirmed ? '送信しました' : '送信を試行しました（結果の確認ができません）'}。担当者より順次ご返信いたします。`);
          form.reset();
          clearAllErrors();
          if (requestFieldset) requestFieldset.classList.remove('is-invalid');
          toggleOther();
          // リセット後にモードを初期状態（公演依頼）に戻す、あるいはリセット時のラジオボタンの状態に合わせる
          updateFormMode();

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
