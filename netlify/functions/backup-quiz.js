// Backup automático do QUIZ ("O Que Mais Entende de Futebol") — roda sozinho (agendado no
// netlify.toml) e guarda uma cópia da pontuação diária de cada usuário, numa coleção separada.
// Existe pra servir de histórico recente: se algo der errado com a pontuação do quiz, dá pra
// olhar como estava há poucas horas e comparar. Fica só 12h guardado — depois disso é apagado
// sozinho, já que a ideia é só um "para-quedas" de curto prazo, não um arquivo permanente.
const { garantirFirebase, admin, registrarLogServidor } = require('./_push-helper');

const HORAS_PARA_GUARDAR = 12;

exports.handler = async () => {
  try {
    garantirFirebase();
  } catch (e) {
    return { statusCode: 500, body: 'Config ausente: ' + e.message };
  }
  const db = admin.firestore();

  try {
    const principal = await db.collection('shared').doc('vasbobo_quiz').get();
    if (!principal.exists) {
      return { statusCode: 200, body: 'Nada pra fazer backup ainda (quiz sem dados).' };
    }
    const v = principal.data();
    const agora = Date.now();
    const idBackup = new Date(agora).toISOString(); // ex: 2026-08-24T18:00:00.000Z

    // guarda só o que interessa pra auditoria de pontuação: quem respondeu o quê, por dia
    // (não guarda a fila de perguntas nem "vistas", que não são pontuação e mudam toda hora)
    await db.collection('backups_quiz').doc(idBackup).set({
      diario: v.diario || {},
      porJogo: v.porJogo || {},
      salvoEm: agora,
    });

    // limpeza: apaga backups com mais de 12h — é só um histórico recente, não um arquivo pra sempre
    const limite = agora - HORAS_PARA_GUARDAR * 3600000;
    const antigos = await db.collection('backups_quiz').where('salvoEm', '<', limite).get();
    let apagados = 0;
    for (const doc of antigos.docs) {
      await doc.ref.delete();
      apagados++;
    }

    await registrarLogServidor(db, { tipo: 'sistema', nivel: 'comum', detalhe: `Backup do quiz rodou OK (${apagados} backup(s) antigo(s) removido(s))` });
    return { statusCode: 200, body: `Backup do quiz salvo (${idBackup}). ${apagados} backup(s) antigo(s) removido(s).` };
  } catch (e) {
    await registrarLogServidor(db, { tipo: 'sistema', nivel: 'critico', detalhe: `Backup do quiz FALHOU: ${e.message}` });
    return { statusCode: 500, body: 'Erro ao fazer backup do quiz: ' + e.message };
  }
};
