// Varredura periódica das Batalhas 1x1 (Quiz x1 e Desafios) — resolve por W.O. qualquer batalha
// que passou do prazo sem os dois jogadores terminarem, mesmo que ninguém tenha aberto o app
// pra "destravar" isso na hora (o app também faz essa checagem quando alguém abre a batalha,
// mas essa função aqui garante que funciona mesmo se ninguém abrir).
// Prazos: Quiz x1 (batalha do dia) — até 23:59 (horário de Brasília) do dia em que começou.
// Desafio — até 24h depois de criado.
const { garantirFirebase, admin, mandarPush, registrarLogServidor } = require('./_push-helper');

const BAT_MAX_PERGUNTAS = 5;

function prazoVenceu(b, agora) {
  if (b.tipo === 'desafio') {
    return agora > (b.criadaEm + 24 * 3600000);
  }
  const fimDoDia = new Date(b.data + 'T23:59:59-03:00').getTime();
  return agora > fimDoDia;
}

exports.handler = async () => {
  try {
    garantirFirebase();
  } catch (e) {
    return { statusCode: 500, body: 'Config ausente: ' + e.message };
  }
  const db = admin.firestore();
  const agora = Date.now();
  let verificadas = 0, resolvidasWO = 0, expiradas = 0;

  try {
    const pendentes = await db.collection('batalhas_quiz')
      .where('status', 'in', ['aguardando', 'em_andamento'])
      .get();

    for (const doc of pendentes.docs) {
      const b = doc.data();
      verificadas++;
      if (!prazoVenceu(b, agora)) continue;

      const [a, c] = b.jogadores;
      const completouA = (b.respostas[a] || []).filter(Boolean).length >= BAT_MAX_PERGUNTAS;
      const completouC = (b.respostas[c] || []).filter(Boolean).length >= BAT_MAX_PERGUNTAS;
      if (completouA && completouC) continue; // não deveria acontecer (já estaria finalizada), mas por segurança não mexe

      const ref = doc.ref;
      if (!completouA && !completouC) {
        await ref.update({ status: 'expirada', resultado: null, pontos: { [a]: 0, [c]: 0 }, finalizadaEm: agora, motivoEncerramento: 'sem_resposta' });
        expiradas++;
        continue;
      }

      const vencedor = completouA ? a : c;
      const perdedor = vencedor === a ? c : a;
      await ref.update({ status: 'finalizada', resultado: vencedor, pontos: { [vencedor]: 2, [perdedor]: 0 }, finalizadaEm: agora, motivoEncerramento: 'wo' });
      resolvidasWO++;

      // atualiza o histórico de confrontos, igual o app faz no cliente
      try {
        const configRef = db.collection('shared').doc('vasbobo_batalhas_config');
        const configSnap = await configRef.get();
        const cfg = configSnap.exists ? configSnap.data() : { confrontos: {} };
        const chave = [a, c].sort().join('|');
        const cAtual = (cfg.confrontos && cfg.confrontos[chave]) || { batalhas: 0, vitorias: {}, empates: 0, ultimaData: null, sequencia: { quem: null, qtd: 0 } };
        cAtual.batalhas = (cAtual.batalhas || 0) + 1;
        cAtual.ultimaData = b.data;
        if (!cAtual.vitorias) cAtual.vitorias = {};
        cAtual.vitorias[vencedor] = (cAtual.vitorias[vencedor] || 0) + 1;
        if (cAtual.sequencia && cAtual.sequencia.quem === vencedor) cAtual.sequencia.qtd++;
        else cAtual.sequencia = { quem: vencedor, qtd: 1 };
        if (!cfg.confrontos) cfg.confrontos = {};
        cfg.confrontos[chave] = cAtual;
        await configRef.set(cfg);
      } catch (e) { /* não deixa isso quebrar o resto */ }

      try {
        await mandarPush(vencedor, '⚔️ Vitória por W.O.!', capitaliza(perdedor) + ' não respondeu a tempo — a vitória é sua.', '/', false);
        await mandarPush(perdedor, '⚔️ Você perdeu por W.O.', 'Não deu tempo de responder — ' + capitaliza(vencedor) + ' levou por W.O. Fica ligado no prazo na próxima!', '/', false);
      } catch (e) {}
    }

    await registrarLogServidor(db, { tipo: 'sistema', nivel: 'comum', detalhe: `Varredura de W.O. de batalhas: ${verificadas} verificadas, ${resolvidasWO} resolvidas por W.O., ${expiradas} expiradas sem resposta` });
    return { statusCode: 200, body: JSON.stringify({ verificadas, resolvidasWO, expiradas }) };
  } catch (e) {
    await registrarLogServidor(db, { tipo: 'sistema', nivel: 'critico', detalhe: `Varredura de W.O. FALHOU: ${e.message}` });
    return { statusCode: 500, body: 'Erro: ' + e.message };
  }
};

function capitaliza(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
