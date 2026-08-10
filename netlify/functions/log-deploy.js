// Recebe o aviso da própria Netlify quando um novo deploy termina, e registra isso
// como um log "sistema" (tipo: atualização do site). NÃO precisa disso rodando sozinho —
// é a Netlify que chama esse endereço automaticamente a cada deploy, se você configurar
// o "outgoing webhook" (veja instruções abaixo).
//
// COMO ATIVAR (só precisa fazer uma vez):
//  1. No painel da Netlify, abra o site do Vasbobo
//  2. Site configuration → Build & deploy → Deploy notifications
//  3. "Add notification" → "Outgoing webhook"
//  4. Event to listen for: "Deploy succeeded"
//  5. URL to notify: https://vasbobo.netlify.app/.netlify/functions/log-deploy
//  6. Salvar. Pronto — todo deploy que terminar bem vai aparecer sozinho nos Logs como
//     "Nova versão do site publicada".
const { garantirFirebase, admin, registrarLogServidor } = require('./_push-helper');

exports.handler = async (event) => {
  try {
    garantirFirebase();
  } catch (e) {
    return { statusCode: 500, body: 'Config ausente: ' + e.message };
  }
  const db = admin.firestore();

  let contexto = '';
  try {
    const corpo = JSON.parse(event.body || '{}');
    // a Netlify manda vários campos; pegamos só o que é útil pra descrição do log
    contexto = [corpo.branch, corpo.commit_ref ? corpo.commit_ref.slice(0, 7) : ''].filter(Boolean).join(' · ');
  } catch (e) { /* corpo vazio ou formato inesperado — segue sem contexto extra */ }

  await registrarLogServidor(db, {
    tipo: 'sistema',
    nivel: 'importante',
    detalhe: `Nova versão do site publicada${contexto ? ' (' + contexto + ')' : ''}`,
  });

  return { statusCode: 200, body: 'Log de deploy registrado.' };
};
