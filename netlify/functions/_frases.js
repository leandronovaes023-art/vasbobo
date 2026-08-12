// Biblioteca de frases de notificação — agora vive no Firestore (coleção notif_frases),
// não mais fixa no código. Isso permite editar/remover/adicionar direto pelo admin.
// Na primeira execução, semeia a coleção com o banco que já existia.

const SEED = [];
function add(tipo, textos, hora) {
  textos.forEach((texto) => SEED.push({ tipo, texto, hora: hora ?? null }));
}

add('motivacional', ['Comece o dia com a frase do Vasbobo Acredita.'], 8);
add('motivacional', ['Já viu a frase do Vasbobo Acredita motivacional do dia?'], 16);
add('motivacional', ['Termine o dia com a frase do Vasbobo Acredita'], 21);

add('quiz', ['O que mais entende de futebol! Você ou DaniGil?'], 9);
add('quiz', ['Sabedoria do Vasbobo. O que mais entende! Teste seu conhecimento'], 17);
add('quiz', ['Faça pontos no quiz da Rodada!'], 22);

add('votar', [
  'O "que mais entende de futebol" votou e já errou (pra variar). Vote e faça o contrário.',
  'Daniel vai dormir feliz com a meia Bob Esponja.',
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
  'GOLE... e já aproveita pra votar.',
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
]);

add('avaliar', [
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
]);

/* saudação removida do sistema — as notificações agora vão direto com o nome da pessoa, sem
   frase de abertura aleatória (era "E aí, Fulano!", "Fulano, olha só" etc.) */

/* ---- ALEATÓRIAS: fofoca/humor do grupo, 4x por dia (7h, 12h, 16h, 21h) — migrada da antiga
   saudação de login (que só aparecia na tela, até 3x/dia). Agora vira notificação push de
   verdade, e ganhou muito mais frase nova. Separadas por horário quando fazia sentido com o
   conteúdo (ex.: piada de "discussão às 7h da manhã" só sai de manhã mesmo) */
add('aleatorias', [
  'Novaes, Douglas e Daniel já discutiram hoje — 7h da manhã, novo recorde do grupo.',
  'Vim do futuro avisar: Daniel e Douglas vão discutir de novo amanhã, 7h da manhã. Já virou ritual religioso.',
  'Daniel já cancelou o sócio de novo. Deve ser recorde do Vasco também.',
  'Juan conseguiu autorização pra sair. Dia histórico, marca na parede.',
  'O Alex já fez um scouting completo do próximo adversário antes mesmo do café.',
  'O Douglas já abriu a Netvasco umas 20 vezes antes do meio-dia. É rotina, não vício (segundo ele).',
], 7);

add('aleatorias', [
  'Antônio Nerd estressado mandando áudio no grupo com voz aveludada. Terapia em grupo, modo ativado.',
  'Douglas começou a graduação em Direito só pra defender o Pedrinho tecnicamente melhor.',
  'Novaes e Douglas na mesma sala da Estácio, cursando Direito, ambos com o mesmo objetivo: o Pedrinho.',
  'André anuncia parceria oficial com o Pedrosa e está genuinamente feliz com isso. Alguém avisa ele.',
  'Daniel, o Maurinho da Colina, ataca de novo com a amargura de sempre. Raio-x fiel.',
  'Wallace escalou o Vasco Sub-93 anos: Oscar, Dudu, Rony, Sérgio Ramos, Didi, Zagallo e Evaristo de Macedo. Time imbatível, só falta a saúde dos jogadores.',
  'Wallace pede time de ponta e endividamento do Vasco. Rumo à Série B com classe.',
  'Leodoro já brigou e sumiu de novo. Recorde de velocidade batido.',
  'Thiago Azevedo sumiu de novo. Ninguém sentiu falta ainda, mas vai sentir quando ele voltar falando sem parar.',
  'Pedro bota o filho pra assistir jogo do Vasco de 2000 e desliga a TV no dia de jogo de verdade. Educação seletiva.',
  'O Wallace repetiu de novo que o David merece a titularidade no lugar do Vegetti. Ninguém pediu, ele insiste.',
  'O professor de química Antônio Nerd segue no laboratório tentando a fórmula pro Hinestroza voltar a jogar bola. Ciência tem limite.',
], 12);

