// Helper compartilhado pra mandar push — usado tanto pelo teste manual quanto pela função agendada.
const admin = require('firebase-admin');

let appInicializado = false;
function garantirFirebase() {
  if (appInicializado) return;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT não configurada nas variáveis de ambiente do Netlify.');
  const credenciais = JSON.parse(raw);
  admin.initializeApp({ credential: admin.credential.cert(credenciais) });
  appInicializado = true;
}

function capitaliza(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// banco de saudações — uma é sorteada e colocada na frente de toda notificação,
// pra parecer que o Vasbobo está chamando a pessoa pelo nome, não só mandando um aviso genérico
const SAUDACOES = [
  (n) => `E aí, ${n}!!`,
  (n) => `${n}, o Vasco depende de você!`,
  (n) => `${n}, está aí?`,
  (n) => `${n}, Vasco é todo dia`,
  (n) => `Opa, ${n}!`,
  (n) => `${n}, cadê você?`,
  (n) => `${n}, bora!`,
  (n) => `${n}, presta atenção nisso aqui`,
  (n) => `Fala, ${n}!`,
  (n) => `${n}, olha só`,
  (n) => `${n}, sem enrolação`,
  (n) => `Vem cá, ${n}`,
];
function saudacaoPersonalizada(usuario) {
  const nome = capitaliza(usuario);
  const escolhida = SAUDACOES[Math.floor(Math.random() * SAUDACOES.length)];
  return escolhida(nome);
}

async function mandarPush(usuario, titulo, texto, url) {
  garantirFirebase();
  const db = admin.firestore();
  const tokDoc = await db.collection('push_tokens').doc(usuario).get();
  if (!tokDoc.exists) return { ok: false, motivo: 'usuário sem token registrado (não ativou notificações ainda)' };
  const { token } = tokDoc.data();
  if (!token) return { ok: false, motivo: 'token vazio' };
  const corpoPersonalizado = `${saudacaoPersonalizada(usuario)} ${texto}`;
  try {
    await admin.messaging().send({
      token,
      // Mensagem "só dados" (sem o campo "notification") — assim ela SEMPRE passa pelo
      // meu código no service worker (onBackgroundMessage), que define o ícone certo.
      // Se tivesse "notification" aqui, o navegador mostraria sozinho, com ícone padrão,
      // ignorando completamente o que configurei — foi exatamente esse o bug.
      data: { title: titulo || 'VASBOBO', body: corpoPersonalizado, url: url || '/' },
      webpush: { headers: { Urgency: 'high' } },
    });
    return { ok: true };
  } catch (e) {
    const codigo = e.code || '';
    if (codigo.includes('registration-token-not-registered') || codigo.includes('invalid-argument')) {
      // token velho/inválido (comum depois de trocar o service worker, reinstalar o app, etc.)
      await db.collection('push_tokens').doc(usuario).delete().catch(() => {});
      return { ok: false, motivo: 'token antigo/inválido (apagado) — a pessoa precisa clicar no sino de novo pra gerar um token novo' };
    }
    return { ok: false, motivo: 'erro do Firebase: ' + (e.message || codigo || 'desconhecido') };
  }
}

module.exports = { garantirFirebase, mandarPush, admin };
