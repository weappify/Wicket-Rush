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

## 🎮 How the game works

- A bowler bowls at you; **tap anywhere** when the ball reaches your bat.
- Timing decides the shot: perfect = **SIX**, great = **FOUR**, okay = 1–2 runs, miss = **wicket**.
- You have 3 wickets. Every over the bowling gets faster.
- Boundary streaks light a 🔥 **multiplier** (up to x3). ✨ **Golden balls** are worth double.
- Runs become 🪙 coins. Spend them in the **Bat Shop** on cosmetic bat skins.
- Best score is saved on the device. **Challenge a friend** shares your score.

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
