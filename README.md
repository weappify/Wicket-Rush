# 🏏 Wicket Rush

**The fast, fun cricket batting game.** One tap. Perfect timing. SIX!

A mobile-first HTML5 game built for phones and iPads. No app store needed to start playing —
it runs in any browser and can be installed to the home screen like a real app (PWA).

## ▶ Play it locally

No build tools, no dependencies. Any static file server works:

```bash
# from the repo root
python3 -m http.server 8000
# then open http://localhost:8000 on your phone/computer
```

To try it on your phone/iPad on the same Wi-Fi, open `http://<your-computer-ip>:8000`.

## 🚀 Deploy it free (2 minutes)

Enable **GitHub Pages** for this repo (Settings → Pages → deploy from branch → root).
That gives you a public URL you can send to anyone — kids can add it to their iPad
home screen via Share → *Add to Home Screen* and it behaves like a native app,
fullscreen and offline.

## 🎮 How the game works — the 12-ball challenge

- You get **12 balls and 3 wickets**. Smash the biggest score you can.
- A bowler bowls at you; **tap anywhere** when the ball reaches your bat.
- **Flick as you tap to place the shot** — pull, cut, straight drive, or a cheeky scoop.
- **Fielders take up positions every ball**, leaving gaps: flick into a gap for **+2 bonus
  runs**, but flick at a fielder and they cut it off to a single. Only a perfect **SIX**
  sails over everyone. A plain tap is always safe (no bonus, no penalty).
- An **over summary** scorecard shows your runs after each over — then the bowling speeds up.
- Timing decides the shot: perfect = **SIX**, great = **FOUR**, okay = 1–2 runs, miss = **BOWLED**.
- It's played on a proper **oval ground with a boundary rope** — hit a SIX and the camera
  follows the ball up and over the rope, with fireworks from the crowd. 🎆
- The AI bowler mixes up **five delivery types**, each with different consequences:
  - ⚡ **Fast ball** — less time to react, but boundaries earn bonus runs
  - 🐢 **Slower ball** — punishes swinging early
  - 🎯 **Yorker** — deceptive: the timing window shrinks
  - ⬆️ **Short ball** — easier to hit, but a weak poke can get you **CAUGHT**
- Every over the bowling gets faster.
- Boundary streaks light a 🔥 **multiplier** (up to x3). ✨ **Golden balls** are worth double.
- Runs become 🪙 coins. Spend them in the **Bat Shop** on cosmetic bat skins.
- Your **top 5 scores** live on the results screen. **Challenge a friend** shares your score.

### The "come back tomorrow" loop 🔁

- **📅 Daily Challenge** — the same 12 balls and field for *every player that day* (seeded, no
  server). A fair race you can screenshot and challenge friends to beat.
- **🔥 Play streak** — play the daily on consecutive days to grow your streak; skip a day and it resets.
- **🎯 Daily Missions** — three goals a day ("hit 3 sixes", "find the gap 4 times") that pay coins.
- **🏆 Trophy Road** — every run earns career trophies that never reset; passing milestones unlocks
  characters and bat skins, and climbs you through leagues (Bronze → Legend).
- **🧑‍🎤 Collectible batters** — unlock characters with light abilities (bigger six window, an extra
  wicket, more golden balls, bigger gap bonus). Collection + variety, never pay-to-win.

## 🧭 Why web-first (and when Unity)

This MVP is deliberately a web/PWA build, matching the "mobile web version first, then
iOS/Android wrapper" plan: it is testable by real kids **today** with a link — no app store,
no $124 in developer accounts, no installs — which is exactly what v0.1 must prove:
*"Do kids voluntarily replay this after one match?"* If retention proves out, the paths up are:
**Capacitor** (wrap this exact codebase as iOS/Android apps with IAP/ads) or a **Unity rebuild**
(if the game evolves toward real-time 1v1/3v3 multiplayer, where Unity earns its weight).
All game rules live in `js/config.js` (the ScriptableObject equivalent), so the design tuning
transfers directly whichever path we take.

## 🗂 Project tour (for new game developers 👋)

| File | What it does | Difficulty to modify |
|---|---|---|
| `js/config.js` | **Every game number** — speeds, timing, prices, skins, characters, missions, trophy road | ⭐ Start here! |
| `css/style.css` | Colors, buttons, menus | ⭐⭐ |
| `js/analytics.js` | Private on-device play counters (the 📊 Stats screen) — no network, ever | ⭐⭐ |
| `js/audio.js` | All sound effects (synthesized in code!) | ⭐⭐ |
| `js/progression.js` | Daily challenge, streak, missions, trophies, characters (the "come back" loop) | ⭐⭐⭐ |
| `js/game.js` | The game itself — drawing, physics, scoring | ⭐⭐⭐ |
| `sw.js` / `manifest.webmanifest` | Makes it installable & offline | ⭐⭐⭐ |

Want a new mission, character, or Trophy Road reward? They're all plain data lists at the bottom
of `js/config.js` (`MISSION_POOL`, `CHARACTERS`, `TROPHY_ROAD`) — add a line and it just appears.

### Fun first projects (great for a 14-year-old co-developer)

1. **Balance patch** — open `js/config.js`, make the game harder/easier, playtest with friends.
2. **Design a new bat skin** — add one line to `SKINS` in `config.js`. Instant content.
3. **New sound** — tweak the frequencies in `js/audio.js` and hear the difference.
4. **New shot type** — add a "GLANCE" timing window worth 3 runs.
5. **Bigger features** — daily challenge, night stadium theme, a second bowler with spin,
   local 2-player pass-and-play ("beat my over").

## 📈 Plans

- [docs/MONETIZATION.md](docs/MONETIZATION.md) — how a free game like this makes money (the Brawl Stars playbook, kid-safe version)
- [docs/GROWTH.md](docs/GROWTH.md) — how to get downloads and make it spread among kids
- [docs/BACKEND.md](docs/BACKEND.md) — you **don't** need a server now; this is the ready-to-go Firebase plan for the day you want a cross-device leaderboard or cloud save

## Tech

Vanilla JavaScript + Canvas. Zero dependencies, zero build step, ~30 KB total.
Works offline as a PWA. Sounds are generated with the Web Audio API (no audio files).
