/* ============================================================
   Wicket Rush — GAME TUNING FILE
   ------------------------------------------------------------
   👋 This file is the safest place to experiment!
   Change a number, save, refresh the game, and feel the
   difference. Nothing in here can "break" the code — it only
   changes how the game FEELS.
   ============================================================ */

const CONFIG = {

  // ---------- Batting timing (all in milliseconds) ----------
  // How close your tap must be to the ball reaching the bat.
  // Smaller number = harder. |tap - perfect moment| <= window.
  TIMING: {
    PERFECT: 45,   // → SIX  (6 runs)
    GREAT:   95,   // → FOUR (4 runs)
    GOOD:    145,  // → 2 runs
    OK:      190,  // → 1 run
  },

  // ---------- Ball speed ----------
  FLIGHT_MS_START: 1350, // how long the first ball takes to reach you
  FLIGHT_MS_MIN:   600,  // fastest a ball can ever get
  SPEEDUP_PER_OVER: 0.90, // each over, flight time is multiplied by this

  // ---------- Innings ----------
  BALLS_PER_INNINGS: 12, // the "12-ball challenge" — innings ends here
  WICKETS: 3,            // …or when you lose this many wickets
  BALLS_PER_OVER: 6,
  LEADERBOARD_SIZE: 5,   // how many top scores to remember

  // ---------- Fun stuff ----------
  GOLDEN_BALL_CHANCE: 0.14, // chance a ball is GOLDEN (double runs)
  GOLDEN_MIN_BALL: 4,       // golden balls only appear after this many balls
  STREAK_PER_LEVEL: 4,      // boundaries in a row per +1 multiplier
  MAX_MULTIPLIER: 3,        // score multiplier cap (x3)
  SWING_CURVE_MAX: 60,      // how far a ball can curve sideways (pixels)

  // ---------- Between balls ----------
  RUNUP_MS: 700,         // bowler run-up time
  RESULT_PAUSE_MS: 950,  // pause after each ball to enjoy the moment
  OVER_SUMMARY_MS: 2200, // how long the end-of-over scorecard stays up

  // ---------- Swipe shot placement ----------
  // Tap for timing, then flick your finger to steer the shot!
  SWIPE: {
    MIN_PX: 24,     // finger must travel this far to count as a flick
    WINDOW_MS: 350, // how long after contact you can still steer the ball
  },

  // ---------- Fielders ----------
  // Each ball, fielders take up some of the field positions and leave
  // gaps. Flick into a gap for bonus runs — flick at a fielder and
  // they'll cut the shot off (only a perfect SIX clears everyone).
  FIELDERS: {
    COUNT: 3,        // fielders on the field each ball
    SLOTS: 6,        // field positions they can choose from
    CATCH_ARC: 0.36, // radians — how wide a zone each fielder covers
    GAP_BONUS: 2,    // extra runs for finding the gap
    FIELDED_RUNS: 1, // what a cut-off shot is worth
  },

  // ---------- Coins ----------
  COINS_PER_RUN: 1,      // coins earned per run scored

  // ---------- Trophies ----------
  TROPHIES_PER_RUN: 1,   // trophies earned per run (career total — never lost)
  DAILY_BONUS_TROPHIES: 15, // extra trophies the first time you play the daily
};

/* ---------- Collectible batters (characters) ----------
   Each has a light ability so picking one changes how you play — but no
   character is "pay to win": abilities are small and the game stays skill-first.
   ability keys the code understands: perfectMult, extraWickets, goldenMult, gapBonus  */
const CHARACTERS = [
  { id: 'rookie',  name: 'Rookie',      emoji: '🧢', color: '#2a6fd6',
    desc: 'A balanced all-rounder. Great for learning.',      ability: {} },
  { id: 'slugger', name: 'Big Bash Bo', emoji: '💥', color: '#e8420e',
    desc: 'Bigger SIX timing window — born to smash.',        ability: { perfectMult: 1.35 } },
  { id: 'wall',    name: 'The Wall',    emoji: '🧱', color: '#8a5a2b',
    desc: 'Starts every innings with one extra wicket.',      ability: { extraWickets: 1 } },
  { id: 'lucky',   name: 'Lucky Luna',  emoji: '🍀', color: '#2fae5a',
    desc: 'Golden balls appear twice as often.',              ability: { goldenChanceMult: 2 } },
  { id: 'ninja',   name: 'Gap Ninja',   emoji: '🥷', color: '#5b3fb0',
    desc: 'Finding a gap pays +1 extra run.',                 ability: { gapBonus: 1 } },
];

/* ---------- Trophy Road ----------
   Milestones you pass as your career trophy total grows. Each hands out a
   reward automatically — a new character, a bat skin, or a pile of coins.
   This is the long-term "climb" that keeps kids coming back.
   reward types: 'character' | 'skin' | 'coins'  */
