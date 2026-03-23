// ══════════════════════════════════════════
//  SERVICE WORKER — ECG Simulador PWA
// ══════════════════════════════════════════

const CACHE_NAME = 'ecg-sim-v1';

// Archivos que se guardan para funcionar sin internet
const ARCHIVOS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// ── INSTALL — guarda los archivos en caché ──
self.addEventListener('install', e => {
  console.log('📦 Service Worker: instalando...');
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Archivos guardados en caché');
        return cache.addAll(ARCHIVOS);
      })
  );
});

// ── ACTIVATE — limpia cachés viejas ──
self.addEventListener('activate', e => {
  console.log('🚀 Service Worker: activado');
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('🗑 Borrando caché vieja:', key);
            return caches.delete(key);
          })
      )
    )
  );
});

// ── FETCH — sirve desde caché si no hay internet ──
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(cached => {
        if (cached) {
          return cached; // ← responde desde caché (sin internet)
        }
        return fetch(e.request); // ← si hay internet, busca en la red
      })
  );
});