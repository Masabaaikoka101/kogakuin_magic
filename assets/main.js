(function () {
  'use strict';

  var body = document.body;
  var page = body ? body.getAttribute('data-page') : null;

  var yearLabel = document.getElementById('year');
  if (yearLabel) {
    yearLabel.textContent = new Date().getFullYear();
  }

  if (page) {
    var currentNav = document.querySelector('[data-nav="' + page + '"]');
    if (currentNav) {
      currentNav.setAttribute('aria-current', 'page');
    }
  }

  if (page === 'home') {
    var firstViewKey = 'firstViewPlayed';
    var releasePendingState = function () {
      document.documentElement.removeAttribute('data-first-view');
    };

    var hasPlayed = false;
    try {
      hasPlayed = !!sessionStorage.getItem(firstViewKey);
    } catch (err) {
      hasPlayed = false;
    }

    if (hasPlayed) {
      releasePendingState();
      return;
    }

    var overlay = document.createElement('video');
    overlay.className = 'first-view-overlay';
    overlay.autoplay = true;
    overlay.muted = true; // Required to allow autoplay without user gesture
    overlay.playsInline = true;
    overlay.controls = false;
    overlay.preload = 'auto';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.objectFit = 'cover';
    overlay.style.background = '#000';
    overlay.style.zIndex = '9999';

    var primarySource = document.createElement('source');
    primarySource.src = 'assets/videos/landing-intro.mp4';
    primarySource.type = 'video/mp4';

    var fallbackSource = document.createElement('source');
    fallbackSource.src = 'first_view.mp4';
    fallbackSource.type = 'video/mp4';

    overlay.appendChild(primarySource);
    overlay.appendChild(fallbackSource);

    var teardown = function () {
      releasePendingState();
      try {
        overlay.remove();
      } catch (err) {
        // ignore
      }
    };

    overlay.addEventListener('ended', function () {
      try {
        sessionStorage.setItem(firstViewKey, '1');
      } catch (err) {
        // ignore
      }
      teardown();
    });

    overlay.addEventListener('error', teardown);

    try {
      document.body.appendChild(overlay);
      try {
        overlay.load();
      } catch (err) {
        // ignore
      }
      try {
        overlay.play().catch(function () { /* ignore */ });
      } catch (err) {
        // ignore
      }
    } catch (err) {
      teardown();
    }
  }
})();

