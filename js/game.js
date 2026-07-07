/* ============================================================
   Wicket Rush — main game
   ------------------------------------------------------------
   One tap. Perfect timing. SIX!
   The whole game lives in this file:
     1. Canvas setup + drawing the stadium, players and ball
     2. The ball state machine (run-up → flight → hit/out)
     3. Scoring, streaks, coins
     4. Screens (home / shop / game over) and saving progress
   ============================================================ */

(() => {
  'use strict';

  // ---------- Canvas setup ----------
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  // roundRect fallback for older iPads / browsers
  if (!ctx.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      this.moveTo(x + r, y);
      this.arcTo(x + w, y, x + w, y + h, r);
      this.arcTo(x + w, y + h, x, y + h, r);
      this.arcTo(x, y + h, x, y, r);
      this.arcTo(x, y, x + w, y, r);
      this.closePath();
      return this;
    };
  }

  const VW = 480;      // virtual width — all game coords use this
  let VH = 854;        // virtual height — depends on the device screen
  let scale = 1, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    scale = w / VW;
    VH = h / scale;
  }
  window.addEventListener('resize', resize);
  resize();

  // Handy layout anchors (recomputed from VH each frame so rotation works)
  const L = {};
  function layout() {
    L.bowlerY  = VH * 0.16;              // where the ball is released
    L.batterY  = VH * 0.80;              // where the bat meets the ball
    L.stumpsY  = VH * 0.80 + 14;
    L.pitchTop = VH * 0.13;
    L.cx = VW / 2;
  }

  // ---------- Saved progress ----------
  const save = {
    get best()   { return +localStorage.getItem('wr_best') || 0; },
    set best(v)  { localStorage.setItem('wr_best', v); },
    get coins()  { return +localStorage.getItem('wr_coins') || 0; },
    set coins(v) { localStorage.setItem('wr_coins', v); },
    get owned()  { return JSON.parse(localStorage.getItem('wr_owned') || '["classic"]'); },
    set owned(v) { localStorage.setItem('wr_owned', JSON.stringify(v)); },
    get skin()   { return localStorage.getItem('wr_skin') || 'classic'; },
    set skin(v)  { localStorage.setItem('wr_skin', v); },
    get played() { return +localStorage.getItem('wr_played') || 0; },
    set played(v){ localStorage.setItem('wr_played', v); },
    get scores() { return JSON.parse(localStorage.getItem('wr_scores') || '[]'); },
    set scores(v){ localStorage.setItem('wr_scores', JSON.stringify(v)); },
  };

  function currentSkin() {
    return SKINS.find(s => s.id === save.skin) || SKINS[0];
  }

  // ---------- Game state ----------
  const G = {
    mode: 'home',        // 'home' | 'playing' | 'over'
    ball: null,          // the current delivery (see newBall)
    score: 0,
    wickets: CONFIG.WICKETS,
    balls: 0,            // legal deliveries bowled this innings
    flightMs: CONFIG.FLIGHT_MS_START,
    streak: 0,           // consecutive boundaries
    multiplier: 1,
    overRuns: 0,         // runs scored this over (for the over summary)
    overWickets: 0,      // wickets lost this over
    swipeStart: null,    // where the finger went down (for shot placement)
    swingT: -1e9,        // when the bat last swung (for animation)
    shake: 0,            // screen shake strength
    particles: [],
    popups: [],          // floating "+6" style texts
    stumpsBroken: 0,     // animation timer after a wicket
  };

  // ---------- The ball state machine ----------
  // phase: 'runup' → 'flight' → 'hit' | 'bowled' → (pause) → next ball
  function pickDelivery() {
    const total = DELIVERIES.reduce((s, d) => s + d.weight, 0);
    let r = Math.random() * total;
    for (const d of DELIVERIES) { r -= d.weight; if (r <= 0) return d; }
    return DELIVERIES[0];
  }

  function newBall() {
    const golden = G.balls >= CONFIG.GOLDEN_MIN_BALL && Math.random() < CONFIG.GOLDEN_BALL_CHANCE;
    const delivery = pickDelivery();
    G.ball = {
      phase: 'runup',
      t0: performance.now(),
      releaseX: L.cx + (Math.random() * 60 - 30),          // bowler varies position
      curve: (Math.random() * 2 - 1) * CONFIG.SWING_CURVE_MAX, // sideways swing
      golden,
      delivery,
      flightMs: G.flightMs * delivery.flight,  // this ball's actual speed
      swung: false,
      // set when hit:
      hitVx: 0, hitVy: 0, hitX: 0, hitY: 0,
    };
    if (G.balls === 0 && save.played === 0) showTapHint(true);
  }

  function ballPos(p) {
    // Where is the ball when it is p (0→1) of the way down the pitch?
    const b = G.ball;
    const x = b.releaseX + (L.cx - b.releaseX) * p + b.curve * Math.sin(p * Math.PI);
    const y = L.bowlerY + (L.batterY - L.bowlerY) * (p * p * 0.4 + p * 0.6); // slight ease-in, like a real delivery
    return { x, y };
  }

  // ---------- Swinging the bat ----------
  // Returns true when the ball was actually hit (so a flick can steer it).
  function swing() {
    const b = G.ball;
    G.swingT = performance.now();
    if (!b || b.phase !== 'flight' || b.swung) return false;
    b.swung = true;

    const dt = Math.abs((performance.now() - b.t0) - b.flightMs); // ms away from perfect contact
    const T = CONFIG.TIMING;
    const w = b.delivery.window; // yorkers shrink the windows, short balls widen them

    let runs = 0, label = '', color = '#fff';
    if      (dt <= T.PERFECT * w) { runs = 6; label = 'SIX!';  color = '#ffd93b'; }
    else if (dt <= T.GREAT * w)   { runs = 4; label = 'FOUR!'; color = '#6fdb4e'; }
    else if (dt <= T.GOOD * w)    { runs = 2; label = '+2';    color = '#5ec8ff'; }
    else if (dt <= T.OK * w)      { runs = 1; label = '+1';    color = '#ffffff'; }

    if (runs === 0) return false; // swung too early/late — ball continues to the stumps…

    // A weak poke at a short ball can loop up to a fielder… CAUGHT!
    if (runs === 1 && Math.random() < b.delivery.catchRisk) { wicketFalls('caught'); return false; }

    // --- It's a hit! ---
    const boundary = runs >= 4;
    if (boundary) runs += b.delivery.bonus;              // brave hits off fast balls pay extra
    if (b.golden) { runs *= 2; label = '✨ ' + label + ' x2'; }

    if (boundary) {
      G.streak++;
      G.multiplier = 1 + Math.min(CONFIG.MAX_MULTIPLIER - 1, Math.floor(G.streak / CONFIG.STREAK_PER_LEVEL));
    } else {
      G.streak = 0;
      G.multiplier = 1;
    }
    const total = runs * G.multiplier;
    G.score += total;
    G.overRuns += total;
    if (G.multiplier > 1) label += ` x${G.multiplier}`;

    // Send the ball flying off toward the crowd
    const pos = ballPos(Math.min(1, (performance.now() - b.t0) / G.flightMs));
    b.phase = 'hit';
    b.tHit = performance.now();
    b.hitX = pos.x; b.hitY = pos.y;
    const ang = -Math.PI / 2 + (Math.random() * 0.9 - 0.45);
    const power = boundary ? 1.6 : 0.9;
    b.hitVx = Math.cos(ang) * power;
    b.hitVy = Math.sin(ang) * power;

    // Juice!
    burst(pos.x, pos.y, boundary ? 26 : 12, currentSkin().trail);
    popup(label, color, runs >= 6 ? 44 : 34);
    Sound.crack();
    if (boundary) { Sound.cheer(); G.shake = runs >= 6 ? 14 : 8; buzz(boundary ? 60 : 25); }
    showTapHint(false);
    scheduleNext();
    updateHUD();
    return true;
  }

  // A quick flick right after contact steers the ball — shot placement!
  function applySwipe(dx, dy) {
    const b = G.ball;
    if (!b || b.phase !== 'hit' || b.caught) return;
    if (performance.now() - b.tHit > CONFIG.SWIPE.WINDOW_MS) return;
    const len = Math.hypot(dx, dy);
    if (len < CONFIG.SWIPE.MIN_PX) return;

    // Re-base the ball at its current position so it turns smoothly
    const t = (performance.now() - b.tHit) / 16.7;
    b.hitX = b.hitX + b.hitVx * t * 9;
    b.hitY = b.hitY + b.hitVy * t * 9 + t * t * 0.12;
    b.tHit = performance.now();
    const power = Math.hypot(b.hitVx, b.hitVy);
    b.hitVx = (dx / len) * power;
    b.hitVy = (dy / len) * power;

    // Name the shot like a commentator
    let shot;
    if (Math.abs(dx) > Math.abs(dy)) shot = dx < 0 ? '⬅ PULL SHOT!' : 'CUT SHOT! ➡';
    else shot = dy < 0 ? '⬆ STRAIGHT DRIVE!' : 'CHEEKY SCOOP! ⬇';
    popup(shot, '#ffffff', 22, VH * 0.52);
  }

  function wicketFalls(how) {
    const b = G.ball;
    G.wickets--;
    G.overWickets++;
    G.streak = 0;
    G.multiplier = 1;
    if (how === 'caught') {
      // The ball loops gently up off the bat into a fielder's hands
      const pos = ballPos(Math.min(1, (performance.now() - b.t0) / b.flightMs));
      b.phase = 'hit';
      b.caught = true;
      b.tHit = performance.now();
      b.hitX = pos.x; b.hitY = pos.y;
      b.hitVx = 0.25; b.hitVy = -0.9;
      popup('CAUGHT!', '#ff5252', 46);
    } else {
      b.phase = 'bowled';
      G.stumpsBroken = performance.now();
      popup('BOWLED!', '#ff5252', 46);
    }
    Sound.wicket();
    buzz(120);
    G.shake = 10;
    showTapHint(false);
    scheduleNext();
    updateHUD();
  }

  function scheduleNext() {
    G.balls++;
    setTimeout(() => {
      if (G.mode !== 'playing') return;
      if (G.wickets <= 0 || G.balls >= CONFIG.BALLS_PER_INNINGS) return endInnings();
      if (G.balls % CONFIG.BALLS_PER_OVER === 0) return showOverSummary();
      nextBall();
    }, CONFIG.RESULT_PAUSE_MS);
  }

  function nextBall() {
    newBall();
    Sound.whoosh();
    updateHUD();
  }

  // The scorecard moment between overs — a breather before faster bowling
  function showOverSummary() {
    const overNo = G.balls / CONFIG.BALLS_PER_OVER;
    el('os-title').textContent = `End of Over ${overNo}`;
    el('os-runs').textContent = `${G.overRuns} run${G.overRuns === 1 ? '' : 's'} this over`;
    el('os-total').textContent = G.overWickets > 0
      ? `Total: ${G.score}  •  ${G.overWickets} wicket${G.overWickets > 1 ? 's' : ''} lost`
      : `Total: ${G.score}`;
    show('over-summary');
    if (G.overRuns >= 12) Sound.cheer(); else Sound.tap();

    setTimeout(() => {
      if (G.mode !== 'playing') return;
      hide('over-summary');
      G.flightMs = Math.max(CONFIG.FLIGHT_MS_MIN, G.flightMs * CONFIG.SPEEDUP_PER_OVER);
      G.overRuns = 0;
      G.overWickets = 0;
      popup('⚡ Faster bowling!', '#ffd93b', 26);
      nextBall();
    }, CONFIG.OVER_SUMMARY_MS);
  }

  // ---------- Innings ----------
  function startInnings() {
    G.mode = 'playing';
    G.score = 0;
    G.wickets = CONFIG.WICKETS;
    G.balls = 0;
    G.streak = 0;
    G.multiplier = 1;
    G.overRuns = 0;
    G.overWickets = 0;
    G.swipeStart = null;
    G.flightMs = CONFIG.FLIGHT_MS_START;
    G.particles = [];
    G.popups = [];
    show('hud');
    hide('screen-home'); hide('screen-gameover'); hide('screen-shop'); hide('screen-howto'); hide('over-summary');
    updateHUD();
    newBall();
    Sound.whoosh();
  }

  function endInnings() {
    G.mode = 'over';
    save.played = save.played + 1;
    const coins = G.score * CONFIG.COINS_PER_RUN;
    save.coins = save.coins + coins;
    const isBest = G.score > save.best;
    if (isBest) save.best = G.score;

    // Local leaderboard: keep the top scores on this device
    const scores = [...save.scores, G.score].sort((a, b) => b - a).slice(0, CONFIG.LEADERBOARD_SIZE);
    save.scores = scores;

    el('go-title').textContent = isBest ? '🏆 NEW BEST!' : 'Innings Over!';
    el('go-score').textContent = G.score;
    el('go-sub').textContent = `${G.balls} balls  •  Best: ${save.best}`;
    el('go-coins').textContent = `🪙 +${coins}`;
    el('go-board').innerHTML = scores
      .map((s, i) => `<div class="board-row${s === G.score ? ' me' : ''}">${['🥇','🥈','🥉','4.','5.'][i]} ${s}</div>`)
      .join('');
    hide('hud');
    show('screen-gameover');
    if (coins > 0) Sound.coin();
  }

  // ---------- Particles & popups (the "juice") ----------
  function burst(x, y, n, color) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 5;
      G.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, life: 1, color });
    }
  }

  function popup(text, color, size, y) {
    G.popups.push({ text, color, size, y: y || VH * 0.42, life: 1 });
  }

  function buzz(ms) {
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  // ---------- Drawing ----------
  function draw(now) {
    layout();
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);

    // Screen shake
    if (G.shake > 0.5) {
      ctx.translate((Math.random() - 0.5) * G.shake, (Math.random() - 0.5) * G.shake);
      G.shake *= 0.85;
    }

    drawStadium();

    if (G.mode === 'playing' || G.mode === 'over') {
      drawStumps(now);
      drawBatter(now);
      drawBowler(now);
      if (G.mode === 'playing') drawBall(now);
    } else {
      // Home screen: idle batter waiting for the game to start
      drawStumps(now);
      drawBatter(now);
      drawBowler(now);
    }

    drawParticles();
    drawPopups();
  }

  function drawStadium() {
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, VH * 0.35);
    sky.addColorStop(0, '#39b3f4');
    sky.addColorStop(1, '#7dd3ff');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VW, VH * 0.35);

    // Crowd stand
    ctx.fillStyle = '#2b6ea5';
    ctx.fillRect(0, VH * 0.06, VW, VH * 0.06);
    ctx.fillStyle = '#1e5c8f';
    ctx.fillRect(0, VH * 0.09, VW, VH * 0.03);
    // Crowd dots
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = ['#ffd93b', '#ff7a3c', '#6fdb4e', '#ff5252', '#fff'][i % 5];
      ctx.beginPath();
      ctx.arc((i * 37 + 15) % VW, VH * 0.065 + (i * 13 % 3) * VH * 0.015 + 4, 3.5, 0, 7);
      ctx.fill();
    }

    // Grass
    const grass = ctx.createLinearGradient(0, VH * 0.12, 0, VH);
    grass.addColorStop(0, '#4caf50');
    grass.addColorStop(1, '#2e8b3a');
    ctx.fillStyle = grass;
    ctx.fillRect(0, VH * 0.12, VW, VH);
    // Mowing stripes
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i < 6; i++) ctx.fillRect(0, VH * 0.12 + i * VH * 0.16, VW, VH * 0.08);

    // Pitch (the brown strip down the middle)
    ctx.fillStyle = '#d9b47c';
    const pw = 120;
    ctx.beginPath();
    ctx.moveTo(L.cx - pw * 0.28, L.pitchTop);
    ctx.lineTo(L.cx + pw * 0.28, L.pitchTop);
    ctx.lineTo(L.cx + pw * 0.62, VH);
    ctx.lineTo(L.cx - pw * 0.62, VH);
    ctx.fill();
    // Crease lines
    ctx.strokeStyle = 'rgba(255,255,255,.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(L.cx - 55, L.batterY + 26);
    ctx.lineTo(L.cx + 55, L.batterY + 26);
    ctx.stroke();
  }

  function drawStumps(now) {
    const broken = G.stumpsBroken && now - G.stumpsBroken < 900;
    const t = broken ? (now - G.stumpsBroken) / 900 : 0;
    ctx.save();
    ctx.translate(L.cx, L.stumpsY);
    for (let i = -1; i <= 1; i++) {
      ctx.save();
      ctx.translate(i * 12, 0);
      if (broken) ctx.rotate(i * t * 1.2 + t * 0.4);
      ctx.fillStyle = '#ffe9b0';
      ctx.fillRect(-3, 0, 6, 34);
      ctx.restore();
    }
    // Bails fly off when bowled
    if (!broken) {
      ctx.fillStyle = '#ffd93b';
      ctx.fillRect(-13, -3, 12, 4);
      ctx.fillRect(1, -3, 12, 4);
    } else {
      ctx.fillStyle = '#ffd93b';
      ctx.fillRect(-13 - t * 40, -3 - t * 60 + t * t * 120, 12, 4);
      ctx.fillRect(1 + t * 40, -3 - t * 70 + t * t * 120, 12, 4);
    }
    ctx.restore();
    if (G.stumpsBroken && now - G.stumpsBroken >= 900) G.stumpsBroken = 0;
  }

  function drawBatter(now) {
    const skin = currentSkin();
    const sw = Math.min(1, (now - G.swingT) / 260); // swing animation 0→1
    const batAngle = sw < 1 ? -2.4 * Math.sin(sw * Math.PI) : 0;

    ctx.save();
    ctx.translate(L.cx - 34, L.batterY);

    // Body
    ctx.fillStyle = '#2a6fd6';
    ctx.beginPath();
    ctx.roundRect(-12, -18, 24, 34, 8);
    ctx.fill();
    // Legs (pads)
    ctx.fillStyle = '#f4f6f8';
    ctx.fillRect(-11, 15, 9, 20);
    ctx.fillRect(2, 15, 9, 20);
    // Head + helmet
    ctx.fillStyle = '#ffcf9e';
    ctx.beginPath(); ctx.arc(0, -30, 11, 0, 7); ctx.fill();
    ctx.fillStyle = '#1d4f9c';
    ctx.beginPath(); ctx.arc(0, -32, 11, Math.PI, 0); ctx.fill();
    ctx.fillRect(-11, -32, 22, 4);

    // Bat (rotates when you swing)
    ctx.save();
    ctx.translate(14, -8);
    ctx.rotate(0.5 + batAngle);
    const g = ctx.createLinearGradient(0, 0, 0, 46);
    g.addColorStop(0, skin.colors[0]);
    g.addColorStop(1, skin.colors[1]);
    ctx.fillStyle = '#7a5230';
    ctx.fillRect(-3, -14, 6, 14); // handle
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(-7, 0, 14, 46, 5);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  function drawBowler(now) {
    const b = G.ball;
    let lean = 0, yOff = 0;
    if (b && b.phase === 'runup' && G.mode === 'playing') {
      const p = Math.min(1, (now - b.t0) / CONFIG.RUNUP_MS);
      yOff = -30 + p * 30;      // runs in toward the crease
      lean = p * 0.5;           // leans into the delivery
    }
    ctx.save();
    ctx.translate((b ? b.releaseX : L.cx) + 0, L.bowlerY - 26 + yOff);
    ctx.rotate(lean * 0.3);
    // Body
    ctx.fillStyle = '#e8420e';
    ctx.beginPath(); ctx.roundRect(-9, -10, 18, 26, 7); ctx.fill();
    // Head
    ctx.fillStyle = '#ffcf9e';
    ctx.beginPath(); ctx.arc(0, -19, 8, 0, 7); ctx.fill();
    // Arm windmill during run-up
    ctx.strokeStyle = '#e8420e';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    const armA = (b && b.phase === 'runup') ? ((now - (b ? b.t0 : 0)) / CONFIG.RUNUP_MS) * Math.PI * 2 : 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(Math.cos(armA) * 14, -6 + Math.sin(armA) * 14);
    ctx.stroke();
    ctx.restore();
  }

  function drawBall(now) {
    const b = G.ball;
    if (!b) return;

    if (b.phase === 'runup') {
      if (now - b.t0 >= CONFIG.RUNUP_MS) {
        b.phase = 'flight';
        b.t0 = now;
        // Announce special deliveries as they leave the bowler's hand
        if (b.delivery.name) popup(b.delivery.name, '#ffffff', 24);
      }
      return;
    }

    if (b.phase === 'flight') {
      const p = (now - b.t0) / b.flightMs;
      if (p >= 1.12) { wicketFalls(); return; } // reached the stumps untouched
      const pos = ballPos(Math.min(1, p));
      const r = 5 + p * 9; // ball "grows" as it gets closer — fake 3D

      // Shadow on the pitch
      ctx.fillStyle = 'rgba(0,0,0,.18)';
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y + r + 4, r * 0.9, r * 0.35, 0, 0, 7);
      ctx.fill();

      // Golden ball sparkle trail
      if (b.golden && Math.random() < 0.6) {
        G.particles.push({ x: pos.x, y: pos.y, vx: (Math.random() - .5), vy: (Math.random() - .5), life: 0.6, color: '#ffd93b' });
      }

      // The ball
      ctx.fillStyle = b.golden ? '#ffd93b' : '#e8382a';
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, 7); ctx.fill();
      // Seam
      ctx.strokeStyle = b.golden ? '#c99400' : '#8f1a12';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 0.6, 0.4, 2.6); ctx.stroke();
      return;
    }

    if (b.phase === 'hit') {
      const t = (now - b.tHit) / 16.7; // frames since contact
      const x = b.hitX + b.hitVx * t * 9;
      const y = b.hitY + b.hitVy * t * 9 + t * t * 0.12; // a touch of gravity
      const r = Math.max(2, 12 - t * 0.35);              // shrinks as it flies away
      if (y > -40 && x > -40 && x < VW + 40) {
        ctx.fillStyle = b.golden ? '#ffd93b' : '#e8382a';
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      }
    }
  }

  function drawParticles() {
    for (let i = G.particles.length - 1; i >= 0; i--) {
      const p = G.particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.025;
      if (p.life <= 0) { G.particles.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3.5 * p.life + 1, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawPopups() {
    for (let i = G.popups.length - 1; i >= 0; i--) {
      const p = G.popups[i];
      p.y -= 0.8; p.life -= 0.012;
      if (p.life <= 0) { G.popups.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.font = `900 ${p.size}px -apple-system, "Segoe UI", Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 6;
      ctx.strokeStyle = 'rgba(0,0,0,.35)';
      ctx.strokeText(p.text, L.cx, p.y);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, L.cx, p.y);
    }
    ctx.globalAlpha = 1;
  }

  // ---------- Main loop ----------
  function frame(now) {
    draw(now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ---------- Input ----------
  window.addEventListener('pointerdown', (e) => {
    if (G.mode !== 'playing') return;
    if (e.target.closest('button')) return; // let buttons be buttons
    const hit = swing();
    // Remember where the finger landed — a flick from here steers the shot
    G.swipeStart = hit ? { x: e.clientX, y: e.clientY } : null;
  });
  window.addEventListener('pointermove', (e) => {
    if (!G.swipeStart) return;
    const dx = e.clientX - G.swipeStart.x, dy = e.clientY - G.swipeStart.y;
    if (Math.hypot(dx, dy) >= CONFIG.SWIPE.MIN_PX) {
      applySwipe(dx, dy);
      G.swipeStart = null;
    }
  });
  window.addEventListener('pointerup', (e) => {
    if (!G.swipeStart) return;
    applySwipe(e.clientX - G.swipeStart.x, e.clientY - G.swipeStart.y);
    G.swipeStart = null;
  });
  // Space bar works too (nice for testing on a laptop)
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && G.mode === 'playing') { e.preventDefault(); swing(); }
  });

  // ---------- DOM helpers ----------
  function el(id) { return document.getElementById(id); }
  function show(id) { el(id).classList.remove('hidden'); }
  function hide(id) { el(id).classList.add('hidden'); }

  function showTapHint(on) {
    el('tap-hint').classList.toggle('hidden', !on);
  }

  function updateHUD() {
    el('hud-score').textContent = G.score;
    el('hud-wickets').textContent = G.wickets > 5 ? `🏏 x${G.wickets}` : '🏏 '.repeat(G.wickets).trim() || '—';
    el('hud-over').textContent = `Ball ${Math.min(G.balls + 1, CONFIG.BALLS_PER_INNINGS)}/${CONFIG.BALLS_PER_INNINGS}`;
    const streakEl = el('hud-streak');
    if (G.multiplier > 1) {
      streakEl.textContent = `🔥 x${G.multiplier}`;
      streakEl.classList.remove('hidden');
    } else {
      streakEl.classList.add('hidden');
    }
  }

  function updateHome() {
    el('home-best').textContent = `Best: ${save.best}`;
    el('home-coins').textContent = `🪙 ${save.coins}`;
    el('btn-mute').textContent = Sound.isMuted() ? '🔇' : '🔊';
  }

  // ---------- Shop ----------
  function renderShop() {
    el('shop-coins').textContent = `🪙 ${save.coins}`;
    const list = el('shop-list');
    list.innerHTML = '';
    for (const s of SKINS) {
      const owned = save.owned.includes(s.id);
      const equipped = save.skin === s.id;
      const item = document.createElement('div');
      item.className = 'shop-item';

      const swatch = document.createElement('div');
      swatch.className = 'shop-swatch';
      swatch.style.background = `linear-gradient(${s.colors[0]}, ${s.colors[1]})`;

      const name = document.createElement('div');
      name.className = 'shop-name';
      name.textContent = s.name;

      const btn = document.createElement('button');
      btn.className = 'shop-buy' + (equipped ? ' equipped' : '');
      if (equipped)      { btn.textContent = '✓ Equipped'; btn.disabled = true; }
      else if (owned)    { btn.textContent = 'Equip'; }
      else               { btn.textContent = `🪙 ${s.price}`; btn.disabled = save.coins < s.price; }

      btn.addEventListener('click', () => {
        if (owned) {
          save.skin = s.id;
        } else if (save.coins >= s.price) {
          save.coins = save.coins - s.price;
          save.owned = [...save.owned, s.id];
          save.skin = s.id;
          Sound.coin();
          buzz(30);
        }
        renderShop();
      });

      item.append(swatch, name, btn);
      list.appendChild(item);
    }
  }

  // ---------- Buttons ----------
  el('btn-play').addEventListener('click', () => { Sound.tap(); startInnings(); });
  el('btn-again').addEventListener('click', () => { Sound.tap(); startInnings(); });
  el('btn-home').addEventListener('click', () => {
    Sound.tap(); G.mode = 'home';
    hide('screen-gameover'); show('screen-home'); updateHome();
  });
  el('btn-shop').addEventListener('click', () => {
    Sound.tap(); renderShop();
    hide('screen-home'); show('screen-shop');
  });
  el('btn-shop-back').addEventListener('click', () => {
    Sound.tap();
    hide('screen-shop'); show('screen-home'); updateHome();
  });
  el('btn-howto').addEventListener('click', () => {
    Sound.tap();
    hide('screen-home'); show('screen-howto');
  });
  el('btn-howto-back').addEventListener('click', () => {
    Sound.tap();
    hide('screen-howto'); show('screen-home');
  });
  el('btn-mute').addEventListener('click', () => {
    const muted = Sound.toggleMute();
    el('btn-mute').textContent = muted ? '🔇' : '🔊';
  });
  el('btn-share').addEventListener('click', async () => {
    Sound.tap();
    const text = `🏏 I smashed ${G.score} runs in Wicket Rush! Think you can beat me?`;
    const url = location.href;
    if (navigator.share) {
      try { await navigator.share({ title: 'Wicket Rush', text, url }); } catch (e) { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        el('btn-share').textContent = '✓ Copied!';
        setTimeout(() => el('btn-share').textContent = '📣 Challenge a friend', 1500);
      } catch (e) { /* clipboard unavailable */ }
    }
  });

  // ---------- Go! ----------
  layout();
  updateHome();
})();
