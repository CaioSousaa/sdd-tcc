# RF2 — Autenticação de Usuário

## História de Usuário

**Como** um usuário cadastrado,  
**Quero** fazer login com meu e-mail e senha,  
**Para** obter acesso autenticado às funcionalidades da plataforma.

---

## Contrato da API

**Endpoint:** `POST /auth`

### Corpo da requisição
```json
{
  "email": "string",
  "password": "string"
}
```

### Respostas

| Cenário | Status | Corpo |
|---|---|---|
| Login bem-sucedido | `201` | `{ "message": "Login bem-sucedido, bem-vindo!", "token": "<jwt>" }` |
| Campo obrigatório ausente | `400` | `{ "message": "O campo {campo} é obrigatório" }` |
| E-mail ou senha incorretos | `401` | `{ "message": "E-mail ou senha incorretos, tente novamente" }` |

---

## Critérios de Aceite

1. Dado uma requisição com `email` e `password` corretos, o sistema deve retornar `201` com a mensagem `"Login bem-sucedido, bem-vindo!"` e um token JWT válido.
2. Dado uma requisição com `email` não cadastrado, o sistema deve retornar `401` com a mensagem `"E-mail ou senha incorretos, tente novamente"`.
3. Dado uma requisição com `email` correto mas `password` incorreta, o sistema deve retornar `401` com a mensagem `"E-mail ou senha incorretos, tente novamente"`.
4. O token JWT gerado deve ter expiração de 6 horas.
5. Dado uma requisição sem `email`, o sistema deve retornar `400` com a mensagem `"O campo email é obrigatório"`.
6. Dado uma requisição sem `password`, o sistema deve retornar `400` com a mensagem `"O campo password é obrigatório"`.
7. A tela de login deve ser a primeira tela visualizada pelo usuário (rota raiz `/`).
8. Após login bem-sucedido, o frontend deve redirecionar o usuário para a rota `/home`.

---

## Regras de Negócio

- **RN1:** O login exige que tanto o e-mail quanto a senha estejam corretos; qualquer discrepância retorna `401` sem indicar qual campo está errado (evita enumeração de usuários).
- **RN2:** A senha é comparada via bcrypt contra o hash armazenado.
- **RN3:** O JWT é assinado com a secret `kandaidu92dj90ju32` e expira em `6h`.

---

## Decisões Técnicas

- A validação dos campos obrigatórios ocorre no controller.
- A busca do usuário por e-mail e a comparação de senha ocorrem no service.
- Em caso de falha (e-mail não encontrado ou senha errada), a resposta é sempre `401` com a mesma mensagem — sem distinguir os dois casos.
- O token é retornado no corpo da resposta e armazenado no `localStorage` pelo frontend; o interceptor do Axios o lê e o anexa como `Authorization: Bearer <token>` em cada requisição subsequente.
- A rota `/home` ainda não existe; o frontend realiza apenas o redirect, sem renderizar conteúdo.
- A secret JWT é configurada via variável de ambiente `JWT_SECRET`; o valor `kandaidu92dj90ju32` é o padrão de desenvolvimento definido em `.env`.
