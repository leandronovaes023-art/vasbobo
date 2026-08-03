// Função pra TESTAR na hora, sem esperar horário nenhum.
// Chame assim: https://vasbobo.netlify.app/.netlify/functions/testar-notificacao?usuario=SEU_LOGIN&chave=SUA_CHAVE_SECRETA
// A chave precisa bater com a variável TEST_NOTIF_SECRET configurada no Netlify — sem isso, ninguém de fora consegue chamar essa função.
const { mandarPush } = require('./_push-helper');

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const chave = (params.chave || '').trim();
  const segredoEsperado = process.env.TEST_NOTIF_SECRET;
  if (!segredoEsperado) {
    return { statusCode: 500, body: 'TEST_NOTIF_SECRET não configurada no Netlify — configure antes de usar essa função.' };
  }
  if (chave !== segredoEsperado) {
    return { statusCode: 403, body: 'Chave errada ou ausente. Passa ?chave=SUA_CHAVE_SECRETA na URL.' };
  }
  const usuario = (params.usuario || '').trim();
  if (!usuario) {
    return { statusCode: 400, body: 'Passa ?usuario=SEU_LOGIN na URL. Ex: ?usuario=novaes&chave=SUA_CHAVE' };
  }
  try {
    const r = await mandarPush(usuario, 'VASBOBO', 'Teste de notificação — se você tá vendo isso, funcionou! 🎉', '/');
    if (!r.ok) return { statusCode: 200, body: 'Não enviou: ' + r.motivo };
    return { statusCode: 200, body: 'Notificação de teste enviada pra "' + usuario + '"! Confere o celular.' };
  } catch (e) {
    return { statusCode: 500, body: 'Erro: ' + e.message };
  }
};
