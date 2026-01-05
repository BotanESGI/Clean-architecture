// Service Worker pour les notifications push
self.addEventListener('install', (event) => {
  console.log('Service Worker installé');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activé');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Notification push reçue:', event);

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Banque AVENIR', body: event.data.text() };
    }
  }

  const options = {
    title: data.title || 'Banque AVENIR',
    body: data.body || 'Vous avez une nouvelle notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon,
      badge: options.badge,
      tag: options.tag,
      requireInteraction: options.requireInteraction,
      data: options.data,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification cliquée:', event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si une fenêtre est déjà ouverte, la focus
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon, ouvrir une nouvelle fenêtre
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

