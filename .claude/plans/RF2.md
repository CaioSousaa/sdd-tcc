# RF2 — Plano Técnico: Autenticação de Usuário

## Stack Tecnológica

### Backend
- **jsonwebtoken** — geração e assinatura do JWT (adicionar ao projeto; bcrypt já existe)
- **bcrypt** — comparação de senha já disponível via RF1
- **Mongoose/UserModel** — reutilizado do RF1 para buscar usuário por e-mail
- **Express 5** — handler da rota `POST /auth`

### Frontend
- **Next.js 16 App Router** — `app/page.tsx` se torna a tela de login
- **Axios** — instância em `lib/axios.ts` recebe interceptor de auth
- **localStorage** — armazena o token após login bem-sucedido

---

## Modelo de Dados

Nenhum schema novo. RF2 opera exclusivamente sobre o `UserModel` já criado no RF1:

```
User { _id, name, email, password (bcrypt hash), createdAt }
```

O token JWT carregará o seguinte payload:

```json
{ "sub": "<user._id>", "iat": <epoch>, "exp": <iat + 6h> }
```

---

## Estrutura de Arquivos Novos

### Backend

```
src/
├── config/
│   └── jwt.ts                        # sign() e verify() com JWT_SECRET
├── modules/
│   └── auth/
│       ├── dto/
│       │   └── login.dto.ts           # { email: string; password: string }
│       ├── port/
│       │   └── auth-service.port.ts   # interface AuthServicePort { login(dto) }
│       ├── services/
│       │   └── auth.service.ts        # implementa AuthServicePort
│       ├── factories/
│       │   └── auth.factory.ts        # monta AuthController com dependências
│       └── infra/
│           └── controllers/
│               └── auth.controller.ts # handler HTTP
└── routes/
    └── auth.routes.ts                 # POST /auth → AuthController
```

`auth.service.ts` **não** tem repositório próprio — recebe `UserRepositoryPort` por injeção (reutiliza o repositório do RF1).

### Frontend

```
app/
└── page.tsx          # substituída: tela de login (era template padrão)
components/
└── LoginForm.tsx     # formulário de login (novo)
lib/
└── axios.ts          # atualizado: adicionar interceptor de request com token
```

---

## Endpoint: `POST /auth`

### Fluxo de dados

```
Request → AuthController → AuthService → UserRepository → UserModel (MongoDB)
```

### AuthController (`auth.controller.ts`)

Responsabilidades:
1. Extrair `email` e `password` do `req.body`
2. Validar presença de cada campo → `400` se ausente
3. Chamar `authService.login({ email, password })`
4. Retornar `201 + { message, token }` ou repassar erro ao Express

```typescript
// Pseudocódigo
if (!email) return res.status(400).json({ message: "O campo email é obrigatório" });
if (!password) return res.status(400).json({ message: "O campo password é obrigatório" });

const { token } = await this.authService.login({ email, password });
return res.status(201).json({ message: "Login bem-sucedido, bem-vindo!", token });
```

### AuthService (`auth.service.ts`)

Responsabilidades:
1. Buscar usuário por e-mail via `UserRepositoryPort.findByEmail()`
2. Se não encontrado → lança `InvalidCredentialsError`
3. Comparar senha com `bcrypt.compare()` → se falso → lança `InvalidCredentialsError`
4. Assinar JWT via `jwt.sign()` com `{ sub: user._id }` e `expiresIn: '6h'`
5. Retornar `{ token }`

> **Detalhe:** e-mail não encontrado e senha errada lançam o mesmo erro — a mensagem genérica é deliberada (RN1).

### Tratamento de Erros

| Situação | Erro lançado | Status HTTP | Mensagem |
|---|---|---|---|
| Campo `email` ausente | — (controller) | `400` | `"O campo email é obrigatório"` |
| Campo `password` ausente | — (controller) | `400` | `"O campo password é obrigatório"` |
| E-mail não cadastrado | `InvalidCredentialsError` | `401` | `"E-mail ou senha incorretos, tente novamente"` |
| Senha incorreta | `InvalidCredentialsError` | `401` | `"E-mail ou senha incorretos, tente novamente"` |

`InvalidCredentialsError` é uma classe de erro customizada (mesmo padrão do `DuplicateEmailError` do RF1). O Express a captura no handler de erro e resolve o status correto.

### Configuração JWT (`config/jwt.ts`)

```typescript
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET ?? "kandaidu92dj90ju32";

export const signToken = (sub: string) =>
  jwt.sign({ sub }, SECRET, { expiresIn: "6h" });
```

Variável `JWT_SECRET` adicionada ao `.env`.

### Registro da Rota (`auth.routes.ts` → `server.ts`)

```typescript
// auth.routes.ts
router.post("/", authFactory().handle.bind(...));

// server.ts
app.use("/auth", authRoutes);
```

---

## Frontend

### `app/page.tsx` — Tela de Login

- Substitui o template padrão do Next.js
- Renderiza `<LoginForm />`
- Layout idêntico ao da tela de cadastro (card centralizado, zinc-900, amber-400)
- Link para `/cadastro`

### `components/LoginForm.tsx`

Estado: `email`, `password`, `error`, `loading`

Fluxo:
1. Submit → `POST /auth` via axios
2. Sucesso → salva token em `localStorage.setItem("token", token)` → `router.push("/home")`
3. Erro `400`/`401` → exibe `error.response.data.message` no formulário

### `lib/axios.ts` — Interceptor de Request

```typescript
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

> Interceptor adicionado à instância existente, sem alterar a configuração de `baseURL`.

---

## Sequência de Implementação

1. `npm install jsonwebtoken @types/jsonwebtoken` no backend
2. Adicionar `JWT_SECRET` ao `.env`
3. Criar `src/config/jwt.ts`
4. Criar `InvalidCredentialsError` (ou em `shared/errors/`)
5. Criar módulo `auth/` completo (dto → port → service → controller → factory)
6. Criar `auth.routes.ts` e registrar em `server.ts`
7. Substituir `app/page.tsx` pelo componente de login
8. Criar `components/LoginForm.tsx`
9. Atualizar `lib/axios.ts` com o interceptor de request
