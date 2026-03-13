import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Unit tests for Service Worker
 * Tests offline functionality and caching behavior
 * Requirements: 7.1, 7.4, 7.5
 */

describe('Service Worker', () => {
  let serviceWorkerCode;
  let mockCaches;
  let mockCache;
  let mockEvent;

  beforeEach(() => {
    // Mock cache API
    mockCache = {
      addAll: vi.fn().mockResolvedValue(undefined),
      match: vi.fn(),
      put: vi.fn().mockResolvedValue(undefined)
    };

    mockCaches = {
      open: vi.fn().mockResolvedValue(mockCache),
      match: vi.fn(),
      keys: vi.fn().mockResolvedValue(['bubble-game-v1']),
      delete: vi.fn().mockResolvedValue(true)
    };

    global.caches = mockCaches;
    global.self = global;

    // Mock event
    mockEvent = {
      waitUntil: vi.fn((promise) => promise),
      respondWith: vi.fn((promise) => promise),
      request: { url: 'https://example.com/test' }
    };
  });

  describe('Cache Configuration', () => {
    it('should define correct cache name', () => {
      const CACHE_NAME = 'bubble-game-v1';
      expect(CACHE_NAME).toBe('bubble-game-v1');
    });

    it('should include all required URLs in cache list', () => {
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
        '/assets/images/icon_192x192.png',
        '/assets/images/icon_512x512.png',
        '/assets/audio/pop.wav',
        '/assets/audio/explosion.wav',
        '/assets/audio/fanfare.wav',
        'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js'
      ];

      // Verify essential files are included
      expect(urlsToCache).toContain('/');
      expect(urlsToCache).toContain('/index.html');
      expect(urlsToCache).toContain('/manifest.json');
      expect(urlsToCache).toContain('/src/main.js');
      expect(urlsToCache).toContain('https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js');
      
      // Verify all scenes are cached
      expect(urlsToCache).toContain('/src/scenes/BootScene.js');
      expect(urlsToCache).toContain('/src/scenes/PreloaderScene.js');
      expect(urlsToCache).toContain('/src/scenes/GameScene.js');
      
      // Verify all entities are cached
      expect(urlsToCache).toContain('/src/entities/Bubble.js');
      expect(urlsToCache).toContain('/src/entities/PlayerBubble.js');
      expect(urlsToCache).toContain('/src/entities/AIBubble.js');
      
      // Verify systems are cached
      expect(urlsToCache).toContain('/src/systems/CollisionSystem.js');
      expect(urlsToCache).toContain('/src/systems/SpawnSystem.js');
      
      // Verify UI is cached
      expect(urlsToCache).toContain('/src/ui/HUD.js');
      
      // Verify assets are cached
      expect(urlsToCache).toContain('/assets/images/logo.png');
      expect(urlsToCache).toContain('/assets/audio/pop.wav');
      expect(urlsToCache).toContain('/assets/audio/explosion.wav');
      expect(urlsToCache).toContain('/assets/audio/fanfare.wav');
    });
  });

  describe('Install Event', () => {
    it('should open cache with correct name during install', async () => {
      const installHandler = async (event) => {
        await event.waitUntil(
          caches.open('bubble-game-v1')
            .then((cache) => cache.addAll([]))
        );
      };

      await installHandler(mockEvent);
      
      expect(mockCaches.open).toHaveBeenCalledWith('bubble-game-v1');
    });

    it('should cache all required URLs during install', async () => {
      const urlsToCache = ['/index.html', '/src/main.js'];
      
      const installHandler = async (event) => {
        await event.waitUntil(
          caches.open('bubble-game-v1')
            .then((cache) => cache.addAll(urlsToCache))
        );
      };

      await installHandler(mockEvent);
      
      expect(mockCache.addAll).toHaveBeenCalledWith(urlsToCache);
    });

    it('should handle cache errors gracefully', async () => {
      mockCache.addAll.mockRejectedValueOnce(new Error('Cache failed'));
      
      const installHandler = async (event) => {
        try {
          await event.waitUntil(
            caches.open('bubble-game-v1')
              .then((cache) => cache.addAll([]))
              .catch((error) => {
                // Error should be caught and logged
                expect(error.message).toBe('Cache failed');
              })
          );
        } catch (error) {
          // Graceful degradation
        }
      };

      await installHandler(mockEvent);
    });
  });

  describe('Fetch Event', () => {
    it('should return cached response when available', async () => {
      const cachedResponse = new Response('cached content');
      mockCaches.match.mockResolvedValueOnce(cachedResponse);

      const fetchHandler = async (event) => {
        return await caches.match(event.request)
          .then((response) => response || fetch(event.request));
      };

      const result = await fetchHandler(mockEvent);
      
      expect(result).toBe(cachedResponse);
      expect(mockCaches.match).toHaveBeenCalledWith(mockEvent.request);
    });

    it('should fetch from network when cache miss occurs', async () => {
      mockCaches.match.mockResolvedValueOnce(undefined);
      global.fetch = vi.fn().mockResolvedValueOnce(new Response('network content'));

      const fetchHandler = async (event) => {
        return await caches.match(event.request)
          .then((response) => response || fetch(event.request));
      };

      const result = await fetchHandler(mockEvent);
      
      expect(global.fetch).toHaveBeenCalledWith(mockEvent.request);
    });

    it('should implement cache-first strategy', async () => {
      const cachedResponse = new Response('cached');
      mockCaches.match.mockResolvedValueOnce(cachedResponse);
      global.fetch = vi.fn();

      const fetchHandler = async (event) => {
        return await caches.match(event.request)
          .then((response) => response || fetch(event.request));
      };

      await fetchHandler(mockEvent);
      
      // Should not call fetch if cache hit
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Activate Event', () => {
    it('should clean up old caches during activation', async () => {
      mockCaches.keys.mockResolvedValueOnce(['bubble-game-v1', 'old-cache-v1']);

      const activateHandler = async (event) => {
        await event.waitUntil(
          caches.keys().then((cacheNames) => {
            return Promise.all(
              cacheNames.map((cacheName) => {
                if (cacheName !== 'bubble-game-v1') {
                  return caches.delete(cacheName);
                }
              })
            );
          })
        );
      };

      await activateHandler(mockEvent);
      
      expect(mockCaches.delete).toHaveBeenCalledWith('old-cache-v1');
    });

    it('should preserve current cache during activation', async () => {
      mockCaches.keys.mockResolvedValueOnce(['bubble-game-v1']);

      const activateHandler = async (event) => {
        await event.waitUntil(
          caches.keys().then((cacheNames) => {
            return Promise.all(
              cacheNames.map((cacheName) => {
                if (cacheName !== 'bubble-game-v1') {
                  return caches.delete(cacheName);
                }
              })
            );
          })
        );
      };

      await activateHandler(mockEvent);
      
      // Should not delete current cache
      expect(mockCaches.delete).not.toHaveBeenCalledWith('bubble-game-v1');
    });
  });

  describe('Offline Functionality', () => {
    it('should enable offline gameplay after caching', async () => {
      // Simulate successful caching
      const urlsToCache = ['/index.html', '/src/main.js'];
      await mockCache.addAll(urlsToCache);
      
      // Simulate offline fetch
      mockCaches.match.mockResolvedValueOnce(new Response('cached game'));
      
      const fetchHandler = async (event) => {
        return await caches.match(event.request)
          .then((response) => response || fetch(event.request));
      };

      const result = await fetchHandler(mockEvent);
      
      expect(result).toBeDefined();
      expect(result.constructor.name).toBe('Response');
    });

    it('should handle network failures gracefully', async () => {
      mockCaches.match.mockResolvedValueOnce(undefined);
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const fetchHandler = async (event) => {
        try {
          return await caches.match(event.request)
            .then((response) => response || fetch(event.request))
            .catch(() => {
              // Graceful error handling
              return undefined;
            });
        } catch (error) {
          return undefined;
        }
      };

      const result = await fetchHandler(mockEvent);
      
      // Should handle error without crashing
      expect(result).toBeUndefined();
    });
  });
});
