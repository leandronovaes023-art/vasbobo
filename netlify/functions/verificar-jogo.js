// Orquestrador do sistema de verificação de jogos do Vasco com múltiplas fontes.
// Busca o placar/eventos no LANCE! e no UOL Placar ao mesmo tempo, compara os dois e devolve
// um veredito único com nível de confiança (🟢 confirmado / 🟡 provável / 🔴 divergência).
//
// Decisão de fontes: ESPN Brasil foi testado e descartado — usa firewall AWS WAF com desafio
// de JavaScript que bloqueia qualquer busca automática simples (não dá pra contornar sem um
// navegador completo, inviável numa função gratuita). Por enquanto o sistema roda só com
// LANCE! + UOL, que já se provaram muito confiáveis em teste com jogo real (13/13 eventos
// bateram entre si, incluindo nomes de jogador escritos diferente entre os sites). O ge.globo
// fica como candidato a terceira fonte numa próxima etapa, se for necessário.
//
// Uso: /.netlify/functions/verificar-jogo?lance=<url tempo real do LANCE>&uol=<url do UOL Placar>
const { extrairLance } = require('./lance-jogo');
const { extrairUol } = require('./uol-jogo');
const { verificarJogo } = require('./_comparador-fontes');

exports.handler = async (event) => {
  const { lance, uol } = event.queryStringParameters || {};
  if (!lance && !uol) {
    return { statusCode: 400, body: JSON.stringify({ erro: 'Passe pelo menos um de: ?lance=<url> ou ?uol=<url>' }) };
  }

  const resultados = await Promise.all([
    lance ? extrairLance(lance).catch((e) => ({ erro: e.message, fonte: 'lance' })) : Promise.resolve(null),
    uol ? extrairUol(uol).catch((e) => ({ erro: e.message, fonte: 'uol' })) : Promise.resolve(null),
  ]);

  const validos = resultados.filter((r) => r && !r.erro);
  const comErro = resultados.filter((r) => r && r.erro);
  const veredito = verificarJogo(validos);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ veredito, fontesComErro: comErro, brutoLance: resultados[0], brutoUol: resultados[1] }, null, 2),
  };
};
