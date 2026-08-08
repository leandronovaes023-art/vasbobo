// Manda uma notificação imediata pra TODOS os usuários com token registrado,
// ou só pra uma lista específica de usuários (campo "usuarios": [...] no corpo da requisição).
// Chamada pelo painel admin (Configurações → Enviar / Agendar).
const { mandarPush, garantirFirebase, admin } = require('./_push-helper');

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const texto = (body.texto || '').trim();
    // aceita tanto "usuarios" (lista) quanto "usuario" (compatibilidade com chamadas antigas)
    let alvos = Array.isArray(body.usuarios) ? body.usuarios : (body.usuario ? [body.usuario] : null);
    if (!texto) return { statusCode: 400, body: 'Faltou o texto da mensagem.' };

    garantirFirebase();
    const db = admin.firestore();

    if (alvos) {
      let enviados = 0, falhas = 0;
      const detalhes = [];
      for (const usuario of alvos) {
        const r = await mandarPush(usuario, 'VASBOBO', texto, '/', false);
        if (r.ok) enviados++; else { falhas++; detalhes.push(`${usuario}: ${r.motivo}`); }
      }
      return { statusCode: 200, body: `Enviado pra ${enviados} pessoa(s)` + (falhas ? `, ${falhas} falharam (${detalhes.join('; ')})` : '') + '.' };
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
