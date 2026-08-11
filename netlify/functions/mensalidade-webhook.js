// Recebe o aviso automático (webhook) da InfinitePay quando alguém paga a mensalidade via Pix,
// e marca sozinho como PAGO no Firestore — ninguém do admin precisa conferir nada manualmente.
// A InfinitePay espera receber 200 OK de volta pra considerar a notificação entregue.
const { garantirFirebase, admin, registrarLogServidor } = require('./_push-helper');

exports.handler = async (event) => {
  try {
    garantirFirebase();
  } catch (e) {
    return { statusCode: 500, body: 'Config ausente: ' + e.message };
  }
  const db = admin.firestore();

  try {
    const corpo = JSON.parse(event.body || '{}');
    const orderNsu = corpo.order_nsu || '';
    // formato esperado: usuario-ANO-MES (ex.: novaes-2026-08) — usuario pode ter hífen no nome também,
    // por isso captura tudo antes dos dois últimos blocos numéricos
    const m = orderNsu.match(/^(.+)-(\d{4})-(\d{2})$/);
    if (!m) {
      return { statusCode: 200, body: 'ignorado (order_nsu fora do formato esperado: ' + orderNsu + ')' };
    }
    const [, usuario, ano, mes] = m;
    const docId = `${usuario}_${ano}_${mes}`;

    await db.collection('mensalidades').doc(docId).set({
      usuario, ano: Number(ano), mes: Number(mes),
      pago: true,
      pagoEm: Date.now(),
      valorPago: corpo.paid_amount != null ? corpo.paid_amount : (corpo.amount != null ? corpo.amount : null),
      comprovante: corpo.receipt_url || null,
      transacaoId: corpo.transaction_nsu || null,
      metodo: corpo.capture_method || null,
    }, { merge: true });

    await registrarLogServidor(db, {
      usuario,
      tipo: 'pagamento',
      nivel: 'importante',
      detalhe: `Mensalidade de ${mes}/${ano} confirmada via Pix (InfinitePay) — comprovante gerado automaticamente`,
    });

    return { statusCode: 200, body: 'ok' };
  } catch (e) {
    return { statusCode: 500, body: 'erro: ' + e.message };
  }
};
