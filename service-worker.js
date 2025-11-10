const CACHE_NAME = 'acai-cia-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/modals.css',
  '/script.js',
  '/modal-customization.js',
  '/modal-address.js',
  '/modal-map-payment.js',
  '/products_with_prices.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  // Ignorar requisições que não sejam HTTP/HTTPS (ex: chrome-extension://)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retorna a resposta do cache
        if (response) {
          return response;
        }

        // Clone da requisição
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Verifica se recebeu uma resposta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone da resposta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Event listener para notificações push
self.addEventListener('push', (event) => {
  console.log('Push recebido:', event);

  let notificationData = {
    title: 'Açaí & Cia',
    body: 'Nova notificação!',
    icon: 'https://em-content.zobj.net/source/apple/391/bubble-tea_1f9cb.png',
    badge: 'https://em-content.zobj.net/source/apple/391/bubble-tea_1f9cb.png',
    data: {
      url: '/'
    }
  };

  // Se houver dados no push, usar
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        image: data.image || undefined,
        badge: data.badge || notificationData.badge,
        data: {
          url: data.url || notificationData.data.url,
          ...data.data
        },
        actions: data.actions || []
      };
    } catch (e) {
      console.error('Erro ao parsear dados do push:', e);
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      image: notificationData.image,
      badge: notificationData.badge,
      data: notificationData.data,
      actions: notificationData.actions,
      vibrate: [200, 100, 200],
      requireInteraction: false
    }
  );

  event.waitUntil(promiseChain);
});

// Event listener para cliques em notificações
self.addEventListener('notificationclick', (event) => {
  console.log('Clique na notificação:', event);

  event.notification.close();

  // URL para abrir quando clicar na notificação
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then((windowClients) => {
      // Verificar se já existe uma janela aberta
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não houver janela aberta, abrir nova
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
