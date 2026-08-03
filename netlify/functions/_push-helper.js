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

async function mandarPush(usuario, titulo, texto, url) {
  garantirFirebase();
  const db = admin.firestore();
  const tokDoc = await db.collection('push_tokens').doc(usuario).get();
  if (!tokDoc.exists) return { ok: false, motivo: 'usuário sem token registrado (não ativou notificações ainda)' };
  const { token } = tokDoc.data();
  if (!token) return { ok: false, motivo: 'token vazio' };
  await admin.messaging().send({
    token,
    notification: { title: titulo || 'VASBOBO', body: texto },
    data: { url: url || '/' },
  });
  return { ok: true };
}

module.exports = { garantirFirebase, mandarPush, admin };
