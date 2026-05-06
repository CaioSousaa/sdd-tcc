# RF1 — Cadastro de Usuário: Plano Técnico de Implementação

## Contexto

Implementar o endpoint `POST /users` no backend (Express 5 / Clean Architecture) e a página `/cadastro` no frontend (Next.js 16 App Router). O backend está em estado mínimo (só `src/server.ts`); o frontend também está em boilerplate puro. Nenhum banco de dados, rota ou componente existe ainda.

---

## 1. Dependências a Instalar

### Backend
```bash
npm install mongoose bcrypt
npm install --save-dev @types/bcrypt
```

### Frontend
```bash
npm install axios
```

---

## 2. Arquivos a Criar / Modificar

### Backend

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `src/infra/mongo/connection.ts` | CRIAR | `connectDB()` — lê `MONGO_URI` do `.env` e abre conexão Mongoose |
| `src/infra/mongo/schemas/user.schema.ts` | CRIAR | Schema Mongoose do User + `IUser` interface + `UserModel` |
| `src/modules/user/dto/create-user.dto.ts` | CRIAR | Interface `CreateUserDTO { name, email, password }` |
| `src/modules/user/port/user-repository.port.ts` | CRIAR | Interface `UserRepositoryPort { findByEmail, create }` |
| `src/modules/user/port/user-service.port.ts` | CRIAR | Interface `UserServicePort { createUser }` |
| `src/modules/user/infra/repository/user.repository.ts` | CRIAR | Implementação Mongoose de `UserRepositoryPort` |
| `src/modules/user/services/user.service.ts` | CRIAR | Lógica de negócio: verifica duplicata, hasha senha (bcrypt, custo 10), persiste |
| `src/modules/user/infra/controllers/user.controller.ts` | CRIAR | Valida campos obrigatórios, delega ao service, mapeia erros → HTTP |
| `src/modules/user/factories/user.factory.ts` | CRIAR | `makeUserController()` — instancia e injeta dependências |
| `src/routes/user.routes.ts` | CRIAR | `POST /` → `userController.create` |
| `src/server.ts` | MODIFICAR | Importa `connectDB` e `userRouter`; inicia server só após conexão |

### Frontend

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `.env.local` | CRIAR | `NEXT_PUBLIC_API_URL=http://localhost:3333` |
| `lib/axios.ts` | CRIAR | Instância Axios apontando para `NEXT_PUBLIC_API_URL` |
| `types/index.ts` | CRIAR | `interface ApiError { message: string }` |
| `components/ui/Input.tsx` | CRIAR | Input reutilizável estilizado (dark theme, focus amber-400) |
| `components/ui/Button.tsx` | CRIAR | Botão reutilizável amber-400 com prop `isLoading` |
| `components/RegisterForm.tsx` | CRIAR | Client Component com estado de form, chamada à API, tratamento de erros |
| `app/cadastro/page.tsx` | CRIAR | Server Component shell para a rota `/cadastro` |
| `app/layout.tsx` | MODIFICAR | Adicionar `dark` e `bg-zinc-900` ao `<html>`; `lang="pt-BR"` |

---

## 3. Fluxo de Dados

```
Navegador
  └─▶ RegisterForm (Client Component)
        └─▶ axios.post('/users', { name, email, password })
              └─▶ Express: server.ts → /users router → UserController.create()
                    ├─ Validação de campos (400 se ausente)
                    └─▶ UserService.createUser()
                          ├─ findByEmail() → 409 DuplicateEmailError se existir
                          ├─ bcrypt.hash(password, 10)
                          └─▶ UserRepository.create() → MongoDB Atlas
                                └─▶ 201 { message: "Usuário cadastrado com sucesso" }
```

---

## 4. Tratamento de Erros

| Camada | Condição | Resultado HTTP |
|---|---|---|
| Controller | Campo ausente em `req.body` | `400 { message: "O campo X é obrigatório" }` |
| Service | E-mail já existe no banco | lança `DuplicateEmailError` |
| Controller | Captura `DuplicateEmailError` | `409 { message: "E-mail já cadastrado, por favor tente outro" }` |
| Controller | Qualquer outro erro | `throw error` → Express 5 propaga como 500 |
| RegisterForm | `axios.isAxiosError` com response | Exibe `err.response.data.message` em vermelho |
| RegisterForm | Erro de rede / sem response | "Erro inesperado. Tente novamente." |

