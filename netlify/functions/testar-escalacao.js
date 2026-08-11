// Endpoint de TESTE temporário — só pra conferir a extração de escalação do UOL antes de ligar
// no fluxo automático de verdade. Pode ser apagado depois.
const { extrairUol } = require('./uol-jogo');
exports.handler = async (event) => {
  const { url } = event.queryStringParameters || {};
  if (!url) return { statusCode: 400, body: 'Passe ?url=<endereço do UOL Placar>' };
  try {
    const dados = await extrairUol(url);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify({ times: dados.times, escalacaoTitular: dados.escalacaoTitular }, null, 2) };
  } catch (e) {
    return { statusCode: 500, body: 'Erro: ' + e.message };
  }
};
