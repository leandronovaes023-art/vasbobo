# 📋 Vasbobo — Handoff Completo (jul/2026, atualizado)

> **Como usar:** anexe este arquivo numa conversa nova do Claude junto com a frase de início sugerida no final. Ele contém tudo que o Claude precisa pra continuar exatamente de onde paramos, sem perder contexto.

Site: **vasbobo.netlify.app** · Dono: Leandro Novaes (leigo em tecnologia) · Grupo de amigos vascaínos do RJ · Todo o trabalho é feito em português. Deploy = arrastar o **zip inteiro sem extrair** na aba "Deploys" do Netlify.

---

## ⚠️ PENDÊNCIAS ABERTAS (ler primeiro)

1. ✅ **CONFIRMADO PELO USUÁRIO REAL** — A funcionalidade "⚽ O Que Mais Entende de Futebol" foi testada no deploy real pelo usuário (prints anexados mostrando o widget, a resposta do dia registrada e os pontos aparecendo no Ranking da Rodada) e ele confirmou "ficou tudo bom e parece que está funcionando". A Sabedoria do Vasbobo antiga foi removida por completo. Ver seção 12.

2. ✅ **RESOLVIDO** — Sistema de pontuação dos palpites redesenhado (regra de ouro: quem acerta o resultado nunca é ultrapassado por quem erra). Ver seção 6.

3. 🔶 **AJUSTES DESTA RODADA, AINDA NÃO CONFIRMADOS VISUALMENTE PELO USUÁRIO**:
   - O widget do quiz é um **selo fixo no topo direito da tela (132×198px), com a arte oficial COMPLETA** (sem corte, proporção 2:3 igual à original). Passou por 3 ajustes de posição nesta conversa: canto superior esquerdo (sobrepunha o logo do cabeçalho) → borda esquerda centralizada (sobrepunha o card "Jogo em Destaque" ao rolar a página, reportado com print pelo usuário) → **topo direito, fixo** (posição atual, escolhida a partir de seta que o usuário desenhou apontando pro topo do cabeçalho). Em telas ≤380px encolhe pra 104×156px. **Em telas largas (desktop, ≥900px)** o selo desce pro canto inferior direito automaticamente, pra não brigar com a caixa "Fala, Novaes / Sair" que no desktop fica no topo direito do cabeçalho (no mobile essa caixa quebra pra uma linha à esquerda, então não há conflito lá).
   - Timer mudou de 5s → **10s** (código + texto explicativo na página `futebol.html`).
   - Ao errar, **a resposta certa não é mais revelada** — só mostra "❌ Você errou!".
   - Modal do quiz redesenhado: fundo preto/branco, vermelho só na cruz de malta (✠), que virou parte do botão de fechar/continuar.
   - **Algoritmo anti-repetição**: cada pergunta respondida ou pulada fica marcada como "vista" por usuário (`estado.vistas`, gravado no mesmo doc Firebase do quiz), e a próxima pergunta sorteada nunca repete uma já vista — só reinicia o ciclo depois que o usuário esgotar as 1000. Testei essa lógica isolada (fora do navegador) e bate, mas **não testei no site ao vivo**.
   - A imagem de marca ("VASBOBO — O QUE MAIS ENTENDE DE FUTEBOL", enviada pelo usuário como PNG) foi recortada em duas versões: um ícone pequeno e nítido da bola (selo fixo) e a arte completa como banner no topo da página `futebol.html`.

4. **Fotos de perfil**: desconsiderada (pendência antiga, sem ação necessária).

5. **Contas de teste no Firebase**: usuário orientado a remover pelo painel Admin do app; não confirmado se já fez.

6. **Banco de 1000 perguntas do quiz não foi re-verificado fato a fato pelo Claude** — estrutura validada, conteúdo histórico não checado item a item (inviável em escala). Corrigir pontualmente em `perguntas_futebol.json` se o grupo reportar erro.

7. 🔶 **NOVO — bug do Luiz/Vitor travando na roleta do castigo (iPhone/Safari)**: causa concreta encontrada (modal sem `overflow-y:auto`, conteúdo passa de 900px de altura, botões ficam fora da tela em celular) e corrigida em todos os modais bloqueantes do site. Ver seção 14 pro diagnóstico completo. **Ainda não confirmado com o Luiz/Vitor de verdade** — pedir pra eles testarem de novo (login automático → cair na roleta → conseguir girar → conseguir confirmar) depois desse deploy.

