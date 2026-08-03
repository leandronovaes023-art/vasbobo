// Service worker único do site — cuida de duas coisas:
// 1) deixar o site "instalável" como app (Chrome/Android exige isso)
// 2) receber notificações push em segundo plano (Firebase Cloud Messaging)
// Não guarda nada offline de propósito, pra sempre pegar a versão mais nova do site.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {}); // não intercepta nada — sempre busca da rede

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
    icon: '/icons/icon-notif-grande.png',
    badge: '/icons/icon-notif-96.png',
    data: { url: dados.url || '/' }
  });
});

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
