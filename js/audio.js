/* ============================================================
   Wicket Rush — sound effects
   ------------------------------------------------------------
   All sounds are generated with the Web Audio API — no audio
   files needed, so the game stays tiny and works offline.
   ============================================================ */

const Sound = (() => {
  let ctx = null;
  let muted = localStorage.getItem('wr_muted') === '1';

  // Browsers only allow audio after the user touches the screen,
  // so we create the AudioContext lazily on first use.
  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // A short burst of noise, shaped by a filter — the base of most effects
  function noise(duration, freq, type, gain) {
    if (muted) return;
    const c = ac();
    const buf = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    const g = c.createGain();
    g.gain.setValueAtTime(gain, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    src.connect(filter).connect(g).connect(c.destination);
    src.start();
  }

  // A simple pitched beep
  function tone(freq, duration, type, gain, slideTo) {
    if (muted) return;
    const c = ac();
    const o = c.createOscillator();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, c.currentTime);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + duration);
    const g = c.createGain();
    g.gain.setValueAtTime(gain || 0.15, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + duration);
  }

  return {
    // UI button tap
    tap()    { tone(600, 0.08, 'square', 0.12); },
    // Bat hitting the ball — a sharp crack
    crack()  { noise(0.12, 2600, 'highpass', 0.5); tone(180, 0.1, 'triangle', 0.3); },
    // Crowd cheering after a boundary
    cheer()  { noise(0.7, 900, 'bandpass', 0.35); tone(520, 0.35, 'sine', 0.12, 780); },
    // Stumps rattling — you're out!
    wicket() { noise(0.25, 400, 'lowpass', 0.5); tone(140, 0.3, 'sawtooth', 0.2, 60); },
    // Ball released by the bowler
    whoosh() { noise(0.18, 1200, 'bandpass', 0.15); },
    // Coins / rewards
    coin()   { tone(880, 0.09, 'square', 0.12); setTimeout(() => tone(1320, 0.12, 'square', 0.12), 80); },

    toggleMute() {
      muted = !muted;
      localStorage.setItem('wr_muted', muted ? '1' : '0');
      return muted;
    },
    isMuted() { return muted; },
  };
})();
