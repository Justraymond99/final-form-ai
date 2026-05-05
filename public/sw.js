const CACHE_VERSION = 'v4';
const STATIC_CACHE = `final-form-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `final-form-dynamic-${CACHE_VERSION}`;
const API_CACHE = `final-form-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `final-form-images-${CACHE_VERSION}`;

// Static assets to pre-cache on install.
// IMPORTANT: do NOT pre-cache '/' or '/index.html'. Caching the HTML shell
// pins the page to a specific build's chunk hashes; after a redeploy the
// cached HTML references chunk files that no longer exist, which can break
// lazy-loaded routes and produce React hook errors. Always fetch HTML fresh.
const STATIC_ASSETS = [
  '/manifest.json',
  '/final-form-logo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/app-icon-1024.png'
];

// API endpoints to cache with stale-while-revalidate
const CACHEABLE_API_PATTERNS = [
  /\/rest\/v1\/profiles/,
  /\/rest\/v1\/daily_tracking/,
  /\/rest\/v1\/workout_templates/,
  /\/rest\/v1\/goals/,
  /\/rest\/v1\/achievements/,
  /\/rest\/v1\/exercises/,
  /\/rest\/v1\/recipes/,
];

// Max items per cache
const CACHE_LIMITS = {
  dynamic: 50,
  api: 100,
  images: 60
};

// Cache expiry times (in milliseconds)
const CACHE_EXPIRY = {
  api: 5 * 60 * 1000, // 5 minutes for API
  images: 7 * 24 * 60 * 60 * 1000, // 7 days for images
};

// Helper: Limit cache size
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await limitCacheSize(cacheName, maxItems);
  }
}

// Helper: Check if request is cacheable API call
function isCacheableAPI(url) {
  return CACHEABLE_API_PATTERNS.some(pattern => pattern.test(url));
}

// Helper: Check if request is an image
function isImage(request) {
  const url = new URL(request.url);
  return (
    request.destination === 'image' ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url.pathname)
  );
}

// Install: Pre-cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE, IMAGE_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => !currentCaches.includes(cacheName))
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Apply caching strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Only handle GET requests
  if (request.method !== 'GET') return;
  
  // Skip non-http(s) requests
  if (!url.protocol.startsWith('http')) return;
  
  // Skip Supabase auth endpoints (never cache)
  if (url.pathname.includes('/auth/')) return;
  
  // Skip edge functions (never cache)
  if (url.pathname.includes('/functions/')) return;
  
  // Strategy 1: Always fetch HTML fresh from the network so chunk hashes
  // stay in sync with the deployed build. Fall back to a minimal offline
  // response only if the network is unreachable.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          '<!doctype html><html><body><p>You appear to be offline. Please reconnect and reload.</p></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        )
      )
    );
    return;
  }
  
  // Strategy 2: Stale-while-revalidate for API calls
  if (isCacheableAPI(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE, CACHE_LIMITS.api));
    return;
  }
  
  // Strategy 3: Cache-first for images
  if (isImage(request)) {
    event.respondWith(cacheFirstWithNetwork(request, IMAGE_CACHE, CACHE_LIMITS.images));
    return;
  }
  
  // Strategy 4: Cache-first for static assets (fonts, etc)
  const isSameOrigin = url.origin === self.location.origin;
  const isStaticAsset = /\.(woff2?|ttf|otf|eot)$/i.test(url.pathname);
  
  if (isSameOrigin && isStaticAsset) {
    event.respondWith(cacheFirstWithNetwork(request, STATIC_CACHE, 30));
    return;
  }
  
  // Skip caching for JS/CSS bundles to prevent stale code
  const dest = request.destination;
  if (dest === 'script' || dest === 'style' || dest === 'worker') {
    event.respondWith(fetch(request));
    return;
  }
  
  // Default: Network with dynamic cache fallback
  event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE));
});

// Network-first strategy with cache fallback
async function networkFirstWithCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

// Cache-first strategy with network fallback
async function cacheFirstWithNetwork(request, cacheName, maxItems) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      limitCacheSize(cacheName, maxItems);
    }
    
    return networkResponse;
  } catch (error) {
    // Return a placeholder for images
    if (isImage(request)) {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#1a1a2e" width="100" height="100"/></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    throw error;
  }
}

// Stale-while-revalidate strategy for API
async function staleWhileRevalidate(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Start network request in background
  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
        limitCacheSize(cacheName, maxItems);
      }
      return networkResponse;
    })
    .catch(() => null);
  
  // Return cached response immediately if available
  if (cachedResponse) {
    // Trigger background update
    networkPromise;
    return cachedResponse;
  }
  
  // Wait for network if no cache
  const networkResponse = await networkPromise;
  if (networkResponse) {
    return networkResponse;
  }
  
  // Return error response
  return new Response(JSON.stringify({ error: 'Offline', cached: false }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  let data = {
    title: 'Final Form',
    body: 'You have a new notification!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: {}
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    tag: data.tag || 'default'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/home';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event);
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-pending-data') {
    event.waitUntil(syncPendingData());
  }
});

// Sync pending data when back online
async function syncPendingData() {
  // This would sync any IndexedDB stored requests
  console.log('[SW] Syncing pending data...');
}

// Message handler for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.addAll(urls);
      })
    );
  }
});
