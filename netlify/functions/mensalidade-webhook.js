// Recebe o aviso automático (webhook) da InfinitePay quando alguém paga a mensalidade via Pix,
// e marca sozinho como PAGO no Firestore — ninguém do admin precisa conferir nada manualmente.
// A InfinitePay espera receber 200 OK de volta pra considerar a notificação entregue.
const { garantirFirebase, admin, registrarLogServidor, mandarPush } = require('./_push-helper');

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

    // avisa todo mundo que mais uma contribuição entrou (sem falar quem foi) — mensagem genérica
    // sorteada de uma lista, só pra comemorar que o prêmio do mês aumentou
    const MENSAGENS_PAGAMENTO = [
      'Mais um VASBOBO participando do BOBOBET do mês! O prêmio milionário aumentou! 💰',
      'Confirmado: mais uma contribuição no BOBOBET — o prêmio tá cada vez mais gigante!',
      'Alerta de grana: acabou de entrar mais um VASBOBO no BOBOBET desse mês! 💸',
      'O cofre do BOBOBET tá enchendo! Mais um VASBOBO confirmado.',
      'Rachou a economia mas valeu: mais um VASBOBO no BOBOBET desse mês!',
      'Prêmio subindo! Mais um pagamento confirmado no BOBOBET.',
    ];
    try {
      const tokensSnap = await db.collection('push_tokens').get();
      const msg = MENSAGENS_PAGAMENTO[Math.floor(Math.random() * MENSAGENS_PAGAMENTO.length)];
      for (const doc of tokensSnap.docs) {
        await mandarPush(doc.id, 'BOBOBET 💰', msg, '/#vasbolao', false);
      }
    } catch (e) { /* não deixa a confirmação do pagamento falhar por causa do broadcast */ }

    return { statusCode: 200, body: 'ok' };
  } catch (e) {
    return { statusCode: 500, body: 'erro: ' + e.message };
  }
};
