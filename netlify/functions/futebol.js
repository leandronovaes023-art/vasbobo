// Proxy gratuito para a TheSportsDB (thesportsdb.com) — cobre a temporada atual,
// diferente da API-Football (cujo plano grátis só libera temporadas antigas).
// Usa a chave pública gratuita "123" (não é segredo, não precisa de variável de ambiente).
//
// Uso pelo site:
//   /.netlify/functions/futebol?acao=proximos
//     -> últimos jogos (com placar, se já aconteceram) + próximos jogos do Vasco
//   /.netlify/functions/futebol?acao=detalhe&data=2026-08-02&adversario=Botafogo
//     -> placar final + quem entrou em campo (se o jogo já tiver acabado)

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

  res(200, { jogo: resumo, encerrado: true, escalacao, escalacaoDisponivel: escalacao.mandante.length + escalacao.visitante.length > 0 });
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
    else return responder(400, { erro: 'Use ?acao=proximos ou ?acao=detalhe' });
    return responder(resultado.statusCode, resultado.body);
  } catch (e) {
    return responder(500, { erro: String(e.message || e) });
  }
};
