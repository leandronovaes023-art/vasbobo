// Backup automático — roda sozinho (agendado no netlify.toml) e guarda uma cópia
// do banco de dados principal a cada execução, numa coleção separada.
// Existe pra nunca mais passarmos pela situação de perder dados sem ter pra onde voltar.
const { garantirFirebase, admin } = require('./_push-helper');

const DIAS_PARA_GUARDAR = 14; // mantém backups dos últimos 14 dias, apaga os mais antigos sozinho

exports.handler = async () => {
  try {
    garantirFirebase();
  } catch (e) {
    return { statusCode: 500, body: 'Config ausente: ' + e.message };
  }
  const db = admin.firestore();

  try {
    const principal = await db.collection('shared').doc('vasbobo_v2').get();
    if (!principal.exists) {
      return { statusCode: 200, body: 'Nada pra fazer backup ainda (documento principal não existe).' };
    }
    const agora = Date.now();
    const idBackup = new Date(agora).toISOString(); // ex: 2026-08-05T18:00:00.000Z

    await db.collection('backups_automaticos').doc(idBackup).set({
      value: principal.data().value,
      salvoEm: agora,
    });

    // limpeza: apaga backups com mais de DIAS_PARA_GUARDAR dias
    const limite = agora - DIAS_PARA_GUARDAR * 24 * 3600000;
    const antigos = await db.collection('backups_automaticos').where('salvoEm', '<', limite).get();
    let apagados = 0;
    for (const doc of antigos.docs) {
      await doc.ref.delete();
      apagados++;
    }

    return { statusCode: 200, body: `Backup salvo (${idBackup}). ${apagados} backup(s) antigo(s) removido(s).` };
  } catch (e) {
    return { statusCode: 500, body: 'Erro ao fazer backup: ' + e.message };
  }
};
