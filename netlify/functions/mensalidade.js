// Mensalidade do Vasbobo via Pix — usa o Checkout Integrado da InfinitePay, que não cobra
// NADA no Pix (diferente de Mercado Pago/outros, que cobram uma taxinha por transação).
// Documentação: https://www.infinitepay.io/checkout-documentacao
//
// Uso: /.netlify/functions/mensalidade?acao=criar&usuario=novaes
//   -> devolve { url } — o link/QR Code de pagamento daquele usuário, pro mês atual

const INFINITEPAY_TAG = 'leandro-pereira-12m'; // InfiniteTag pública (sem $), identifica a conta que recebe
const VALOR_MENSALIDADE_CENTAVOS = 1000; // R$10,00 (R$5 vira prêmio do mês, R$5 acumula pro fim do ano)
const SITE_URL = 'https://vasbobo.netlify.app';

function mesAno() {
  const agora = new Date();
  const brasilia = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  return { ano: brasilia.getFullYear(), mes: brasilia.getMonth() + 1, brasilia };
}

async function acaoCriar(params, res) {
  const usuario = (params.usuario || '').trim().toLowerCase();
  if (!usuario) return res(400, { erro: 'Informe "usuario".' });
  const { ano, mes, brasilia } = mesAno();
  const orderNsu = `${usuario}-${ano}-${String(mes).padStart(2, '0')}`;
  const mesNome = brasilia.toLocaleDateString('pt-BR', { month: 'long' });

  const body = {
    handle: INFINITEPAY_TAG,
    order_nsu: orderNsu,
    webhook_url: `${SITE_URL}/.netlify/functions/mensalidade-webhook`,
    redirect_url: `${SITE_URL}/?mensalidadePaga=1`,
    items: [{ quantity: 1, price: VALOR_MENSALIDADE_CENTAVOS, description: `Vasbet - ${mesNome}/${ano}` }],
  };

  try {
    const r = await fetch('https://api.checkout.infinitepay.io/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const dados = await r.json();
    if (!r.ok || !dados.url) return res(502, { erro: 'InfinitePay não devolveu um link válido.', detalhe: dados });
    res(200, { url: dados.url, orderNsu, ano, mes });
  } catch (e) {
    res(500, { erro: 'Erro ao falar com a InfinitePay: ' + e.message });
  }
}

exports.handler = async (event) => {
  const responder = (status, body) => ({
    statusCode: status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(body),
  });
  const params = event.queryStringParameters || {};
  try {
    let resultado = null;
    const capturar = (s, b) => { resultado = { s, b }; };
    if (params.acao === 'criar') await acaoCriar(params, capturar);
    else return responder(400, { erro: 'Use ?acao=criar&usuario=...' });
    return responder(resultado.s, resultado.b);
  } catch (e) {
    return responder(500, { erro: String(e.message || e) });
  }
};
