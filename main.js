/**
 * NOCTIS — Main Controller
 * Pure Vanilla JavaScript Scrollytelling Engine
 */

(function () {
  'use strict';

  // State
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  const isMobile = () => window.innerWidth < 768;

  // DOM Elements
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloader-bar');
  const preloaderCounter = document.getElementById('preloader-counter');

  const mainNav = document.getElementById('main-nav');
  const grainCanvas = document.getElementById('grain-canvas');
  const customCursor = document.getElementById('custom-cursor');
  const cursorLabel = document.getElementById('cursor-label');

  // Hero Section Elements
  const heroSection = document.getElementById('hero-section');
  const heroStage = document.getElementById('hero-stage');
  const heroCanvas = document.getElementById('hero-canvas');
  const heroCtx = heroCanvas.getContext('2d');
  const heroProgressFill = document.getElementById('hero-progress-fill');
  const hudChapter = document.getElementById('hud-chapter');
  const hudSpeed = document.getElementById('hud-speed');
  const hudDistance = document.getElementById('hud-distance');
  const heroChapters = Array.from(document.querySelectorAll('.hero-chapter'));

  // Statement Section Elements
  const statementSection = document.getElementById('statement-section');
  const statementQuote = document.getElementById('statement-quote');

  // Dismantle Section Elements
  const dismantleSection = document.getElementById('dismantle-section');
  const dismantleStage = document.getElementById('dismantle-stage');
  const dismantleCanvas = document.getElementById('dismantle-canvas');
  const dismantleCtx = dismantleCanvas.getContext('2d');
  const dismantleProgressFill = document.getElementById('dismantle-progress-fill');
  const dismantleCallouts = document.getElementById('dismantle-callouts');

  // Lineup Section Elements
  const lineupSection = document.getElementById('lineup-section');
  const lineupAccordion = document.getElementById('lineup-accordion');

  // Reserve Button
  const reserveCta = document.getElementById('reserve-cta');

  // Image Frame Caches
  const heroImages = new Map();
  const dismantleImages = new Map();

  let heroCurrentFrame = 1;
  let heroTargetFrame = 1;
  let dismantleCurrentFrame = 1;
  let dismantleTargetFrame = 1;

  let lastScrollY = window.scrollY;

  // Set initial section heights from config
  heroSection.style.height = CONFIG.hero.wrapperHeight;
  dismantleSection.style.height = CONFIG.dismantle.wrapperHeight;

  /* --------------------------------------------------------------------------
     1. Noise Film-Grain Effect
     -------------------------------------------------------------------------- */
  function initFilmGrain() {
    if (!grainCanvas) return;
    const gCtx = grainCanvas.getContext('2d');
    const tileSize = 128;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = tileSize;
    offCanvas.height = tileSize;
    const offCtx = offCanvas.getContext('2d');

    const imgData = offCtx.createImageData(tileSize, tileSize);
    const buf = new Uint32Array(imgData.data.buffer);
    for (let i = 0; i < buf.length; i++) {
      const v = (Math.random() * 255) | 0;
      buf[i] = (255 << 24) | (v << 16) | (v << 8) | v;
    }
    offCtx.putImageData(imgData, 0, 0);

    function resizeGrain() {
      grainCanvas.width = window.innerWidth;
      grainCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeGrain);
    resizeGrain();

    let pattern = gCtx.createPattern(offCanvas, 'repeat');

    // Shift randomly approx 8 times per second (~125ms)
    setInterval(() => {
      if (document.hidden) return;
      gCtx.clearRect(0, 0, grainCanvas.width, grainCanvas.height);
      const offsetX = Math.floor(Math.random() * tileSize);
      const offsetY = Math.floor(Math.random() * tileSize);
      gCtx.save();
      gCtx.translate(offsetX, offsetY);
      gCtx.fillStyle = pattern;
      gCtx.fillRect(-tileSize, -tileSize, grainCanvas.width + tileSize, grainCanvas.height + tileSize);
      gCtx.restore();
    }, 125);
  }

  /* --------------------------------------------------------------------------
     2. Custom Cursor ("The Headlight")
     -------------------------------------------------------------------------- */
  let mouseX = -100;
  let mouseY = -100;
  let cursorX = -100;
  let cursorY = -100;

  function initCursor() {
    if (!isFinePointer || isReducedMotion || !customCursor) return;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    window.addEventListener('mousedown', () => {
      customCursor.classList.add('is-down');
      setTimeout(() => {
        customCursor.classList.remove('is-down');
      }, 120);
    });

    // Delegate hover states
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('a, button, [role="button"], .lineup-slide, [data-cursor]');
      if (!target) {
        customCursor.classList.remove('is-hovering');
        return;
      }

      customCursor.classList.add('is-hovering');

      // Custom label handling
      if (target.classList.contains('lineup-slide')) {
        const isExpanded = target.getAttribute('aria-expanded') === 'true';
        cursorLabel.textContent = isExpanded ? 'CONFIGURE' : 'OPEN';
      } else if (target.getAttribute('data-cursor')) {
        cursorLabel.textContent = target.getAttribute('data-cursor');
      } else if (target.tagName === 'A' || target.tagName === 'BUTTON') {
        cursorLabel.textContent = 'VIEW';
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('a, button, [role="button"], .lineup-slide, [data-cursor]');
      if (target && !e.relatedTarget?.closest('a, button, [role="button"], .lineup-slide, [data-cursor]')) {
        customCursor.classList.remove('is-hovering');
      }
    });

    function renderCursor() {
      // Lerp 0.18
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;
      customCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);
  }

  /* --------------------------------------------------------------------------
     3. Preloader & Progressive Frame Loading
     -------------------------------------------------------------------------- */
  function getFramePath(type, num) {
    const pad = String(num).padStart(4, '0');
    const cfg = CONFIG[type];
    const basePath = isMobile() ? cfg.mobilePath : cfg.desktopPath;
    return `${basePath}${pad}${cfg.extension}`;
  }

  function loadSingleFrame(type, num) {
    return new Promise((resolve) => {
      const cache = type === 'hero' ? heroImages : dismantleImages;
      if (cache.has(num)) {
        return resolve(cache.get(num));
      }
      const img = new Image();
      let resolved = false;

      const finish = () => {
        if (resolved) return;
        resolved = true;
        cache.set(num, img);
        resolve(img);
      };

      const fail = () => {
        if (resolved) return;
        resolved = true;
        resolve(null);
      };

      // Safety timeout in case of offline/local file stalling
      const timer = setTimeout(fail, 2500);

      img.onload = () => {
        clearTimeout(timer);
        if (typeof img.decode === 'function') {
          img.decode().catch(() => {}).finally(finish);
        } else {
          finish();
        }
      };
      img.onerror = () => {
        clearTimeout(timer);
        fail();
      };
      img.src = getFramePath(type, num);
    });
  }

  async function startPreloader() {
    const criticalHeroCount = Math.min(40, CONFIG.hero.frameCount);
    let loadedCount = 0;

    const criticalPromises = [];
    for (let i = 1; i <= criticalHeroCount; i++) {
      const p = loadSingleFrame('hero', i).then((img) => {
        loadedCount++;
        const pct = Math.round((loadedCount / criticalHeroCount) * 100);
        preloaderBar.style.width = `${pct}%`;
        preloaderCounter.textContent = String(pct).padStart(3, '0');
        return img;
      });
      criticalPromises.push(p);
    }

    // Await all critical frames or fallback after max 3.5s
    await Promise.race([
      Promise.all(criticalPromises),
      new Promise((r) => setTimeout(r, 3500))
    ]);

    // Force 100% on completion
    preloaderBar.style.width = '100%';
    preloaderCounter.textContent = '100';

    // Initial render of first hero frame
    drawFrame('hero', heroCanvas, heroCtx, 1);

    // Flash exit effect
    preloaderBar.classList.add('glow-exit');
    setTimeout(() => {
      preloader.classList.add('is-hidden');
      document.body.classList.remove('overflow-locked');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 700);
      // Trigger entrance reveals
      triggerLineReveals(heroChapters[0]);
    }, 200);

    // Continue loading rest of hero in background
    loadBackgroundSequence('hero', criticalHeroCount + 1, CONFIG.hero.frameCount);
    // Then load dismantle
    loadBackgroundSequence('dismantle', 1, CONFIG.dismantle.frameCount);
  }

  async function loadBackgroundSequence(type, start, end) {
    for (let i = start; i <= end; i++) {
      if (document.hidden) {
        await new Promise((r) => setTimeout(r, 80));
      }
      await loadSingleFrame(type, i);
    }
  }

  /* --------------------------------------------------------------------------
     4. Canvas Drawing Engine (Cover / Contain & DPR Scaling)
     -------------------------------------------------------------------------- */
  function drawFrame(type, canvas, ctx, requestedFrame) {
    const cache = type === 'hero' ? heroImages : dismantleImages;
    let img = cache.get(requestedFrame);

    // If frame is not yet loaded, find nearest loaded frame
    if (!img) {
      let nearestDist = Infinity;
      let nearestFrame = null;
      for (const [fNum, fImg] of cache.entries()) {
        const dist = Math.abs(fNum - requestedFrame);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestFrame = fImg;
        }
      }
      img = nearestFrame;
    }

    if (!img) return;

    const stage = canvas.parentElement;
    const stageW = stage.clientWidth;
    const stageH = stage.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const targetW = Math.round(stageW * dpr);
    const targetH = Math.round(stageH * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#07080A';
    ctx.fillRect(0, 0, targetW, targetH);

    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;
    const isPortrait = stageH > stageW;

    let drawW, drawH, drawX, drawY;

    if (isPortrait) {
      // Contain fit: vertically centred, car never cropped, text above & below
      const scale = Math.min(targetW / imgW, targetH / imgH);
      drawW = imgW * scale;
      drawH = imgH * scale;
      drawX = (targetW - drawW) / 2;
      drawY = (targetH - drawH) / 2;
    } else {
      // Cover fit: landscape full bleed
      const scale = Math.max(targetW / imgW, targetH / imgH);
      drawW = imgW * scale;
      drawH = imgH * scale;
      drawX = (targetW - drawW) / 2;
      drawY = (targetH - drawH) / 2;
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Fade to solid black over the last 5% of hero scroll
    if (type === 'hero' && heroTargetProgress >= CONFIG.hero.fadeToBlackStart) {
      const alpha = Math.min(Math.max((heroTargetProgress - CONFIG.hero.fadeToBlackStart) / (1 - CONFIG.hero.fadeToBlackStart), 0), 1);
      ctx.fillStyle = '#07080A';
      ctx.globalAlpha = alpha;
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  }

  /* --------------------------------------------------------------------------
     5. Scroll Scrubbing & Scrollytelling rAF Loop
     -------------------------------------------------------------------------- */
  let heroTargetProgress = 0;
  let dismantleTargetProgress = 0;
  let prevDrawnHeroFrame = -1;
  let prevDrawnDismantleFrame = -1;

  function updateScrollytelling() {
    const vh = window.innerHeight;

    // Hero Section Calculations
    const heroRect = heroSection.getBoundingClientRect();
    const heroScrollDist = heroSection.offsetHeight - vh;
    if (heroScrollDist > 0) {
      heroTargetProgress = Math.min(Math.max(-heroRect.top / heroScrollDist, 0), 1);
    } else {
      heroTargetProgress = 0;
    }
    heroTargetFrame = Math.round(heroTargetProgress * (CONFIG.hero.frameCount - 1)) + 1;

    // Dismantle Section Calculations
    const disRect = dismantleSection.getBoundingClientRect();
    const disScrollDist = dismantleSection.offsetHeight - vh;
    if (disScrollDist > 0) {
      dismantleTargetProgress = Math.min(Math.max(-disRect.top / disScrollDist, 0), 1);
    } else {
      dismantleTargetProgress = 0;
    }
    dismantleTargetFrame = Math.round(dismantleTargetProgress * (CONFIG.dismantle.frameCount - 1)) + 1;

    // Update Progress Bars
    if (heroProgressFill) {
      heroProgressFill.style.width = `${(heroTargetProgress * 100).toFixed(2)}%`;
    }
    if (dismantleProgressFill) {
      dismantleProgressFill.style.width = `${(dismantleTargetProgress * 100).toFixed(2)}%`;
    }

    // Update Hero HUD Telemetry
    if (hudSpeed) {
      const spd = Math.round(heroTargetProgress * CONFIG.hero.hud.maxSpeed);
      hudSpeed.textContent = `${String(spd).padStart(3, '0')} KM/H`;
    }
    if (hudDistance) {
      const dist = (heroTargetProgress * CONFIG.hero.hud.maxDistance).toFixed(1);
      hudDistance.textContent = `${dist} KM`;
    }

    // Update Hero Chapters
    updateHeroChapters(heroTargetProgress);

    // Update Statement Word-by-Word Reveal
    updateStatement(vh);

    // Update Dismantle Callouts
    updateDismantleCallouts(dismantleTargetProgress);

    // Nav Hide on Scroll Down / Show on Scroll Up
    const currentScrollY = window.scrollY;
    if (currentScrollY > 100 && currentScrollY > lastScrollY + 4) {
      mainNav.classList.add('nav-hidden');
    } else if (currentScrollY < lastScrollY - 4) {
      mainNav.classList.remove('nav-hidden');
    }
    lastScrollY = currentScrollY;
  }

  function renderScrollyFrames() {
    // Lerp 0.15 for smooth mechanical momentum
    heroCurrentFrame += (heroTargetFrame - heroCurrentFrame) * 0.15;
    const roundedHero = Math.round(heroCurrentFrame);

    if (roundedHero !== prevDrawnHeroFrame) {
      drawFrame('hero', heroCanvas, heroCtx, roundedHero);
      prevDrawnHeroFrame = roundedHero;
    }

    dismantleCurrentFrame += (dismantleTargetFrame - dismantleCurrentFrame) * 0.15;
    const roundedDismantle = Math.round(dismantleCurrentFrame);

    if (roundedDismantle !== prevDrawnDismantleFrame) {
      drawFrame('dismantle', dismantleCanvas, dismantleCtx, roundedDismantle);
      prevDrawnDismantleFrame = roundedDismantle;
    }

    requestAnimationFrame(renderScrollyFrames);
  }

  window.addEventListener('scroll', updateScrollytelling, { passive: true });
  window.addEventListener('resize', () => {
    prevDrawnHeroFrame = -1;
    prevDrawnDismantleFrame = -1;
    updateScrollytelling();
  });

  /* --------------------------------------------------------------------------
     6. Hero Text Chapters Logic
     -------------------------------------------------------------------------- */
  function updateHeroChapters(prog) {
    CONFIG.hero.chapters.forEach((chap, idx) => {
      const el = document.getElementById(chap.id);
      if (!el) return;
      const [start, end] = chap.range;
      const inRange = prog >= start && prog <= end;

      if (inRange) {
        if (!el.classList.contains('is-active')) {
          el.classList.add('is-active');
          triggerLineReveals(el);
          if (hudChapter) hudChapter.textContent = chap.chapterNum;
        }
      } else {
        if (el.classList.contains('is-active')) {
          el.classList.remove('is-active');
          hideLineReveals(el);
        }
      }
    });
  }

  function triggerLineReveals(container) {
    if (!container) return;
    const lines = container.querySelectorAll('.mask-line-inner');
    lines.forEach((line, i) => {
      setTimeout(() => {
        line.style.transform = 'translateY(0%)';
        line.style.opacity = '1';
      }, i * 80);
    });
  }

  function hideLineReveals(container) {
    if (!container) return;
    const lines = container.querySelectorAll('.mask-line-inner');
    lines.forEach((line) => {
      line.style.transform = 'translateY(100%)';
      line.style.opacity = '0';
    });
  }

  /* --------------------------------------------------------------------------
     7. Section 2 — Statement Word-by-Word Scroll Opacity
     -------------------------------------------------------------------------- */
  let statementWords = [];

  function initStatement() {
    const text = CONFIG.statement.sentence;
    const words = text.split(' ');
    statementQuote.innerHTML = words
      .map((w) => `<span class="statement-word">${w}</span>`)
      .join(' ');
    statementWords = Array.from(statementQuote.querySelectorAll('.statement-word'));
  }

  function updateStatement(vh) {
    const rect = statementSection.getBoundingClientRect();
    // Progress through viewport: 0 when entering bottom, 1 when leaving top
    const startY = vh;
    const endY = -rect.height;
    const prog = Math.min(Math.max((startY - rect.top) / (startY - endY), 0), 1);

    const totalWords = statementWords.length;
    statementWords.forEach((wordEl, idx) => {
      const wordThreshold = (idx + 0.5) / totalWords;
      if (prog >= wordThreshold * 0.8 + 0.1) {
        wordEl.classList.add('is-lit');
      } else {
        wordEl.classList.remove('is-lit');
      }
    });
  }

  /* --------------------------------------------------------------------------
     8. Section 3 — Dismantle Callouts
     -------------------------------------------------------------------------- */
  function initDismantleCallouts() {
    dismantleCallouts.innerHTML = '';
    CONFIG.dismantle.callouts.forEach((co) => {
      const el = document.createElement('div');
      el.className = 'dismantle-callout';
      el.id = co.id;
      el.style.left = `${co.x}%`;
      el.style.top = `${co.y}%`;

      // Hairline calculation
      const dx = co.labelX - co.x;
      const dy = co.labelY - co.y;
      const dist = Math.hypot(dx, dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      el.innerHTML = `
        <div class="callout-dot"></div>
        <div class="callout-line" style="width: ${Math.round(dist * 5)}px; transform: rotate(${angle.toFixed(1)}deg);"></div>
        <div class="callout-text-box" style="left: ${Math.round(dx * 5)}px; top: ${Math.round(dy * 5)}px;">
          <div class="callout-code font-hud">${co.code}</div>
          <div class="callout-name font-body">${co.name}</div>
        </div>
      `;
      dismantleCallouts.appendChild(el);
    });
  }

  function updateDismantleCallouts(prog) {
    CONFIG.dismantle.callouts.forEach((co) => {
      const el = document.getElementById(co.id);
      if (!el) return;
      if (prog >= co.triggerProgress) {
        el.classList.add('is-active');
      } else {
        el.classList.remove('is-active');
      }
    });
  }

  /* --------------------------------------------------------------------------
     9. Section 4 — Lineup Hover Accordion
     -------------------------------------------------------------------------- */
  let activeSlideIndex = CONFIG.lineup.defaultOpenIndex;
  let hoverTimeout = null;

  function initLineup() {
    lineupAccordion.innerHTML = '';
    const cars = CONFIG.lineup.cars;

    cars.forEach((car, idx) => {
      const isDefault = idx === activeSlideIndex;
      const slide = document.createElement('button');
      slide.className = 'lineup-slide';
      slide.id = `slide-${car.id}`;
      slide.setAttribute('role', 'tab');
      slide.setAttribute('aria-expanded', isDefault ? 'true' : 'false');
      slide.setAttribute('aria-controls', `panel-${car.id}`);
      slide.setAttribute('data-index', idx);

      slide.innerHTML = `
        <!-- Closed Slide Preview -->
        <div class="slide-closed-content">
          <span class="slide-closed-number font-hud">${car.index}</span>
          <span class="slide-closed-title-rot font-hud">${car.name}</span>
        </div>
        <img class="slide-closed-img-crop" src="${car.image}" alt="" aria-hidden="true" loading="lazy">

        <!-- Open Slide Detail -->
        <div class="slide-open-content" id="panel-${car.id}">
          <header class="slide-open-header">
            <h3 class="slide-open-title font-display">${car.name}</h3>
            <p class="slide-open-tagline font-body">${car.tagline}</p>
          </header>

          <div class="slide-open-img-wrapper">
            <img class="slide-open-car-img" src="${car.image}" alt="${car.alt}" loading="lazy">
          </div>

          <div class="slide-open-footer">
            <p class="font-body" style="font-size: 14px; color: var(--fog);">${car.description}</p>
            
            <div class="slide-specs-row">
              ${car.specs
                .map(
                  (s) => `
                <div class="spec-item">
                  <span class="spec-label">${s.label}</span>
                  <span class="spec-val">${s.value}</span>
                </div>
              `
                )
                .join('')}
            </div>

            <div class="slide-swatches-row" aria-label="Available Colours">
              ${car.swatches
                .map(
                  (sw, sIdx) => `
                <div class="color-swatch ${sw.active ? 'active' : ''}" 
                     style="background-color: ${sw.color};" 
                     title="${sw.name}"
                     data-swatch-index="${sIdx}"></div>
              `
                )
                .join('')}
            </div>

            <a href="#reserve-section" class="slide-config-link" data-cursor="CONFIGURE">
              <span>Configure ${car.name}</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      `;

      // Desktop Hover Accordion (80ms debounce)
      slide.addEventListener('mouseenter', () => {
        if (isMobile()) return;
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          setActiveSlide(idx);
        }, 80);
      });

      // Click / Tap Activation
      slide.addEventListener('click', () => {
        setActiveSlide(idx);
      });

      // Keyboard Navigation (ArrowLeft / ArrowRight)
      slide.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const next = (idx + 1) % cars.length;
          setActiveSlide(next);
          document.querySelector(`[data-index="${next}"]`)?.focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = (idx - 1 + cars.length) % cars.length;
          setActiveSlide(prev);
          document.querySelector(`[data-index="${prev}"]`)?.focus();
        }
      });

      lineupAccordion.appendChild(slide);
    });

    // Swatch Interaction
    lineupAccordion.addEventListener('click', (e) => {
      const swatch = e.target.closest('.color-swatch');
      if (!swatch) return;
      e.stopPropagation();
      const parentRow = swatch.parentElement;
      parentRow.querySelectorAll('.color-swatch').forEach((s) => s.classList.remove('active'));
      swatch.classList.add('active');
    });

    // Reveal slides when lineup section scrolls into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            lineupAccordion.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(lineupSection);
  }

  function setActiveSlide(newIndex) {
    if (activeSlideIndex === newIndex) return;
    activeSlideIndex = newIndex;
    const slides = lineupAccordion.querySelectorAll('.lineup-slide');

    slides.forEach((s, idx) => {
      const isExpanded = idx === newIndex;
      s.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    });

    // Update cursor label if mouse is currently over this slide
    if (customCursor && customCursor.classList.contains('is-hovering')) {
      cursorLabel.textContent = 'CONFIGURE';
    }
  }

  /* --------------------------------------------------------------------------
     10. Section 5 — Reserve Action
     -------------------------------------------------------------------------- */
  function initReserve() {
    if (!reserveCta) return;
    reserveCta.addEventListener('click', (e) => {
      e.preventDefault();
      const originalText = reserveCta.querySelector('span:last-child').textContent;
      reserveCta.querySelector('span:last-child').textContent = 'ALLOCATION CONFIRMED — ATELIER 01';
      reserveCta.style.borderColor = 'var(--bone)';
      setTimeout(() => {
        reserveCta.querySelector('span:last-child').textContent = originalText;
        reserveCta.style.borderColor = 'var(--xenon)';
      }, 3500);
    });
  }

  /* --------------------------------------------------------------------------
     11. Initialize Everything
     -------------------------------------------------------------------------- */
  function init() {
    initFilmGrain();
    initCursor();
    initStatement();
    initDismantleCallouts();
    initLineup();
    initReserve();

    startPreloader();
    renderScrollyFrames();
    updateScrollytelling();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
