// Função agendada (roda sozinha a cada 30 min, configurado no netlify.toml).
// Verifica as condições de cada tipo de notificação e dispara via Firebase Cloud Messaging.
//
// PRECISA das variáveis de ambiente no Netlify:
//   FIREBASE_SERVICE_ACCOUNT  -> cole o JSON inteiro da chave de conta de serviço (Firebase Console)
//
// Usa o MESMO helper de envio (_push-helper.js) que o teste manual e o broadcast usam —
// antes essa função tinha uma cópia própria e desatualizada, que nunca recebeu a correção
// do formato de mensagem, e por isso as notificações automáticas paravam de chegar
// mesmo com o teste manual funcionando normalmente.
const { mandarPush, garantirFirebase, admin } = require('./_push-helper');

const HORA = 3600000;

// ---------- Textos das notificações ----------
const FRASES_MOTIVACIONAL = [
  { hora: 8, texto: 'Comece o dia com a frase do Vasbobo Acredita.' },
  { hora: 16, texto: 'Já viu a frase do Vasbobo Acredita motivacional do dia?' },
  { hora: 21, texto: 'Termine o dia com a frase do Vasbobo Acredita' },
];
const FRASES_QUIZ = [
  { hora: 9, texto: 'O que mais entende de futebol! Você ou DaniGil?' },
  { hora: 17, texto: 'Sabedoria do Vasbobo. O que mais entende! Teste seu conhecimento' },
  { hora: 22, texto: 'Faça pontos no quiz da Rodada!' },
];
// deltas em horas desde a liberação da avaliação (fim do jogo)
const LEMBRETES_AVALIACAO = [
  { desde: 0, ate: 1, texto: (j) => `Avalie os jogadores! Vamos finalizar o ranking da rodada. (${j})` },
  { desde: 1, ate: 2, texto: (j) => `Avalie os jogadores! Vamos finalizar o ranking da rodada. Cuidado com a penalidade. (${j})` },
  { horaDoDia: 7, minDesde: 12, texto: (j) => `Avalie os jogadores! Corre igual o Velloso que dá tempo. (${j})` },
  { horaDoDia: 10, minDesde: 12, texto: (j) => `Avalie os jogadores! Ainda dá tempo. (${j})` },
  { horaDoDia: 16, minDesde: 12, texto: (j) => `Avalie os jogadores! Vai acabar e será penalizado por menos 2 pontos. (${j})` },
  { horaDoDia: 20, minDesde: 12, texto: (j) => `Avalie os jogadores! Última chance. Vota logo seu Vasbobo, filha da puta. (${j})` },
];
const LEMBRETES_PALPITE = [
  { apos: 36, texto: 'Palpites liberados para o próximo jogo. Faça igual o Vitor e se antecipe o máximo!' },
  { apos: 48, texto: 'Tá com medo da derrota do Vascão? Vota logo' },
  { apos: 60, texto: 'Dê seu palpite e reze.' },
];

async function jaEnviou(db, chave) {
  const doc = await db.collection('notif_enviadas').doc(chave).get();
  return doc.exists;
}
async function marcarEnviado(db, chave) {
  await db.collection('notif_enviadas').doc(chave).set({ quando: Date.now() });
}

