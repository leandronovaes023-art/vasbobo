// Service worker mínimo — existe só pra deixar o site "instalável" como app (Chrome/Android
// exige isso pra mostrar o banner de instalação). Não guarda nada offline de propósito,
// pra sempre pegar a versão mais nova do site.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {}); // não intercepta nada — sempre busca da rede
