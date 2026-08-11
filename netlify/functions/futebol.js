// Proxy gratuito para a TheSportsDB (thesportsdb.com) — cobre a temporada atual,
// diferente da API-Football (cujo plano grátis só libera temporadas antigas).
// Usa a chave pública gratuita "123" (não é segredo, não precisa de variável de ambiente).
//
// Uso pelo site:
//   /.netlify/functions/futebol?acao=proximos
//     -> últimos jogos (com placar, se já aconteceram) + próximos jogos do Vasco
//   /.netlify/functions/futebol?acao=detalhe&data=2026-08-02&adversario=Botafogo&local=casa&competicao=Campeonato+Brasileiro
//     -> placar final + quem entrou em campo (se o jogo já tiver acabado)
//     -> se for jogo do Brasileirão, confere o placar também no LANCE!+UOL antes de confiar
//        só na TheSportsDB (a escalação continua vindo sempre da TheSportsDB — LANCE/UOL só
//        têm a linha do tempo de eventos, não a lista de titulares)

const { extrairLance } = require('./lance-jogo');
const { extrairUol } = require('./uol-jogo');
const { verificarJogo } = require('./_comparador-fontes');

const BASE = 'https://www.thesportsdb.com/api/v1/json/123';
const TIME_NOME = 'Vasco da Gama';

let CACHE_TIME_ID = null;

async function chamarApi(caminho) {
  const r = await fetch(BASE + caminho);
  if (!r.ok) throw new Error('TheSportsDB respondeu ' + r.status);
  return r.json();
}

async function idDoVasco() {
  if (CACHE_TIME_ID) return CACHE_TIME_ID;
  const j = await chamarApi(`/searchteams.php?t=${encodeURIComponent(TIME_NOME)}`);
  const times = j.teams || [];
  const achado = times.find(t => (t.strSport || '').toLowerCase() === 'soccer') || times[0];
  if (!achado) throw new Error('Time "Vasco da Gama" não encontrado na TheSportsDB');
  CACHE_TIME_ID = achado.idTeam;
  return CACHE_TIME_ID;
}

