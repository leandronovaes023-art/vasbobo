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

async function registrarLogServidor(db, { usuario, tipo, nivel, detalhe }) {
  try {
    const agora = new Date();
    const br = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    await db.collection('logs').add({
      ts: agora.getTime(), ano: br.getFullYear(), mes: br.getMonth() + 1, dia: br.getDate(),
      hora: br.getHours(), minuto: br.getMinutes(),
      usuario: usuario || '(sistema)', tipo, nivel: nivel || 'comum',
      detalhe: String(detalhe || '').slice(0, 300), pagina: 'servidor',
    });
  } catch (e) { /* nunca deixa um erro de log quebrar a função principal */ }
}

async function mandarPush(usuario, titulo, texto, url, comSaudacao = true) {
  garantirFirebase();
  const db = admin.firestore();
  const tokDoc = await db.collection('push_tokens').doc(usuario).get();
  if (!tokDoc.exists) return { ok: false, motivo: 'usuário sem token registrado (não ativou notificações ainda)' };
  const { token } = tokDoc.data();
  if (!token) return { ok: false, motivo: 'token vazio' };
  // sem saudação/frase de abertura aleatória — só o nome da pessoa antes da mensagem, direto
  const corpoFinal = comSaudacao ? `${capitaliza(usuario)}, ${texto}` : texto;
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
    await registrarLogServidor(db, { usuario, tipo: 'notificacao', nivel: 'importante', detalhe: `Notificação enviada: "${titulo || 'VASBOBO'}" — ${corpoFinal}` });
    return { ok: true };
  } catch (e) {
    const codigo = e.code || '';
    if (codigo.includes('registration-token-not-registered') || codigo.includes('invalid-argument')) {
      await db.collection('push_tokens').doc(usuario).delete().catch(() => {});
      return { ok: false, motivo: 'token antigo/inválido (apagado) — a pessoa precisa clicar no sino de novo pra gerar um token novo' };
    }
    return { ok: false, motivo: 'erro do Firebase: ' + (e.message || codigo || 'desconhecido') };
  }
}

module.exports = { garantirFirebase, mandarPush, admin, registrarLogServidor };
