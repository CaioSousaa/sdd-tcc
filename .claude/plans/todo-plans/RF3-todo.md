# RF3 — Todo de Implementação

## Backend

- [ ] **T1** Criar `src/@types/express/index.d.ts`
  - Augmentar `express.Request` com `userId?: string`
  - Verificar que o `tsconfig.json` cobre `src/**/*` (já cobre — nenhuma alteração necessária)

- [ ] **T2** Criar `src/shared/http/authenticate.ts`
  - Ler `req.headers.authorization`; retornar `401 "Token não informado"` se ausente ou sem prefixo `Bearer`
  - Chamar `jwt.verify(token, SECRET)` dentro de try/catch
  - Capturar `jwt.TokenExpiredError` → `401 "Token expirado, faça login novamente"`
  - Capturar demais erros → `401 "Token inválido"`
  - Em caso de sucesso, atribuir `payload.sub` a `req.userId` e chamar `next()`

## Frontend

- [ ] **T3** Atualizar `lib/axios.ts` — adicionar interceptor de resposta
  - Manter o interceptor de request existente intacto
  - Adicionar `api.interceptors.response.use(passthrough, errorHandler)`
  - No `errorHandler`: verificar `status === 401` e `message === "Token expirado, faça login novamente"`
  - Se positivo: `localStorage.removeItem('token')` + `alert(...)` + `window.location.href = '/'`
  - Sempre fazer `return Promise.reject(error)` ao final

- [ ] **T4** Criar `components/AuthGuard.tsx`
  - Marcar com `'use client'`
  - Estado `checked: boolean` iniciado como `false`
  - `useEffect`: checar `localStorage.getItem('token')`; se ausente chamar `router.replace('/')`; se presente setar `checked = true`
  - Renderizar `null` enquanto `!checked`; renderizar `<>{children}</>` após check

- [ ] **T5** Criar `app/home/page.tsx`
  - Exportar `metadata` com `title: 'Home — SDD'`
  - Page é Server Component; envolver conteúdo com `<AuthGuard>` (Client Component)
  - Conteúdo: `<main>` com fundo `zinc-900` e texto `"Em construção."` centralizado
