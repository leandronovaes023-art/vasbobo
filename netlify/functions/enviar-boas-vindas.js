// Manda a mensagem de boas-vindas assim que a pessoa ativa as notificações pela primeira vez.
const { mandarPush } = require('./_push-helper');

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const usuario = (body.usuario || '').trim().toLowerCase();
    if (!usuario) return { statusCode: 400, body: 'Faltou o usuário.' };
    await mandarPush(usuario, 'VASBOBO', 'Bem-vindo às notificações do Vasbobo! Agora você não perde mais o palpite, a avaliação nem a frase motivacional do dia. 🖤🤍', '/');
    return { statusCode: 200, body: 'ok' };
  } catch (e) {
    return { statusCode: 500, body: 'Erro: ' + e.message };
  }
};
