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

/* leva nova de frases pra "votar" — só as que realmente mencionam palpite/votação.
   As outras 19 dessa mesma leva foram remanejadas pra "aleatórias de dia de jogo" (ver mais
   abaixo), porque eram só comentário de perfil, sem chamada pra ação de votar */
add('votar', [
  'Hoje tem Vasco! Douglas e Novaes já estão de prontidão pra defender o Pedrinho no grupo. Prontidão pra votar também, né?',
  'Hoje tem Vasco! Já é oficial: ninguém vai trabalhar direito depois das 16h hoje. Aproveita esse tempo livre e vota.',
  'Hoje tem Vasco! Faltam poucas horas — hora de fechar o palpite antes que o jogo comece de verdade.',
  'Hoje tem Vasco! Já deu tempo de almoçar, checar a escalação e ainda não votar? Vai lá.',
  'Hoje tem Vasco! O grupo já está mais agitado que reunião de condomínio. Aproveita e vota.',
]);

/* estas 19 saíram do "votar" (não mencionavam voto/palpite, eram só comentário de perfil do dia
   de jogo) e viraram "aleatórias de dia de jogo" — duplicadas em casa e fora, já que nenhuma é
   específica de mandante/visitante */
const REMANEJADAS_ALEATORIAS_JOGO = [
  'O Antônio Nerd já avisou que vai acompanhar o jogo entre um experimento e outro no laboratório.',
  'O André já anunciou parceria oficial com o Pedrosa pra torcer junto hoje.',
  'O Wallace já escalou o time ideal — spoiler: não bate com o time de verdade.',
  'Se o Leodoro aparecer hoje, já vai sair brigando e sumir de novo.',
  'Ninguém sabe se o Thiago Azevedo vai aparecer hoje. Mistério nacional.',
  'O Pedro já avisou que desliga a TV assim que o jogo de verdade começar. Lógica dele, não a nossa.',
  'O Douglas já abriu a Netvasco umas 30 vezes só hoje de manhã.',
  'O Novaes já separou o cigarro de emergência caso critiquem o Pedrinho.',
  'O Daniel está decidindo se vai de Kappa ou daquela Nike que ele nunca admite que comprou.',
  'Se sobrar tempo, o Daniel pega a bike elétrica e passa em Ipanema antes do jogo.',
  'O Jorge já reservou o lugar no bar — e a gordinha também.',
  'O Vitor já está de saída pra chegar 3 horas antes, no espírito, já que hoje talvez não dê.',
  'O Juan está negociando a autorização pra sair e assistir.',
  'O Velloso vai encaixar uma corrida antes, depois ou durante — ele sempre dá um jeito.',
  'O professor Antônio Nerd já avisou a turma: hoje a prova vai ser mais curta.',
  'O Alex já entregou o scouting completo do adversário de hoje.',
  'O Daniel já está com o discurso pronto pra defender o Renato Gaúcho, dê no que der.',
  'Se o time jogar mal, já sabemos quem o Wallace vai culpar primeiro.',
  'A tarde promete: Antônio Nerd, aula até mais tarde; você, direto pro Vasbobo.',
];
add('aleatorias_jogo_casa', REMANEJADAS_ALEATORIAS_JOGO, null);
add('aleatorias_jogo_fora', REMANEJADAS_ALEATORIAS_JOGO, null);

/* leva V5 — a partir do perfil detalhado enviado pelo usuário (arquivo PERFIL_USUARIO.md),
   com foco especial em Pedro, Leodoro e Jorge, mas cobrindo o grupo todo */
