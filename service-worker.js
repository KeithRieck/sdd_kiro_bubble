// Service Worker for Bubble Consumption Game
// This provides offline functionality for the PWA

const CACHE_NAME = 'bubble-game-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.js',
  '/src/scenes/BootScene.js',
  '/src/scenes/PreloaderScene.js',
  '/src/scenes/GameScene.js',
  '/src/entities/Bubble.js',
  '/src/entities/PlayerBubble.js',
  '/src/entities/AIBubble.js',
  '/src/systems/CollisionSystem.js',
  '/src/systems/SpawnSystem.js',
  '/src/ui/HUD.js',
  '/assets/images/logo.png',
  '/assets/images/logo.svg',
  '/assets/images/icon-192.svg',
  '/assets/images/icon-512.svg',
  '/assets/images/icon_128x128.png',
  '/assets/images/icon_192x192.png',
  '/assets/images/icon_512x512.png',
  '/assets/audio/pop.wav',
  '/assets/audio/explosion.wav',
  '/assets/audio/fanfare.wav',
  '/assets/audio/shrink.wav',
  'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, could return a fallback page
        console.log('Service Worker: Fetch failed for', event.request.url);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