exports.handler = async () => {
  try {
    garantirFirebase();
  } catch (e) {
    return { statusCode: 500, body: 'Config ausente: ' + e.message };
  }
  const db = admin.firestore();
  const agora = new Date();
  const horaAtual = agora.getHours();
  const chaveDia = agora.toISOString().slice(0, 10);

  const usuariosSnap = await db.collection('usuarios').get().catch(() => null);
  let usuarios = [];
  if (usuariosSnap && !usuariosSnap.empty) {
    usuarios = usuariosSnap.docs.map((d) => d.id);
  } else {
    const principal = await db.collection('shared').doc('vasbobo_v2').get();
    if (principal.exists) usuarios = Object.keys((principal.data().value ? JSON.parse(principal.data().value) : {}).usuarios || {});
  }

  let enviados = 0, falhas = 0;

  for (const regra of FRASES_MOTIVACIONAL) {
    if (horaAtual !== regra.hora) continue;
    for (const usuario of usuarios) {
      const chave = `motiv_${usuario}_${chaveDia}_${regra.hora}`;
      if (await jaEnviou(db, chave)) continue;
      const usoDoc = await db.collection('frases_uso').doc(usuario).get();
      const jaViuHoje = usoDoc.exists && usoDoc.data().data === chaveDia;
      if (jaViuHoje) { await marcarEnviado(db, chave); continue; }
      const r = await mandarPush(usuario, 'VASBOBO', regra.texto, '/?abrirVasboboAcredita=1');
      if (r.ok) enviados++; else falhas++;
      await marcarEnviado(db, chave);
    }
  }

  for (const regra of FRASES_QUIZ) {
    if (horaAtual !== regra.hora) continue;
    for (const usuario of usuarios) {
      const chave = `quiz_${usuario}_${chaveDia}_${regra.hora}`;
      if (await jaEnviou(db, chave)) continue;
      const quizDoc = await db.collection('shared').doc('vasbobo_quiz').get();
      const diario = quizDoc.exists ? (quizDoc.data().diario || {}) : {};
      const status = diario[`${usuario}|${chaveDia}`] || { respondidas: 0 };
      if (status.respondidas >= 3) { await marcarEnviado(db, chave); continue; }
      const r = await mandarPush(usuario, 'VASBOBO', regra.texto, '/futebol.html');
      if (r.ok) enviados++; else falhas++;
      await marcarEnviado(db, chave);
    }
  }

  try {
    const agendadasSnap = await db.collection('mensagens_agendadas').where('hora', '==', horaAtual).where('ativo', '==', true).get();
    if (!agendadasSnap.empty) {
      const tokensSnap = await db.collection('push_tokens').get();
      for (const msgDoc of agendadasSnap.docs) {
        const msg = msgDoc.data();
        // se a mensagem tem "usuario" definido, manda só pra essa pessoa; senão, pra todo mundo
        const destinatarios = msg.usuario ? [msg.usuario] : tokensSnap.docs.map((d) => d.id);
        for (const usuario of destinatarios) {
          const chave = `agendada_${msgDoc.id}_${usuario}_${chaveDia}_${horaAtual}`;
          if (await jaEnviou(db, chave)) continue;
          const r = await mandarPush(usuario, 'VASBOBO', msg.texto, '/', false);
          if (r.ok) enviados++; else falhas++;
          await marcarEnviado(db, chave);
        }
      }
    }
  } catch (e) { console.error('erro nas mensagens agendadas', e); }

  const principalDoc = await db.collection('shared').doc('vasbobo_v2').get();
  if (principalDoc.exists) {
    const dados = JSON.parse(principalDoc.data().value || '{}');
    const jogos = dados.jogos || {};
    for (const [id, j] of Object.entries(jogos)) {
      if (!j.resultado || !j.resultadoEm) continue;
      const horasDesde = (Date.now() - j.resultadoEm) / HORA;
      const nomeJogo = `Vasco x ${j.adversario || ''}`;
      const palpitantes = Object.keys(j.palpites || {});

      for (const regra of LEMBRETES_AVALIACAO) {
        let deveMandar = false;
        let idRegra = '';
        if (regra.desde !== undefined) {
          deveMandar = horasDesde >= regra.desde && horasDesde < regra.ate;
          idRegra = `${regra.desde}-${regra.ate}`;
        } else {
          deveMandar = horaAtual === regra.horaDoDia && horasDesde >= regra.minDesde;
          idRegra = `h${regra.horaDoDia}`;
        }
        if (!deveMandar) continue;
        for (const usuario of palpitantes) {
          const jaAvaliou = j.avaliacoes && j.avaliacoes[usuario] && Object.keys(j.avaliacoes[usuario]).length;
          if (jaAvaliou) continue;
          const chave = `aval_${usuario}_${id}_${idRegra}_${chaveDia}`;
          if (await jaEnviou(db, chave)) continue;
          const r = await mandarPush(usuario, 'VASBOBO', regra.texto(nomeJogo), `/?avaliarJogo=${id}`);
          if (r.ok) enviados++; else falhas++;
          await marcarEnviado(db, chave);
        }
      }
    }

    const proximoJogo = Object.entries(jogos)
      .filter(([, j]) => !j.resultado)
      .sort((a, b) => (a[1].data + (a[1].hora || '23:59')).localeCompare(b[1].data + (b[1].hora || '23:59')))[0];
    const ultimoComResultado = Object.values(jogos)
      .filter((j) => j.resultadoEm)
      .sort((a, b) => b.resultadoEm - a.resultadoEm)[0];

    if (proximoJogo && ultimoComResultado) {
      const [idProx, jProx] = proximoJogo;
      const horasDesde = (Date.now() - ultimoComResultado.resultadoEm) / HORA;
      for (const regra of LEMBRETES_PALPITE) {
        if (Math.floor(horasDesde) !== regra.apos) continue;
        for (const usuario of usuarios) {
          if (jProx.palpites && jProx.palpites[usuario]) continue;
          const chave = `palp_${usuario}_${idProx}_${regra.apos}`;
          if (await jaEnviou(db, chave)) continue;
          const r = await mandarPush(usuario, 'VASBOBO', regra.texto, '/');
          if (r.ok) enviados++; else falhas++;
          await marcarEnviado(db, chave);
        }
      }
      if (horaAtual === 8 && jProx.data === chaveDia) {
        for (const usuario of usuarios) {
          if (jProx.palpites && jProx.palpites[usuario]) continue;
          const chave = `palp_${usuario}_${idProx}_diajogo`;
          if (await jaEnviou(db, chave)) continue;
          const r = await mandarPush(usuario, 'VASBOBO', 'É dia de Vasco. Faça logo seu palpite.', '/');
          if (r.ok) enviados++; else falhas++;
          await marcarEnviado(db, chave);
        }
      }
    }
  }

  return { statusCode: 200, body: `OK - ${enviados} enviadas, ${falhas} falharam` };
};
