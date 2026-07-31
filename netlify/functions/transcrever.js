// Transcreve um áudio gravado no site usando a API gratuita da Groq (Whisper).
// A chave fica só aqui no servidor (variável de ambiente GROQ_API_KEY do Netlify).
// Não filtra palavrão nem censura nada — transcreve exatamente o que foi falado.
//
// Uso pelo site:
//   POST /.netlify/functions/transcrever
//   corpo: { audio: "base64...", mime: "audio/webm" }
//   resposta: { texto: "..." }

exports.handler = async (event) => {
  const responder = (status, body) => ({
    statusCode: status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(body),
  });

  if (event.httpMethod !== 'POST') return responder(405, { erro: 'Use POST.' });

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return responder(500, { erro: 'GROQ_API_KEY não configurada nas variáveis de ambiente do Netlify.' });

  let audioBase64, mime;
  try {
    const body = JSON.parse(event.body || '{}');
    audioBase64 = body.audio;
    mime = body.mime || 'audio/webm';
  } catch (e) {
    return responder(400, { erro: 'Corpo da requisição inválido.' });
  }
  if (!audioBase64) return responder(400, { erro: 'Informe "audio" (base64 do arquivo gravado).' });

  try {
    const buffer = Buffer.from(audioBase64, 'base64');
    if (buffer.length > 8 * 1024 * 1024) return responder(400, { erro: 'Áudio grande demais.' });

    const ext = mime.includes('mp4') ? 'mp4' : mime.includes('ogg') ? 'ogg' : 'webm';
    const form = new FormData();
    form.append('file', new Blob([buffer], { type: mime }), 'audio.' + ext);
    form.append('model', 'whisper-large-v3-turbo');
    form.append('language', 'pt');
    form.append('response_format', 'json');

    const r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + groqKey },
      body: form,
    });
    if (!r.ok) {
      const errText = await r.text();
      return responder(502, { erro: 'Groq respondeu ' + r.status + ': ' + errText.slice(0, 300) });
    }
    const j = await r.json();
    const texto = (j.text || '').trim();
    return responder(200, { texto });
  } catch (e) {
    return responder(500, { erro: String(e.message || e) });
  }
};
