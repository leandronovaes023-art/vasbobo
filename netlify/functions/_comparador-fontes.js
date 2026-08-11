// Comparador/normalizador do sistema de verificação com múltiplas fontes.
// Recebe os resultados de extração de cada site (LANCE, UOL, ESPN — cada um no formato
// { fonte, encerrado, placar:{casa,fora}, times:{casa,fora}, eventos:[...] }) e devolve um
// veredito único, com nível de confiança, seguindo a lógica que foi desenhada:
//   3/3 fontes concordam → 🟢 confirmado, pode publicar
//   2/3 concordam        → 🟡 provável, publica mas fica marcado
//   1/3 ou fontes brigando → 🔴 diverge, não publica sozinho, cai pra revisão manual

function normalizarNomeJogador(nome) {
  if (!nome) return '';
  return nome
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acento
    .toLowerCase()
    .replace(/^[a-z]\.\s*/, '') // tira inicial abreviada tipo "M. " de "M. Sanabria"
    .replace(/[^a-z\s]/g, '')
    .trim();
}

// compara dois nomes de jogador de forma tolerante (abreviação, acento, apelido x nome completo)
function mesmoJogador(a, b) {
  const na = normalizarNomeJogador(a), nb = normalizarNomeJogador(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  // um nome contido no outro (ex.: "hinestroza" dentro de "marino hinestroza")
  return na.includes(nb) || nb.includes(na);
}

// junta os placares das fontes disponíveis e decide o nível de confiança
function compararPlacares(resultados) {
  const validos = resultados.filter((r) => r && r.placar && r.encerrado);
  if (!validos.length) return { nivel: 'sem_dados', motivo: 'nenhuma fonte encontrou o jogo encerrado ainda' };

  const chave = (r) => `${r.placar.casa}-${r.placar.fora}`;
  const contagem = {};
  validos.forEach((r) => { contagem[chave(r)] = (contagem[chave(r)] || []).concat(r.fonte); });
  const chaves = Object.keys(contagem);

  // todas as fontes que responderam concordam entre si
  if (chaves.length === 1) {
    const [casa, fora] = chaves[0].split('-').map(Number);
    const nivel = validos.length >= 3 ? 'confirmado' : validos.length === 2 ? 'provavel' : 'unica_fonte';
    return { nivel, placar: { casa, fora }, fontesConcordantes: contagem[chaves[0]], totalFontesConsultadas: resultados.length };
  }

  // fontes divergindo — não publica sozinho
  return { nivel: 'divergencia', opcoes: contagem, totalFontesConsultadas: resultados.length };
}

// junta as listas de eventos das fontes, marcando cada evento com quantas fontes o confirmam
function compararEventos(resultados) {
  const validos = resultados.filter((r) => r && Array.isArray(r.eventos));
  const eventosBrutos = [];
  validos.forEach((r) => {
    r.eventos.forEach((ev) => {
      if (ev.tipo === 'substituicao' || ev.tipo === 'gol' || ev.tipo === 'cartao_amarelo' || ev.tipo === 'cartao_vermelho') {
        eventosBrutos.push({ ...ev, fonte: r.fonte });
      }
    });
  });

  const grupos = [];
  eventosBrutos.forEach((ev) => {
    // procura um grupo já existente que "bata" com esse evento (mesmo tipo, minuto próximo, jogador parecido)
    const grupo = grupos.find((g) => {
      if (g.tipo !== ev.tipo) return false;
      if (g.minuto != null && ev.minuto != null && Math.abs(g.minuto - ev.minuto) > 2) return false;
      const jogadorGrupo = g.jogador || g.entra;
      const jogadorEvento = ev.jogador || ev.entra;
      return mesmoJogador(jogadorGrupo, jogadorEvento);
    });
    if (grupo) {
      grupo.fontes.push(ev.fonte);
      grupo.detalhesPorFonte.push(ev);
    } else {
      grupos.push({
        tipo: ev.tipo, minuto: ev.minuto, jogador: ev.jogador || null, entra: ev.entra || null, sai: ev.sai || null,
        fontes: [ev.fonte], detalhesPorFonte: [ev],
      });
    }
  });

  const totalFontes = validos.length;
  return grupos.map((g) => ({
    ...g,
    nivel: totalFontes >= 3 ? (g.fontes.length >= 3 ? 'confirmado' : g.fontes.length === 2 ? 'provavel' : 'unica_fonte')
      : (g.fontes.length >= 2 ? 'provavel' : 'unica_fonte'),
  }));
}

function verificarJogo(resultados) {
  return {
    placar: compararPlacares(resultados),
    eventos: compararEventos(resultados),
    fontesConsultadas: resultados.map((r) => ({ fonte: r ? r.fonte : null, encontrouJogo: !!(r && r.placar) })),
  };
}

module.exports = { verificarJogo, compararPlacares, compararEventos, mesmoJogador, normalizarNomeJogador };
