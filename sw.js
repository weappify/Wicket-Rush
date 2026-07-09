/* Wicket Rush — service worker.
   Caches the whole game so it loads instantly and works offline
   (great for kids on iPads without Wi-Fi!).
   Bump VERSION whenever you change any game file. */

const VERSION = 'wicket-rush-v8';
const ASSETS = [
  '.',
  'index.html',
  'css/style.css',
  'js/config.js',
  'js/analytics.js',
  'js/progression.js',
  'js/audio.js',
  'js/game.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request))
  );
});
