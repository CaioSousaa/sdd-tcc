# RF2 — Todo

## Backend

### Infraestrutura
- [x] **B1** Instalar dependências: `jsonwebtoken` + `@types/jsonwebtoken` no `sdd-backend`
- [x] **B2** Adicionar `JWT_SECRET=kandaidu92dj90ju32` ao `sdd-backend/.env`
- [x] **B3** Criar `src/config/jwt.ts` — função `signToken(sub: string)` com `expiresIn: "6h"` lendo `JWT_SECRET` do `.env`

### Módulo Auth — Erros
- [x] **B4** Criar `src/shared/errors/invalid-credentials.error.ts` — classe `InvalidCredentialsError` (mesmo padrão do `DuplicateEmailError`)

### Módulo Auth — Contratos
- [x] **B5** Criar `src/modules/auth/dto/login.dto.ts` — interface `LoginDTO { email: string; password: string }`
- [x] **B6** Criar `src/modules/auth/port/auth-service.port.ts` — interface `AuthServicePort { login(dto: LoginDTO): Promise<{ token: string }> }`

### Módulo Auth — Implementação
- [x] **B7** Criar `src/modules/auth/services/auth.service.ts` — busca usuário por e-mail, compara senha com bcrypt, assina JWT; lança `InvalidCredentialsError` em qualquer falha de credencial
- [x] **B8** Criar `src/modules/auth/infra/controllers/auth.controller.ts` — valida presença de `email` e `password` (→ 400), chama service (→ 201 + token), repassa erros ao Express
- [x] **B9** Criar `src/modules/auth/factories/auth.factory.ts` — função `makeAuthController()` injetando `UserRepository` no `AuthService`
- [x] **B10** Criar `src/routes/auth.routes.ts` — `POST /` → `authController.login`

### Wiring
- [x] **B11** Atualizar `src/server.ts` — montar `/auth` router

### Validação Backend
- [x] **B12** Testar com curl: happy path → 201 com token JWT
- [x] **B13** Testar com curl: `email` ausente → 400
- [x] **B14** Testar com curl: `password` ausente → 400
- [x] **B15** Testar com curl: credenciais erradas → 401
- [x] **B16** `npx tsc --noEmit` sem erros no backend

---

## Frontend

### Feature
- [x] **F1** Substituir `sdd-frontend/app/page.tsx` — Server Component shell da rota `/` com layout de card centralizado e `<LoginForm />`
- [x] **F2** Criar `sdd-frontend/components/LoginForm.tsx` — Client Component com estado `email`, `password`, `error`, `loading`; salva token no `localStorage` e redireciona para `/home` no sucesso
- [x] **F3** Atualizar `sdd-frontend/lib/axios.ts` — adicionar interceptor de request que lê token do `localStorage` e injeta header `Authorization: Bearer <token>`

### Validação Frontend
- [x] **F4** Verificar no browser: rota `/` renderiza a tela de login
- [ ] **F5** Verificar no browser: campo ausente exibe erro inline correto
- [ ] **F6** Verificar no browser: credenciais erradas exibem mensagem de erro inline
- [ ] **F7** Verificar no browser: login válido redireciona para `/home`
- [x] **F8** `npx tsc --noEmit` sem erros no frontend
