const CACHE_NAME = 'pwa-cache-v1';
const HOSTNAME_WHITELIST = [
    self.location.hostname.toLowerCase(),
    'fonts.gstatic.com',
    'fonts.googleapis.com',
    'cdn.jsdelivr.net'
];

// Add offline fallback page
const OFFLINE_PAGE = '/offline.html';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.add(OFFLINE_PAGE))
            .catch(err => console.error('Failed to cache offline page:', err))
    );
});

self.addEventListener('activate', event => {
    // Clean up old caches
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName !== CACHE_NAME)
                        .map(cacheName => caches.delete(cacheName))
                );
            })
        ])
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    if (!HOSTNAME_WHITELIST.includes(url.hostname.toLowerCase())) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                const networked = fetch(event.request)
                    .then(response => {
                        const cacheCopy = response.clone();
                        
                        // Update cache only for successful responses
                        if (response.ok) {
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, cacheCopy))
                                .catch(err => console.warn('Cache update failed:', err));
                        }
                        
                        return response;
                    })
                    .catch(err => {
                        console.error('Fetch failed:', err);
                        // If both cache and network fail, show offline page
                        return caches.match(OFFLINE_PAGE);
                    });

                // Return cached response immediately, then update cache in background
                return cached || networked;
            })
    );
});