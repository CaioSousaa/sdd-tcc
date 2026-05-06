# RF1 — Todo

## Backend

### Infraestrutura
- [x] **B1** Instalar dependências: `mongoose bcrypt` + `@types/bcrypt` + `dotenv`
- [x] **B2** Criar `src/infra/mongo/connection.ts` — função `connectDB()` lendo `MONGO_URI` do `.env`
- [x] **B3** Criar `src/infra/mongo/schemas/user.schema.ts` — schema Mongoose + interface `IUser` + `UserModel`

### Módulo User — Contratos
- [x] **B4** Criar `src/modules/user/dto/create-user.dto.ts` — interface `CreateUserDTO`
- [x] **B5** Criar `src/modules/user/port/user-repository.port.ts` — interface `UserRepositoryPort`
- [x] **B6** Criar `src/modules/user/port/user-service.port.ts` — interface `UserServicePort`

### Módulo User — Implementação
- [x] **B7** Criar `src/modules/user/infra/repository/user.repository.ts` — implementação Mongoose de `UserRepositoryPort`
- [x] **B8** Criar `src/modules/user/services/user.service.ts` — lógica de negócio + classe `DuplicateEmailError`
- [x] **B9** Criar `src/modules/user/infra/controllers/user.controller.ts` — validação de campos + mapeamento de erros HTTP
- [x] **B10** Criar `src/modules/user/factories/user.factory.ts` — função `makeUserController()`
- [x] **B11** Criar `src/routes/user.routes.ts` — `POST /` → `userController.create`

### Wiring
- [x] **B12** Atualizar `src/server.ts` — montar `/users` router e chamar `connectDB()` antes do `listen`

### Validação Backend
- [x] **B13** Testar com curl: happy path → 201
- [x] **B14** Testar com curl: campo ausente → 400
- [x] **B15** Testar com curl: e-mail duplicado → 409
- [x] **B16** `npx tsc --noEmit` sem erros no backend

---

## Frontend

### Infraestrutura
- [x] **F1** Instalar dependência: `axios`
- [x] **F2** Criar `sdd-frontend/.env.local` — `NEXT_PUBLIC_API_URL=http://localhost:3333`
- [x] **F3** Criar `sdd-frontend/lib/axios.ts` — instância Axios com `baseURL`
- [x] **F4** Criar `sdd-frontend/types/index.ts` — interface `ApiError`

### Componentes UI
- [x] **F5** Criar `sdd-frontend/components/ui/Input.tsx` — input reutilizável estilizado
- [x] **F6** Criar `sdd-frontend/components/ui/Button.tsx` — botão amber-400 com prop `isLoading`

### Feature
- [x] **F7** Criar `sdd-frontend/components/RegisterForm.tsx` — Client Component com form state + chamada à API
- [x] **F8** Criar `sdd-frontend/app/cadastro/page.tsx` — Server Component shell da rota `/cadastro`
- [x] **F9** Atualizar `sdd-frontend/app/layout.tsx` — dark theme global (`bg-zinc-900`, `lang="pt-BR"`)

### Validação Frontend
- [x] **F10** Verificar no browser: renderização da página `/cadastro`
- [x] **F11** Verificar no browser: erro inline ao submeter com campo vazio
- [x] **F12** Verificar no browser: cadastro válido redireciona para `/login`
- [x] **F13** Verificar no browser: e-mail duplicado exibe erro inline
- [x] **F14** `npx tsc --noEmit` sem erros no frontend
