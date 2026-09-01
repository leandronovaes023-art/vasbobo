// Backup MANUAL e PERMANENTE do estado atual do Quiz ("O Que Mais Entende de Futebol") —
// diferente do backup-quiz.js (que roda sozinho a cada hora e se apaga depois de 12h), esse
// aqui só roda quando o admin pede, e o resultado NUNCA é apagado automaticamente. Existe
// especificamente para servir de ponto de restauração antes de uma migração grande (ex: virar
// o sistema de Batalhas 1x1) — se a migração não der certo, os dados de antes continuam aqui,
// intactos, pra sempre (ou até alguém apagar manualmente).
const { garantirFirebase, admin, registrarLogServidor } = require('./_push-helper');

exports.handler = async (event) => {
  try {
    garantirFirebase();
  } catch (e) {
    return { statusCode: 500, body: 'Config ausente: ' + e.message };
  }
  const db = admin.firestore();

  try {
    const rotulo = (event.queryStringParameters && event.queryStringParameters.rotulo) || 'manual';
    const principal = await db.collection('shared').doc('vasbobo_quiz').get();
    const dadosQuiz = principal.exists ? principal.data() : { diario: {}, porJogo: {}, vistas: {}, filasPorUsuario: {} };

    const agora = Date.now();
    const idBackup = rotulo + '__' + new Date(agora).toISOString();

    await db.collection('backups_manuais').doc(idBackup).set({
      tipo: 'quiz',
      rotulo,
      dados: dadosQuiz,
      salvoEm: agora,
    });

    await registrarLogServidor(db, { tipo: 'sistema', nivel: 'comum', detalhe: `Backup MANUAL e permanente do quiz criado: ${idBackup}` });
    return { statusCode: 200, body: JSON.stringify({ ok: true, id: idBackup }) };
  } catch (e) {
    return { statusCode: 500, body: 'Erro ao fazer backup manual do quiz: ' + e.message };
  }
};
