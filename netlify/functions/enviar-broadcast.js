// Manda uma notificação imediata pra TODOS os usuários com token registrado,
// ou só pra um usuário específico se "usuario" vier preenchido no corpo da requisição.
// Chamada pelo painel admin (Configurações → Enviar notificação agora / Mensagem por usuário).
const { mandarPush, garantirFirebase, admin } = require('./_push-helper');

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const texto = (body.texto || '').trim();
    const usuarioAlvo = (body.usuario || '').trim();
    if (!texto) return { statusCode: 400, body: 'Faltou o texto da mensagem.' };

    garantirFirebase();
    const db = admin.firestore();

    if (usuarioAlvo) {
      const r = await mandarPush(usuarioAlvo, 'VASBOBO', texto, '/', false);
      return { statusCode: r.ok ? 200 : 200, body: r.ok ? `Enviado pra "${usuarioAlvo}" ✓` : `Não enviou: ${r.motivo}` };
    }

    const tokensSnap = await db.collection('push_tokens').get();
    if (tokensSnap.empty) return { statusCode: 200, body: 'Ninguém tem notificação ativada ainda.' };

    let enviados = 0, falhas = 0;
    for (const doc of tokensSnap.docs) {
      const usuario = doc.id;
      const r = await mandarPush(usuario, 'VASBOBO', texto, '/', false);
      if (r.ok) enviados++; else falhas++;
    }
    return { statusCode: 200, body: `Enviado pra ${enviados} pessoa(s)` + (falhas ? `, ${falhas} falharam (token antigo, provavelmente)` : '') + '.' };
  } catch (e) {
    return { statusCode: 500, body: 'Erro: ' + e.message };
  }
};
