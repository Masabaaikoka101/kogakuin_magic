(function() {
    // --- Configuration ---
    // Container is scaled by 0.25
    // Internal coordinates are relative to 100x300 container
    
    // Initial Y calculation:
    // Assembly starts at 0 (margin-top removed).
    // Socket Top is at 144px (inside assembly).
    // Socket Height is 55px.
    // Cord attaches at bottom of socket approx 144 + 55 = 199px.
    // Round to 200px.
    const CONFIG = {
      anchorX: 50, // Container is 100px wide, so center is 50
      anchorY: 200, 
      restLength: 90, 
      springK: 0.15,
      damping: 0.82, 
      mass: 1,
      toggleThreshold: 60
    };
  
    const state = {
      isDragging: false,
      handleX: CONFIG.anchorX,
      handleY: CONFIG.anchorY + CONFIG.restLength,
      velocityY: 0,
      velocityX: 0
    };
  
    let els = {};
  
    // --- Theme Logic ---
    const THEME_KEY = 'kms-theme';
  
    function getStoredTheme() {
      try {
        return localStorage.getItem(THEME_KEY);
      } catch (e) { return null; }
    }
  
    function setStoredTheme(theme) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (e) {}
    }
  
    function applyTheme(theme) {
      const root = document.documentElement;
      const target = theme === 'white' ? 'white' : 'dark';
      root.setAttribute('data-theme', target);
      if (document.body) document.body.setAttribute('data-theme', target);
      
      const swapTargets = document.querySelectorAll('[data-src-dark][data-src-white]');
      swapTargets.forEach(img => {
        const nextSrc = target === 'white' ? img.getAttribute('data-src-white') : img.getAttribute('data-src-dark');
        if (nextSrc && img.getAttribute('src') !== nextSrc) {
            img.setAttribute('src', nextSrc);
        }
      });
    }
  
    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'white' ? 'dark' : 'white';
      applyTheme(next);
      setStoredTheme(next);
      
      if (navigator.vibrate) navigator.vibrate(15);
    }
  
    // --- Physics ---
    function updatePhysics() {
        if (!els.path) return;
  
        if (!state.isDragging) {
          const dy = state.handleY - (CONFIG.anchorY + CONFIG.restLength);
          const fy = -CONFIG.springK * dy;
          state.velocityY += fy / CONFIG.mass;
          state.velocityY *= CONFIG.damping;
          state.handleY += state.velocityY;
  
          const dx = state.handleX - CONFIG.anchorX;
          const fx = -CONFIG.springK * dx;
          state.velocityX += fx / CONFIG.mass;
          state.velocityX *= CONFIG.damping;
          state.handleX += state.velocityX;
        }
        
        if (Math.abs(state.velocityY) < 0.01) state.velocityY = 0;
        if (Math.abs(state.velocityX) < 0.01) state.velocityX = 0;
  
        render();
        requestAnimationFrame(updatePhysics);
    }
  
    function render() {
        const { handleX, handleY } = state;
        const { anchorX, anchorY } = CONFIG;
        
        // Handle Size = 48px (CSS) -> Radius 24px
        els.handle.style.left = `${handleX - 24}px`;
        els.handle.style.top = `${handleY}px`;
        
        const dist = Math.sqrt(Math.pow(handleX - anchorX, 2) + Math.pow(handleY - anchorY, 2));
        const isCompressed = dist < CONFIG.restLength - 5; 
        
        let d = "";
        if (isCompressed && !state.isDragging) {
          const bulge = (CONFIG.restLength - dist) * 1.5;
          const side = state.velocityX > 0 ? -1 : 1;
          const midX = (anchorX + handleX) / 2 + (bulge * side);
          const midY = (anchorY + handleY) / 2;
          d = `M${anchorX},${anchorY} Q${midX},${midY} ${handleX},${handleY}`;
        } else {
          d = `M${anchorX},${anchorY} L${handleX},${handleY}`;
        }
        els.path.setAttribute('d', d);
    }
  
    // --- Events ---
    const onStart = (e) => {
        e.preventDefault(); 
        state.isDragging = true;
        state.velocityY = 0;
        state.velocityX = 0;
    };
      
    const onMove = (e) => {
        if (!state.isDragging) return;
        
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        
        const rect = els.container.getBoundingClientRect();
        
        const rawX = clientX - rect.left;
        const rawY = clientY - rect.top;
        
        // Updated scale to 0.20 for mapping logic
        const scale = 0.20;
        const localX = rawX / scale;
        const localY = rawY / scale;
        
        state.handleY = Math.max(CONFIG.anchorY + 10, localY);
        state.handleX = localX; 
    };
      
    const onEnd = () => {
        if (!state.isDragging) return;
        state.isDragging = false;
        const dist = state.handleY - (CONFIG.anchorY + CONFIG.restLength);
        
        if (dist > CONFIG.toggleThreshold) {
          toggleTheme();
        }
    };
  
    // --- Init ---
    document.addEventListener('DOMContentLoaded', () => {
        els.container = document.getElementById('lightbulb-system');
        if (!els.container) return;
        
        els.path = document.getElementById('lb-cordPath');
        els.handle = document.getElementById('lb-handle');
        
        if (!els.handle || !els.path) return;
  
        els.handle.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);
        els.handle.addEventListener('touchstart', onStart, {passive: false});
        window.addEventListener('touchmove', onMove, {passive: false});
        window.addEventListener('touchend', onEnd);
        
        requestAnimationFrame(updatePhysics);
    });
  })();