8. ✅ **CONFERIDO** — usuário avisou que "a URL mudou" e pediu pra sempre usar `https://vasbobo.netlify.app/`. Conferi todo o código (meta tags Open Graph/Twitter em `index.html`, texto de compartilhamento em `hoje.html`) — **já estava tudo consistente com essa URL**, não precisou trocar nada. Só documentando aqui que foi checado, pra próxima sessão não perder tempo reconferindo à toa.

---

## 1. ARQUITETURA

- **Código**: Netlify, `vasbobo.netlify.app`.
- **Dados**: Firebase Firestore, projeto `vasbobo-crvg`. `apiKey: AIzaSyDNk1IhC1KpF9UKdwyMjhybrhuJ-BsfkSs`. Doc principal (todo o app: usuários, jogos, palpites, elenco): `shared/vasbobo_v2`, acessado via um wrapper `window.storage` (implementado em `index.html`) que imita a API de storage de artefatos da Claude, mas por baixo dos panos é 100% Firestore puro — nunca é apagado em update de código. As páginas satélites (`ogrupo.html`, `galeria.html`, `hoje.html`, `futebol.html`) leem esse mesmo doc direto via Firestore (sem o wrapper) para saber quem é admin etc.
- **Quiz "O Que Mais Entende de Futebol"**: doc próprio e separado `shared/vasbobo_quiz` (não polui o doc principal). Estrutura: `{diario:{"usuario|AAAA-MM-DD":{respondidas,acertos}}, semanal:{"usuario|AAAA-MM-DD(segunda-feira)":pontos}}`.
- **Mídias**: estáticas em `img/`, `vid/`, `rostos/` (sobem no zip) — EXCETO fotos de perfil/castigo, que também ficam no Firestore (`fotos_perfil`, `fotos_castigo`) como rede de segurança, e fotos extras da galeria (`galeria_extras`).
- **Busca via IA (Anthropic)**: usada para sincronizar placar/escalação/transmissão (app principal) e montar a aba Hoje. **É paga** (sem plano grátis contínuo). **O grupo decidiu NÃO pagar** — `ANTHROPIC_API_KEY` fica com valor placeholder (`COLE_SUA_CHAVE_AQUI`) de propósito, e o código já detecta isso e cai 100% em modo manual (sem tentativas inúteis, sem spinners, sem erros): admin corrige placar/escalação manualmente no app; aba Hoje usa cadastro manual de jogos. Se um dia quiserem pagar, basta colar a chave real nos dois arquivos (`index.html` e `hoje.html`) que tudo volta a funcionar sozinho — o código já está pronto pra isso.

## 2. ARQUIVOS DO SITE

- `index.html` — app principal (Jogos, Ranking, Castigos, Elenco, Configurações) + widget fixo do quiz
- `ogrupo.html` — perfis do grupo
- `galeria.html` — Obras-Primas (fotos/vídeos)
- `hoje.html` — jogos do dia
- `futebol.html` — página nova: "⚽ O Que Mais Entende de Futebol" (quiz completo, com ranking da semana)
- `perguntas_futebol.json` — banco de 1000 perguntas do quiz (`id, pergunta, resposta_correta, alternativas[4], nivel`), carregado via `fetch()` por todas as páginas que precisam (não embutido no HTML)
- `preview.jpg` — preview do link no WhatsApp (confirmar se está no zip mais recente)
- Pastas no zip: `img/` (104 fotos), `vid/` (7 vídeos), `rostos/` (fotos de perfil + fotos-alvo de castigo)
- `trofeu_reizinho.jpg`, `trofeu_ribamar.png` — ícones reais enviados pelo usuário

## 3. VISUAL

Tema claro: fundo branco/creme (`#F2F0EA`), caixas brancas, texto escuro. Vermelho (`#C0121B`) só na Cruz de Malta/ações; dourado (`#A97B12`) pra prêmios. Fundo do app: foto do Bar da Tia com véu leve (usada nas 4 páginas). Fonte Inter geral, Anton no logo/números grandes. Container principal 1320px.

## 4. ACESSO

Login persiste por dispositivo (sem tela de confirmação repetida). Admins: `novaes` e `antonio`. Todas as páginas exigem login.

## 5. NAVEGAÇÃO

Jogos · Ranking · 🎡 Castigos · O Grupo 🔥 · 🎨 Obras-Primas · 📅 Hoje · ⚽ O Que Mais Entende · Partidas
(Elenco/Configurações só aparecem pra admin. Aba "Jogadores" foi desativada.)

## 6. SISTEMA DE PONTUAÇÃO (redesenhado — jul/2026)