add('aleatorias', [
  'O Jorge já fez a bet de hoje. Mas não foi na Sportingbet. Estamos de olho, Jorge.',
  'Daniel segue defendendo a Kappa, dizendo que é melhor que a Nike. Pelo menos não vou sofrer sozinho com essa opinião.',
  'Daniel já comprou a camisa da Nike do Vasco escondido. Ele nunca vai admitir, mas a etiqueta não mente.',
  'O professor Antônio Nerd está no laboratório criando uma dose pro Tchê Tchê jogar com vontade. Se der certo, patenteia.',
  'Daniel só está esperando o PH errar uma vez pra já pedir o Puma de volta. Paciência de caçador.',
  'Bastou o Antônio Nerd elogiar o Hinestroza uma vez pro cara desaprender a jogar. Boca aveludada, boca de túmulo.',
  'O Velloso já comprou mais um tênis essa semana e não é da Nike. Estamos de olho.',
  'Novaes criou mais uma foto em IA sobre o Daniel. A IA já não aguenta mais o Novaes. Nem o Daniel.',
  'O professor Antônio Nerd tá em semana de prova, tendo que aguentar aluno bagunceiro e o Spinelli no ataque na mesma semana. Respeita o homem.',
  'Velloso segue correndo maratona... e do Vasco também, dependendo do resultado.',
], 16);

add('aleatorias', [
  'VASBOBO Leo Dias: Daniel pegou a bike elétrica e foi pra Ipanema ver o Renato jogar vôlei. Fonte confiável.',
  'Daniel segue limpando a areia da praia... da boca. Vocês entenderam.',
  'Novaes e Douglas fundam oficialmente a Liga da Justiça Guardiã do Pedro Paulo. Estatuto em anexo (não existe).',
  'Daniel segue defendendo o Renato e odiando o Diniz. Tudo normal por aqui, mais um dia de paz.',
  'Daniel já defendeu o Renato hoje, ontem, e vai defender amanhã. Fidelidade rara em tempos de crise.',
  'Daniel já marcou o Novaes de novo no grupo. O WhatsApp deveria bloquear por spam, mas até o WhatsApp desistiu.',
  'O Daniel precisa voltar pra Barreira do Vasco e encher a cara com urgência. Isso é apelo, não sugestão.',
  'Novaes segue defendendo o Pedrinho. Como sempre. Como sempre será.',
  'Daniel e Novaes já discutiram hoje. Confirmado, testemunhas oculares no grupo.',
  'Antônio Nerd mandou mais um áudio estressado no grupo. Que tesão essa voz, respeitosamente falando.',
], 21);

/* ---- ALEATÓRIAS DE DIA DE JOGO: só saem quando o Vasco joga (em casa ou fora) — a função de
   envio decide isso, não precisa marcar hora aqui, sai junto dos 4 horários fixos do dia ---- */
add('aleatorias_jogo_casa', [
  'Vitor já chegou em São Januário para assistir o jogo. Recorde pessoal de antecedência batido de novo.',
  'Daniel já separou a meia do Bob Esponja para o jogo do Vasco hoje. Ritual sagrado, não questione.',
  'Douglas já abriu a Netvasco 139 vezes hoje com a ansiedade do jogo. A internet dele merece um prêmio.',
  'Jorge já escolheu o bar mais perto de São Januário. A gordinha já está reservada, com nome e tudo.',
  'Juan conseguiu autorização de última hora pra ir no jogo. Milagre confirmado pela diretoria de casa.',
  'Novaes já separou o cigarro de emergência caso alguém critique o Pedrinho hoje em São Januário.',
  'O Alex entregou o scouting completo do adversário de hoje, com estatísticas que ninguém pediu mas todo mundo vai ler.',
], null);

add('aleatorias_jogo_fora', [
  'Vitor lamenta não poder chegar 3 horas antes hoje porque o jogo é longe demais. Sofrimento à distância, mas ele está lá de espírito.',
  'Douglas já garantiu a transmissão da Netvasco pro jogo de hoje fora de casa. Internet no talo.',
  'Jorge escolheu o bar de sempre, já que hoje não dá pra ir no estádio. A gordinha viaja igual.',
  'Antônio Nerd avisou que vai acompanhar o jogo de hoje entre um experimento e outro no laboratório.',
  'Velloso corre com o celular na mão hoje pra não perder nenhum lance do jogo fora de casa.',
  'Daniel separou a meia do Bob Esponja mesmo o jogo sendo fora. Fé não tem distância.',
], null);

