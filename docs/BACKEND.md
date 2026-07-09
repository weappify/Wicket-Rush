# 🔌 Adding a Backend (Firebase) — for when you need it, not before

**You do not need this to launch.** Wicket Rush is a fully static app and runs great
on GitHub Pages with everything saved on the device. Keep it that way until a feature
*genuinely* needs a shared server. This doc is the ready-to-go plan for that day.

---

## 1. Do you actually need a backend yet?

Add one only when you want something that **must be shared across devices**:

| You want… | Backend needed? | First choice |
|---|---|---|
| A **global / friends leaderboard** | ✅ Yes | Firebase Firestore |
| **Cloud save** (same progress on iPad + phone) | ✅ Yes | Firebase (Auth + Firestore) |
| **Online multiplayer** | ✅ Yes | Firebase Realtime DB / a game server |
| **Remote config / weekly events** you can change without a redeploy | ✅ Yes | Firebase Remote Config |
| Anything you already have (scores, coins, trophies, missions, streak) | ❌ No | stays on-device |

👉 **Recommended first backend feature: a leaderboard.** It's the highest-value,
lowest-complexity thing to add, and the rest of this doc walks through exactly that.

The rule from GROWTH.md still holds: **prove kids replay first** (watch the 📊 Stats),
*then* add the server. A leaderboard makes a fun game stickier; it does not make an
unfun game fun.

---

## 2. Why the current code makes this easy

All player data already flows through **one file — `js/progression.js`**. It's the single
source of truth. A backend doesn't replace it; it just *mirrors* the numbers you choose
(e.g. the final score) up to the cloud. That means adding Firebase is a small, contained
change — not a rewrite.

The natural hook point is the end of an innings in `js/game.js`:

```js
// in endInnings(), right after the score is finalised:
Stats.recordScore(G.score, dailyStreak);
// 👇 the one line you'd add later:
if (window.Leaderboard) Leaderboard.submitScore(G.score, G.daily);
```

---

## 3. Firebase setup (about 15 minutes)