| Critério | Pontos |
|---|---|
| 🎯 Placar exato | **12** (não acumula aproximação) |
| ✅ Acertar o resultado (vitória/empate/derrota) | **6** base |
| 📈 Aproximação — diferença de 1 gol | +3 |
| 📈 Aproximação — diferença de 2 gols | +2 |
| 📈 Aproximação — diferença de 3 gols | +1 |
| 🤏 Errou o resultado, mas cravou o placar exato de um time | 3 |
| ⚽ Acertar quem faz gol — **só se também acertou o resultado** | **+6** |
| ⭐ Acertar o MVP da galera — **só se também acertou o resultado** | **+6** |
| ❌ Errou tudo | 0 |

- Constantes no código: `PTS_EXATO=12, PTS_RESULTADO=6, PTS_UMTIME_ERROU=3, PTS_GOL=6, PTS_MVP=6`. Aproximação = `max(0, 4 - diferença)`, somada a `PTS_RESULTADO`.
- **Regra de ouro (motivo do redesign)**: no sistema antigo, quem errava o resultado mas acertava gol/MVP podia ultrapassar quem acertava o resultado (ex.: 1+8+8=17 > 7). O usuário pediu correção. Agora os bônus de gol/MVP **só existem** para quem também acertou o resultado (vitória/empate/derrota) — isso garante matematicamente `min(acertou resultado) > max(errou resultado)` sempre (6 > 3). Testado isoladamente em Node com casos extremos, confere.
- A função `pontosPalpite(p,j,usarParcial)` retorna `{base, aproximacao, bonusGol, bonusMvp, total, exato, acertouResultado}`. Uma nova função `descricaoPontosPalpite(pts)` gera a lista de critérios com valor exato de cada um (ex.: "✅ acertou o resultado (+6) · 📈 aproximação (+2)"), usada no detalhamento por palpite — a faixa ambígua antiga "7–10 pts" foi removida da legenda.
- Modal didático completo "Sistema de Pontuação" (`#modalSistemaPontuacao` / `.modal-pontuacao`), acessível por link em destaque no topo do Ranking e por link dentro do tooltip "Entenda a pontuação".
- Cálculo sempre dinâmico (nunca cacheado/salvo) — mudanças na fórmula valem **retroativamente** pra todos os palpites já existentes, sem precisar migrar nada. Isso também recalcula silenciosamente quem é o Reizinho/Ribamar de rodadas passadas ainda não resolvidas (castigos já confirmados/girados ficam intocados, pois ficam gravados como snapshot em `dados.castigos`).
- Pontos do quiz "⚽ O Que Mais Entende de Futebol" (1 ponto por acerto) somam tanto no ranking geral quanto no ranking da rodada da semana correspondente — ver seção 12.

## 7. SISTEMA DE CASTIGO (roleta)

5 frases, cada uma com foto vinculada da pessoa citada (`rostos/castigo_*.jpg`, mostradas sem cortar via `object-fit:contain`). Roleta em SVG (tema Vasco), só ativa a partir da data do deploy. Ao entrar no app:
- 👑 Vencedor da rodada → modal de vitória
- 😮 Nem venceu nem perdeu → modal "bola na trave" (ícone SVG customizado + frases tema "quase")
- 🎡 Perdedor(es) → modal bloqueante com zoação + roleta real, grava no Firebase pra sempre

Aba Castigos: histórico público. Painel de teste (admin): simula os 3 cenários sem gravar nada.

## 8. RANKING DA RODADA + CASTIGO DA RODADA

Card "Jogo em destaque": 3 colunas (Jogo | Ranking da Rodada | Castigo da Rodada). Ranking mostra **todo mundo** (não só top 6), uma linha por pessoa, posição compartilhada entre empates, último grupo destacado em vermelho/negrito.

## 9. ABA O GRUPO

16 perfis (Novaes, Daniel, Velloso, Nerd, Douglas, Azevedo, Vitor, Jorge, Wallace, Andre, Juan, João, Alex, Pedro, Leodoro, Luiz) com foto, estatísticas reais do zap, frases rotativas. Seção "🥊 As Grandes Rixas do Vasbobo" com contagem real de citações mútuas.

## 10. OBRAS-PRIMAS (galeria)

104 fotos + 7 vídeos reais do grupo, grid com filtros, lightbox. Admin pode adicionar/remover fotos direto pela página.

## 11. ABA HOJE

Jogos de Série A + Copa do Brasil + Libertadores + Sudamericana. **Modo manual** (ver seção 1 — grupo não paga API). Cadastro manual de jogos funciona 100%.

## 12. "⚽ O QUE MAIS ENTENDE DE FUTEBOL" (quiz novo, substitui a Sabedoria do Vasbobo)

