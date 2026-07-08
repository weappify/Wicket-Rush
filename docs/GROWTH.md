# 📈 Wicket Rush — Growth Plan (how it spreads among kids)

Kids' games don't grow through marketing budgets. They grow through
**playground word-of-mouth, shared devices, and short-form video**. Every feature
below is a growth feature, not a marketing task.

## Why this game can spread

- **10-second rule**: a kid understands it from watching one ball being hit. No tutorial needed.
- **"Beat my score" is the whole loop**: one-tap gameplay + visible score = instant rivalry.
- **Runs on anything**: school Chromebooks, old iPads, parents' phones — no download, no account.
  (Games that run on school Chromebooks at lunchtime is literally how several web games blew up.)

## Built into the MVP already

- ✅ **Challenge a friend** share button ("I smashed 47 runs — beat me!") using the native share sheet
- ✅ Home-screen install (PWA) — the game keeps its icon on their iPad like a real app
- ✅ Sessions under 90 seconds — fits recess, car rides, "5 more minutes before dinner"
- ✅ Streak/multiplier + golden balls — creates "NO WAY, x3 golden six!" moments kids retell

## Next growth features (rough priority order)

1. **Challenge links** — share encodes your score; opening it shows
   "Ankit's son scored 61. Your turn." Head-to-head, no server needed at first.
2. **Weekly leaderboard** — school-friendly: compare with friends via a simple room code.
3. **Daily challenge** — same 18 balls for everyone each day (seeded random) → daily habit + shared topic.
4. **Name & avatar picker** (no accounts, no personal data — just a funny name generator like
   "SixMachine_Tiger"). Identity = attachment.
5. **Recordable moments** — a "replay of your best six" that kids screen-record for
   TikTok / YouTube Shorts / WhatsApp status.
6. **Seasonal events** — World Cup mode, festive skins. Events give lapsed players a reason to return.

## Launch checklist (zero budget)

1. **Deploy to GitHub Pages** → you have a URL today.
2. **Family & friends alpha (week 1)**: your son's friend group is the perfect focus group.
   Watch them play *in person* — where they laugh, where they quit. Fix the quit points.
3. **Submit to web game portals**: Poki, CrazyGames, itch.io, Newgrounds. They have
   built-in discovery with millions of kid players — this is the #1 free distribution channel for HTML5 games.
4. **Short-form video**: 15-second clips — "POV: last ball, need a six", golden-ball jackpots,
   "my dad vs me". Your son making these is both marketing *and* his product education.
5. **Cricket communities**: r/Cricket game threads, cricket Discord servers, school cricket teams.
   Cricket is a passionate, underserved niche in casual games (huge in India, UK, Australia — 
   a billion+ fans and far fewer good casual cricket games than football ones).
6. **App stores later**: once web retention is proven, wrap with Capacitor and launch on
   Google Play first (cheaper, faster review), then iOS.

## Metrics that matter (in order)

1. **D1 retention** — % who come back tomorrow (target 35–45% for hyper-casual)
2. **Sessions per day** and session length
3. **Shares per player** (K-factor — is the challenge button being pressed?)
4. Only after those: revenue per player

### Reading the built-in 📊 Stats screen (during your friends test)

The game ships with a **private, on-device** stats panel (tap 📊 on the home screen).
Nothing is ever sent anywhere — it's just counters in that phone's storage, so it's
COPPA-safe and needs no backend. On each kid's device after a play session, look at:

- **“Bat Again” taps (replays)** and **Play sessions** — the clearest "do they replay
  voluntarily?" signal. High replays per session = the core loop is fun.
- **Days played** / **Days since first game** — hand them the device again a few days
  later; if "Days played" climbed without you prompting, you have real retention.
- **Times shared / challenged** — is the social loop firing on its own?
- **Daily Challenge games** vs **Free-play games** and **Best daily streak** — is the
  daily habit taking hold?

Use **📋 Copy** to grab a JSON snapshot you can paste into a note per tester, and
**🗑 Reset** to zero a device before handing it to the next kid for a clean read.
When you're ready for real cross-device numbers later, swap this for a privacy-first,
kid-safe analytics service (e.g. self-hosted Plausible or aggregate-only counts).

## The 14-year-old co-founder angle 🚀

Your son is the target demographic — that's a superpower:
- He can playtest with the exact audience daily and report what's "mid" vs "fire"
- Give him ownership of *content*: skins, sounds, event ideas, TikTok clips
  (`js/config.js` is designed so he can ship a new skin in one line)
- Weekly "patch notes" ritual: he proposes changes, you review the diff together —
  that's a real product team, and a great way to learn git, JS, and game design.
