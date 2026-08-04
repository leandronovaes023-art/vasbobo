// Manda uma notificação imediata pra TODOS os usuários com token registrado.
// Chamada só pelo painel admin (Configurações → Enviar notificação agora).
const { mandarPush, garantirFirebase, admin } = require('./_push-helper');

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const texto = (body.texto || '').trim();
    if (!texto) return { statusCode: 400, body: 'Faltou o texto da mensagem.' };

    garantirFirebase();
    const db = admin.firestore();
    const tokensSnap = await db.collection('push_tokens').get();
    if (tokensSnap.empty) return { statusCode: 200, body: 'Ninguém tem notificação ativada ainda.' };

    let enviados = 0, falhas = 0;
    for (const doc of tokensSnap.docs) {
      const usuario = doc.id;
      const r = await mandarPush(usuario, 'VASBOBO', texto, '/');
      if (r.ok) enviados++; else falhas++;
    }
    return { statusCode: 200, body: `Enviado pra ${enviados} pessoa(s)` + (falhas ? `, ${falhas} falharam (token antigo, provavelmente)` : '') + '.' };
  } catch (e) {
    return { statusCode: 500, body: 'Erro: ' + e.message };
  }
};
