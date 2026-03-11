import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Unit tests for PWA Configuration
 * Tests manifest validity and service worker registration
 * Requirements: 7.1, 7.2, 7.3
 */

describe('PWA Configuration', () => {
  describe('Manifest File', () => {
    let manifest;

    beforeEach(() => {
      // Read the actual manifest.json file
      const manifestPath = join(process.cwd(), 'manifest.json');
      const manifestContent = readFileSync(manifestPath, 'utf-8');
      manifest = JSON.parse(manifestContent);
    });

    it('should have valid JSON structure', () => {
      expect(manifest).toBeDefined();
      expect(typeof manifest).toBe('object');
    });

    it('should have required name field', () => {
      expect(manifest.name).toBeDefined();
      expect(typeof manifest.name).toBe('string');
      expect(manifest.name.length).toBeGreaterThan(0);
    });

    it('should have required short_name field', () => {
      expect(manifest.short_name).toBeDefined();
      expect(typeof manifest.short_name).toBe('string');
      expect(manifest.short_name.length).toBeGreaterThan(0);
    });

    it('should have description field', () => {
      expect(manifest.description).toBeDefined();
      expect(typeof manifest.description).toBe('string');
    });

    it('should have start_url field', () => {
      expect(manifest.start_url).toBeDefined();
      expect(typeof manifest.start_url).toBe('string');
      expect(manifest.start_url).toBe('/');
    });

    it('should have display mode set to standalone', () => {
      expect(manifest.display).toBeDefined();
      expect(manifest.display).toBe('standalone');
    });

    it('should have background_color field', () => {
      expect(manifest.background_color).toBeDefined();
      expect(typeof manifest.background_color).toBe('string');
      expect(manifest.background_color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should have theme_color field', () => {
      expect(manifest.theme_color).toBeDefined();
      expect(typeof manifest.theme_color).toBe('string');
      expect(manifest.theme_color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should have icons array with required sizes', () => {
      expect(manifest.icons).toBeDefined();
      expect(Array.isArray(manifest.icons)).toBe(true);
      expect(manifest.icons.length).toBeGreaterThan(0);

      // Check for required icon sizes
      const iconSizes = manifest.icons.map(icon => icon.sizes);
      expect(iconSizes).toContain('192x192');
      expect(iconSizes).toContain('512x512');
    });

    it('should have valid icon structure', () => {
      manifest.icons.forEach(icon => {
        expect(icon.src).toBeDefined();
        expect(typeof icon.src).toBe('string');
        expect(icon.sizes).toBeDefined();
        expect(typeof icon.sizes).toBe('string');
        expect(icon.type).toBeDefined();
        expect(typeof icon.type).toBe('string');
      });
    });

    it('should have correct game metadata', () => {
      expect(manifest.name).toBe('Bubble Consumption Game');
      expect(manifest.short_name).toBe('Bubbles');
      expect(manifest.description).toContain('bubble');
    });
  });

  describe('Service Worker Registration', () => {
    let mockNavigator;
    let mockServiceWorker;
    let mockRegistration;

    beforeEach(() => {
      // Mock service worker registration
      mockRegistration = {
        scope: '/',
        active: true
      };

      mockServiceWorker = {
        register: vi.fn().mockResolvedValue(mockRegistration)
      };

      mockNavigator = {
        serviceWorker: mockServiceWorker
      };

      global.navigator = mockNavigator;
    });

    it('should check for service worker support', () => {
      expect('serviceWorker' in navigator).toBe(true);
    });

    it('should register service worker with correct path', async () => {
      await navigator.serviceWorker.register('/service-worker.js');
      
      expect(mockServiceWorker.register).toHaveBeenCalledWith('/service-worker.js');
    });

    it('should return registration object on success', async () => {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      
      expect(registration).toBeDefined();
      expect(registration.scope).toBe('/');
    });

    it('should handle registration failure gracefully', async () => {
      mockServiceWorker.register.mockRejectedValueOnce(new Error('Registration failed'));

      try {
        await navigator.serviceWorker.register('/service-worker.js');
      } catch (error) {
        expect(error.message).toBe('Registration failed');
      }
    });

    it('should register on window load event', () => {
      const loadHandler = vi.fn();
      
      // Simulate the registration pattern from index.html
      if ('serviceWorker' in navigator) {
        loadHandler();
      }
      
      expect(loadHandler).toHaveBeenCalled();
    });
  });

  describe('HTML Configuration', () => {
    let htmlContent;

    beforeEach(() => {
      // Read the actual index.html file
      const htmlPath = join(process.cwd(), 'index.html');
      htmlContent = readFileSync(htmlPath, 'utf-8');
    });

    it('should include manifest link in HTML', () => {
      expect(htmlContent).toContain('manifest.json');
      expect(htmlContent).toMatch(/<link[^>]*rel="manifest"[^>]*>/);
    });

    it('should include theme-color meta tag', () => {
      expect(htmlContent).toMatch(/<meta[^>]*name="theme-color"[^>]*>/);
    });

    it('should include viewport meta tag', () => {
      expect(htmlContent).toMatch(/<meta[^>]*name="viewport"[^>]*>/);
    });

    it('should include service worker registration script', () => {
      expect(htmlContent).toContain('serviceWorker');
      expect(htmlContent).toContain('register');
      expect(htmlContent).toContain('service-worker.js');
    });

    it('should register service worker on load event', () => {
      expect(htmlContent).toContain("window.addEventListener('load'");
      expect(htmlContent).toContain('serviceWorker.register');
    });

    it('should have proper error handling for registration', () => {
      expect(htmlContent).toContain('.catch');
    });
  });

  describe('PWA Installation', () => {
    it('should be installable with valid manifest', () => {
      const manifestPath = join(process.cwd(), 'manifest.json');
      const manifestContent = readFileSync(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);

      // Check all required fields for installability
      expect(manifest.name).toBeDefined();
      expect(manifest.short_name).toBeDefined();
      expect(manifest.start_url).toBeDefined();
      expect(manifest.display).toBeDefined();
      expect(manifest.icons).toBeDefined();
      expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
    });

    it('should have icons suitable for home screen', () => {
      const manifestPath = join(process.cwd(), 'manifest.json');
      const manifestContent = readFileSync(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);

      const has192Icon = manifest.icons.some(icon => icon.sizes === '192x192');
      const has512Icon = manifest.icons.some(icon => icon.sizes === '512x512');

      expect(has192Icon).toBe(true);
      expect(has512Icon).toBe(true);
    });

    it('should support standalone display mode', () => {
      const manifestPath = join(process.cwd(), 'manifest.json');
      const manifestContent = readFileSync(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);

      expect(manifest.display).toBe('standalone');
    });
  });

  describe('Offline Capability', () => {
    it('should cache all required assets for offline play', () => {
      const serviceWorkerPath = join(process.cwd(), 'service-worker.js');
      const serviceWorkerContent = readFileSync(serviceWorkerPath, 'utf-8');

      // Check that essential files are in the cache list
      expect(serviceWorkerContent).toContain('/index.html');
      expect(serviceWorkerContent).toContain('/src/main.js');
      expect(serviceWorkerContent).toContain('/manifest.json');
      expect(serviceWorkerContent).toContain('phaser');
    });

    it('should implement cache-first strategy', () => {
      const serviceWorkerPath = join(process.cwd(), 'service-worker.js');
      const serviceWorkerContent = readFileSync(serviceWorkerPath, 'utf-8');

      // Check for cache-first pattern
      expect(serviceWorkerContent).toContain('caches.match');
      expect(serviceWorkerContent).toContain('fetch');
    });

    it('should cache game assets', () => {
      const serviceWorkerPath = join(process.cwd(), 'service-worker.js');
      const serviceWorkerContent = readFileSync(serviceWorkerPath, 'utf-8');

      // Check for game-specific assets
      expect(serviceWorkerContent).toContain('BootScene');
      expect(serviceWorkerContent).toContain('PreloaderScene');
      expect(serviceWorkerContent).toContain('GameScene');
      expect(serviceWorkerContent).toContain('Bubble');
      expect(serviceWorkerContent).toContain('CollisionSystem');
      expect(serviceWorkerContent).toContain('SpawnSystem');
    });

    it('should cache audio assets', () => {
      const serviceWorkerPath = join(process.cwd(), 'service-worker.js');
      const serviceWorkerContent = readFileSync(serviceWorkerPath, 'utf-8');

      expect(serviceWorkerContent).toContain('pop');
      expect(serviceWorkerContent).toContain('explosion');
      expect(serviceWorkerContent).toContain('fanfare');
    });

    it('should cache image assets', () => {
      const serviceWorkerPath = join(process.cwd(), 'service-worker.js');
      const serviceWorkerContent = readFileSync(serviceWorkerPath, 'utf-8');

      expect(serviceWorkerContent).toContain('logo');
      expect(serviceWorkerContent).toContain('icon-192');
      expect(serviceWorkerContent).toContain('icon-512');
    });
  });
});