add('votar', [
  'Hoje tem Vasco! O Pedro já saiu da toca — ele só aparece mesmo em dia de jogo.',
  'Hoje tem Vasco! O filho do Pedro já deve estar gritando "Edmundo!" antes até da bola rolar.',
  'Hoje tem Vasco! O Pedro já separou o vídeo do gol do Romário em 2000 pra reprisar depois, ganhando ou perdendo.',
  'Hoje tem Vasco! Se perder, nem liga pro Pedro — ele já vai sumir até o próximo jogo.',
  'Hoje tem Vasco! O Leodoro já xingou o Daniel hoje. Nem precisou de motivo.',
  'Hoje tem Vasco! O Leodoro já arrumou treta no grupo de manhã e sumiu antes do café.',
  'Hoje tem Vasco! Aposta quanto tempo o Leodoro demora pra aparecer, xingar alguém e sumir de novo hoje?',
  'Hoje tem Vasco! O Leodoro tá quieto demais hoje... deve estar guardando energia pra treta pré-jogo.',
  'Hoje tem Vasco! O Jorge já tá no bar, cerveja na mão e de olho na gordinha.',
  'Hoje tem Vasco! Pergunta pro Jorge quantas ele já tomou — aposto que ele nem lembra mais.',
  'Hoje tem Vasco! O Jorge já gritou "GOLE!" antes até da bola rolar.',
  'Hoje tem Vasco! A gordinha do Jorge já sabe: hoje é dia de jogo, ele não sai do bar.',
  'Hoje tem Vasco! O Novaes já tá de prontidão — qualquer crítica ao Pedrinho hoje, ele entra em campo (de verdade).',
  'Hoje tem Vasco! O Novaes já acendeu o primeiro cigarro do dia defendendo o Pedrinho antes mesmo do jogo.',
  'Hoje tem Vasco! O Daniel já separou a meia do Bob Esponja e a pochete colorida pro jogo de hoje.',
  'Hoje tem Vasco! Se perguntarem quem mais entende de futebol, o Daniel já tem a resposta pronta (e errada).',
  'Hoje tem Vasco! O Douglas já deve ter aberto a NetVasco umas 20 vezes só hoje de manhã.',
  'Hoje tem Vasco! O Douglas já está montando a defesa do Diniz pro pós-jogo, ganhando ou perdendo.',
  'Hoje tem Vasco! O Antônio Nerd já avisou a turma que a aula de química hoje vai ser resumida.',
  'Hoje tem Vasco! Se o Vasco perder, prepara o ouvido — vem áudio estressado de voz aveludada por aí.',
  'Hoje tem Vasco! O Vitor jura que hoje é o dia que ele volta a São Januário. Duvido.',
  'Hoje tem Vasco! O Velloso vai encaixar uma corrida antes do jogo — ele sempre dá um jeito.',
  'Hoje tem Vasco! Aposto que o Velloso já comprou tênis novo essa semana só de ansiedade pelo jogo.',
  'Hoje tem Vasco! O Juan já conseguiu autorização pra sair — hoje é dia de liberdade.',
  'Hoje tem Vasco! Se o Pedrosa falar besteira hoje, o André já tá pronto pra brigar por aí.',
  'Hoje tem Vasco! Ninguém sabe se o Thiago Azevedo vai aparecer hoje — mas se aparecer, não para de falar.',
  'Hoje tem Vasco! O Alex já deve ter mandado a análise do adversário de hoje, curta e certeira como sempre.',
  'Hoje tem Vasco! O Luiz já tá cogitando marcar churrasco no Tropi depois do jogo — vitória ou não.',
]);

async function garantirSeedV5(db) {
  const marcador = db.collection('notif_frases_meta').doc('seed_v5_votar_perfis');
  const doc = await marcador.get();
  if (doc.exists) return;
  // (função histórica — já rodou em produção; mantida só pra quem nunca rodou nenhum seed ainda)
  const NOVOS = SEED.filter((s) => s.tipo === 'votar').slice(-28);
  const batch = db.batch();
  NOVOS.forEach((item) => {
    const ref = db.collection('notif_frases').doc();
    batch.set(ref, { ...item, ativo: true, criadoEm: Date.now() });
  });
  batch.set(marcador, { feito: true, quando: Date.now(), qtd: NOVOS.length });
  await batch.commit();
}

/* limpeza: remove do banco as 24 frases antigas da leva V4 (que tinham "Hoje tem Vasco!" fixo no
   texto e viviam em "votar", mesmo boa parte não falando de votar) e recoloca do jeito certo —
   5 continuam em "votar" (com texto levemente ajustado), 19 viram "aleatórias de dia de jogo" */