### 3a. Create the project
1. Go to <https://console.firebase.google.com> → **Add project** → name it `wicket-rush`.
   (You can turn Google Analytics **off** — you don't need it and it simplifies COPPA.)
2. In the project, **Build → Firestore Database → Create database → Production mode**.
3. **Build → Authentication → Get started → Sign-in method → Anonymous → Enable.**
   Anonymous auth gives each device an ID **without collecting any personal data** —
   important for a kids' game (see §5).

### 3b. Register a web app
- Project settings (⚙️) → **Your apps → Web (`</>`)** → register `wicket-rush`.
- Copy the `firebaseConfig` object it shows you. It looks like:

```js
const firebaseConfig = {
  apiKey: "AIza...",              // safe to ship publicly — it's an identifier, not a secret
  authDomain: "wicket-rush.firebaseapp.com",
  projectId: "wicket-rush",
  // ...
};
```

> The `apiKey` is **not** a password — it's fine to commit. Your data is protected by the
> Security Rules in §4, not by hiding the key.

---

## 4. Kid-safe Firestore Security Rules

Paste these in **Firestore → Rules**. They let a signed-in device write **only its own**
score row, cap the values so nobody can inject a fake 999999, and store **no personal
data** — just a random in-game handle and a number.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Anyone signed in (anonymously) can read the leaderboard.
    // A device may only create/update the row keyed to its own uid.
    match /scores/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.auth.uid == uid
                   && request.resource.data.score is int
                   && request.resource.data.score >= 0
                   && request.resource.data.score <= 500        // sanity cap
                   && request.resource.data.handle is string
                   && request.resource.data.handle.size() <= 16; // no essays, no PII
    }

    // Daily challenge board, one row per device per day
    match /daily/{dayId}/scores/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.auth.uid == uid
                   && request.resource.data.score is int
                   && request.resource.data.score >= 0
                   && request.resource.data.score <= 500;
    }
  }
}
```

---

## 5. Kid-safety & privacy checklist ⚠️

A leaderboard is the point where a kids' game can accidentally collect personal data or
expose kids to each other. Design it safe from day one:

- **No real names.** Generate a fun random handle (`SixMachine_Tiger`) — never ask for
  a name, email, or photo. Store only that handle + the score.
- **Anonymous auth only.** No Google/Apple/email sign-in for under-13s.
- **No chat, no free-text** that other players can see.
- **Profanity-filter the random handle generator** (curate the word lists so it can't
  produce anything rude).
- This keeps you aligned with **COPPA / Apple Kids / Google Families** rules. If you ever
  add real accounts, you enter verifiable-parental-consent territory — a much bigger step.

---

## 6. Drop-in `js/leaderboard.js` (for later)

When you're ready, add this file and one `<script>` tag. It uses Firebase's modular CDN
build, signs in anonymously, and exposes `submitScore` / `getTop`. Until this file exists,
the `if (window.Leaderboard)` guard in §2 means the game runs exactly as it does now.

```js
// js/leaderboard.js  (loaded as <script type="module">)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  getFirestore, doc, setDoc, collection, query, orderBy, limit, getDocs
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = { /* paste from §3b */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let uid = null;
signInAnonymously(auth).then(c => { uid = c.user.uid; });

// A fun, safe handle stored on the device (curate these lists!)
function handle() {
  let h = localStorage.getItem('wr_handle');
  if (!h) {
    const a = ['Six','Cover','Yorker','Spin','Turbo','Mega','Ninja','Rapid'];
    const b = ['Machine','Tiger','Blaster','Ace','Comet','Legend','Bolt','Smash'];
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    h = `${pick(a)}${pick(b)}${Math.floor(Math.random()*90+10)}`;
    localStorage.setItem('wr_handle', h);
  }
  return h;
}

window.Leaderboard = {
  async submitScore(score, isDaily) {
    if (!uid) return;                       // not signed in yet — skip quietly
    // Only submit a personal best to the all-time board
    const best = +localStorage.getItem('wr_best') || 0;
    if (!isDaily && score >= best) {
      await setDoc(doc(db, 'scores', uid), { handle: handle(), score, ts: Date.now() });
    }
    if (isDaily) {
      const dayId = new Date().toISOString().slice(0, 10);   // YYYY-MM-DD
      await setDoc(doc(db, 'daily', dayId, 'scores', uid), { handle: handle(), score, ts: Date.now() });
    }
  },
  async getTop(n = 20) {
    const q = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(n));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());     // [{handle, score}, …]
  },
};
```

Then in `index.html`, after the other scripts:

```html
<script type="module" src="js/leaderboard.js"></script>
```

…and add a **Leaderboard screen** modeled on the existing Trophy Road screen in
`js/game.js` (call `Leaderboard.getTop()` and render the rows). The share button already
gives you a head start on the social loop.

> **PWA note:** the service worker in `sw.js` only caches the local files it lists and
> falls through to the network for everything else, so Firestore calls work fine offline-
> first with no change. Just remember to bump the `VERSION` in `sw.js` when you add files.

---

## 7. What it costs

- Firebase **Spark (free) plan**: no credit card, generous for a friends test and early
  launch — on the order of ~50k reads and ~20k writes **per day** for Firestore.
- One leaderboard read = one screen open (you can cache it for a minute to cut reads).
  One write = one new personal best. A few hundred kids fit comfortably in free tier.
- You only pay (Blaze plan, pay-as-you-go) once you're well past that — a good problem to
  have, and by then the game is earning via the MONETIZATION.md plan.

---

## 8. Alternatives to Firebase (all fine)

- **Supabase** — open-source, Postgres + row-level security, similar free tier. Nicer if
  you prefer SQL.
- **Cloudflare Workers + KV/D1** — cheapest at scale, a bit more DIY.
- **A tiny serverless function** (Vercel/Netlify) in front of any database.
- **No backend at all, longer** — lean on the share-a-score link and per-device stats.
  Perfectly valid until a real leaderboard is clearly wanted.

Firebase is recommended first because it bundles auth + database + hosting + remote config
in one console, has the gentlest learning curve, and is a great project for you and your
son to learn a real backend on together.

---

### TL;DR
Ship on GitHub Pages now. Add Firebase the day you want a **cross-device leaderboard or
cloud save** — it's a ~1-file, ~15-minute addition thanks to all save logic living in
`progression.js`, and the kid-safe rules above keep it compliant from the first write.