Substitui completamente a Sabedoria do Vasbobo antiga (removida: mascote 3D, toque no cabeçalho, 82 perguntas, tudo). Identidade visual própria a partir da arte oficial enviada pelo usuário (mascote "Vasbobo" com a bola "VASBOBO" e o texto "QUE MAIS ENTENDE DE FUTEBOL").

- **Onde aparece**: (1) página dedicada `futebol.html`, acessível pela aba "⚽ O Que Mais Entende" no menu de todas as páginas, com a arte oficial completa como banner no topo; (2) **selo fixo (132×198px, 104×156px em telas ≤380px)** no topo direito do `index.html` (`#fqFixo`), usando a **arte oficial completa, sem nenhum corte** (a imagem toda cabe no selo, proporção 2:3 igual ao arquivo original) — sempre visível para quem está logado, ponto vermelho pulsante = ainda não respondeu hoje, check verde = já respondeu. Em desktop (≥900px de largura) desce pro canto inferior direito, pra não brigar com a caixa de usuário/sair que ali fica no topo direito do cabeçalho. Abre o quiz num modal ao tocar.
- **Banco**: `perguntas_futebol.json`, 1000 perguntas (800 difíceis + 200 médias), carregado via `fetch()` (não embutido no HTML — mais leve e fácil de atualizar no futuro).
- **Regras**:
  - 3 respostas válidas por dia, dia começando às 6h da manhã (`fqChaveDia()`).
  - Cada pergunta tem **10 segundos** (barra + contador regressivo visual, fica destacado nos últimos 3s). Se o tempo esgotar, a pergunta é pulada e **não conta** nas 3 diárias.
  - Cada resposta certa vale **1 ponto**.
  - **Se errar, a resposta certa não é revelada** — só mostra que errou, pra não "ensinar" a resposta de graça.
  - **Nunca repete a mesma pergunta pro mesmo usuário**: cada pergunta vista (respondida ou pulada por tempo) fica marcada em `estado.vistas[usuario]` (array de ids), gravado no mesmo doc do Firebase. A próxima pergunta sorteada exclui as já vistas; só reinicia o ciclo (permite repetir) depois que o usuário já viu as 1000.
- **Visual do modal**: preto e branco (fundo `#0B0B0E`, texto `#F2F0EA`, bordas cinza-claro translúcidas) — o vermelho (`var(--vermelho)`) aparece só na cruz de malta (✠) que ilustra o botão de "Fechar"/"Próxima pergunta".
- **Persistência**: 100% Firebase, doc próprio `shared/vasbobo_quiz` (ver seção 1) — nunca usa `localStorage`. Estrutura: `{diario:{"usuario|dia":{respondidas,acertos}}, semanal:{"usuario|segunda-feira":pontos}, vistas:{"usuario":[ids]}}`.
- **Integração com o ranking**: pontos do quiz somam automaticamente:
  - No **Ranking do Vasbobo** (geral/histórico, `renderRank()`): soma todos os pontos de quiz do usuário, em todas as semanas, mostrado como "+X do quiz ⚽" na linha de cada pessoa.
  - No **Ranking da Rodada** (`premiacaoJogo()`, `tabelaRodada()`, o card por jogo que decide Reizinho/Ribamar): soma os pontos de quiz da **semana do jogo** aos pontos de palpite de quem já tem palpite naquele jogo. Só entra na disputa quem também deu palpite no jogo (responder só o quiz não cria concorrente novo naquele card específico).
  - A "semana" usada em todo o sistema é sempre segunda-feira a domingo, ajustada às 6h (`fqChaveSemana()`).
- **Funções-chave** (replicadas de forma idêntica em `index.html` e `futebol.html`, com `db`/`dbFut` como única diferença): `fqChaveDia`, `fqChaveSemana`, `fqLerEstado`, `fqSalvarEstado`, `fqStatusDia`, `fqPontosSemana`, `fqPontosTotal`, `fqVistasUsuario`, `fqRegistrarVista`, `fqRegistrarResposta`, `fqEscolherPergunta`, `fqAbrirQuiz`, `fqResponder`, `fqTempoEsgotado`.
- Em `index.html` existe ainda um cache em memória `ESTADO_QUIZ` (evita ficar consultando o Firestore a cada render do ranking) — atualizado ao entrar no app, a cada resposta, e a cada 40s junto com a sincronização normal dos dados.
- **Imagens embutidas**: a arte oficial enviada pelo usuário (`file_000000001c64820e9c034d85f2ca2d10.png`, 1024×1536) foi recortada/redimensionada em duas versões e embutidas como base64 (mesmo padrão do resto do site, sem arquivos externos): recorte maior (bola + rosto do mascote + escudo, ~320×320, PNG, usado no selo fixo) e banner completo (~520px de largura, JPEG qualidade 87, usado no topo da `futebol.html`).