const TEXTOS_V4_ANTIGOS = [
  'Hoje tem Vasco! O Antônio Nerd já avisou que vai acompanhar o jogo entre um experimento e outro no laboratório.',
  'Hoje tem Vasco! O André já anunciou parceria oficial com o Pedrosa pra torcer junto hoje.',
  'Hoje tem Vasco! O Wallace já escalou o time ideal — spoiler: não bate com o time de verdade.',
  'Hoje tem Vasco! Se o Leodoro aparecer hoje, já vai sair brigando e sumir de novo.',
  'Hoje tem Vasco! Ninguém sabe se o Thiago Azevedo vai aparecer hoje. Mistério nacional.',
  'Hoje tem Vasco! O Pedro já avisou que desliga a TV assim que o jogo de verdade começar. Lógica dele, não a nossa.',
  'Hoje tem Vasco! O Douglas já abriu a Netvasco umas 30 vezes só hoje de manhã.',
  'Hoje tem Vasco! O Novaes já separou o cigarro de emergência caso critiquem o Pedrinho.',
  'Hoje tem Vasco! O Daniel está decidindo se vai de Kappa ou daquela Nike que ele nunca admite que comprou.',
  'Hoje tem Vasco! Se sobrar tempo, o Daniel pega a bike elétrica e passa em Ipanema antes do jogo.',
  'Hoje tem Vasco! O Jorge já reservou o lugar no bar — e a gordinha também.',
  'Hoje tem Vasco! O Vitor já está de saída pra chegar 3 horas antes, no espírito, já que hoje talvez não dê.',
  'Hoje tem Vasco! O Juan está negociando a autorização pra sair e assistir.',
  'Hoje tem Vasco! O Velloso vai encaixar uma corrida antes, depois ou durante — ele sempre dá um jeito.',
  'Hoje tem Vasco! O professor Antônio Nerd já avisou a turma: hoje a prova vai ser mais curta.',
  'Hoje tem Vasco! O Alex já entregou o scouting completo do adversário de hoje.',
  'Hoje tem Vasco! Douglas e Novaes já estão de prontidão pra defender o Pedrinho no grupo.',
  'Hoje tem Vasco! O Daniel já está com o discurso pronto pra defender o Renato Gaúcho, dê no que der.',
  'Hoje tem Vasco! Se o time jogar mal, já sabemos quem o Wallace vai culpar primeiro.',
  'Hoje tem Vasco! A tarde promete: Antônio Nerd, aula até mais tarde; você, direto pro Vasbobo.',
  'Hoje tem Vasco! Já é oficial: ninguém vai trabalhar direito depois das 16h hoje.',
  'Hoje tem Vasco! Faltam poucas horas — hora de fechar o palpite antes que o jogo comece de verdade.',
  'Hoje tem Vasco! Já deu tempo de almoçar, checar a escalação e ainda não votar? Vai lá.',
  'Hoje tem Vasco! O grupo já está mais agitado que reunião de condomínio. Aproveita e vota.',
];
async function garantirSeedV6(db) {
  const marcador = db.collection('notif_frases_meta').doc('seed_v6_reorganiza_diajogo');
  const doc = await marcador.get();
  if (doc.exists) return;
  // apaga as 24 antigas (por texto exato, dentro do tipo "votar")
  const snap = await db.collection('notif_frases').where('tipo', '==', 'votar').get();
  const batch = db.batch();
  snap.docs.forEach((d) => {
    if (TEXTOS_V4_ANTIGOS.includes(d.data().texto)) batch.delete(d.ref);
  });
  // insere as 5 novas de "votar" (por texto exato, não por índice — mais seguro) + as 19 remanejadas (casa e fora)
  const TEXTOS_VOTAR_NOVOS = [
    'Hoje tem Vasco! Douglas e Novaes já estão de prontidão pra defender o Pedrinho no grupo. Prontidão pra votar também, né?',
    'Hoje tem Vasco! Já é oficial: ninguém vai trabalhar direito depois das 16h hoje. Aproveita esse tempo livre e vota.',
    'Hoje tem Vasco! Faltam poucas horas — hora de fechar o palpite antes que o jogo comece de verdade.',
    'Hoje tem Vasco! Já deu tempo de almoçar, checar a escalação e ainda não votar? Vai lá.',
    'Hoje tem Vasco! O grupo já está mais agitado que reunião de condomínio. Aproveita e vota.',
  ];
  const NOVOS = SEED.filter((s) => s.tipo === 'votar' && TEXTOS_VOTAR_NOVOS.includes(s.texto))
    .concat(SEED.filter((s) => s.tipo === 'aleatorias_jogo_casa' && REMANEJADAS_ALEATORIAS_JOGO.includes(s.texto)))
    .concat(SEED.filter((s) => s.tipo === 'aleatorias_jogo_fora' && REMANEJADAS_ALEATORIAS_JOGO.includes(s.texto)));
  NOVOS.forEach((item) => {
    const ref = db.collection('notif_frases').doc();
    batch.set(ref, { ...item, ativo: true, criadoEm: Date.now() });
  });
  batch.set(marcador, { feito: true, quando: Date.now(), qtd: NOVOS.length, apagadas: TEXTOS_V4_ANTIGOS.length });
  await batch.commit();
}

async function garantirSeedV4(db) {
  const marcador = db.collection('notif_frases_meta').doc('seed_v4_votar_extra');
  const doc = await marcador.get();
  if (doc.exists) return;
  const NOVOS = SEED.filter((s) => s.tipo === 'votar').slice(68); // só a leva nova (as 68 primeiras já foram semeadas antes)
  const batch = db.batch();
  NOVOS.forEach((item) => {
    const ref = db.collection('notif_frases').doc();
    batch.set(ref, { ...item, ativo: true, criadoEm: Date.now() });
  });
  batch.set(marcador, { feito: true, quando: Date.now(), qtd: NOVOS.length });
  await batch.commit();
}

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

module.exports = { garantirSeed, garantirSeedV2, garantirSeedV3, garantirSeedV4, garantirSeedV5, garantirSeedV6, buscarFrases, sorteia };
