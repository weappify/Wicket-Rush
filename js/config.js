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

  // ---------- Coins ----------
  COINS_PER_RUN: 1,      // coins earned per run scored
};

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