const TROPHY_ROAD = [
  { trophies: 40,   reward: { type: 'coins', amount: 100 } },
  { trophies: 90,   reward: { type: 'character', id: 'slugger' } },
  { trophies: 180,  reward: { type: 'skin', id: 'neon' } },
  { trophies: 320,  reward: { type: 'character', id: 'wall' } },
  { trophies: 500,  reward: { type: 'coins', amount: 300 } },
  { trophies: 750,  reward: { type: 'character', id: 'lucky' } },
  { trophies: 1100, reward: { type: 'skin', id: 'galaxy' } },
  { trophies: 1600, reward: { type: 'character', id: 'ninja' } },
  { trophies: 2400, reward: { type: 'skin', id: 'gold' } },
];

/* ---------- Leagues (rank badges) ----------
   Just a friendly name + colour for your current trophy total, shown on the
   home screen. Climbing into a new league feels like levelling up.  */
const LEAGUES = [
  { name: 'Bronze',   min: 0,    color: '#cd7f32', icon: '🥉' },
  { name: 'Silver',   min: 100,  color: '#b8c4cc', icon: '🥈' },
  { name: 'Gold',     min: 300,  color: '#ffd93b', icon: '🥇' },
  { name: 'Platinum', min: 600,  color: '#5ec8ff', icon: '💎' },
  { name: 'Diamond',  min: 1100, color: '#7dd3ff', icon: '💠' },
  { name: 'Legend',   min: 2000, color: '#b06cff', icon: '👑' },
];

/* ---------- Missions ----------
   Three are active each day. Progress builds up across every game you play
   that day; finish one to claim its coin reward. New set every day.
   type keys the code understands:
     sixes, fours, boundaries, gaps, golden, scoreOneGame, runsTotal, gamesPlayed  */
const MISSION_POOL = [
  { id: 'm_six3',    type: 'sixes',       target: 3,  reward: 40,  text: 'Hit 3 SIXES' },
  { id: 'm_six6',    type: 'sixes',       target: 6,  reward: 80,  text: 'Hit 6 SIXES' },
  { id: 'm_four5',   type: 'fours',       target: 5,  reward: 40,  text: 'Hit 5 FOURS' },
  { id: 'm_bnd8',    type: 'boundaries',  target: 8,  reward: 60,  text: 'Hit 8 boundaries' },
  { id: 'm_gap4',    type: 'gaps',        target: 4,  reward: 60,  text: 'Find the gap 4 times' },
  { id: 'm_gold2',   type: 'golden',      target: 2,  reward: 70,  text: 'Smash 2 GOLDEN balls' },
  { id: 'm_score25', type: 'scoreOneGame',target: 25, reward: 60,  text: 'Score 25 in one game' },
  { id: 'm_score40', type: 'scoreOneGame',target: 40, reward: 120, text: 'Score 40 in one game' },
  { id: 'm_runs80',  type: 'runsTotal',   target: 80, reward: 70,  text: 'Score 80 runs total' },
  { id: 'm_play3',   type: 'gamesPlayed', target: 3,  reward: 40,  text: 'Play 3 games' },
];

/* ---------- Delivery types (the AI bowler's bag of tricks) ----------
   weight   : how often the bowler picks it (relative)
   flight   : flight-time multiplier (lower = faster ball)
   window   : timing-window multiplier (lower = harder to time)
   bonus    : extra runs added to a boundary off this ball
   catchRisk: chance a WEAK hit (1-run timing) is caught out       */
const DELIVERIES = [
  { id: 'normal', name: '',              weight: 40, flight: 1.00, window: 1.00, bonus: 0, catchRisk: 0   },
  { id: 'fast',   name: '⚡ FAST BALL',  weight: 15, flight: 0.75, window: 1.00, bonus: 2, catchRisk: 0   },
  { id: 'slower', name: '🐢 SLOWER BALL',weight: 15, flight: 1.28, window: 1.00, bonus: 0, catchRisk: 0   },
  { id: 'yorker', name: '🎯 YORKER',     weight: 15, flight: 0.90, window: 0.70, bonus: 1, catchRisk: 0   },
  { id: 'short',  name: '⬆️ SHORT BALL', weight: 15, flight: 1.12, window: 1.35, bonus: 0, catchRisk: 0.5 },
];

/* ---------- Bat skins (the shop) ----------
   Add your own! Just copy a line and change the values.
   colors: [top of bat, bottom of bat], trail: particle color when you hit.  */
const SKINS = [
  { id: 'classic', name: 'Classic Willow', price: 0,    colors: ['#e8c27a', '#c89b52'], trail: '#ffffff' },
  { id: 'neon',    name: 'Neon Blaze',     price: 100,  colors: ['#39ffb0', '#00c2ff'], trail: '#39ffb0' },
  { id: 'fire',    name: 'Fire Striker',   price: 250,  colors: ['#ffb830', '#ff4d00'], trail: '#ff7a3c' },
  { id: 'galaxy',  name: 'Galaxy Smash',   price: 500,  colors: ['#b06cff', '#4322a8'], trail: '#d9a8ff' },
  { id: 'gold',    name: 'Golden Legend',  price: 1000, colors: ['#ffe680', '#d4a017'], trail: '#ffd93b' },
];
