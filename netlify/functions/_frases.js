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

add('saudacao', [
  'E aí, {nome}!!', '{nome}, o Vasco depende de você!', '{nome}, está aí?', '{nome}, Vasco é todo dia',
  'Opa, {nome}!', '{nome}, cadê você?', '{nome}, bora!', '{nome}, presta atenção nisso aqui',
  'Fala, {nome}!', '{nome}, olha só', '{nome}, sem enrolação', 'Vem cá, {nome}',
  '{nome}, acorda!', '{nome}, para tudo', 'Ô {nome}, escuta', '{nome}, é sério isso',
  '{nome}, larga o que tá fazendo', 'Psiu, {nome}', '{nome}, tô de olho em você', '{nome}, urgente',
  '{nome}, sem desculpa dessa vez', 'Alô, {nome}?', '{nome}, o Bar da Tia te chama', '{nome}, corre aqui',
  '{nome}, dá um tempo pra isso', 'Sério, {nome}', '{nome}, foi mal te incomodar, mas', '{nome}, uma coisinha rápida',
  '{nome}, guarda esse recado', '{nome}, presta ou perde',
]);

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

module.exports = { garantirSeed, buscarFrases, sorteia };
