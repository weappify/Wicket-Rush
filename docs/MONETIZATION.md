# 💰 Wicket Rush — Monetization Plan

## The model: free-to-play, like Brawl Stars

Games like Brawl Stars, Subway Surfers and Stumble Guys are free and still make money
because **the download is the top of a funnel**, not the product. The product is:

1. **A daily habit** (short sessions, streaks, "one more go")
2. **Status and self-expression** (skins, cosmetics your friends can see)
3. **Impatience** (progress you can speed up by paying)
4. **Attention** (ads shown to the players who never pay — ~95% of them)

Wicket Rush's MVP already contains the seed of this loop: **runs → coins → bat skins**.
Everything below builds on that loop without making the game pay-to-win
(pay-to-win kills word-of-mouth among kids — they call it out instantly).

## Revenue streams, in the order to add them

### 1. Rewarded ads (first, easiest, kid-acceptable)
Players *choose* to watch a 15–30s ad for a reward. No forced interstitials.
- "Watch an ad to **double your coins**" on the game-over screen
- "Watch an ad for a **second innings**" (one revive per game)
- Typical earnings: $10–$40 per 1,000 rewarded views (varies by country/season)
- Because the player opts in, it doesn't feel like an ad — it feels like a power-up.

### 2. Cosmetic IAP (the Brawl Stars core)
Real-money purchases that change *looks only*:
- Bat skins, ball trails, batter outfits, stadium themes, victory celebrations
- A premium currency ("Gems") so pricing is flexible: $1.99 / $4.99 / $9.99 packs
- Limited-time & seasonal skins (Diwali bat, World Cup kits, Halloween stadium) — scarcity sells
- **Never** sell runs, easier timing, or extra wickets. Skill stays sacred.

### 3. Season Pass / "Wicket Pass" (the biggest earner in this genre)
A 4–6 week track of ~30 reward tiers you climb by playing:
- Free track for everyone; **premium track ($4.99)** with the coolest skins
- This is Brawl Pass / Battle Pass economics: it converts your most engaged players
  and *increases retention* at the same time, because progress feels wasted if you stop.

### 4. "Remove ads" one-time purchase ($2.99)
A single purchase for parents who'd rather pay once. Costs nothing to add, always converts a few percent.

## ⚠️ Kids + money: the rules that keep you out of trouble

Your audience is under-13 to teen. This changes which ad tech you're allowed to use:

- **COPPA (US) / GDPR-K (EU)**: no behavioral/tracking ads for under-13s.
  Use kid-certified ad networks — **SuperAwesome (AwesomeAds), Kidoz, AdMob with
  "child-directed" flag** — which serve contextual ads only.
- **App-store Kids rules**: Apple's Kids Category forbids third-party trackers and
  requires a parental gate before purchases/links. Google Play has the "Designed for Families" program.
- Show clear pricing, no dark patterns, purchases behind a parental gate
  (e.g. "hold 3 seconds" + a simple math question).
- This also *sells*: "kid-safe, no creepy tracking" is a feature parents tell other parents about.

## Distribution path (where the money can actually flow)

| Stage | Platform | Monetization available |
|---|---|---|
| **Now (MVP)** | Web / PWA via GitHub Pages — free hosting, instant updates | None yet — focus on fun & retention |
| **Stage 2** | Web + rewarded ads (kid-safe network), share loop | Rewarded ads |
| **Stage 3** | Wrap with **Capacitor** into iOS/Android apps (same codebase!) | IAP + season pass + ads |
| **Stage 4** | Also publish to **Poki / CrazyGames / itch.io** (huge kid traffic, they handle ads & pay rev-share) | Their rev-share (~50%) with zero ad work |

Poki/CrazyGames are underrated: they bring **millions of kids browsing for games**
and pay web-game developers a revenue share — often the fastest first dollar for an HTML5 game.

## What NOT to do

- ❌ Forced interstitial ads between innings (kids leave, parents delete)
- ❌ Pay-to-win (kills playground word-of-mouth)
- ❌ Loot boxes with real money (regulatory minefield for minors, banned in some countries)
- ❌ Monetizing before retention — if day-1 retention is weak, ads just monetize people leaving

## The order of operations

**Fun → Retention → Distribution → Monetization.** Measure first:
if ~40% of players come back the next day, you have a business; then turn on rewarded ads,
then cosmetics, then the pass. Add simple, privacy-safe analytics (e.g. self-hosted Plausible
or aggregate-only counters) to know your retention before spending on anything else.
