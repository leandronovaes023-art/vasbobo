// Extrai placar, status e linha do tempo (gols, cartões, substituições) da página de
// "Tempo Real" do LANCE! pra um jogo específico. Essa é a fonte PRINCIPAL do sistema de
// verificação com 3 fontes (LANCE + UOL + ESPN) — só o LANCE por enquanto, as outras duas
// entram numa próxima etapa.
const cheerio = require('cheerio');

async function extrairLance(urlTempoReal) {
  const r = await fetch(urlTempoReal, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'Accept-Language': 'pt-BR,pt;q=0.9',
    },
  });
  if (!r.ok) throw new Error('LANCE respondeu ' + r.status);
  const html = await r.text();
  const $ = cheerio.load(html);

  // -------- placar + times --------
  // span com classe "text-[22px]...font-bold" tem 3 filhos de texto/elemento: gol casa, separador (svg), gol visitante
  let golsCasa = null, golsFora = null, nomeCasa = null, nomeFora = null;
  const spanPlacar = $('span[class*="text-[22px]"][class*="font-bold"]').first();
  if (spanPlacar.length) {
    const numeros = spanPlacar
      .contents()
      .filter((i, el) => el.type === 'text')
      .map((i, el) => $(el).text().trim())
      .get()
      .filter(Boolean);
    if (numeros.length === 2) {
      golsCasa = parseInt(numeros[0], 10);
      golsFora = parseInt(numeros[1], 10);
    }
  }
  // nomes dos times: primeiro/último bloco com "hidden sm:block" perto do placar
  const nomesTimes = $('h1 span.hidden.sm\\:block, h1 span[class*="hidden"][class*="sm:block"]')
    .map((i, el) => $(el).text().trim())
    .get();
  if (nomesTimes.length >= 2) { nomeCasa = nomesTimes[0]; nomeFora = nomesTimes[nomesTimes.length - 1]; }

  // -------- status da partida --------
  let statusTexto = null;
  $('span').each((i, el) => {
    if (statusTexto) return;
    const t = $(el).clone().children().remove().end().text().trim();
    if (/^(Partida encerrada|Partida ao vivo|Partida não iniciada|Intervalo)$/i.test(t)) statusTexto = t;
  });
  const encerrado = /encerrada/i.test(statusTexto || '');

  // -------- linha do tempo (dentro do painel "Linha do tempo") --------
  const eventos = [];
  const painelLinhaDoTempo = $('span:contains("Linha do tempo")').first().closest('div.w-full');
  const itens = painelLinhaDoTempo.length ? painelLinhaDoTempo.find('li') : $('li');
  itens.each((i, li) => {
    const $li = $(li);
    const textoCompleto = $li.text().replace(/\s+/g, ' ').trim();
    if (!textoCompleto) return;
    const minutoMatch = textoCompleto.match(/(\d+)'/);
    const minuto = minutoMatch ? parseInt(minutoMatch[1], 10) : null;
    const imgAlt = ($li.find('img').attr('alt') || '').trim();

    if (/^Fim de jogo$/i.test(textoCompleto)) { eventos.push({ tipo: 'fim_de_jogo', minuto: null, texto: textoCompleto }); return; }
    if (/^Início do (primeiro|segundo) tempo$/i.test(textoCompleto)) { eventos.push({ tipo: 'inicio_tempo', minuto: null, texto: textoCompleto }); return; }
    if (/^Fim do primeiro tempo$/i.test(textoCompleto)) { eventos.push({ tipo: 'fim_primeiro_tempo', minuto: null, texto: textoCompleto }); return; }

    if (/substitui/i.test(imgAlt)) {
      // jogador que entra vem destacado em verde (#1F9636), quem sai em vermelho (#C61B38)
      const entra = $li.find('span[class*="1F9636"]').first().text().trim() || null;
      const sai = $li.find('span[class*="C61B38"]').first().text().trim() || null;
      eventos.push({ tipo: 'substituicao', minuto, entra, sai, texto: textoCompleto });
      return;
    }
    if (/cart[ãa]o amarelo/i.test(imgAlt)) {
      eventos.push({ tipo: 'cartao_amarelo', minuto, jogador: textoCompleto.replace(/\d+'/, '').trim(), texto: textoCompleto });
      return;
    }
    if (/cart[ãa]o vermelho/i.test(imgAlt)) {
      eventos.push({ tipo: 'cartao_vermelho', minuto, jogador: textoCompleto.replace(/\d+'/, '').trim(), texto: textoCompleto });
      return;
    }
    if (/gol/i.test(imgAlt)) {
      eventos.push({ tipo: 'gol', minuto, jogador: textoCompleto.replace(/\d+'/, '').trim(), texto: textoCompleto });
      return;
    }
    // evento não classificado — guarda cru pra não perder informação, mesmo sem saber o tipo exato
    eventos.push({ tipo: 'outro', minuto, texto: textoCompleto, imgAlt: imgAlt || null });
  });

  return {
    fonte: 'lance',
    url: urlTempoReal,
    encerrado,
    statusTexto,
    placar: (golsCasa !== null && golsFora !== null) ? { casa: golsCasa, fora: golsFora } : null,
    times: { casa: nomeCasa, fora: nomeFora },
    eventos,
  };
}

exports.handler = async (event) => {
  const { url } = event.queryStringParameters || {};
  if (!url || !url.includes('lance.com.br')) {
    return { statusCode: 400, body: JSON.stringify({ erro: 'Passe ?url=<endereço da página de tempo real do LANCE!>' }) };
  }
  try {
    const dados = await extrairLance(url);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(dados, null, 2) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ erro: e.message, stack: e.stack }) };
  }
};

module.exports.extrairLance = extrairLance;
