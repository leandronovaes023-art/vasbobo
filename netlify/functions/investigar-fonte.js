// Função de DIAGNÓSTICO temporária — não faz parte do fluxo normal do site.
// Serve só pra eu (Claude) inspecionar como o LANCE!/UOL/ESPN entregam o HTML de verdade
// pro servidor (sem JavaScript rodando), pra depois escrever o scraper certo.
// Depois que o sistema de verificação estiver pronto, este arquivo pode ser apagado.
//
// Uso: /.netlify/functions/investigar-fonte?url=<endereco-completo-da-pagina>
const cheerio = require('cheerio');

exports.handler = async (event) => {
  const { url } = event.queryStringParameters || {};
  if (!url) {
    return { statusCode: 400, body: JSON.stringify({ erro: 'Passe ?url=<endereço completo da página>' }) };
  }
  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
    });
    const html = await r.text();
    const $ = cheerio.load(html);

    // acha o elemento que contém o texto "Partida encerrada" (ou "Fim de jogo") e sobe alguns
    // níveis de pai, pra ver a "vizinhança" onde normalmente fica o placar junto
    let statusHtml = null;
    $('*').each((i, el) => {
      if (statusHtml) return;
      const txt = $(el).clone().children().remove().end().text().trim();
      if (/^(Partida encerrada|Fim de jogo)$/i.test(txt)) {
        statusHtml = $(el).parent().parent().html();
      }
    });

    // acha o bloco de "linha do tempo" procurando o texto "Substituição" ou "Fim de jogo" na lista de eventos
    let timelineHtml = null;
    $('li, div').each((i, el) => {
      if (timelineHtml) return;
      const txt = $(el).text();
      if (/Fim de jogo/i.test(txt) && /Substitui/i.test($(el).parent().text())) {
        timelineHtml = $(el).parent().html();
      }
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        tamanhoHtml: html.length,
        statusHtml: (statusHtml || '(não achei)').slice(0, 2500),
        timelineHtml: (timelineHtml || '(não achei)').slice(0, 4000),
      }, null, 2),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ erro: e.message, stack: e.stack }) };
  }
};
