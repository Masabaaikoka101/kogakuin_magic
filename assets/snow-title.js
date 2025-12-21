
// Snow Title Animation
document.addEventListener("DOMContentLoaded", () => {
  // 期間判定 (日本時間の12月〜2月のみ動作)
  const now = new Date();
  // UTC時間を取得し、JST(+9時間)に変換
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const jst = new Date(utc + (3600000 * 9));
  const month = jst.getMonth(); // 0:Jan, 1:Feb, ..., 11:Dec

  // 11(12月), 0(1月), 1(2月) 以外は終了
  if (month !== 11 && month !== 0 && month !== 1) {
    return;
  }

  const heroSection = document.querySelector(".hero");
  if (!heroSection) return;

  const h1 = heroSection.querySelector("h1");
  // タイトルは表示したまま（雪が上に積もる演出）
  if (h1) h1.style.opacity = "1";

  // 1. Setup Canvas
  const canvas = document.createElement("canvas");
  canvas.id = "snow-title-canvas";
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "10"; // 文字の上

  // H1の上に重ねる
  const heroStyle = window.getComputedStyle(heroSection);
  if (heroStyle.position === "static") {
    heroSection.style.position = "relative";
  }
  heroSection.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let width, height;
  let particles = [];
  let textMap = null; // テキストのピクセルデータ（Collision用）

  const init = () => {
    width = heroSection.offsetWidth;
    height = heroSection.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    // テキストのマスクを作成
    createTextMap();

    particles = [];
    // 初期粒子（量を増やす）
    for (let i = 0; i < width * 1.0; i++) {
      particles.push(createParticle(true));
    }
  };

  const createTextMap = () => {
    if (!h1) return;

    // オフスクリーンCanvasでテキスト描画
    const osCv = document.createElement('canvas');
    osCv.width = width;
    osCv.height = height;
    const osCtx = osCv.getContext('2d');

    const computedStyle = window.getComputedStyle(h1);
    const fontSize = parseFloat(computedStyle.fontSize);
    const fontFamily = computedStyle.fontFamily;

    osCtx.font = `700 ${fontSize}px ${fontFamily} `;
    osCtx.textAlign = "center";
    osCtx.textBaseline = "middle";
    osCtx.fillStyle = "white"; // 色は何でも良い（Alphaチェック用）

    const h1Rect = h1.getBoundingClientRect();
    const heroRect = heroSection.getBoundingClientRect();

    const spans = h1.querySelectorAll("span");
    spans.forEach(span => {
      const rect = span.getBoundingClientRect();
      const x = rect.left - heroRect.left + rect.width / 2;
      const y = rect.top - heroRect.top + rect.height / 2;
      osCtx.fillText(span.textContent, x, y);
    });

    const idata = osCtx.getImageData(0, 0, width, height);
    textMap = idata.data;
  };

  const isTextPixel = (x, y) => {
    if (!textMap) return false;
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix < 0 || ix >= width || iy < 0 || iy >= height) return false;

    // Alpha channel check
    return textMap[(iy * width + ix) * 4 + 3] > 100;
  };

  const createParticle = (initial = false) => {
    return {
      x: Math.random() * width,
      y: initial ? Math.random() * height : -10,
      size: Math.random() * 2 + 1,
      speedY: Math.random() * 3 + 2, // 2px~5px/frame
      speedX: (Math.random() - 0.5) * 1.5, // 横揺れ少し強く
      isLanded: false
    };
  };

  const render = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "white";
    ctx.beginPath();

    // 降っている雪の数をカウント
    let fallingCount = 0;
    for (let p of particles) {
      if (!p.isLanded) fallingCount++;
    }

    // 常に一定量の降る雪を維持する (積もった分とは別枠で補充)
    // 画面幅 * 0.6 個くらいは常に降っていてほしい
    if (fallingCount < width * 0.6) {
      particles.push(createParticle());
    }

    // 粒子数が増えすぎないように安全策（3000個上限）
    if (particles.length > 3000) {
      // 古い積もった雪から削除するか、ランダムに削除して間引く
      // ここでは単純に先頭（古いもの）から消す
      particles.shift();
    }

    // 更新と描画
    // 削除用フラグを使わず、ループ内で処理
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      if (!p.isLanded) {
        p.y += p.speedY;
        p.x += p.speedX;

        // 衝突判定（テキストに積もる）
        if (isTextPixel(p.x, p.y)) {
          // 積もる確率
          if (Math.random() < 0.2) {
            p.isLanded = true;
          }
        }

        // 画面外リセットor削除
        if (p.y > height) {
          // リサイクル
          p.y = -10;
          p.x = Math.random() * width;
        }
        if (p.x > width) p.x = 0;
        if (p.x < 0) p.x = width;
      }

      // 描画 (rect)
      ctx.moveTo(p.x, p.y);
      ctx.rect(p.x, p.y, p.size, p.size);
    }

    ctx.fill();
  };

  // Loop
  gsap.ticker.add(render);

  // Resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      init();
    }, 500);
  });

  // フォント読み込み後に初期化
  document.fonts.ready.then(() => {
    setTimeout(init, 100);
  });
});
