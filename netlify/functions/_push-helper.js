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
  (n) => `${n}, acorda!`,
  (n) => `${n}, para tudo`,
  (n) => `Ô ${n}, escuta`,
  (n) => `${n}, é sério isso`,
  (n) => `${n}, larga o que tá fazendo`,
  (n) => `Psiu, ${n}`,
  (n) => `${n}, tô de olho em você`,
  (n) => `${n}, urgente`,
  (n) => `${n}, sem desculpa dessa vez`,
  (n) => `Alô, ${n}?`,
  (n) => `${n}, o Bar da Tia te chama`,
  (n) => `${n}, corre aqui`,
  (n) => `${n}, dá um tempo pra isso`,
  (n) => `Sério, ${n}`,
  (n) => `${n}, foi mal te incomodar, mas`,
  (n) => `${n}, uma coisinha rápida`,
  (n) => `${n}, guarda esse recado`,
  (n) => `${n}, presta ou perde`,
];
async function saudacaoPersonalizada(db, usuario) {
  const nome = capitaliza(usuario);
  let extras = [];
  try {
    const snap = await db.collection('saudacoes').get();
    extras = snap.docs.map((d) => (n) => d.data().texto.replace('{nome}', n));
  } catch (e) { /* se falhar, segue só com as fixas */ }
  const todas = SAUDACOES.concat(extras);
  const escolhida = todas[Math.floor(Math.random() * todas.length)];
  return escolhida(nome);
}

async function mandarPush(usuario, titulo, texto, url, comSaudacao = true) {
  garantirFirebase();
  const db = admin.firestore();
  const tokDoc = await db.collection('push_tokens').doc(usuario).get();
  if (!tokDoc.exists) return { ok: false, motivo: 'usuário sem token registrado (não ativou notificações ainda)' };
  const { token } = tokDoc.data();
  if (!token) return { ok: false, motivo: 'token vazio' };
  const corpoFinal = comSaudacao ? `${await saudacaoPersonalizada(db, usuario)} ${texto}` : texto;
  try {
    await admin.messaging().send({
      token,
      // Mensagem "só dados" (sem o campo "notification") — assim ela SEMPRE passa pelo
      // meu código no service worker (onBackgroundMessage), que define o ícone certo.
      // Se tivesse "notification" aqui, o navegador mostraria sozinho, com ícone padrão,
      // ignorando completamente o que configurei — foi exatamente esse o bug.
      data: { title: titulo || 'VASBOBO', body: corpoFinal, url: url || '/' },
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
