// Service worker do Firebase Cloud Messaging — cuida das notificações que chegam
// com o app fechado ou em segundo plano. Sozinho ele não faz nada além disso.
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDNk1IhC1KpF9UKdwyMjhybrhuJ-BsfkSs",
  authDomain: "vasbobo-crvg.firebaseapp.com",
  projectId: "vasbobo-crvg",
  storageBucket: "vasbobo-crvg.firebasestorage.app",
  messagingSenderId: "967008085523",
  appId: "1:967008085523:web:744136b984604b20bc81e6"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const dados = payload.data || {};
  const titulo = payload.notification?.title || 'VASBOBO';
  const corpo = payload.notification?.body || '';
  self.registration.showNotification(titulo, {
    body: corpo,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: dados.url || '/' }
  });
});

// clique na notificação: abre (ou foca) o app já na tela certa
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((lista) => {
      for (const cliente of lista) {
        if ('focus' in cliente) { cliente.navigate(url); return cliente.focus(); }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