## 13. PADRÕES DE TRABALHO

- Edição via Python (`str_replace`) + validação de sintaxe via Node antes de entregar.
- Zip final sempre contém: `index.html`, `preview.jpg`, `ogrupo.html`, `hoje.html`, `galeria.html`, `trofeu_reizinho.jpg`, `trofeu_ribamar.png`, pastas `img/`, `vid/`, `rostos/`.
- Usuário sempre confere por print/screenshot — vários ajustes vieram de feedback visual direto.
- Claude recusa reproduzir termos ofensivos/discriminatórios do histórico real do grupo, mesmo aparecendo literalmente nas mensagens — mantém o resto da zoeira "pesada" liberada.

## 14. BUG DA ROLETA TRAVANDO NO SAFARI/iPHONE (2ª causa encontrada e corrigida, jul/2026)

- **Sintoma**: Luiz e Vitor (iPhone/Safari real) entram automaticamente logados, caem direto na tela da roleta de castigo (modal bloqueante) e **ficam presos, sem conseguir sair nem avançar**. Não é problema de login — eles entram normalmente, o problema é dentro do modal.
- **1ª hipótese (sessão anterior, jul/2026) — insuficiente**: suspeitava-se do `<foreignObject>` da roleta SVG (bug conhecido de render/clique no WebKit). Isso foi removido (texto agora é `<text>`/`<tspan>` nativo), mas **o problema continuou acontecendo** — ou seja, não era essa a causa principal (ou não era a única).
- **2ª causa, encontrada por inspeção de layout (bem mais provável e mensurável)**: o modal da roleta (`.modal-castigo`) é o **único modal bloqueante do site sem `max-height`/`overflow-y:auto`**. Somando o conteúdo real dele — foto do Ribamar (220px) + título + texto de zoação + roda da roleta (até 400px) + resultado (que depois do giro ainda inclui outra foto de 210px) + 2 botões + os `padding` — dá **bem mais de 900–1000px de altura**, quando um iPhone em pé no Safari tem, na prática, uns 600–650px visíveis (a barra de endereço do Safari come uma boa fatia). Sem `overflow-y:auto`, o que não cabe **simplesmente fica fora da tela, sem rolagem possível** — inclusive o botão "Girar a roleta" (antes de girar) ou "Aceitar e guardar" (depois de girar). A pessoa literalmente não consegue ver nem tocar no botão que a tiraria dali. Isso bate 100% com o relato: preso, sem conseguir sair, especificamente em tela de celular.
- **Prova de que era isso**: o modal do "Sistema de Pontuação" (`.modal-pontuacao`), que também tem bastante conteúdo, **já usa** `max-height:86vh;overflow-y:auto` — ou seja, esse padrão já existia no código para outros modais compridos, só não tinha sido aplicado no modal da roleta. Foi um esquecimento pontual, não uma limitação técnica.
- **Correção aplicada**: adicionado `max-height:88vh` (com `max-height:88dvh` logo em seguida, que sobrescreve em navegadores que suportam a unidade `dvh` — mais precisa em iOS Safari, onde `vh` é historicamente impreciso por causa da barra de endereço que aparece/some) + `overflow-y:auto` + `-webkit-overflow-scrolling:touch` (rolagem por inércia no iOS) em **todos** os modais bloqueantes do site: `.modal-castigo` (o da roleta — correção principal), `.modal` (genérico, usado em confirmações), `.modal-banner` (banner de vencedor/quase) e `.fq-modal` (o do quiz "O Que Mais Entende de Futebol", em `index.html` e `futebol.html`).
- **Por que isso não afeta ninguém que já funcionava bem**: `max-height`/`overflow-y:auto` só têm efeito quando o conteúdo realmente não cabe na tela. Em qualquer tela onde o modal já cabia inteiro (a maioria dos celulares maiores e todo desktop), nada muda visualmente — é uma rede de segurança pura, sem risco de regressão.
- **Ainda não confirmado com o usuário real** — é uma causa concreta, mensurável e consistente com o sintoma relatado (bem mais forte que a hipótese anterior), mas pedir pro Luiz e pro Vitor testarem de novo depois desse deploy, especialmente **girando a roleta até o fim e confirmando o castigo**, pra fechar o ciclo.
