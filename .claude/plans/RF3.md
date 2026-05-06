# RF3 — Plano Técnico: Controle de Acesso por Usuário

## Stack Tecnológica

### Backend
- **jsonwebtoken** — já instalado (RF2); `jwt.verify()` valida e decodifica o token
- **Express 5** — middleware de Request/Response
- **TypeScript module augmentation** — estende `express.Request` para incluir `userId: string`

### Frontend
- **Next.js 16 App Router** — nova rota `app/home/` (Client Component com guard)
- **Axios** — interceptor de resposta em `lib/axios.ts` detecta expiração
- **localStorage** — fonte do token; lida pelo guard e pelo interceptor de request já existente

> **Nota sobre `proxy.ts`**: O `proxy.ts` do Next.js 16 executa em Edge Runtime e não tem acesso ao `localStorage`. Como o token está no `localStorage` (decisão tomada no RF2), o guard de rota será implementado no lado cliente via `useEffect`, e não via proxy.

---

## Modelo de Dados

Nenhum schema novo. RF3 não persiste dados — atua apenas na camada de transporte e controle de acesso.

O middleware extrai o `userId` do payload JWT (`sub`) e o injeta em `req.userId`. Todas as queries de recursos protegidos (tarefas, notificações, tags) utilizarão esse campo nas RFs subsequentes. A tipagem é feita via module augmentation:

```
express.Request {
  userId?: string   // preenchido pelo middleware authenticate após validação do token
}
```

---

## Estrutura de Arquivos

### Backend — arquivos novos

```
src/
├── @types/
│   └── express/
│       └── index.d.ts          ← augmenta Request com userId
└── shared/
    └── http/
        └── authenticate.ts     ← middleware JWT
```

### Frontend — arquivos novos/modificados

```
app/
└── home/
    └── page.tsx                ← nova rota protegida (Client Component)
components/
└── AuthGuard.tsx               ← guard reutilizável (Client Component)
lib/
└── axios.ts                    ← adiciona interceptor de resposta
```

---

## Implementação Detalhada

### 1. Type augmentation — `src/@types/express/index.d.ts`

Estende a interface `Request` do Express para aceitar `userId` sem cast:

```ts
import 'express';

declare module 'express' {
  interface Request {
    userId?: string;
  }
}
```

O `tsconfig.json` já inclui `src/**/*`, então o arquivo será reconhecido automaticamente.

---

### 2. Middleware `authenticate` — `src/shared/http/authenticate.ts`

Fluxo:
1. Lê `req.headers.authorization`
2. Se ausente ou sem prefixo `Bearer`, responde `401 "Token não informado"`
3. Chama `jwt.verify(token, SECRET)`
4. Se `TokenExpiredError`, responde `401 "Token expirado, faça login novamente"`
5. Se qualquer outro erro (`JsonWebTokenError`, `NotBeforeError`), responde `401 "Token inválido"`
6. Se válido, atribui `(payload as jwt.JwtPayload).sub` a `req.userId` e chama `next()`

```ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET ?? 'kandaidu92dj90ju32';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token não informado' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, SECRET) as jwt.JwtPayload;
    req.userId = payload.sub;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expirado, faça login novamente' });
      return;
    }
    res.status(401).json({ message: 'Token inválido' });
  }
}
```

O middleware **não** será registrado globalmente no `server.ts`; será aplicado por rota nas RFs que criarem endpoints protegidos.

---

### 3. Interceptor de resposta — `lib/axios.ts`

Adiciona um `interceptors.response.use` à instância já existente:

```ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      (error.response.data as { message?: string }).message ===
        'Token expirado, faça login novamente'
    ) {
      localStorage.removeItem('token');
      alert('Token expirado, faça login novamente');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
```

`window.location.href` é usado em vez de `router.push` porque o interceptor vive fora do ciclo React e não tem acesso ao `useRouter`.

---

### 4. `AuthGuard` — `components/AuthGuard.tsx`

Client Component reutilizável que verifica a presença do token. Enquanto a verificação ocorre (hidratação), renderiza `null` para evitar flash do conteúdo protegido:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/');
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;
  return <>{children}</>;
}
```

---

### 5. Rota `/home` — `app/home/page.tsx`

Página vazia nesta entrega — seu único papel é confirmar que o fluxo de redirecionamento pós-login funciona. Conteúdo real será adicionado nas RFs de tarefas.

```tsx
import AuthGuard from '@/components/AuthGuard';

export const metadata = { title: 'Home — SDD' };

export default function HomePage() {
  return (
    <AuthGuard>
      <main className="flex min-h-screen items-center justify-center bg-zinc-900">
        <p className="text-zinc-400">Em construção.</p>
      </main>
    </AuthGuard>
  );
}
```

> `page.tsx` é um Server Component por padrão; o `AuthGuard` importado é Client Component — o limite de Client/Server é respeitado.

---

## Tratamento de Erros

| Camada | Cenário | Resposta |
|---|---|---|
| Middleware backend | Header `Authorization` ausente | `401 { message: "Token não informado" }` |
| Middleware backend | Assinatura JWT inválida | `401 { message: "Token inválido" }` |
| Middleware backend | Token expirado (`TokenExpiredError`) | `401 { message: "Token expirado, faça login novamente" }` |
| Axios interceptor | 401 + mensagem de expiração | `alert()` + `window.location.href = '/'` + remove token do localStorage |
| AuthGuard | `localStorage` sem token | `router.replace('/')` silencioso (sem alert) |

---

## Ordem de Implementação

1. `src/@types/express/index.d.ts` — type augmentation
2. `src/shared/http/authenticate.ts` — middleware
3. `lib/axios.ts` — response interceptor
4. `components/AuthGuard.tsx` — guard reutilizável
5. `app/home/page.tsx` — rota protegida
