// Nombre del caché y lista de archivos a almacenar
const CACHE_NAME = 'aula-scan-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/fav-32.png',
    '/fav-16.png',
    '/fav-180.png',
    // Incluye aquí otros recursos necesarios, como hojas de estilo, scripts, etc.
    'https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic',
    'https://unpkg.com/normalize.css@8.0.0/normalize.css',
    'https://unpkg.com/@tailwindcss/browser@4',
    'https://unpkg.com/@zxing/library@latest',
    'https://cdnjs.cloudflare.com/ajax/libs/howler/2.1.2/howler.min.js'
];

// Evento de instalación: se cachean los recursos esenciales
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache abierto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Evento de activación: limpieza de caches antiguos si existen
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );
});

// Intercepta las peticiones y responde con el recurso cacheado si está disponible
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Retorna el recurso cacheado o realiza la petición a la red
                return response || fetch(event.request);
            })
    );
});