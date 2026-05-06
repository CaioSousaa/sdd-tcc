# RF3 — Controle de Acesso por Usuário

## História de Usuário

**Como** um usuário autenticado,  
**Quero** que minhas tarefas e notificações sejam acessíveis apenas por mim,  
**Para** garantir a privacidade e a integridade dos meus dados.

---

## Contrato da API

### Middleware de autenticação (aplicado a todas as rotas protegidas)

O middleware lê o header `Authorization: Bearer <token>`, valida o JWT e injeta o `userId` no objeto `req`. Em caso de falha, encerra a requisição com os erros abaixo.

**Cabeçalho esperado:** `Authorization: Bearer <token>`

### Respostas do middleware

| Cenário | Status | Corpo |
|---|---|---|
| Token ausente | `401` | `{ "message": "Token não informado" }` |
| Token inválido (assinatura incorreta) | `401` | `{ "message": "Token inválido" }` |
| Token expirado | `401` | `{ "message": "Token expirado, faça login novamente" }` |
| Token válido | — | Executa o próximo handler com `req.userId` preenchido |

---

## Critérios de Aceite

1. Dado uma requisição a uma rota protegida sem o header `Authorization`, o sistema deve retornar `401` com a mensagem `"Token não informado"`.
2. Dado uma requisição com token de assinatura inválida, o sistema deve retornar `401` com a mensagem `"Token inválido"`.
3. Dado uma requisição com token expirado, o sistema deve retornar `401` com a mensagem `"Token expirado, faça login novamente"`.
4. Dado uma requisição com token válido, o middleware deve injetar o `userId` decodificado em `req` e passar o controle ao próximo handler.
5. Nenhuma rota protegida deve retornar dados de outro usuário — todas as consultas ao banco devem ser filtradas pelo `userId` do token.
6. Se o usuário não possui token no `localStorage`, o frontend deve redirecioná-lo para `/` ao tentar acessar qualquer rota protegida.
7. Quando o Axios interceptor receber `401` com a mensagem `"Token expirado, faça login novamente"`, o frontend deve exibir um alerta informativo ao usuário e redirecioná-lo para `/`.
8. Após login bem-sucedido, o frontend deve redirecionar o usuário para `/home` e a rota deve ser renderizada.

---

## Regras de Negócio

- **RN1:** Somente um login bem-sucedido (RF2) resulta em redirecionamento para `/home`; qualquer outro acesso direto à rota sem token válido retorna à tela de login.
- **RN2:** Ao expirar o token, o sistema não realiza refresh silencioso — o usuário é notificado e deve autenticar-se novamente.
- **RN3:** O `userId` injetado pelo middleware é a única fonte de identidade usada nas queries; parâmetros de rota ou corpo da requisição não sobrescrevem esse valor para fins de autorização.

---

## Decisões Técnicas

- O middleware `authenticate` é implementado no backend em `src/shared/http/` e registrado em todas as rotas que exigem autenticação.
- O `userId` é decodificado do payload JWT e adicionado como `req.userId` (tipado via `express.d.ts` ou equivalente).
- No frontend, o interceptor de resposta do Axios (em `lib/axios.ts`) verifica o status `401` e a mensagem retornada; ao detectar token expirado, dispara `alert("Token expirado, faça login novamente")` e redireciona para `/`.
- A rota `/home` é a primeira rota protegida do frontend; seu conteúdo nesta entrega pode ser uma página vazia, validando apenas o fluxo de autenticação e redirecionamento.
- O guard de rota no frontend verifica a presença do token no `localStorage` antes de renderizar qualquer rota protegida.
