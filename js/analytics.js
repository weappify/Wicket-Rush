/* ============================================================
   Wicket Rush — local, private analytics
   ------------------------------------------------------------
   ⚠️ PRIVACY BY DESIGN:
   Nothing here ever leaves the device. There is NO network code,
   no account, no user ID, no third-party SDK. Every number is a
   plain counter in this browser's localStorage. It exists only so
   YOU (the parent/developer) can open the Stats screen during a
   playtest and answer the one question that matters:
       "Are kids coming back and replaying on their own?"
   You can wipe it all any time with the Reset button.
   ============================================================ */

const Stats = (() => {
  const K = 'wr_stat_';
  const getN = (k, d = 0) => +localStorage.getItem(K + k) || d;
  const setN = (k, v) => localStorage.setItem(K + k, v);
  const getJ = (k, d) => { try { return JSON.parse(localStorage.getItem(K + k)) ?? d; } catch { return d; } };
  const setJ = (k, v) => localStorage.setItem(K + k, JSON.stringify(v));

  const SESSION_GAP_MS = 30 * 60 * 1000; // 30 min idle = a new "sitting"

  function todayKey() {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  // Add n to a counter.
  function bump(key, n = 1) { setN(key, getN(key) + n); }

  // Keep a running "highest ever" for a counter.
  function max(key, v) { if (v > getN(key)) setN(key, v); }

  // Called when a game ends: total runs + best score + daily streak record.
  function recordScore(score, streak) {
    bump('totalRuns', score);
    max('best', score);
    if (streak) max('streakBest', streak);
  }

  // Record that the game is being used right now: tracks distinct days
  // played (a simple retention signal) and separate play sessions.
  function touch() {
    const now = Date.now();
    const last = getN('lastActiveTs', 0);
    if (!last || now - last > SESSION_GAP_MS) bump('sessions');
    setN('lastActiveTs', now);

    if (!getN('firstDay')) setN('firstDay', todayKey());
    setN('lastDay', todayKey());

    const days = getJ('days', []);
    const today = todayKey();
    if (!days.includes(today)) { days.push(today); setJ('days', days); }
  }

  // How many calendar days have passed since the player's very first game.
  function ageDays() {
    const first = getN('firstDay', 0);
    if (!first) return 0;
    const toDate = (n) => new Date(Math.floor(n / 10000), Math.floor((n % 10000) / 100) - 1, n % 100);
    return Math.max(0, Math.round((toDate(todayKey()) - toDate(first)) / 86400000));
  }

  // Everything the Stats screen shows, already computed.
  function summary() {
    const games = getN('games');
    const daysActive = getJ('days', []).length;
    const runs = getN('totalRuns');
    return {
      // The retention headline numbers
      daysActive,
      daysSinceFirst: ageDays(),
      sessions: getN('sessions'),
      games,
      replays: getN('replays'),
      shares: getN('shares'),
      // Play breakdown
      gamesFree: getN('gamesFree'),
      gamesDaily: getN('gamesDaily'),
      dailyStreakBest: getN('streakBest'),
      // Skill / fun signals
      best: getN('best'),
      avgScore: games ? Math.round(runs / games) : 0,
      totalRuns: runs,
      sixes: getN('sixes'),
      fours: getN('fours'),
      gaps: getN('gaps'),
      // Progression engagement
      missionsClaimed: getN('missionsClaimed'),
      skinsBought: getN('skinsBought'),
    };
  }

  // A copy-pasteable snapshot (JSON) for sharing test results with yourself.
  function exportText() {
    return JSON.stringify({ generated: new Date().toISOString(), stats: summary() }, null, 2);
  }

  function reset() {
    Object.keys(localStorage).filter(k => k.startsWith(K)).forEach(k => localStorage.removeItem(k));
  }

  return { bump, max, recordScore, touch, summary, exportText, reset };
})();
