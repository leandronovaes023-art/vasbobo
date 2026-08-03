// Função pra TESTAR na hora, sem esperar horário nenhum.
// Chame assim: https://vasbobo.netlify.app/.netlify/functions/testar-notificacao?usuario=SEU_LOGIN
const { mandarPush } = require('./_push-helper');

exports.handler = async (event) => {
  const usuario = (event.queryStringParameters && event.queryStringParameters.usuario || '').trim().toLowerCase();
  if (!usuario) {
    return { statusCode: 400, body: 'Passa ?usuario=SEU_LOGIN na URL. Ex: ?usuario=novaes' };
  }
  try {
    const r = await mandarPush(usuario, 'VASBOBO', 'Teste de notificação — se você tá vendo isso, funcionou! 🎉', '/');
    if (!r.ok) return { statusCode: 200, body: 'Não enviou: ' + r.motivo };
    return { statusCode: 200, body: 'Notificação de teste enviada pra "' + usuario + '"! Confere o celular.' };
  } catch (e) {
    return { statusCode: 500, body: 'Erro: ' + e.message };
  }
};