// slug simples: minúsculo, sem acento, espaços viram hífen (serve pro LANCE e de forma similar pro UOL)
function slugificar(nome) {
  return (nome || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}
// nomes que a TheSportsDB usa não batem sempre com o "apelido curto" que LANCE/UOL usam na URL
// (ex.: TheSportsDB manda "Vasco da Gama", mas o site usa só "vasco"). Mapeia os times que o
// Vasco mais enfrenta no Brasileirão — qualquer time fora dessa lista cai no slug genérico, que
// funciona bem pra times de nome já curto (ex.: "Bahia", "Santos", "Palmeiras").
const APELIDO_TIME = {
  'vasco da gama': 'vasco', vasco: 'vasco',
  'athletico paranaense': 'athletico-pr', 'atletico paranaense': 'athletico-pr', athletico: 'athletico-pr',
  'atletico mineiro': 'atletico-mg', 'atlético mineiro': 'atletico-mg',
  'red bull bragantino': 'red-bull-bragantino', bragantino: 'red-bull-bragantino',
  'sao paulo': 'sao-paulo',
  fluminense: 'fluminense', flamengo: 'flamengo', botafogo: 'botafogo', corinthians: 'corinthians',
  palmeiras: 'palmeiras', santos: 'santos', gremio: 'gremio', internacional: 'internacional',
  cruzeiro: 'cruzeiro', bahia: 'bahia', vitoria: 'vitoria', coritiba: 'coritiba', remo: 'remo',
  ceara: 'ceara', fortaleza: 'fortaleza', mirassol: 'mirassol', juventude: 'juventude',
};
function nomeParaSlug(nome) {
  const chave = (nome || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  return APELIDO_TIME[chave] || slugificar(nome);
}

// mapeia cada competição do Vasco pro "pedaço" do endereço que cada site usa.
// LANCE: confirmado de verdade pra Brasileirão, Sudamericana e Libertadores (testado com jogos reais).
// UOL: confirmado só pra Brasileirão — "sul-americana"/"libertadores" é uma tentativa educada seguindo
// o mesmo padrão do Brasileirão; se não bater o slug certo, a função simplesmente não confirma nada
// e o site continua funcionando normal com a TheSportsDB, sem quebrar.
const COMPETICOES = [
  { teste: /brasileir[ãa]o|campeonato brasileiro/i, lance: 'brasileirao-serie-a', uol: 'brasileirao' },
  { teste: /sul[ -]?americana|sudamericana/i, lance: 'copa-sul-americana', uol: 'sul-americana' },
  { teste: /libertadores/i, lance: 'copa-libertadores-da-america', uol: 'libertadores' },
];
function achaCompeticao(nomeCompeticao) {
  return COMPETICOES.find(c => c.teste.test(nomeCompeticao || '')) || null;
}

function montarUrlsJogo(data, timeCasa, timeFora, competicaoInfo) {
  const [ano, mes, dia] = data.split('-');
  const slugCasa = nomeParaSlug(timeCasa), slugFora = nomeParaSlug(timeFora);
  return {
    lance: `https://www.lance.com.br/temporeal/partida/${competicaoInfo.lance}-${ano}-${dia}-${mes}-${ano}-${slugCasa.replace(/-/g,'')}x${slugFora.replace(/-/g,'')}`,
    uol: `https://placar.uol.com.br/esporte/futebol/${competicaoInfo.uol}/${ano}/${mes}/${dia}/${slugCasa}-x-${slugFora}.htm`,
  };
}

// tenta confirmar o placar de um jogo do Vasco direto no LANCE!+UOL, pra qualquer competição
// mapeada em COMPETICOES. Se der qualquer erro (site fora do ar, slug de time ou de competição
// que a gente não acertou, etc.), simplesmente devolve null e quem chamou continua usando a
// TheSportsDB normalmente — não quebra nada.
async function tentarConfirmarPlacar({ data, timeCasa, timeFora, competicao }) {
  const info = achaCompeticao(competicao);
  if (!info) return null;
  try {
    const urls = montarUrlsJogo(data, timeCasa, timeFora, info);
    const [lance, uol] = await Promise.all([
      extrairLance(urls.lance).catch(() => null),
      extrairUol(urls.uol).catch(() => null),
    ]);
    const veredito = verificarJogo([lance, uol].filter(Boolean));
    if (veredito.placar && (veredito.placar.nivel === 'confirmado' || veredito.placar.nivel === 'provavel')) {
      return { golsMandante: veredito.placar.placar.casa, golsVisitante: veredito.placar.placar.fora, nivel: veredito.placar.nivel, fontes: veredito.placar.fontesConcordantes };
    }
  } catch (e) { /* qualquer erro aqui e a gente simplesmente segue com a TheSportsDB, sem quebrar nada */ }
  return null;
}

// tenta achar a escalação titular oficial de um jogo do Vasco ainda não iniciado, direto no UOL
// (que publica num formato de dados limpo, casa/fora linha a linha). Normalmente só aparece de
// ~30 a 60 minutos antes da bola rolar — antes disso, devolve null normalmente.
async function tentarEscalacao({ data, timeCasa, timeFora, competicao }) {
  const info = achaCompeticao(competicao);
  if (!info) return null;
  try {
    const urls = montarUrlsJogo(data, timeCasa, timeFora, info);
    const uol = await extrairUol(urls.uol).catch(() => null);
    if (uol && uol.escalacaoTitular && (uol.escalacaoTitular.casa.length === 11 || uol.escalacaoTitular.fora.length === 11)) {
      return uol.escalacaoTitular;
    }
  } catch (e) { /* segue sem escalação, sem quebrar nada */ }
  return null;
}

function statusEncerrado(ev) {
  const st = (ev.strStatus || '').toLowerCase();
  if (st.includes('finished') || st === 'ft' || st === 'match finished') return true;
  if (ev.intHomeScore !== null && ev.intHomeScore !== undefined && ev.intAwayScore !== null && ev.intAwayScore !== undefined) {
    const dataJogo = new Date((ev.dateEvent || '') + 'T' + (ev.strTime || '23:59:00'));
    return dataJogo.getTime() < Date.now() - 2 * 3600000;
  }
  return false;
}

function resumirEvento(ev) {
  return {
    eventoId: ev.idEvent,
    data: ev.dateEvent,
    hora: (ev.strTime || '').slice(0, 5),
    liga: ev.strLeague,
    mandante: ev.strHomeTeam,
    visitante: ev.strAwayTeam,
    golsMandante: ev.intHomeScore !== null && ev.intHomeScore !== undefined ? Number(ev.intHomeScore) : null,
    golsVisitante: ev.intAwayScore !== null && ev.intAwayScore !== undefined ? Number(ev.intAwayScore) : null,
    encerrado: statusEncerrado(ev),
    estadio: ev.strVenue || null,
  };
}

async function acaoProximos(res) {
  const timeId = await idDoVasco();
  const [proximosJ, ultimosJ] = await Promise.all([
    chamarApi(`/eventsnext.php?id=${timeId}`),
    chamarApi(`/eventslast.php?id=${timeId}`),
  ]);
  const proximos = proximosJ.events || [];
  const ultimos = ultimosJ.results || ultimosJ.events || [];
  const vistos = new Set();
  const todos = [...ultimos, ...proximos].filter(ev => {
    if (vistos.has(ev.idEvent)) return false;
    vistos.add(ev.idEvent);
    return true;
  });
  res(200, { jogos: todos.map(resumirEvento) });
}

async function acaoDetalhe(params, res) {
  const timeId = await idDoVasco();
  let eventoId = params.fixture || params.evento;

  if (!eventoId) {
    if (!params.data) return res(400, { erro: 'Informe "evento" (ID do jogo) ou "data" (YYYY-MM-DD) + "adversario".' });
    const [proximosJ, ultimosJ] = await Promise.all([
      chamarApi(`/eventsnext.php?id=${timeId}`),
      chamarApi(`/eventslast.php?id=${timeId}`),
    ]);
    const candidatos = [...(ultimosJ.results || ultimosJ.events || []), ...(proximosJ.events || [])];
    let achado = candidatos.find(ev => ev.dateEvent === params.data);
    if (params.adversario && candidatos.filter(ev => ev.dateEvent === params.data).length > 1) {
      const alvo = params.adversario.toLowerCase();
      achado = candidatos.find(ev => ev.dateEvent === params.data &&
        ((ev.strHomeTeam || '').toLowerCase().includes(alvo) || (ev.strAwayTeam || '').toLowerCase().includes(alvo))
      ) || achado;
    }
    if (!achado) return res(404, { erro: 'Nenhum jogo do Vasco encontrado nessa data (a TheSportsDB só guarda os últimos/próximos 5 jogos do time — se for um jogo mais antigo, talvez não apareça).' });
    eventoId = achado.idEvent;
  }

  const detJ = await chamarApi(`/lookupevent.php?id=${eventoId}`);
  const ev = (detJ.events || [])[0];
  if (!ev) return res(404, { erro: 'Jogo não encontrado.' });
  const resumo = resumirEvento(ev);

  if (!resumo.encerrado) {
    return res(200, { jogo: resumo, encerrado: false });
  }

  // tenta confirmar o placar direto no LANCE!+UOL (qualquer competição mapeada) — se confirmar,
  // usa esse placar (mais rápido e assertivo que esperar a TheSportsDB atualizar); senão, segue
  // com o que a TheSportsDB já trouxe, sem travar nem quebrar nada.
  let fonteExtra = null;
  const confirmado = await tentarConfirmarPlacar({ data: resumo.data, timeCasa: resumo.mandante, timeFora: resumo.visitante, competicao: params.competicao || resumo.liga });
  if (confirmado) {
    resumo.golsMandante = confirmado.golsMandante;
    resumo.golsVisitante = confirmado.golsVisitante;
    fonteExtra = { fonte: 'lance+uol', nivel: confirmado.nivel, fontesConcordantes: confirmado.fontes };
  }

  let escalacao = { mandante: [], visitante: [] };
  try {
    const linJ = await chamarApi(`/lookuplineup.php?id=${eventoId}`);
    const lista = linJ.lineup || [];
    lista.forEach(j => {
      const lado = j.strHome === 'Yes' ? 'mandante' : 'visitante';
      escalacao[lado].push({
        nome: j.strPlayer,
        posicao: j.strPosition || null,
        titular: j.strSubstitute !== 'Yes',
      });
    });
  } catch (e) { /* lineup pode não estar disponível — segue só com o placar */ }

  res(200, { jogo: resumo, encerrado: true, escalacao, escalacaoDisponivel: escalacao.mandante.length + escalacao.visitante.length > 0, placarConfirmadoPor: fonteExtra });
}

async function acaoEscalacaoPreJogo(params, res) {
  if (!params.data || !params.timeCasa || !params.timeFora) {
    return res(400, { erro: 'Informe "data" (YYYY-MM-DD), "timeCasa" e "timeFora".' });
  }
  const escalacao = await tentarEscalacao({ data: params.data, timeCasa: params.timeCasa, timeFora: params.timeFora, competicao: params.competicao });
  if (!escalacao) return res(200, { encontrada: false });
  res(200, { encontrada: true, escalacao, fonte: 'uol' });
}

exports.handler = async (event) => {
  const responder = (status, body) => ({
    statusCode: status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(body),
  });
  const params = event.queryStringParameters || {};
  try {
    let resultado = null;
    const capturar = (s, b) => { resultado = { statusCode: s, body: b }; };
    if (params.acao === 'proximos') await acaoProximos(capturar);
    else if (params.acao === 'detalhe') await acaoDetalhe(params, capturar);
    else if (params.acao === 'escalacaoPreJogo') await acaoEscalacaoPreJogo(params, capturar);
    else return responder(400, { erro: 'Use ?acao=proximos, ?acao=detalhe ou ?acao=escalacaoPreJogo' });
    return responder(resultado.statusCode, resultado.body);
  } catch (e) {
    return responder(500, { erro: String(e.message || e) });
  }
};
