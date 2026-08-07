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
// ---------- Prefixos de dia (sorteados) ----------
const PREFIXOS_HOJE = ['Hoje é dia de Vasco!', 'Hoje é Vascão!', 'Hoje nosso Vascão entra em campo!', 'Hoje tem Vasco!', 'Hoje tem Vascão!'];
const PREFIXOS_AMANHA = ['Amanhã tem Vasco!', 'Amanhã é dia de Vascão!', 'Amanhã o Vasco joga!', 'Amanhã o Colossal joga!'];
function comPrefixo(lista, frase) { return `${lista[Math.floor(Math.random() * lista.length)]} ${frase}`; }
function sorteia(lista) { return lista[Math.floor(Math.random() * lista.length)]; }

// ---------- Banco grande de frases pra votar o palpite (antes/dia de jogo) ----------
const FRASES_VOTAR = [
  'O "que mais entende de futebol" votou e já errou (pra variar). Vote e faça o contrário.',
  'Daniel vai dormir feliz com a meia Bob Esponja. Vota antes que ele durma.',
  'Se o Novaes sobreviver ao intervalo sem defender o Pedrinho, você consegue votar.',
  'Vote antes que o Novaes coma todos os palpites.',
  'Até o Daniel largou as figurinhas para votar.',
  'O Daniel já cancelou o sócio. Você não precisa cancelar seu palpite.',
  'Se tem Vasco, o Douglas já abriu a Netvasco 83x hoje. Abre o Vasbobo uma vez e vá votar.',
  'O Douglas já preparou a defesa do Pedrinho. Agora falta você votar.',
  'Faça igual ao Vitor e chegue 3 horas antes... pelo menos no palpite do placar.',
  'Vitor já estaria em São Januário. Você ainda nem abriu o app para votar no placar.',
  'O Vitor não gosta de ficar atrás do gol porque é ruim para ver o jogo. No app você vê tudo fácil e vota.',
  'Termine seu palpite antes do Velloso comprar mais um tênis.',
  'Hoje tem Vasco! GOLE... e já aproveita pra votar.',
  'Hoje tem jogo! O Jorge já escolheu o bar e a gordinha.',
  'Vote antes da terceira cerveja do Jorge.',
  'O Juan conseguiu autorização pra sair. Você consegue votar.',
  'A tornozeleira imaginária do Juan foi liberada e você também está liberado para votar.',
  'O Alex já fez um scouting do jogo. Você só precisa votar.',
  'O Azevedo apareceu... aproveita esse fenômeno raro e vote.',
  'Corre! O "que mais entende de futebol" já deve estar errando o placar.',
  'Última chamada! O Douglas já publicou três notícias e você nem votou.',
  'Corre e vote logo, antes que o Douglas explique por que seu atraso favorece o Pedrinho.',
  'Nem chegando 3 horas antes o Vitor salva quem esqueceu de votar.',
  'Corre! O Velloso termina uma maratona antes de você votar.',
  'Última chance! Depois da próxima cerveja do Jorge ninguém responde por ele.',
  'Vai lá. A autorização do Juan saiu agora e a sua também. Vote.',
  'NOVAES MANDOU AVISAR! Vote antes que eu tenha que defender você também, além do Pedrinho.',
  'DANIEL MANDOU UMA MENSAGEM! O que mais entende de futebol já votou... agora falta quem entende mesmo.',
  'DANIEL MANDOU AVISAR! Vai votar ou tá escolhendo figurinha igual eu?',
  'DANIEL MANDOU AVISAR! Acho engraçado vocês demorando pra votar, não entendem nada mesmo.',
  'DOUGLAS MANDOU AVISAR! A Netvasco já me confirmou que vocês estão atrasados para a votação.',
  'DOUGLAS ENVIOU UMA MENSAGEM! Hoje vamos ganhar igual na época do Diniz. Aproveita e vota.',
  'DOUGLAS MANDOU AVISAR! Vote antes que eu publique mais 14 links da Netvasco.',
  'VITOR MANDOU AVISAR! Estou esperando vocês desde três horas atrás pra concluir a votação.',
  'VITOR MANDOU AVISAR! Até o portão de São Januário abriu e vocês não votaram.',
  'VITOR MANDOU UMA MENSAGEM! Chegar cedo no estádio é fácil. Difícil é vocês abrirem o app e votar.',
  'VITOR MANDOU AVISAR! Vocês atrasam mais que fila de biometria.',
  'VELLOSO MANDOU AVISAR! Corri 15 km e vocês ainda não votaram. Clique e vote.',
  'VELLOSO MANDOU MENSAGEM! Façam esse esforço. Nem precisa correr. Vote logo.',
  'VELLOSO MANDOU AVISAR! Abrir o app gasta menos energia que uma corrida de 5 km. Dê seu palpite.',
  'VELLOSO DIGITOU UMA MENSAGEM! Se votar queimasse calorias, vocês já tinham desistido.',
  'JORGE DIGITOU UMA MENSAGEM! GOLE! Agora vota.',
  'JORGE MANDOU AVISAR! Escolhe o MVP antes da saideira.',
  'JORGE MANDOU MENSAGEM! Estou de olho na gordinha e em você que não votou!',
  'JUAN MANDOU UMA MENSAGEM! Minha mulher deixou eu votar. Vote também!',
  'JUAN MANDOU AVISAR! Minha saída foi aprovada. A sua votação ainda não.',
  'JUAN DIGITOU UMA MENSAGEM! Vote antes que revoguem meu alvará.',
  'NERD ENVIOU UMA MENSAGEM! Em nome da química, vote.',
  'NERD ENVIOU UMA MENSAGEM! Difícil foi minha tese de doutorado. Só falta você votar.',
  'NERD MANDOU AVISAR! Nem o carbono demora tanto para reagir. Vota logo.',
  'NERD MANDOU MENSAGEM! A voz mais aveludada do grupo: "Vote imediatamente."',
  'A voz aveludada anuncia: ainda dá tempo de salvar sua dignidade e votar.',
  'O Antônio Nerd já reservou o lugar na arquibancada em cima do Novaes. Você só precisa votar.',
  'O banco da arquibancada agradece quando o Antônio escolhe o Novaes como almofada. O app agradece quando você vota.',
  'A voz aveludada informa: quem não votar ficará em recuperação.',
  'Seu voto está impedido... porque não existe.',
  'A voz aveludada informa: seu palpite ainda não foi localizado.',
  // novas, baseadas nos perfis
  'O Novaes já acendeu o segundo cigarro discutindo por causa do Pedrinho. Vota antes que ele acenda o terceiro.',
  'O Novaes brigou uma vez em São Januário defendendo o Pedrinho. Defenda seu palpite votando logo.',
  'André já xingou o Pedrosa três vezes hoje. Você só precisa votar uma.',
  'O André jura que o Sforza ainda vai voltar. Você jura que vai votar? Então vota.',
  'André avistou uma figurinha do Daniel e já surtou. Aproveita a distração dele e vota antes.',
  'Leodoro apareceu, arrumou uma treta rápida e sumiu. Nem deu tempo de você votar ainda?',
  'Luiz já tá pensando em marcar churrasco no Tropi pra depois do jogo. Vota que o assado espera.',
  'Otimista como o Luiz, este app acredita que você ainda vai votar a tempo.',
  'Pedro apareceu do nada só pra xingar um lateral. Aproveita que ele tá on e vota também.',
  'Thiago Azevedo sumiu nas últimas 40 rodadas e voltou hoje falando sem parar. Vota antes que ele suma de novo.',
  'Alex fez o scouting completo do adversário. Você só precisa clicar em "enviar palpite".',
];

