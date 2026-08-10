// Backup diário dos logs de acesso/ações — roda sozinho todo dia às 3h (horário de Brasília)
// e arquiva o dia anterior inteiro numa coleção separada, pra nunca depender só da coleção
// "logs" ao vivo. Nada aqui é apagado — fica guardado pra sempre, como pedido.
const { garantirFirebase, admin, registrarLogServidor } = require('./_push-helper');

exports.handler = async () => {
  try {
    garantirFirebase();
  } catch (e) {
    return { statusCode: 500, body: 'Config ausente: ' + e.message };
  }
  const db = admin.firestore();

  try {
    // A função roda às 3h de Brasília (6h UTC) — o dia que acabou de fechar é o de ontem.
    const agora = new Date();
    const brasilia = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    brasilia.setDate(brasilia.getDate() - 1);
    const ano = brasilia.getFullYear(), mes = brasilia.getMonth() + 1, dia = brasilia.getDate();
    const idDia = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

    const snap = await db.collection('logs')
      .where('ano', '==', ano).where('mes', '==', mes).where('dia', '==', dia)
      .get();

    if (snap.empty) {
      await registrarLogServidor(db, { tipo: 'sistema', nivel: 'comum', detalhe: `Backup diário de logs rodou OK (nada em ${idDia})` });
      return { statusCode: 200, body: `Nenhum log em ${idDia} pra arquivar.` };
    }

    const registros = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // se um dia excepcionalmente cheio passar de ~800 registros, o doc único pode chegar perto
    // do limite de 1MiB do Firestore — separa em blocos de 800 pra nunca estourar.
    const TAMANHO_BLOCO = 800;
    for (let i = 0; i < registros.length; i += TAMANHO_BLOCO) {
      const bloco = registros.slice(i, i + TAMANHO_BLOCO);
      const idBloco = registros.length > TAMANHO_BLOCO ? `${idDia}_${i / TAMANHO_BLOCO + 1}` : idDia;
      await db.collection('logs_backup_diario').doc(idBloco).set({
        dia: idDia, total: bloco.length, registros: bloco, salvoEm: Date.now(),
      });
    }

    await registrarLogServidor(db, { tipo: 'sistema', nivel: 'comum', detalhe: `Backup diário de logs rodou OK (${registros.length} registro(s) arquivado(s) de ${idDia})` });
    return { statusCode: 200, body: `Backup de logs salvo (${idDia}), ${registros.length} registro(s).` };
  } catch (e) {
    await registrarLogServidor(db, { tipo: 'sistema', nivel: 'critico', detalhe: `Backup diário de logs FALHOU: ${e.message}` });
    return { statusCode: 500, body: 'Erro ao arquivar logs: ' + e.message };
  }
};
