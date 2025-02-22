// Nombre del caché (puedes actualizar la versión cuando realices cambios)
// Nota: Aunque se cachean los recursos en la instalación, la estrategia de fetch
// es network-first, de modo que siempre se intenta obtener la versión más reciente.
const CACHE_NAME = 'aula-scan-cache-v2';
const urlsToCache = [
    '/', // Página de inicio
    '/index.html',
    '/manifest.json',
    '/fav-32.png',
    '/fav-16.png',
    '/fav-180.png',
    // Otros recursos necesarios, como hojas de estilo y scripts
    'https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic',
    'https://unpkg.com/normalize.css@8.0.0/normalize.css',
    'https://unpkg.com/@tailwindcss/browser@4',
    'https://unpkg.com/@zxing/library@latest',
    'https://cdnjs.cloudflare.com/ajax/libs/howler/2.1.2/howler.min.js'
];

/**
 * Evento de instalación:
 * - Se abre el caché y se almacenan los recursos definidos.
 * - Se llama a skipWaiting() para forzar la activación inmediata del nuevo service worker.
 */
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Cache abierta y recursos precargados');
                return cache.addAll(urlsToCache);
            })
    );
});

/**
 * Evento de activación:
 * - Se eliminan caches antiguos que no correspondan a la versión actual.
 * - Se llama a clients.claim() para tomar control inmediato de las páginas.
 */
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => {
                        console.log('Service Worker: Eliminando caché antigua', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

/**
 * Evento de fetch:
 * Estrategia network-first: 
 * - Se intenta obtener siempre la versión actualizada desde la red.
 * - Si falla la conexión, se retorna una respuesta personalizada (sin fallback a caché)
 *   ya que no es prioritario ofrecer acceso offline.
 */
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Si la respuesta es correcta, se retorna tal cual
                return response;
            })
            .catch(() => {
                // En caso de error (p.ej., sin conexión), se responde con un mensaje
                return new Response('No hay conexión a internet. Por favor, revisa tu red.', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({'Content-Type': 'text/plain'})
                });
            })
    );
});
