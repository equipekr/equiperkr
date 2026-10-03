var CACHE_NAME = 'equipe-kr-v1';
var urlsToCache = ['./', './index.html', './admin.html', './manifest.json'];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      console.log('✅ Cache aberto');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(cacheNames){
      return Promise.all(
        cacheNames.map(function(cacheName){
          if(cacheName !== CACHE_NAME){
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event){
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function(response){
      if(response){
        fetch(event.request).then(function(networkResponse){
          if(networkResponse && networkResponse.status === 200){
            caches.open(CACHE_NAME).then(function(cache){
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(function(){});
        return response;
      }
      return fetch(event.request).then(function(response){
        if(!response || response.status !== 200 || response.type !== 'basic') return response;
        var responseToCache = response.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, responseToCache); });
        return response;
      }).catch(function(){ return caches.match('./index.html'); });
    })
  );
});