**Nota:** Express 5 propaga Promises rejeitadas automaticamente ao error handler — não é necessário `next(err)` nos controllers.

---

## 5. Detalhes de Implementação

### `user.schema.ts`
```typescript
// timestamps: { createdAt: true, updatedAt: false }
// email: unique: true, lowercase: true, trim: true
```

### `user.service.ts`
```typescript
export class DuplicateEmailError extends Error { ... }

async createUser(data: CreateUserDTO): Promise<void> {
  const existing = await this.userRepository.findByEmail(data.email);
  if (existing) throw new DuplicateEmailError();
  const hashedPassword = await bcrypt.hash(data.password, 10);
  await this.userRepository.create({ ...data, password: hashedPassword });
}
```

### `user.controller.ts`
```typescript
const REQUIRED_FIELDS = ['name', 'email', 'password'] as const;
// Itera REQUIRED_FIELDS; se req.body[field] for falsy → 400 e return
// Captura DuplicateEmailError → 409
// Outros erros → throw (Express 5 trata como 500)
```

### `server.ts` (atualização)
```typescript
connectDB()
  .then(() => app.listen(PORT, ...))
  .catch((err) => { console.error(err); process.exit(1); });
```

### Design Frontend
- Fundo global: `bg-zinc-900` no `<body>`
- Card do form: `bg-zinc-950 border border-zinc-800`
- Input: `bg-zinc-800 border-zinc-700 focus:border-amber-400 focus:ring-amber-400`
- Botão: `bg-amber-400 text-zinc-900`
- Erro: `text-red-400 role="alert"`
- Link para login: `text-amber-400`

---

## 6. Verificação End-to-End

```bash
# 1. Backend
cd sdd-backend && npm run dev
# Espera: "MongoDB connected" + "Server running on port 3333"

# 2. Happy path
curl -s -X POST http://localhost:3333/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Caio","email":"caio@test.com","password":"secret123"}'
# Espera: 201 { "message": "Usuário cadastrado com sucesso" }

# 3. E-mail duplicado
curl -s -X POST http://localhost:3333/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Caio","email":"caio@test.com","password":"other"}'
# Espera: 409 { "message": "E-mail já cadastrado, por favor tente outro" }

# 4. Campo ausente
curl -s -X POST http://localhost:3333/users \
  -H "Content-Type: application/json" \
  -d '{"email":"a@b.com","password":"x"}'
# Espera: 400 { "message": "O campo name é obrigatório" }

# 5. Frontend
cd sdd-frontend && npm run dev
# Navegar para http://localhost:3001/cadastro
# Testar: campo vazio → erro inline; cadastro válido → redirect /login;
# e-mail duplicado → erro inline; backend offline → "Erro inesperado"

# 6. TypeScript
cd sdd-backend && npx tsc --noEmit
cd sdd-frontend && npx tsc --noEmit
```

---

## 7. Ordem de Implementação

1. Instalar dependências (backend + frontend)
2. `connection.ts` + testar conexão Atlas
3. `user.schema.ts`
4. DTOs e interfaces de port
5. `UserRepository`
6. `UserService` + `DuplicateEmailError`
7. `UserController`
8. `user.factory.ts` + `user.routes.ts`
9. Atualizar `server.ts`
10. Testes curl (happy path, duplicata, campo ausente)
11. `lib/axios.ts` + `types/index.ts` + `.env.local`
12. `components/ui/Input.tsx` + `Button.tsx`
13. `components/RegisterForm.tsx`
14. `app/cadastro/page.tsx`
15. Atualizar `app/layout.tsx`
16. Verificação visual no browser
17. `tsc --noEmit` nos dois projetos

---

## Arquivos Críticos

- `sdd-backend/src/server.ts`
- `sdd-backend/src/modules/user/services/user.service.ts`
- `sdd-backend/src/modules/user/infra/controllers/user.controller.ts`
- `sdd-frontend/components/RegisterForm.tsx`
- `sdd-frontend/app/cadastro/page.tsx`
