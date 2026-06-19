/* =============================================
   WEDDING INVITATION — script.js
   Sai Teja & Bhagya Sri | Harry Potter Theme
   ============================================= */

(function () {
  'use strict';

  /* -------------------------------------------
     DOM REFERENCES
  ------------------------------------------- */
  const splashPage = document.getElementById('splash-page');
  const invitePage = document.getElementById('invite-page');
  const openBtn = document.getElementById('open-invite-btn');
  const audioBtn = document.getElementById('audio-btn');
  const starsCanvas = document.getElementById('stars-canvas');
  const bgAudio = document.getElementById('hedwigs-theme');

  /* -------------------------------------------
     OPEN INVITE BUTTON — Transition
  ------------------------------------------- */
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      // 1. Start Hedwig's Theme (user gesture unlocks audio)
      if (bgAudio) {
        bgAudio.volume = 0.45;
        bgAudio.play().catch(() => { });
        audioBtn.classList.add('show');
        audioBtn.textContent = '🔊';
      }

      // 2. Fade out splash
      splashPage.classList.add('hidden');

      // 3. Show stars canvas & invite
      starsCanvas.classList.add('visible');
      setTimeout(() => {
        invitePage.classList.add('visible');
        initStars();
        initScrollReveal();
        initCountdown();
        initMagicRain();
      }, 400);
    });
  }

  /* -------------------------------------------
     AUDIO TOGGLE
  ------------------------------------------- */
  let muted = false;
  if (audioBtn && bgAudio) {
    audioBtn.addEventListener('click', () => {
      muted = !muted;
      bgAudio.muted = muted;
      audioBtn.textContent = muted ? '🔇' : '🔊';
    });
  }

  /* -------------------------------------------
     PORTRAIT ALTER EGO FLIP CARDS
  ------------------------------------------- */
  document.querySelectorAll('.portrait-flip-container').forEach(container => {
    container.addEventListener('click', () => {
      container.classList.toggle('flipped');
    });
  });

  /* -------------------------------------------
     STAR PARTICLE SYSTEM
  ------------------------------------------- */
  function initStars() {
    const canvas = starsCanvas;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const STAR_COUNT = 160;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      alpha: Math.random(),
      dAlpha: (Math.random() * 0.006 + 0.002) * (Math.random() < 0.5 ? 1 : -1),
      speed: Math.random() * 0.08 + 0.02,
    }));

    // A few golden sparkles
    const sparkles = Array.from({ length: 18 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 1,
      alpha: Math.random(),
      dAlpha: (Math.random() * 0.012 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // White stars
      stars.forEach(s => {
        s.alpha += s.dAlpha;
        if (s.alpha <= 0 || s.alpha >= 1) s.dAlpha *= -1;
        s.alpha = Math.max(0, Math.min(1, s.alpha));

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,248,230,${s.alpha})`;
        ctx.fill();
      });

      // Gold sparkles
      sparkles.forEach(s => {
        s.alpha += s.dAlpha;
        if (s.alpha <= 0 || s.alpha >= 1) s.dAlpha *= -1;
        s.alpha = Math.max(0, Math.min(1, s.alpha));

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,208,107,${s.alpha * 0.7})`;
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }
    draw();
  }

  /* -------------------------------------------
     SCROLL REVEAL — Intersection Observer
  ------------------------------------------- */
  function initScrollReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    els.forEach(el => observer.observe(el));
  }

  /* -------------------------------------------
     FLOATING SPARKLES on Mouse Move (HP page)
  ------------------------------------------- */
  let sparkleTimeout;
  document.addEventListener('mousemove', (e) => {
    if (!invitePage.classList.contains('visible')) return;
    clearTimeout(sparkleTimeout);
    sparkleTimeout = setTimeout(() => {
      createSparkle(e.clientX, e.clientY);
    }, 60);
  });

  function createSparkle(x, y) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed;
      left:${x}px;
      top:${y}px;
      width:6px;height:6px;
      border-radius:50%;
      background:radial-gradient(circle, #f5d06b, #c9a84c);
      pointer-events:none;
      z-index:9999;
      transform:translate(-50%,-50%);
      animation:sparkleAnim 0.7s ease forwards;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700);
  }

  // Inject sparkle keyframes once
  const style = document.createElement('style');
  style.textContent = `
    @keyframes sparkleAnim {
      0%   { opacity:1; transform:translate(-50%,-50%) scale(1); }
      100% { opacity:0; transform:translate(-50%,-120%) scale(0.2); }
    }
  `;
  document.head.appendChild(style);

  function initCountdown() {
    // August is Month Index 7 in Javascript (0-indexed: 0=Jan, 7=Aug)
    const targetDate = new Date(2026, 7, 26, 23, 44, 0).getTime();
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");
    const countdownContainer = document.getElementById("wedding-countdown");
    const expiredMsg = document.getElementById("countdown-expired");
    const titleEl = document.getElementById("countdown-title");
    const subtitleEl = document.getElementById("countdown-subtitle");

    if (!daysEl) return;

    function update() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      let distanceToUse = distance;
      let isPast = false;

      if (distance < 0) {
        distanceToUse = Math.abs(distance);
        isPast = true;
      }

      if (isPast) {
        if (expiredMsg) expiredMsg.classList.remove('hidden');
        if (titleEl && titleEl.textContent !== "The Magical Spell of Forever Has Been Cast!") {
          titleEl.textContent = "The Magical Spell of Forever Has Been Cast!";
        }
        if (subtitleEl && subtitleEl.textContent !== "Time since the magical union began:") {
          subtitleEl.textContent = "Time since the magical union began:";
        }
      } else {
        if (expiredMsg) expiredMsg.classList.add('hidden');
        if (titleEl && titleEl.textContent !== "Time Until the Sacred Spell of Forever is Cast") {
          titleEl.textContent = "Time Until the Sacred Spell of Forever is Cast";
        }
        if (subtitleEl && subtitleEl.textContent !== 'Time is flowing faster than a Golden Snitch...') {
          subtitleEl.textContent = 'Time is flowing faster than a Golden Snitch...';
        }
      }

      const days = Math.floor(distanceToUse / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distanceToUse % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distanceToUse % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distanceToUse % (1000 * 60)) / 1000);

      daysEl.textContent = String(days).padStart(2, '0');
      hoursEl.textContent = String(hours).padStart(2, '0');
      minutesEl.textContent = String(minutes).padStart(2, '0');
      secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  /* -------------------------------------------
     MAGIC RAIN — Falling Petals, Stars & Owls
  ------------------------------------------- */
  function initMagicRain() {
    const canvas = document.getElementById('magic-rain-canvas');
    if (!canvas) return;
    canvas.classList.add('visible');
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    /* ---- Particle factory ---- */
    const PETAL_COLORS  = ['#ffd6e7', '#ffb3cc', '#ffe4f0', '#fff0f5', '#f5d06b', '#ffeaa7'];
    const STAR_COLORS   = ['#f5d06b', '#ffe066', '#fff8dc', '#ffd700', '#c9a84c'];

    function makeParticle(initialY) {
      const roll = Math.random();
      const type = roll < 0.45 ? 'petal' : roll < 0.80 ? 'star' : 'sparkle';
      return {
        type,
        x:         Math.random() * canvas.width,
        y:         initialY !== undefined ? initialY : -20 - Math.random() * 40,
        size:      type === 'star' ? Math.random() * 7 + 3 : Math.random() * 9 + 5,
        speed:     Math.random() * 0.9 + 0.35,
        drift:     (Math.random() - 0.5) * 0.55,
        sway:      Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.018 + 0.007,
        rot:       Math.random() * Math.PI * 2,
        rotSpeed:  (Math.random() - 0.5) * 0.04,
        twinkle:   Math.random() * Math.PI * 2,
        twkSpeed:  Math.random() * 0.07 + 0.03,
        opacity:   0,
        color: type === 'petal'
          ? PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)]
          : STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      };
    }

    /* Pre-seed particles spread across full height so page isn't empty on load */
    const TOTAL = 38;
    const particles = Array.from({ length: TOTAL }, () => {
      const p = makeParticle(Math.random() * canvas.height);
      p.opacity = Math.random() * 0.55 + 0.05;
      return p;
    });

    /* ---- Draw helpers ---- */
    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      // Teardrop petal using bezier
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo( p.size * 0.7, -p.size * 0.4,  p.size * 0.6, p.size * 0.5, 0,  p.size * 0.7);
      ctx.bezierCurveTo(-p.size * 0.6,  p.size * 0.5, -p.size * 0.7, -p.size * 0.4, 0, -p.size);
      ctx.fill();
      ctx.restore();
    }

    function drawStar(p) {
      const pts = 5;
      const twinkledOpacity = p.opacity * (0.5 + 0.5 * Math.abs(Math.sin(p.twinkle)));
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = twinkledOpacity;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = p.size * 2.5;
      ctx.beginPath();
      for (let i = 0; i < pts * 2; i++) {
        const angle = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? p.size : p.size * 0.42;
        i === 0
          ? ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r)
          : ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawSparkle(p) {
      const blink = p.opacity * Math.abs(Math.sin(p.twinkle));
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = blink;
      ctx.strokeStyle = p.color;
      ctx.lineWidth   = 1.2;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = 6;
      const s = p.size * 0.9;
      [0, 45, 90, 135].forEach(deg => {
        const r = deg * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(Math.cos(r) * -s, Math.sin(r) * -s);
        ctx.lineTo(Math.cos(r) *  s, Math.sin(r) *  s);
        ctx.stroke();
      });
      ctx.restore();
    }

    /* ---- Witch creatures on broomsticks flying across the top ---- */
    const witches = [
      { x: -90, y: 55, speed: 1.1, bobT: 0 },   // flies left → right
      { x: canvas.width + 90, y: 90, speed: -0.9, bobT: Math.PI }, // flies right → left
    ];
    let witchesStarted = false;
    setTimeout(() => { witchesStarted = true; }, 500);

    function drawWitch(w) {
      ctx.save();
      ctx.translate(w.x, w.y);

      // Mirror the left-flying witch so she always faces her direction of travel
      const facingLeft = w.speed < 0;
      if (facingLeft) ctx.scale(-1, 1);

      ctx.globalAlpha = 0.82;

      /* === BROOMSTICK === */
      // Handle — long diagonal wooden pole
      ctx.strokeStyle = '#8B5E1A';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(45, 12);   // front tip
      ctx.lineTo(-48, 5);   // back end
      ctx.stroke();

      // Bristles fanned at the back
      ctx.lineWidth = 1.8;
      const bristleColors = ['#c9a84c', '#e8c46a', '#b8943c', '#f0d070', '#a07830'];
      for (let b = 0; b < 9; b++) {
        ctx.strokeStyle = bristleColors[b % bristleColors.length];
        const bx = -46 + b * 1.5;
        const spread = (b - 4) * 3;
        ctx.beginPath();
        ctx.moveTo(bx, 6);
        ctx.lineTo(bx - 10, 22 + spread);
        ctx.stroke();
      }

      /* === WITCH BODY / ROBE === */
      // Flowing dark robe
      ctx.fillStyle = '#160d2e';
      ctx.beginPath();
      ctx.moveTo(-10, -8);
      ctx.bezierCurveTo(-14, 10, -20, 20, -14, 28);
      ctx.lineTo(14, 28);
      ctx.bezierCurveTo(18, 20, 12, 10, 8, -8);
      ctx.closePath();
      ctx.fill();

      // Robe hem accent (gold trim)
      ctx.strokeStyle = '#c9a84c';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-14, 28);
      ctx.lineTo(14, 28);
      ctx.stroke();

      /* === HEAD === */
      // Skin
      ctx.fillStyle = '#f0c8a0';
      ctx.beginPath();
      ctx.arc(0, -16, 9, 0, Math.PI * 2);
      ctx.fill();

      // Hair peeking under hat
      ctx.fillStyle = '#3a1a05';
      ctx.beginPath();
      ctx.arc(0, -9, 9, 0, Math.PI);
      ctx.fill();

      // Face detail — tiny smile
      ctx.strokeStyle = '#b07840';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, -14, 4, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#1a0a2e';
      ctx.beginPath();
      ctx.arc(-3.5, -17, 1.5, 0, Math.PI * 2);
      ctx.arc( 3.5, -17, 1.5, 0, Math.PI * 2);
      ctx.fill();

      /* === POINTY WITCH HAT === */
      // Brim
      ctx.fillStyle = '#0e0720';
      ctx.beginPath();
      ctx.ellipse(0, -24, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Cone
      ctx.beginPath();
      ctx.moveTo(-11, -24);
      ctx.lineTo(3, -52);
      ctx.lineTo(13, -24);
      ctx.closePath();
      ctx.fill();
      // Hat band gold
      ctx.fillStyle = '#c9a84c';
      ctx.fillRect(-10, -28, 20, 3);

      /* === WAND === */
      // Arm holding wand forward
      ctx.strokeStyle = '#f0c8a0';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(8, -5);
      ctx.lineTo(28, -18);
      ctx.stroke();
      // Wand stick
      ctx.strokeStyle = '#6b3d0f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(25, -20);
      ctx.lineTo(48, -34);
      ctx.stroke();
      // Wand tip sparkle glow
      ctx.fillStyle = '#fffacd';
      ctx.shadowColor = '#f5d06b';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(48, -34, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();
    }

    /* ---- Main loop ---- */
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* Update + draw particles */
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.y       += p.speed;
        p.sway    += p.swaySpeed;
        p.x       += p.drift + Math.sin(p.sway) * 0.4;
        p.rot     += p.rotSpeed;
        p.twinkle += p.twkSpeed;

        /* Fade in near top, fade out near bottom */
        if (p.y < 60)                       p.opacity = Math.min(p.y / 60 * 0.6, 0.6);
        else if (p.y > canvas.height - 60)  p.opacity = Math.max((canvas.height - p.y) / 60 * 0.6, 0);
        else                                p.opacity = 0.25 + Math.abs(Math.sin(p.twinkle)) * 0.3;

        /* Gentle x boundary bounce */
        if (p.x < -10)                p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        /* Recycle off the bottom */
        if (p.y > canvas.height + 25) {
          particles[i] = makeParticle();
          continue;
        }

        if (p.type === 'petal')   drawPetal(p);
        else if (p.type === 'star') drawStar(p);
        else                        drawSparkle(p);
      }

      /* Update + draw witches on broomsticks */
      if (witchesStarted) {
        witches.forEach(w => {
          w.bobT += 0.03;
          w.x    += w.speed;
          const bobY = Math.sin(w.bobT) * 5;

          // Throw particles from wand tip
          if (Math.random() < 0.18) {
            const wandOffX = w.speed > 0 ? 48 : -48;
            const p = makeParticle(w.y - 34 + bobY);
            p.x       = w.x + wandOffX + (Math.random() - 0.5) * 12;
            p.opacity = 0.65;
            p.speed   = Math.random() * 1.2 + 0.5;
            particles.push(p);
            if (particles.length > TOTAL + 30) particles.splice(TOTAL, 1);
          }

          const savedY = w.y;
          w.y += bobY;
          drawWitch(w);
          w.y = savedY;

          // Loop: re-enter from opposite side
          if (w.speed > 0 && w.x > canvas.width + 100) {
            w.x = -100;
            w.y = 45 + Math.random() * 50;
          }
          if (w.speed < 0 && w.x < -100) {
            w.x = canvas.width + 100;
            w.y = 60 + Math.random() * 50;
          }
        });
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

})();
