// Função agendada (roda sozinha a cada 30 min, configurado no netlify.toml).
// Verifica as condições de cada tipo de notificação e dispara via Firebase Cloud Messaging.
//
// PRECISA das variáveis de ambiente no Netlify:
//   FIREBASE_SERVICE_ACCOUNT  -> cole o JSON inteiro da chave de conta de serviço (Firebase Console)
//
// As frases agora vivem no Firestore (coleção notif_frases, ver _frases.js), editáveis
// pelo admin em Configurações → Notificações. Nada mais fica fixo no código.
const { mandarPush, garantirFirebase, admin } = require('./_push-helper');
const { garantirSeed, buscarFrases, sorteia } = require('./_frases');

const HORA = 3600000;

const PREFIXOS_HOJE = ['Hoje é dia de Vasco!', 'Hoje é Vascão!', 'Hoje nosso Vascão entra em campo!', 'Hoje tem Vasco!', 'Hoje tem Vascão!'];
const PREFIXOS_AMANHA = ['Amanhã tem Vasco!', 'Amanhã é dia de Vascão!', 'Amanhã o Vasco joga!', 'Amanhã o Colossal joga!'];
function sorteiaTexto(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
function comPrefixo(lista, frase) { return `${sorteiaTexto(lista)} ${frase}`; }

// deltas em horas desde a liberação da avaliação (fim do jogo)
const LEMBRETES_AVALIACAO = [
  { desde: 0, ate: 1 },
  { desde: 1, ate: 2 },
  { desde: 8, ate: 9 },
  { desde: 14, ate: 15 },
  { desde: 20, ate: 21 },
  { desde: 23, ate: 24 },
];
const LEMBRETES_PALPITE = [{ apos: 42 }, { apos: 50 }, { apos: 58 }];

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
  await garantirSeed(db);
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

  // ---------- Vasbobo Acredita ----------
  const frasesMotivHora = await buscarFrases(db, 'motivacional', horaAtual);
  if (frasesMotivHora.length) {
    for (const usuario of usuarios) {
      const chave = `motiv_${usuario}_${chaveDia}_${horaAtual}`;
      if (await jaEnviou(db, chave)) continue;
      const usoDoc = await db.collection('frases_uso').doc(usuario).get();
      const jaViuHoje = usoDoc.exists && usoDoc.data().data === chaveDia;
      if (jaViuHoje) { await marcarEnviado(db, chave); continue; }
      const r = await mandarPush(usuario, 'VASBOBO', sorteia(frasesMotivHora), '/?abrirVasboboAcredita=1');
      if (r.ok) enviados++; else falhas++;
      await marcarEnviado(db, chave);
    }
  }

  // ---------- Quiz ----------
  const frasesQuizHora = await buscarFrases(db, 'quiz', horaAtual);
  if (frasesQuizHora.length) {
    for (const usuario of usuarios) {
      const chave = `quiz_${usuario}_${chaveDia}_${horaAtual}`;
      if (await jaEnviou(db, chave)) continue;
      const quizDoc = await db.collection('shared').doc('vasbobo_quiz').get();
      const diario = quizDoc.exists ? (quizDoc.data().diario || {}) : {};
      const status = diario[`${usuario}|${chaveDia}`] || { respondidas: 0 };
      if (status.respondidas >= 3) { await marcarEnviado(db, chave); continue; }
      const r = await mandarPush(usuario, 'VASBOBO', sorteia(frasesQuizHora), '/futebol.html');
      if (r.ok) enviados++; else falhas++;
      await marcarEnviado(db, chave);
    }
  }

  // ---------- Mensagens agendadas fixas (criadas pelo admin) ----------
  try {
    const agendadasSnap = await db.collection('mensagens_agendadas').where('hora', '==', horaAtual).where('ativo', '==', true).get();
    if (!agendadasSnap.empty) {
      const tokensSnap = await db.collection('push_tokens').get();
      for (const msgDoc of agendadasSnap.docs) {
        const msg = msgDoc.data();
        if (msg.data && msg.data !== chaveDia) continue; // agendada pra um dia específico que não é hoje
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
    const frasesAvaliar = await buscarFrases(db, 'avaliar');
    const frasesVotar = await buscarFrases(db, 'votar');

    for (const [id, j] of Object.entries(jogos)) {
      if (!j.resultado || !j.resultadoEm) continue;
      if (!j.emCampo || !j.emCampo.length) continue;
      const horasDesde = (Date.now() - j.resultadoEm) / HORA;
      const casa = j.local !== 'fora';
      const timeCasa = casa ? 'Vasco' : (j.adversario || '');
      const timeFora = casa ? (j.adversario || '') : 'Vasco';
      const golsCasa = casa ? j.resultado.v : j.resultado.a;
      const golsFora = casa ? j.resultado.a : j.resultado.v;
      const nomeJogo = `${timeCasa} ${golsCasa}x${golsFora} ${timeFora}`;
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
          const r = await mandarPush(usuario, 'VASBOBO', `${sorteia(frasesAvaliar) || 'Avalie os jogadores!'} (${nomeJogo})`, `/?avaliarJogo=${id}`);
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
          const r = await mandarPush(usuario, 'VASBOBO', sorteia(frasesVotar) || 'Dê seu palpite!', '/');
          if (r.ok) enviados++; else falhas++;
          await marcarEnviado(db, chave);
        }
      }
      if (horaAtual === 8 && jProx.data === chaveDia) {
        for (const usuario of usuarios) {
          if (jProx.palpites && jProx.palpites[usuario]) continue;
          const chave = `palp_${usuario}_${idProx}_diajogo`;
          if (await jaEnviou(db, chave)) continue;
          const r = await mandarPush(usuario, 'VASBOBO', comPrefixo(PREFIXOS_HOJE, sorteia(frasesVotar) || 'Dê seu palpite!'), '/');
          if (r.ok) enviados++; else falhas++;
          await marcarEnviado(db, chave);
        }
      }
    }

    // ---------- Dia de jogo: 2 mensagens de manhã + 1 duas horas antes da bola rolar ----------
    const jogoHoje = Object.entries(jogos).find(([, j]) => j.data === chaveDia && !j.resultado);
    if (jogoHoje) {
      const [idHoje, jHoje] = jogoHoje;
      const HORAS_MANHA = [9, 12];
      for (const horaRegra of HORAS_MANHA) {
        if (horaAtual !== horaRegra) continue;
        for (const usuario of usuarios) {
          const chave = `diajogo_manha_${usuario}_${idHoje}_${horaRegra}`;
          if (await jaEnviou(db, chave)) continue;
          const r = await mandarPush(usuario, 'VASBOBO', comPrefixo(PREFIXOS_HOJE, sorteia(frasesVotar) || 'Vai votar hoje?'), '/');
          if (r.ok) enviados++; else falhas++;
          await marcarEnviado(db, chave);
        }
      }
      if (jHoje.hora) {
        const [hh] = jHoje.hora.split(':').map(Number);
        const horaAlvo = hh - 2;
        if (horaAlvo >= 0 && horaAtual === horaAlvo) {
          for (const usuario of usuarios) {
            const chave = `diajogo_2h_${usuario}_${idHoje}`;
            if (await jaEnviou(db, chave)) continue;
            const r = await mandarPush(usuario, 'VASBOBO', comPrefixo(PREFIXOS_HOJE, `Faltam 2 horas pro jogo! ${sorteia(frasesVotar) || ''}`), '/');
            if (r.ok) enviados++; else falhas++;
            await marcarEnviado(db, chave);
          }
        }
      }
    }

    // ---------- Véspera: amanhã tem jogo do Vasco ----------
    const amanha = new Date(agora.getTime() + 24 * HORA).toISOString().slice(0, 10);
    const jogoAmanha = Object.entries(jogos).find(([, j]) => j.data === amanha && !j.resultado);
    if (jogoAmanha && horaAtual === 20) {
      const [idAmanha] = jogoAmanha;
      for (const usuario of usuarios) {
        const chave = `vespera_${usuario}_${idAmanha}`;
        if (await jaEnviou(db, chave)) continue;
        const r = await mandarPush(usuario, 'VASBOBO', comPrefixo(PREFIXOS_AMANHA, 'Já vai se programando.'), '/');
        if (r.ok) enviados++; else falhas++;
        await marcarEnviado(db, chave);
      }
    }
  }

  return { statusCode: 200, body: `OK - ${enviados} enviadas, ${falhas} falharam` };
};
