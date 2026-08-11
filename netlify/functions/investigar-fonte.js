// Função de DIAGNÓSTICO temporária — não faz parte do fluxo normal do site.
// Serve só pra eu (Claude) inspecionar como o LANCE!/UOL/ESPN entregam o HTML de verdade
// pro servidor (sem JavaScript rodando), pra depois escrever o scraper certo.
// Depois que o sistema de verificação estiver pronto, este arquivo pode ser apagado.
//
// Uso: /.netlify/functions/investigar-fonte?url=<endereco-completo-da-pagina>
const cheerio = require('cheerio');

const TERMOS = ['Titular', 'titular', 'Reservas', 'formation', 'Escalação confirmada'];
const JANELA = 2500;

exports.handler = async (event) => {
  const { url } = event.queryStringParameters || {};
  if (!url) {
    return { statusCode: 400, body: JSON.stringify({ erro: 'Passe ?url=<endereço completo da página>' }) };
  }
  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': 'https://www.google.com/',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Dest': 'document',
      },
    });
    const html = await r.text();

    const achados = {};
    TERMOS.forEach((termo) => {
      const idx = html.indexOf(termo);
      achados[termo] = idx >= 0 ? html.slice(Math.max(0, idx - 300), idx + JANELA) : null;
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        status: r.status,
        headersResposta: Object.fromEntries(r.headers.entries()),
        tamanhoHtml: html.length,
        achados,
      }, null, 2),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ erro: e.message, stack: e.stack }) };
  }
};