async function garantirSeedV2(db) {
  const marcador = db.collection('notif_frases_meta').doc('seed_v2_aleatorias');
  const doc = await marcador.get();
  if (doc.exists) return; // já rodou antes, não duplica
  const NOVOS = SEED.filter((s) => s.tipo === 'aleatorias' || s.tipo === 'aleatorias_jogo_casa' || s.tipo === 'aleatorias_jogo_fora');
  const batch = db.batch();
  NOVOS.forEach((item) => {
    const ref = db.collection('notif_frases').doc();
    batch.set(ref, { ...item, ativo: true, criadoEm: Date.now() });
  });
  batch.set(marcador, { feito: true, quando: Date.now(), qtd: NOVOS.length });
  await batch.commit();
}

/* ---- GOL DE TESTE: hype de pré-jogo, brincando que "foi gol" e avisando que é só teste da
   notificação — sai só na véspera (10h/15h/22h) e no dia do jogo (7h/11h/17h), tratado à parte
   pela função de envio (não usa buscarFrases com hora, porque o mesmo texto pode sair em
   qualquer um dos horários — só muda "amanhã" x "mais tarde" no final) ---- */
add('gol_teste', [
  'Puma Rodríguez de bicicleta, direto no ângulo',
  'David de cabeça, sem chance pro goleiro',
  'Adson de calcanhar — golaço olímpico',
  'Andrés Gómez de fora da área, um foguete',
  'Nuno Moreira driblou três e rolou pro gol vazio',
  'João Vitor, contra-ataque relâmpago e categoria',
  'Spinelli de cavadinha, estilo Neymar',
  'Brenner, cabeçada de centroavante raiz',
  'Robert Renan subiu pro escanteio e testou — na trave e dentro',
  'Jair, de fora da área, sem dó',
  'Tchê Tchê, chegando pra pegar a sobra e mandar pro fundo',
  'Cuiabano cruzou fechado e caiu direto no gol',
  'Johan Rojas, jogada individual, três dribles e tapinha',
  'Lucas Piton, subiu a linha inteira e bateu cruzado',
  'Carlos Cuesta, de cabeça em cima de escanteio',
  'Paulo Henrique invadiu a área e tocou por cima do goleiro',
  'Thiago Mendes, chute de longe que ninguém esperava',
  'Ramon Rique, aproveitando rebote e mandando pra rede',
  'Marino Hinestroza driblou o goleiro e rolou pra dentro',
  'JP, categoria pura, encobriu o goleiro',
]);

async function garantirSeedV3(db) {
  const marcador = db.collection('notif_frases_meta').doc('seed_v3_gol_teste');
  const doc = await marcador.get();
  if (doc.exists) return;
  const NOVOS = SEED.filter((s) => s.tipo === 'gol_teste');
  const batch = db.batch();
  NOVOS.forEach((item) => {
    const ref = db.collection('notif_frases').doc();
    batch.set(ref, { ...item, ativo: true, criadoEm: Date.now() });
  });
  batch.set(marcador, { feito: true, quando: Date.now(), qtd: NOVOS.length });
  await batch.commit();
}

async function garantirSeed(db) {
  const snap = await db.collection('notif_frases').limit(1).get();
  if (!snap.empty) return; // já foi semeado antes, não faz de novo
  const batch = db.batch();
  SEED.forEach((item) => {
    const ref = db.collection('notif_frases').doc();
    batch.set(ref, { ...item, ativo: true, criadoEm: Date.now() });
  });
  await batch.commit();
}

async function buscarFrases(db, tipo, hora) {
  let q = db.collection('notif_frases').where('tipo', '==', tipo).where('ativo', '==', true);
  if (hora !== undefined && hora !== null) q = q.where('hora', '==', hora);
  const snap = await q.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

function sorteia(lista) {
  return lista.length ? lista[Math.floor(Math.random() * lista.length)].texto : null;
}

module.exports = { garantirSeed, garantirSeedV2, garantirSeedV3, buscarFrases, sorteia };
