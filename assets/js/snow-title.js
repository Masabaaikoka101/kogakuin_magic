
// Snow Title Animation - ふわふわ雪エフェクト（文字の上にのみ積もる）
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
  let textTopEdge = null; // 文字の上端マップ（積もり用）
  let frameCount = 0; // アニメーション用フレームカウンタ

  const init = () => {
    width = heroSection.offsetWidth;
    height = heroSection.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    // テキストのマスクを作成
    createTextMap();

    // 文字の上端マップを作成
    createTextTopEdgeMap();

    particles = [];
    // 初期粒子
    for (let i = 0; i < width * 0.8; i++) {
      particles.push(createParticle(true));
    }
  };

  const createTextMap = () => {
    // オフスクリーンCanvasでテキストを描画
    const osCv = document.createElement('canvas');
    osCv.width = width;
    osCv.height = height;
    const osCtx = osCv.getContext('2d');

    const heroRect = heroSection.getBoundingClientRect();

    // テキスト（h1）を描画
    if (h1) {
      const computedStyle = window.getComputedStyle(h1);
      const fontSize = parseFloat(computedStyle.fontSize);
      const fontFamily = computedStyle.fontFamily;

      osCtx.font = `700 ${fontSize}px ${fontFamily} `;
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

  // 各X座標における文字の一番上のY座標を計算
  const createTextTopEdgeMap = () => {
    if (!textMap) return;

    textTopEdge = new Array(width).fill(-1);

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const alpha = textMap[(y * width + x) * 4 + 3];
        if (alpha > 100) {
          textTopEdge[x] = y;
          break; // 一番上のピクセルを見つけたらbreak
        }
      }
    }
  };

  // 文字の上端に到達したかチェック（内部には入らない）
  const getTextTopAt = (x) => {
    if (!textTopEdge) return -1;
    const ix = Math.floor(x);
    if (ix < 0 || ix >= width) return -1;
    return textTopEdge[ix];
  };

  const createParticle = (initial = false) => {
    // ふわふわ感を出すためのパラメータ
    const size = Math.random() * 3 + 1.5; // 1.5〜4.5px

    return {
      x: Math.random() * width,
      y: initial ? Math.random() * height * 0.8 : -10 - Math.random() * 50,
      size: size,
      // ゆっくり落下（0.3〜1.0px/frame）- とてもふわふわ
      baseSpeedY: Math.random() * 0.7 + 0.3,
      speedY: 0,
      speedX: 0,
      // 揺れのパラメータ（各雪片で異なる）- 控えめに
      swayAmplitude: Math.random() * 0.7 + 0.3, // 揺れ幅 0.3〜1.0（控えめ）
      swayFrequency: Math.random() * 0.02 + 0.01, // 揺れ周波数
      swayOffset: Math.random() * Math.PI * 2, // 位相オフセット
      // 不規則な動きのためのノイズパラメータ
      noiseSpeed: Math.random() * 0.02 + 0.005,
      noiseOffset: Math.random() * 1000,
      // 透明度のバリエーション
      opacity: Math.random() * 0.3 + 0.7, // 0.7〜1.0
      isLanded: false,
      landedY: 0
    };
  };

  // シンプルなノイズ関数（Perlin風の滑らかなランダム）
  const noise = (t) => {
    const x = Math.sin(t * 1.1) * 0.5 + Math.sin(t * 2.3) * 0.3 + Math.sin(t * 4.7) * 0.2;
    return x;
  };

  const render = () => {
    frameCount++;
    ctx.clearRect(0, 0, width, height);

    // 降っている雪の数をカウント
    let fallingCount = 0;
    for (let p of particles) {
      if (!p.isLanded) fallingCount++;
    }

    // 常に一定量の降る雪を維持する
    if (fallingCount < width * 0.5) {
      particles.push(createParticle());
    }

    // 粒子数が増えすぎないように安全策（2500個上限）
    if (particles.length > 2500) {
      particles.shift();
    }

    // 更新と描画
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      if (!p.isLanded) {
        // ふわふわ落下速度計算
        const time = frameCount + p.noiseOffset;

        // 縦方向：基本速度 + 微妙なゆらぎ
        const verticalNoise = noise(time * p.noiseSpeed) * 0.2;
        p.speedY = p.baseSpeedY + verticalNoise;

        // 横方向：サイン波 + ノイズで不規則なゆらゆら（控えめ）
        const sway = Math.sin(time * p.swayFrequency + p.swayOffset) * p.swayAmplitude;
        const horizontalNoise = noise(time * p.noiseSpeed * 1.5 + 100) * 0.3;
        p.speedX = sway + horizontalNoise;

        p.y += p.speedY;
        p.x += p.speedX;

        // 文字の上端との衝突判定（内部には入らない）
        const topY = getTextTopAt(p.x);
        if (topY > 0 && p.y >= topY) { // 文字の上端で判定
          // 積もる確率
          if (Math.random() < 0.15) {
            p.isLanded = true;
            p.landedY = topY; // 文字の上端に完全にぴったり配置
            p.y = p.landedY;
          }
        }

        // 画面外リセット
        if (p.y > height + 10) {
          // リサイクル
          p.y = -10 - Math.random() * 30;
          p.x = Math.random() * width;
          p.noiseOffset = Math.random() * 1000;
        }
        // 横方向のワープ
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;
      }

      // 描画（丸い雪片）
      ctx.globalAlpha = p.opacity;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
    }

    ctx.globalAlpha = 1;
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
