/* ============================================================
   Wicket Rush — progression system
   ------------------------------------------------------------
   Everything that makes you want to come back tomorrow:
     • Daily Challenge (same balls for everyone) + play streak
     • Daily missions that pay coins
     • Career trophies → leagues → a Trophy Road of unlocks
     • Collectible batter characters with light abilities
   All saved on the device — no accounts, no servers, works offline.
   ============================================================ */

const Progress = (() => {

  // ---------- tiny localStorage helpers ----------
  const get  = (k, d) => { const v = localStorage.getItem('wr_' + k); return v === null ? d : v; };
  const getN = (k, d) => +get(k, d);
  const getJ = (k, d) => { try { return JSON.parse(get(k, JSON.stringify(d))); } catch { return d; } };
  const set  = (k, v) => localStorage.setItem('wr_' + k, typeof v === 'object' ? JSON.stringify(v) : v);

  // ---------- today's date as a plain YYYYMMDD string/number ----------
  // (used both as the daily seed and to detect "a new day")
  function todayKey() {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }
  function daysBetween(a, b) {
    // a, b are YYYYMMDD ints — convert to real dates and diff in days
    const toDate = (n) => new Date(Math.floor(n / 10000), Math.floor((n % 10000) / 100) - 1, n % 100);
    return Math.round((toDate(b) - toDate(a)) / 86400000);
  }

  // ---------- a seeded random generator (mulberry32) ----------
  // Given the same seed, everyone gets the same sequence — that's what makes
  // the Daily Challenge fair: identical deliveries and field for every player.
  function makeRng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------- career trophies + leagues ----------
  const trophies = () => getN('trophies', 0);

  function league(t) {
    t = t == null ? trophies() : t;
    let cur = LEAGUES[0];
    for (const lg of LEAGUES) if (t >= lg.min) cur = lg;
    return cur;
  }

  // Add trophies and hand out any Trophy Road rewards we just passed.
  // Returns the list of rewards unlocked (so the results screen can show them).
  function addTrophies(n) {
    const before = trophies();
    const after = before + n;
    set('trophies', after);
    const unlocked = [];
    for (const m of TROPHY_ROAD) {
      if (m.trophies > before && m.trophies <= after) {
        grantReward(m.reward);
        unlocked.push(m.reward);
      }
    }
    return unlocked;
  }

  function grantReward(r) {
    if (r.type === 'coins') {
      addCoins(r.amount);
    } else if (r.type === 'character') {
      const owned = getJ('chars', ['rookie']);
      if (!owned.includes(r.id)) { owned.push(r.id); set('chars', owned); }
    } else if (r.type === 'skin') {
      const owned = getJ('owned', ['classic']);
      if (!owned.includes(r.id)) { owned.push(r.id); set('owned', owned); }
    }
  }

  // ---------- coins (shared with the shop) ----------
  const coins = () => getN('coins', 0);
  const addCoins = (n) => set('coins', coins() + n);

  // ---------- characters ----------
  const ownedChars = () => getJ('chars', ['rookie']);
  const character  = () => get('char', 'rookie');
  const setCharacter = (id) => { if (ownedChars().includes(id)) set('char', id); };
  function characterData() {
    return CHARACTERS.find(c => c.id === character()) || CHARACTERS[0];
  }
  const ability = () => characterData().ability || {};

  // ---------- daily challenge + streak ----------
  // Returns { seed, alreadyDone } for today's challenge.
  function dailyInfo() {
    const key = todayKey();
    return { key, seed: key, alreadyDone: getN('dailyDate', 0) === key, best: getN('dailyBest', 0) };
  }

  // Call when a DAILY game finishes. Updates streak + daily best, awards a
  // first-of-the-day trophy bonus. Returns { firstToday, streak, bonus }.
  function recordDaily(score) {
    const key = todayKey();
    const lastPlayed = getN('dailyDate', 0);
    const firstToday = lastPlayed !== key;
    let streak = getN('streak', 0);
    let bonus = 0;

    if (firstToday) {
      const gap = lastPlayed ? daysBetween(lastPlayed, key) : 999;
      streak = gap === 1 ? streak + 1 : 1; // consecutive day → extend, else reset to 1
      set('streak', streak);
      set('dailyDate', key);
      bonus = CONFIG.DAILY_BONUS_TROPHIES;
    }

    // Daily best resets each day — track which day the stored best belongs to.
    if (getN('dailyBestDate', 0) !== key) { set('dailyBest', score); set('dailyBestDate', key); }
    else if (score > getN('dailyBest', 0)) { set('dailyBest', score); }

    return { firstToday, streak, bonus };
  }

  // Streak is "alive" only if you played today or yesterday.
  function streakInfo() {
    const streak = getN('streak', 0);
    const last = getN('dailyDate', 0);
    if (!last) return { streak: 0, playedToday: false, alive: false };
    const gap = daysBetween(last, todayKey());
    return { streak: gap <= 1 ? streak : 0, playedToday: gap === 0, alive: gap <= 1 };
  }

  // ---------- daily missions ----------
  // Pick 3 missions for today, deterministically from the date so they don't
  // reshuffle on refresh. Progress + claimed flags persist across games.
  function missions() {
    const key = todayKey();
    let state = getJ('missions', null);
    if (!state || state.date !== key) {
      const rng = makeRng(key ^ 0x9e3779b9);
      const pool = [...MISSION_POOL];
      const chosen = [];
      for (let i = 0; i < 3 && pool.length; i++) {
        const idx = Math.floor(rng() * pool.length);
        const m = pool.splice(idx, 1)[0];
        chosen.push({ id: m.id, progress: 0, claimed: false });
      }
      state = { date: key, list: chosen };
      set('missions', state);
    }
    return state;
  }

  function missionDef(id) { return MISSION_POOL.find(m => m.id === id); }

  // Add progress to every active mission of a given type. Called during play.
  // Returns any missions that JUST reached their target (for a toast).
  function addMissionProgress(type, amount) {
    const state = missions();
    const completed = [];
    let changed = false;
    for (const m of state.list) {
      const def = missionDef(m.id);
      if (!def || def.type !== type || m.claimed) continue;
      if (m.progress >= def.target) continue;
      m.progress += amount;
      changed = true;
      if (m.progress >= def.target) completed.push(def);
    }
    if (changed) set('missions', state);
    return completed;
  }

  // Claim a finished mission's reward. Returns coins awarded (0 if not claimable).
  function claimMission(id) {
    const state = missions();
    const m = state.list.find(x => x.id === id);
    const def = missionDef(id);
    if (!m || !def || m.claimed || m.progress < def.target) return 0;
    m.claimed = true;
    set('missions', state);
    addCoins(def.reward);
    return def.reward;
  }

  return {
    todayKey, makeRng,
    trophies, league, addTrophies,
    coins, addCoins,
    ownedChars, character, setCharacter, characterData, ability, grantReward,
    dailyInfo, recordDaily, streakInfo,
    missions, missionDef, addMissionProgress, claimMission,
    TROPHY_ROAD,
  };
})();
