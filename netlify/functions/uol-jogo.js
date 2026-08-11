// Extrai placar, status e eventos (gols, cartões, substituições) da página do UOL Placar
// pra um jogo específico. Segunda fonte do sistema de verificação com 3 fontes (LANCE + UOL + ESPN).
const cheerio = require('cheerio');

function extrairMinuto(texto) {
  // formatos vistos: "31'  2º T", "21'  1º T"
  const m = (texto || '').match(/(\d+)'\s*(1º|2º)?\s*T?/);
  if (!m) return null;
  const min = parseInt(m[1], 10);
  return m[2] === '2º' ? min + 45 : min; // normaliza pro minuto "corrido" do jogo, igual o LANCE mostra
}

function timeDoEscudo(imgSrc) {
  const m = (imgSrc || '').match(/brasoes\/60x60\/([a-z0-9-]+)\.png/i);
  return m ? m[1] : null;
}

async function extrairUol(urlPlacar) {
  const r = await fetch(urlPlacar, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'Accept-Language': 'pt-BR,pt;q=0.9',
    },
  });
  if (!r.ok) throw new Error('UOL respondeu ' + r.status);
  const html = await r.text();
  const $ = cheerio.load(html);

  // -------- status + placar (vem num bloco de estado JSON embutido no HTML) --------
  const statusMatch = html.match(/"status":"(match-ended|in-progress|not-started|halftime)"/);
  const placarMatch = html.match(/"score":\{"goals":\{"home":(\d+),"away":(\d+)/);
  const status = statusMatch ? statusMatch[1] : null;
  const encerrado = status === 'match-ended';
  const placar = placarMatch ? { casa: parseInt(placarMatch[1], 10), fora: parseInt(placarMatch[2], 10) } : null;

  // times: junta todos os pares nome+slug encontrados na página (pega o primeiro casa/fora que aparecer)
  const paresTime = {};
  const reTimes = /"name":"([^"]+)","slug":"([a-z0-9-]+)","acronym":"[A-Z]+"/g;
  let mt;
  while ((mt = reTimes.exec(html))) { paresTime[mt[2]] = mt[1]; }

  // -------- eventos --------
  const eventos = [];
  $('[class*="scoreboard-event"]').each((i, el) => {
    const $el = $(el);
    const classe = $el.attr('class') || '';
    const minutoTexto = $el.find('.regular-subtext').first().text().trim();
    const minuto = extrairMinuto(minutoTexto);
    const time = timeDoEscudo($el.find('img').attr('src'));
    const titles = $el.find('.event-title').map((i2, t) => $(t).text().trim()).get();
    const descricao = $el.find('.event-description').first().text().trim();

    if (/substitution-card/.test(classe)) {
      eventos.push({ tipo: 'substituicao', minuto, time, entra: titles[0] || null, sai: titles[1] || null, texto: descricao || null });
    } else if (/yellow-card/.test(classe)) {
      eventos.push({ tipo: 'cartao_amarelo', minuto, time, jogador: titles[0] || null, texto: descricao });
    } else if (/red-card/.test(classe)) {
      eventos.push({ tipo: 'cartao_vermelho', minuto, time, jogador: titles[0] || null, texto: descricao });
    } else if (/goal-card/.test(classe)) {
      // nome do artilheiro não vem separado — tenta extrair da frase de comemoração
      // (ex.: "GOOOOOOOOL DO VASCO! ADSON ABRE O PLACAR!" -> "ADSON")
      let jogador = null;
      const mGol = descricao.match(/GOL[O]*\s+DO\s+[^!]+!\s*([A-ZÀ-Ú][A-ZÀ-Ú\s.]+?)\s+(ABRE|AMPLIA|EMPATA|VIRA|MARCA|DESCONTA|FAZ)/i);
      if (mGol) jogador = mGol[1].trim();
      eventos.push({ tipo: 'gol', minuto, time, jogador, texto: descricao });
    }
  });

  return {
    fonte: 'uol',
    url: urlPlacar,
    encerrado,
    statusTexto: status,
    placar,
    times: paresTime,
    eventos,
  };
}

exports.handler = async (event) => {
  const { url } = event.queryStringParameters || {};
  if (!url || !url.includes('uol.com.br')) {
    return { statusCode: 400, body: JSON.stringify({ erro: 'Passe ?url=<endereço da página do UOL Placar>' }) };
  }
  try {
    const dados = await extrairUol(url);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(dados, null, 2) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ erro: e.message, stack: e.stack }) };
  }
};

module.exports.extrairUol = extrairUol;
