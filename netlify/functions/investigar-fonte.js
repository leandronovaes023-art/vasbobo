// Função de DIAGNÓSTICO temporária — não faz parte do fluxo normal do site.
// Serve só pra eu (Claude) inspecionar como o LANCE!/UOL/ESPN entregam o HTML de verdade
// pro servidor (sem JavaScript rodando), pra depois escrever o scraper certo.
// Depois que o sistema de verificação estiver pronto, este arquivo pode ser apagado.
//
// Uso: /.netlify/functions/investigar-fonte?url=<endereco-completo-da-pagina>
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

    const temNextData = html.includes('__NEXT_DATA__');
    const temNuxtData = html.includes('__NUXT__');
    const temApolloState = html.includes('__APOLLO_STATE__');
    const temPartidaEncerrada = /Partida encerrada|Fim de jogo|FIM DE JOGO|Encerrado/i.test(html);
    const temSubstituicao = /Substitui[çc][ãa]o/i.test(html);
    const temVasco = /Vasco/i.test(html);

    // se tiver __NEXT_DATA__, extrai só esse bloco (é onde moram os dados estruturados de verdade)
    let blocoNextData = null;
    if (temNextData) {
      const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (m) blocoNextData = m[1].slice(0, 6000); // corta pra não estourar o tamanho da resposta
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        status: r.status,
        tamanhoHtml: html.length,
        temNextData, temNuxtData, temApolloState,
        temPartidaEncerrada, temSubstituicao, temVasco,
        // pedaço bruto do começo do HTML, pra eu ver como está estruturado por fora
        trechoInicial: html.slice(0, 1500),
        blocoNextData,
      }, null, 2),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ erro: e.message }) };
  }
};
