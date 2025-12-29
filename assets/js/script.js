// 年号 & 現在ページのナビ強調
(function () {
  // bodyタグの data-page 属性を元に、現在のナビゲーションリンクを特定
  const page = document.body.getAttribute("data-page");

  // Translation Dictionary
  const I18N = {
    ja: {
      nav_home: "ホーム",
      nav_about: "活動紹介",
      nav_contact: "公演依頼",
      lang_label: "English",
      lang_text: "EN",
      form_mode_performance: "公演依頼",
      form_mode_general: "その他のお問い合わせ",
      form_name: "お名前",
      form_email: "メールアドレス",
      form_event: "イベント名",
      form_schedule: "開催日程（期間複数日可）",
      form_schedule_hint: "期間や複数日など、分かる範囲でご記入ください。",
      form_venue: "会場",
      form_audience: "想定人数",
      form_budget: "出演料（ご予算）",
      form_budget_hint: "ボランティア出演も可能です（交通費等は要相談）。<br>頂いた出演料は今後の活動費として大切に活用させていただきます。",
      form_type: "依頼内容",
      form_type_magic: "マジック",
      form_type_juggling: "ジャグリング",
      form_type_other: "その他",
      form_type_hint: "複数選択可",
      form_other_detail: "その他（内容）",
      form_tel: "電話番号",
      form_remarks_perf: "その他連絡事項",
      form_remarks_gen: "お問い合わせ内容",
      form_submit: "送信",
      form_sending: "送信中...",
      form_sent: "送信しました",
      form_sent_detail: "担当者より順次ご返信いたします。",
      form_error: "送信に失敗しました。",
      req: "必須",
      opt: "任意",
      ph_name: "例：工学院 太郎",
      ph_email: "例：example@gmail.com",
      ph_event: "例：〇〇子ども会、未定",
      ph_schedule: "例：12月1日〜12月3日、未定",
      ph_venue: "例：住所・最寄り駅、未定",
      ph_audience: "例：50名、未定",
      ph_budget: "例：1〜2万円、ボランティア希望、未定",
      ph_other: "例: 体験コーナーの相談 など",
      ph_remarks_perf: "任意：当日の流れ、設備（マイク/音響など）、NG事項、補足など",
      ph_remarks_gen: "お問い合わせ内容をご記入ください"
    },
    en: {
      nav_home: "Home",
      nav_about: "About",
      nav_contact: "Contact",
      lang_label: "日本語",
      lang_text: "JP",
      form_mode_performance: "Performance Request",
      form_mode_general: "Other Inquiries",
      form_name: "Name",
      form_email: "Email",
      form_event: "Event Name",
      form_schedule: "Dates",
      form_schedule_hint: "Please provide dates or period if known.",
      form_venue: "Venue",
      form_audience: "Audience",
      form_budget: "Budget",
      form_budget_hint: "Volunteer performances possible (transportation fees may apply). Fees support our activities.",
      form_type: "Request Type",
      form_type_magic: "Magic",
      form_type_juggling: "Juggling",
      form_type_other: "Other",
      form_type_hint: "Multiple selections possible",
      form_other_detail: "Other Details",
      form_tel: "Phone Number",
      form_remarks_perf: "Other Remarks",
      form_remarks_gen: "Inquiry Content",
      form_submit: "Submit",
      form_sending: "Sending...",
      form_sent: "Sent successfully.",
      form_sent_detail: "We will get back to you shortly.",
      form_error: "Failed to send.",
      req: "Required",
      opt: "Optional",
      ph_name: "e.g. Taro Kogakuin",
      ph_email: "e.g. example@gmail.com",
      ph_event: "e.g. Kids Party",
      ph_schedule: "e.g. Dec 1st - Dec 3rd",
      ph_venue: "e.g. Address, Nearest Station",
      ph_audience: "e.g. 50 people",
      ph_budget: "e.g. 10,000 JPY, Volunteer",
      ph_other: "e.g. Consultation for experience corner",
      ph_remarks_perf: "Optional: Flow of the day, Equipment (Mic/Audio), NG items, etc.",
      ph_remarks_gen: "Please describe your inquiry."
    }
  };

  const t = (key) => {
    const lang = document.documentElement.lang === 'en' ? 'en' : 'ja';
    return I18N[lang][key] || key;
  };

  const updatePageLanguage = () => {
    const lang = document.documentElement.lang === 'en' ? 'en' : 'ja';
    const dict = I18N[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = dict[key];
        } else {
          el.innerHTML = dict[key];
        }
      }
    });

    // Handle special cases with spans (req/opt) inside labels
    document.querySelectorAll('[data-i18n-label]').forEach(el => {
      const key = el.getAttribute('data-i18n-label'); // e.g., "form_name"
      const type = el.getAttribute('data-i18n-type'); // "req" or "opt"
      if (dict[key]) {
        const suffix = type ? ` <span class="${type}">${dict[type]}</span>` : '';
        el.innerHTML = dict[key] + suffix;
      }
    });
  };

  // Header Loading Logic
  const initHeader = () => {
    const y = document.getElementById("year");
    if (y) {
      y.textContent = new Date().getFullYear();
    }

    const currentPage = document.body.getAttribute("data-page");
    const currentNavLink = document.querySelector(`[data-nav="${currentPage}"]`);
    if (currentNavLink) {
      currentNavLink.setAttribute("aria-current", "page");
    }

    // Update Language Switcher Link
    const langLink = document.querySelector('.lang-link');
    if (langLink) {
      const isEn = document.documentElement.lang === 'en';
      // Use client-side translation for the link text
      langLink.textContent = t('lang_text');
      langLink.setAttribute('aria-label', t('lang_label'));

      const targetPrefix = isEn ? '../' : 'en/';
      // Map page to filename
      const map = { home: 'index.html', about: 'about.html', contact: 'contact.html' };
      const currentPage = document.body.getAttribute("data-page");
      langLink.href = targetPrefix + (map[currentPage] || 'index.html');
    }


  };

  // Load Header and then init
  const headerContainer = document.getElementById('global-header');
  if (headerContainer) {
    // ALWAYS load the root header.html using relative path if needed
    const assetsPath = window.ASSETS_PATH || '';
    fetch(`${assetsPath}header.html`)
      .then(response => response.text())
      .then(html => {
        // Rewrite asset paths in header for subdirectories
        // e.g. src="assets/..." -> src="../assets/..."
        const processedHtml = html.replace(/(src|href)=["']assets\//g, (match) => {
          const quote = match.charAt(match.length - 8); // ' or "
          return `${match.substring(0, match.length - 7)}${assetsPath}assets/`;
        });

        headerContainer.innerHTML = processedHtml;
        window.dispatchEvent(new CustomEvent('kms:header-loaded'));
        // Apply translations to the loaded header
        updatePageLanguage();
        initHeader();
        // ロゴの色反転など、画像関連の初期化も必要ならここで再実行
      })
      .catch(err => console.error('Failed to load header:', err));
  } else {
    // フォールバック: ヘッダーコンテナが無い場合でもテーマ機能などは動かす
    initHeader();
  }

  // Handle SPA Page Updates
  window.addEventListener('kms:page-updated', () => {
    // Update ASSETS_PATH based on new language
    const isEn = document.documentElement.lang === 'en';
    window.ASSETS_PATH = isEn ? '../' : '';

    updatePageLanguage();
    initHeader(); // Re-run header logic

    // Also re-init contact form if on contact page
    // initContactForm is defined later but available in scope when event fires
    if (typeof initContactForm === 'function') {
      initContactForm();
    }
  });


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
      // Asset Path Handling
      const assetsPath = window.ASSETS_PATH || '';

      // Poster Image
      overlay.poster = `${assetsPath}assets/images/landing-intro-poster.avif`;

      Object.assign(overlay.style, {
        position: 'fixed', inset: '0', width: '100vw', height: '100vh',
        objectFit: 'cover', background: '#000', zIndex: '9999',
        transition: 'opacity 0.6s ease' // Fade out transition
      });

      // WebM (Recommended)
      const webmSource = document.createElement('source');
      webmSource.src = `${assetsPath}assets/videos/landing-intro.webm`;
      webmSource.type = 'video/webm';

      overlay.appendChild(webmSource);

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
        try { overlay.remove(); } catch (_) { }
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

  // CONTACT: カスタムフォーム初期化（関数化して再実行可能に）
  const initContactForm = () => {
    // Ensure static translations are applied if not yet
    updatePageLanguage();

    const currentPage = document.body.getAttribute('data-page');
    if (currentPage !== 'contact') return;

    const form = document.getElementById('contact-form');
    if (!form) return;

    // 既に初期化済みの場合はスキップ
    if (form.dataset.initialized === 'true') return;
    form.dataset.initialized = 'true';

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
      const isEn = document.documentElement.lang === 'en';

      if (performanceFields) {
        performanceFields.classList.toggle('is-hidden', !isPerformance);
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

      const remarksLabel = document.getElementById('label-remarks');
      if (remarksLabel) {
        // Use translate helper for labels
        const labelKey = isPerformance ? 'form_remarks_perf' : 'form_remarks_gen';
        const typeKey = isPerformance ? 'opt' : 'req';
        // Manually constructing HTML to keep spans
        remarksLabel.innerHTML = `${t(labelKey)} <span class="${typeKey}">${t(typeKey)}</span>`;

        const remarksInput = document.getElementById('cf-remarks');
        if (remarksInput) {
          if (!isPerformance) {
            remarksInput.required = true;
            remarksInput.placeholder = t('ph_remarks_gen');
          } else {
            remarksInput.required = false;
            remarksInput.placeholder = t('ph_remarks_perf');
          }
        }
      }

      // Clear errors on mode switch
      clearAllErrors();
    };

    modeRadios.forEach(radio => radio.addEventListener('change', updateFormMode));
    toggleOther();
    if (otherToggle) otherToggle.addEventListener('change', toggleOther);

    // Initial translation for static form elements handled by updatePageLanguage outside, 
    // but form placeholder logic is dynamic for remarks:
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

      const isEn = document.documentElement.lang === 'en';
      const msg = {
        name: isEn ? 'Please enter your name.' : 'お名前を入力してください。',
        email: isEn ? 'Please enter your email.' : 'メールアドレスを入力してください。',
        emailFormat: isEn ? 'Invalid email format.' : 'メールアドレスの形式が正しくありません。',
        event: isEn ? 'Please enter event name.' : 'イベント名を入力してください。',
        schedule: isEn ? 'Please enter schedule.' : '開催日程を入力してください。',
        venue: isEn ? 'Please enter venue.' : '会場を入力してください。',
        audience: isEn ? 'Please enter estimated audience.' : '想定人数を入力してください。',
        budget: isEn ? 'Please enter budget.' : '出演料（ご予算）を入力してください。',
        type: isEn ? 'Please select at least one request type.' : '依頼内容を1つ以上選択してください。',
        other: isEn ? 'Please specify details for "Other".' : '「その他」を選択した場合は内容を入力してください。',
        remarks: isEn ? 'Please enter your inquiry.' : 'お問い合わせ内容を入力してください。'
      };

      // Note: We could move 'msg' to I18N too, but for validation logic simplicity kept here or use t()
      // Let's rely on the previous object for now to minimize diff risk, or update if user complains.
      // But user wanted consistency. Let's stick with what we have since it's already language-aware.

      if (!readValue('name')) markInvalid(nameEl, 'name', msg.name);

      const mode = readValue('formMode');
      const isPerformance = mode === 'performance';

      if (!readValue('email')) {
        markInvalid(emailEl, 'email', msg.email);
      } else if (emailEl && !emailEl.checkValidity()) {
        markInvalid(emailEl, 'email', msg.emailFormat);
      }

      if (isPerformance) {
        if (!readValue('eventName')) markInvalid(eventEl, 'eventName', msg.event);
        if (!readValue('eventSchedule')) markInvalid(scheduleEl, 'eventSchedule', msg.schedule);
        if (!readValue('venue')) markInvalid(venueEl, 'venue', msg.venue);
        if (!readValue('audience')) markInvalid(audienceEl, 'audience', msg.audience);
        if (!readValue('budget')) markInvalid(budgetEl, 'budget', msg.budget);

        const types = Array.from(form.querySelectorAll('input[name="requestType"]:checked')).map((el) => el.value);
        if (!types.length) {
          const err = getErrorEl('requestType');
          if (err) err.textContent = msg.type;
          if (requestFieldset) requestFieldset.classList.add('is-invalid');
          if (!firstInvalid && requestFieldset) firstInvalid = requestFieldset;
        }

        if (otherInput && otherInput.required && !readValue('requestOther')) {
          markInvalid(otherInput, 'requestOther', msg.other);
        }
      } else {
        // general inquiry
        const remarksEl = form.querySelector('#cf-remarks');
        if (!readValue('remarks')) markInvalid(remarksEl, 'remarks', msg.remarks);
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
        const isEn = document.documentElement.lang === 'en';
        submitBtn.textContent = isEn ? 'Sending...' : '送信中...';
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

        const isEn = document.documentElement.lang === 'en';
        alert(`${confirmed
          ? (isEn ? 'Sent successfully.' : '送信しました')
          : (isEn ? 'Attempted to send (Could not verify result).' : '送信を試行しました（結果の確認ができません）')}。${isEn ? 'We will get back to you shortly.' : '担当者より順次ご返信いたします。'}`);
        form.reset();
        clearAllErrors();
        if (requestFieldset) requestFieldset.classList.remove('is-invalid');
        toggleOther();
        updateFormMode();

      } catch (err) {
        const isEn = document.documentElement.lang === 'en';
        const msg = err && typeof err.message === 'string' ? err.message : '';
        alert(`${isEn ? 'Failed to send.' : '送信に失敗しました。'}${msg ? `\n${msg}` : ''}\n${isEn ? 'Please check your connection.' : '通信状況と送信先（GAS）の設定を確認してください。'}`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          const isEn = document.documentElement.lang === 'en';
          submitBtn.textContent = originalBtnText || (isEn ? 'Submit' : '送信');
        }
      }
    });
  };

  // 初回実行
  if (page === 'contact') {
    initContactForm();
  }

  // ページ遷移後の再初期化
  window.addEventListener('kms:page-updated', () => {
    initContactForm();
  });
})();

