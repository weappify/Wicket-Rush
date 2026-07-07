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
- Timing decides the shot: perfect = **SIX**, great = **FOUR**, okay = 1–2 runs, miss = **BOWLED**.
- The AI bowler mixes up **five delivery types**, each with different consequences:
  - ⚡ **Fast ball** — less time to react, but boundaries earn bonus runs
  - 🐢 **Slower ball** — punishes swinging early
  - 🎯 **Yorker** — deceptive: the timing window shrinks
  - ⬆️ **Short ball** — easier to hit, but a weak poke can get you **CAUGHT**
- Every over the bowling gets faster.
- Boundary streaks light a 🔥 **multiplier** (up to x3). ✨ **Golden balls** are worth double.
- Runs become 🪙 coins. Spend them in the **Bat Shop** on cosmetic bat skins.
- Your **top 5 scores** live on the results screen. **Challenge a friend** shares your score.

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
| `js/config.js` | **Every game number** — speeds, timing windows, prices, skins | ⭐ Start here! |
| `css/style.css` | Colors, buttons, menus | ⭐⭐ |
| `js/audio.js` | All sound effects (synthesized in code!) | ⭐⭐ |
| `js/game.js` | The game itself — drawing, physics, scoring | ⭐⭐⭐ |
| `sw.js` / `manifest.webmanifest` | Makes it installable & offline | ⭐⭐⭐ |

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

## Tech

Vanilla JavaScript + Canvas. Zero dependencies, zero build step, ~30 KB total.
Works offline as a PWA. Sounds are generated with the Web Audio API (no audio files).
