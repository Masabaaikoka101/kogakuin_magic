
// Snow Title Animation - ふわふわ雪エフェクト（文字の上にのみ積もる）
(function () {
  'use strict';

  // 雪アニメーションの状態管理
  let snowInstance = null;
  let renderCallback = null;
  let activeResizeHandler = null; // 追加: リサイズイベントハンドラの参照保持用

  // 期間判定 (日本時間の12月〜2月のみ動作)
  const isWinterSeason = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const jst = new Date(utc + (3600000 * 9));
    const month = jst.getMonth(); // 0:Jan, 1:Feb, ..., 11:Dec
    return month === 11 || month === 0 || month === 1;
  };

  // 雪アニメーションを停止
  const stopSnow = () => {
    if (renderCallback && typeof gsap !== 'undefined') {
      gsap.ticker.remove(renderCallback);
      renderCallback = null;
    }

    // リサイズイベントの削除（メモリリーク防止）
    if (activeResizeHandler) {
      window.removeEventListener("resize", activeResizeHandler);
      activeResizeHandler = null;
    }

    const existingCanvas = document.getElementById('snow-title-canvas');
    if (existingCanvas) {
      existingCanvas.remove();
    }
    snowInstance = null;
  };

  // 雪アニメーションを初期化・開始
  const initSnowAnimation = () => {
    // 冬以外は終了
    if (!isWinterSeason()) return;

    // ホームページ以外なら停止して終了
    const currentPage = document.body.getAttribute('data-page');
    if (currentPage !== 'home') {
      stopSnow();
      return;
    }

    // 既にアニメーション中なら何もしない
    if (snowInstance) return;

    const heroSection = document.querySelector(".hero");
    if (!heroSection) return;

    const h1 = heroSection.querySelector("h1");
    if (h1) h1.style.opacity = "1";

    // 既存のキャンバスを削除
    const existingCanvas = document.getElementById('snow-title-canvas');
    if (existingCanvas) existingCanvas.remove();

    // キャンバス作成
    const canvas = document.createElement("canvas");
    canvas.id = "snow-title-canvas";
    canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10;";

    const heroStyle = window.getComputedStyle(heroSection);
    if (heroStyle.position === "static") {
      heroSection.style.position = "relative";
    }
    heroSection.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    let width, height;
    let particles = [];
    let textMap = null;
    let textTopEdge = null;
    let frameCount = 0;

    const createTextMap = () => {
      const osCv = document.createElement('canvas');
      osCv.width = width;
      osCv.height = height;
      const osCtx = osCv.getContext('2d');
      const heroRect = heroSection.getBoundingClientRect();

      if (h1) {
        const computedStyle = window.getComputedStyle(h1);
        const fontSize = parseFloat(computedStyle.fontSize);
        const fontFamily = computedStyle.fontFamily;

        osCtx.font = `700 ${fontSize}px ${fontFamily}`;
        osCtx.textAlign = "center";
        osCtx.textBaseline = "middle";
        osCtx.fillStyle = "white";

        const spans = h1.querySelectorAll("span");
        spans.forEach(span => {
          const rect = span.getBoundingClientRect();
          const x = rect.left - heroRect.left + rect.width / 2;
          const y = rect.top - heroRect.top + rect.height / 2;
          osCtx.fillText(span.textContent, x, y);
        });
      }

      const idata = osCtx.getImageData(0, 0, width, height);
      textMap = idata.data;
    };

    const createTextTopEdgeMap = () => {
      if (!textMap) return;
      textTopEdge = new Array(width).fill(-1);

      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const alpha = textMap[(y * width + x) * 4 + 3];
          if (alpha > 100) {
            textTopEdge[x] = y;
            break;
          }
        }
      }
    };

    const getTextTopAt = (x) => {
      if (!textTopEdge) return -1;
      const ix = Math.floor(x);
      if (ix < 0 || ix >= width) return -1;
      return textTopEdge[ix];
    };

    const createParticle = (initial = false) => {
      const size = Math.random() * 3 + 1.5;
      return {
        x: Math.random() * width,
        y: initial ? -Math.random() * height * 0.5 : -10 - Math.random() * 50,
        size: size,
        baseSpeedY: Math.random() * 0.7 + 0.3,
        speedY: 0,
        speedX: 0,
        swayAmplitude: Math.random() * 0.7 + 0.3,
        swayFrequency: Math.random() * 0.02 + 0.01,
        swayOffset: Math.random() * Math.PI * 2,
        noiseSpeed: Math.random() * 0.02 + 0.005,
        noiseOffset: Math.random() * 1000,
        opacity: Math.random() * 0.3 + 0.7,
        isLanded: false,
        landedY: 0,
        canLand: Math.random() > 0.4
      };
    };

    const noise = (t) => {
      return Math.sin(t * 1.1) * 0.5 + Math.sin(t * 2.3) * 0.3 + Math.sin(t * 4.7) * 0.2;
    };

    const init = () => {
      width = heroSection.offsetWidth;
      height = heroSection.offsetHeight;
      canvas.width = width;
      canvas.height = height;

      createTextMap();
      createTextTopEdgeMap();

      particles = [];
      for (let i = 0; i < width * 0.8; i++) {
        particles.push(createParticle(true));
      }
    };

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      let fallingCount = 0;
      for (let p of particles) {
        if (!p.isLanded) fallingCount++;
      }

      if (fallingCount < width * 0.5) {
        particles.push(createParticle());
      }

      if (particles.length > 2500) {
        particles.shift();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        if (!p.isLanded) {
          const time = frameCount + p.noiseOffset;
          const verticalNoise = noise(time * p.noiseSpeed) * 0.2;
          p.speedY = p.baseSpeedY + verticalNoise;

          const sway = Math.sin(time * p.swayFrequency + p.swayOffset) * p.swayAmplitude;
          const horizontalNoise = noise(time * p.noiseSpeed * 1.5 + 100) * 0.3;
          p.speedX = sway + horizontalNoise;

          p.y += p.speedY;
          p.x += p.speedX;

          if (p.canLand) {
            const topY = getTextTopAt(p.x);
            if (topY > 0 && p.y >= topY) {
              if (Math.random() < 0.15) {
                p.isLanded = true;
                p.landedY = topY;
                p.y = p.landedY;
              }
            }
          }

          if (p.y > height + 10) {
            p.y = -10 - Math.random() * 30;
            p.x = Math.random() * width;
            p.noiseOffset = Math.random() * 1000;
          }
          if (p.x > width + 20) p.x = -20;
          if (p.x < -20) p.x = width + 20;
        }

        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    // インスタンス設定
    snowInstance = { canvas, ctx, init };
    renderCallback = render;

    // フォント読み込み後に初期化
    document.fonts.ready.then(() => {
      setTimeout(() => {
        init();
        if (typeof gsap !== 'undefined') {
          gsap.ticker.add(render);
        }
      }, 100);
    });

    // リサイズ対応
    let resizeTimer;
    let lastWidth = window.innerWidth; // 横幅の変化のみ検知

    activeResizeHandler = () => {
      // 横幅が変わらない（縦スクロールによるバー開閉など）場合は無視
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;

      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (snowInstance) {
          init();
        }
      }, 500);
    };
    window.addEventListener("resize", activeResizeHandler);
  };

  // 雪アニメーションを遅延開始
  const startSnowWithDelay = (delay = 500) => {
    setTimeout(initSnowAnimation, delay);
  };

  // 初回起動時の処理
  const handleInitialStart = () => {
    const currentPage = document.body.getAttribute('data-page');
    if (currentPage !== 'home') return;

    const firstViewKey = 'firstViewPlayed';
    let hasPlayed = false;
    try {
      hasPlayed = !!sessionStorage.getItem(firstViewKey);
    } catch (_) { }

    if (hasPlayed) {
      startSnowWithDelay(500);
    } else {
      const overlay = document.querySelector('.first-view-overlay');
      if (overlay && overlay.tagName === 'VIDEO') {
        overlay.addEventListener('ended', () => startSnowWithDelay(800));
        setTimeout(() => startSnowWithDelay(0), 10000); // フォールバック
      } else {
        startSnowWithDelay(1000);
      }
    }
  };

  // DOMContentLoaded時に初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleInitialStart);
  } else {
    handleInitialStart();
  }

  // SPA遷移時の処理
  window.addEventListener('kms:page-updated', () => {
    const currentPage = document.body.getAttribute('data-page');
    if (currentPage === 'home') {
      // ホームに戻ったら雪を再開
      stopSnow();
      startSnowWithDelay(300);
    } else {
      // 他のページでは雪を停止
      stopSnow();
    }
  });
})();