// ---------- Banco grande de frases pra avaliar jogadores/MVP (depois do jogo) ----------
const FRASES_AVALIAR = [
  'Escolher o MVP e avaliar os jogadores é mais fácil que escolher meia do Bob Esponja e pochete colorida.',
  'Já escolheu o MVP ou está esperando a opinião do "que mais entende de futebol"?',
  'Vote e escolha seu MVP. O Daniel já escolheu o Renato Gaúcho e o Bob Esponja.',
  'Já escalou o MVP? O Douglas escolheu o Diniz!',
  'Vote nos jogadores. O Douglas e o Novaes tentaram colocar o Pedrinho de MVP.',
  'Já escalou o MVP? O Novaes tentou votar no Pedrinho de novo.',
  'Escolha o MVP. Não precisa chegar 3 horas antes igual ao Vitor.',
  'Já escolheu o MVP ou está pagando pra correr igual o Velloso? Avaliar é de graça!',
  'O Alex já analisou todos os mapas de calor. Avalie logo os jogadores e o MVP.',
  'Escolha o MVP antes da saideira do Jorge.',
  'NOVAES MANDOU AVISAR! Se você não avaliar os jogadores e MVP, vou considerar uma crítica ao Pedrinho.',
  'NOVAES MANDOU FALAR! Avaliar jogador e MVP atrasado é coisa de quem torce contra o Pedrinho.',
  'NOVAES MANDOU AVISAR! Se perder o prazo, a culpa não é do Pedrinho. Avalie os jogadores e MVP.',
  'Avalie os jogadores e o MVP. Agora o Novaes vai explicar por que a culpa não foi do Pedrinho.',
  'O VAR revisou e confirmou: falta avaliar jogadores e MVP.',
  'O árbitro acrescentou 3 minutos. Aproveite e avalie os jogadores.',
  // novas, baseadas nos perfis
  'DOUGLAS MANDOU AVISAR! Avalie os jogadores antes que eu publique mais um artigo defendendo o Diniz.',
  'DANIEL MANDOU AVISAR! Se demorar pra avaliar, vou postar mais figurinha até você terminar.',
  'ANDRÉ MANDOU AVISAR! Avalie os jogadores, mas nem pense em elogiar o Garone.',
  'VELLOSO MANDOU AVISAR! Corri, tomei banho e voltei — e vocês ainda não avaliaram os jogadores.',
  'JUAN MANDOU AVISAR! Consegui autorização só até avaliarmos os jogadores. Corre.',
  'JORGE MANDOU AVISAR! Termina de avaliar antes da saideira ficar quente.',
  'NERD MANDOU AVISAR! Em nome da tabela periódica, avalie os jogadores.',
  'Pedro apareceu, xingou o lateral e sumiu de novo. Pelo menos avalie os jogadores antes que ele volte.',
  'Leodoro já criou uma treta sobre o resultado. Resolve isso avaliando os jogadores.',
  'Luiz já quer marcar o churrasco no Tropi pra comemorar (ou esquecer) o jogo. Avalia os jogadores antes.',
  'Thiago Azevedo sumiu de novo. Aproveita o silêncio dele pra avaliar os jogadores com calma.',
  'André está craft na crítica ao Garone. Canaliza essa energia e avalia os jogadores.',
  'A voz aveludada do Nerd informa: sua avaliação ainda não foi localizada.',
  'O Alex já escreveu o relatório completo do jogo. Você só precisa dar as notas.',
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
      if (!j.emCampo || !j.emCampo.length) continue; // só notifica depois que o admin marcar quem entrou em campo
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
          const r = await mandarPush(usuario, 'VASBOBO', `${sorteia(FRASES_AVALIAR)} (${nomeJogo})`, `/?avaliarJogo=${id}`);
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
          const r = await mandarPush(usuario, 'VASBOBO', sorteia(FRASES_VOTAR), '/');
          if (r.ok) enviados++; else falhas++;
          await marcarEnviado(db, chave);
        }
      }
      if (horaAtual === 8 && jProx.data === chaveDia) {
        for (const usuario of usuarios) {
          if (jProx.palpites && jProx.palpites[usuario]) continue;
          const chave = `palp_${usuario}_${idProx}_diajogo`;
          if (await jaEnviou(db, chave)) continue;
          const r = await mandarPush(usuario, 'VASBOBO', comPrefixo(PREFIXOS_HOJE, sorteia(FRASES_VOTAR)), '/');
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
          const r = await mandarPush(usuario, 'VASBOBO', comPrefixo(PREFIXOS_HOJE, sorteia(FRASES_VOTAR)), '/');
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
            const r = await mandarPush(usuario, 'VASBOBO', comPrefixo(PREFIXOS_HOJE, `Faltam 2 horas pro jogo! ${sorteia(FRASES_VOTAR)}`), '/');
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
