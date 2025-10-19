(function(){
  'use strict';

  // 年の表示と現在ページのARIA
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
  var page = document.body.getAttribute('data-page');
  var current = document.querySelector('[data-nav="' + page + '"]');
  if (current) current.setAttribute('aria-current','page');

  // ホーム初回のみフルスクリーン動画を再生
  if (page === 'home') {
    var key = 'firstViewPlayed';
    if (sessionStorage.getItem(key)) return;

    var v = document.createElement('video');
    v.autoplay = true;
    v.muted = true;      // 自動再生のため必須
    v.playsInline = true;
    v.controls = false;
    v.preload = 'auto';
    v.style.position = 'fixed';
    v.style.inset = '0';
    v.style.width = '100vw';
    v.style.height = '100vh';
    v.style.objectFit = 'cover';
    v.style.background = '#000';
    v.style.zIndex = '9999';

    // 複数候補（どちらかが存在すれば再生されます）
    var s1 = document.createElement('source'); s1.src = 'assets/videos/landing-intro.mp4'; s1.type = 'video/mp4';
    var s2 = document.createElement('source'); s2.src = 'first_view.mp4'; s2.type = 'video/mp4';
    v.appendChild(s1); v.appendChild(s2);

    var cleanup = function(){
      try { v.remove(); } catch(_) {}
    };
    v.addEventListener('ended', function(){
      sessionStorage.setItem(key,'1');
      cleanup();
    });
    v.addEventListener('error', function(){
      // 再生できない場合はブロッキングを回避
      cleanup();
    });

    document.body.appendChild(v);
    try { v.load(); } catch(_) {}
    try { v.play().catch(function(){ /* ignore */ }); } catch(_) {}
  }
})();

