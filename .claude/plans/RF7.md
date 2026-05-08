# RF7 — Criação de Tarefa: Plano Técnico de Implementação

## Contexto

O backend já possui a estrutura completa de Clean Architecture estabelecida pelas RFs anteriores (user, auth, tag). O padrão a seguir é: **ports → service → infra (controller + repository) → factory → route**. O frontend tem `lib/axios.ts`, `types/index.ts`, componentes `ui/Input` e `ui/Button` prontos, e a página `/home` como placeholder. Nenhum módulo de task existe ainda.

---

## 1. Dependências a Instalar

Nenhuma dependência nova é necessária — Mongoose, JWT, Express 5 e os tipos já estão instalados.

---

## 2. Arquivos a Criar / Modificar

### Backend

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `src/config/taskEnums.ts` | CRIAR | Constantes `TASK_STATUSES` e `TASK_PRIORITIES` usadas na validação |
| `src/infra/mongo/schemas/task.schema.ts` | CRIAR | Schema Mongoose da Task + interface `ITask` + `TaskModel` |
| `src/modules/task/dto/create-task.dto.ts` | CRIAR | Interface `CreateTaskDTO` com todos os campos da tarefa |
| `src/modules/task/port/task-repository.port.ts` | CRIAR | Interface `TaskRepositoryPort { create }` |
| `src/modules/task/port/task-service.port.ts` | CRIAR | Interface `TaskServicePort { createTask }` |
| `src/modules/task/infra/repository/task.repository.ts` | CRIAR | Implementação Mongoose de `TaskRepositoryPort` |
| `src/modules/task/services/task.service.ts` | CRIAR | Lógica de negócio + `TagNotFoundError` |
| `src/modules/task/infra/controllers/task.controller.ts` | CRIAR | Validação de campos → delega ao service → mapeia erros HTTP |
| `src/modules/task/factories/task.factory.ts` | CRIAR | `makeTaskController()` — injeta TaskRepository + TagRepository + TaskService |
| `src/routes/task.routes.ts` | CRIAR | `POST /` protegida por `authenticate` |
| `src/server.ts` | MODIFICAR | Importa e registra `taskRouter` em `/tasks` |

### Frontend

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `components/CreateTaskForm.tsx` | CRIAR | Client Component com formulário de criação de tarefa |
| `app/home/page.tsx` | MODIFICAR | Incorpora `CreateTaskForm` substituindo o placeholder |
| `types/index.ts` | MODIFICAR | Adiciona interface `Tag` para uso no formulário |

---

## 3. Modelo de Dados

### `task.schema.ts`

```typescript
export interface ITask extends Document {
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  owner: Types.ObjectId;       // ref: 'User'
  tags: Types.ObjectId[];      // ref: 'Tag'
  alert?: string;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title:       { type: String, required: true },
    description: { type: String, required: true },
    status:      { type: String, enum: ['todo', 'in_progress', 'done'], required: true },
    priority:    { type: String, enum: ['low', 'medium', 'high'], required: true },
    dueDate:     { type: Date, required: true },
    owner:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags:        [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    alert:       { type: String },
  },
  { timestamps: true }   // gera createdAt e updatedAt automaticamente
);
```

### `taskEnums.ts`

```typescript
export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;
export type TaskStatus = typeof TASK_STATUSES[number];

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export type TaskPriority = typeof TASK_PRIORITIES[number];
```

---

## 4. Estrutura do Endpoint

### Fluxo de dados

```
POST /tasks  (Authorization: Bearer <token>)
  │
  ├─ authenticate middleware        → injeta req.userId
  │
  └─ TaskController.create()
        ├─ Valida campos obrigatórios (title, description, status, priority, dueDate)
        │     → 400 "O campo {campo} é obrigatório"
        ├─ Valida status ∈ TASK_STATUSES
        │     → 400 "Status inválido"
        ├─ Valida priority ∈ TASK_PRIORITIES
        │     → 400 "Prioridade inválida"
        └─ taskService.createTask(dto, req.userId!)
              ├─ Para cada ID em tags: TagRepository.findById() filtrando owner === userId
              │     → lança TagNotFoundError se qualquer ID falhar
              └─ TaskRepository.create({ ...dto, owner: userId })
                    → 201 "Tarefa criada com sucesso"
```

### Ports

**`task-repository.port.ts`**
```typescript
export interface TaskRepositoryPort {
  create(data: CreateTaskDTO & { owner: string }): Promise<void>;
}
```

**`task-service.port.ts`**
```typescript
export interface TaskServicePort {
  createTask(data: CreateTaskDTO, userId: string): Promise<void>;
}
```

### DTO

```typescript
// create-task.dto.ts
export interface CreateTaskDTO {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  tags: string[];
  alert?: string;
}
```

### Service — dependências e lógica

O `TaskService` recebe **dois repositórios** no construtor: `TaskRepositoryPort` e `TagRepositoryPort` (importado do módulo tag). A validação de tags reutiliza o método `findById` já existente em `TagRepository`.

```typescript
export class TagNotFoundError extends Error {
  constructor() {
    super('Tag não encontrada');
    this.name = 'TagNotFoundError';
  }
}

export class TaskService implements TaskServicePort {
  constructor(
    private readonly taskRepository: TaskRepositoryPort,
    private readonly tagRepository: TagRepositoryPort,
  ) {}

  async createTask(data: CreateTaskDTO, userId: string): Promise<void> {
    for (const tagId of data.tags) {
      const tag = await this.tagRepository.findById(tagId);
      if (!tag || tag.owner !== userId) throw new TagNotFoundError();
    }
    await this.taskRepository.create({ ...data, owner: userId });
  }
}
```

### Controller — ordem de validação

```typescript
const REQUIRED_FIELDS = ['title', 'description', 'status', 'priority', 'dueDate'] as const;

// 1. Campos obrigatórios
for (const field of REQUIRED_FIELDS) {
  if (!req.body[field]) {
    res.status(400).json({ message: `O campo ${field} é obrigatório` });
    return;
  }
}

// 2. Enum status
if (!TASK_STATUSES.includes(status)) {
  res.status(400).json({ message: 'Status inválido' });
  return;
}

// 3. Enum priority
if (!TASK_PRIORITIES.includes(priority)) {
  res.status(400).json({ message: 'Prioridade inválida' });
  return;
}

// 4. Delega ao service (valida tags internamente)
try {
  await this.taskService.createTask(dto, req.userId!);
  res.status(201).json({ message: 'Tarefa criada com sucesso' });
} catch (error) {
  if (error instanceof TagNotFoundError) {
    res.status(400).json({ message: error.message });
  } else {
    res.status(500).json({ message: 'erro interno do servidor' });
  }
}
```

### Factory

```typescript
// task.factory.ts
import { TagRepository } from '../../tag/infra/repository/tag.repository';
import { TaskRepository } from '../infra/repository/task.repository';
import { TaskService } from '../services/task.service';
import { TaskController } from '../infra/controllers/task.controller';

export function makeTaskController(): TaskController {
  const taskRepository = new TaskRepository();
  const tagRepository  = new TagRepository();        // reutiliza implementação existente
  const service = new TaskService(taskRepository, tagRepository);
  return new TaskController(service);
}
```

### Route

```typescript
// task.routes.ts
router.post('/', authenticate, (req, res) => makeTaskController().create(req, res));
```

### Server

```typescript
// server.ts — adicionar:
import taskRouter from './routes/task.routes';
app.use('/tasks', taskRouter);
```

---

## 5. Tratamento de Erros

| Origem | Condição | HTTP | Corpo |
|---|---|---|---|
| Controller | Campo obrigatório ausente | `400` | `{ "message": "O campo {campo} é obrigatório" }` |
| Controller | `status` fora do enum | `400` | `{ "message": "Status inválido" }` |
| Controller | `priority` fora do enum | `400` | `{ "message": "Prioridade inválida" }` |
| Service → Controller | `TagNotFoundError` | `400` | `{ "message": "Tag não encontrada" }` |
| Middleware `authenticate` | Token ausente ou inválido | `401` | *(padrão RF3)* |
| Qualquer outro erro | Exceção inesperada | `500` | `{ "message": "erro interno do servidor" }` |

**Nota:** Express 5 propaga Promises rejeitadas automaticamente — não é necessário `next(err)`.

---

## 6. Frontend

### `types/index.ts` — adicionar

```typescript
export interface Tag {
  id: string;
  name: string;
  color: string;
}
```

### `components/CreateTaskForm.tsx`

Client Component que:
1. Na montagem, busca `GET /tags` para listar as tags do usuário e popular o seletor múltiplo.
2. Mantém estado para: `title`, `description`, `status`, `priority`, `dueDate`, `selectedTags: string[]`, `alert` (opcional), `error`, `isLoading`.
3. Ao submeter, chama `api.post('/tasks', payload)`.
4. Em caso de sucesso (201), chama `onSuccess?.()`.
5. Em caso de erro Axios, exibe `err.response?.data?.message`.

#### Campos do formulário

| Campo | Componente | Tipo de input |
|---|---|---|
| `title` | `<Input>` reutilizável | `text` |
| `description` | `<textarea>` | `textarea` |
| `status` | `<select>` | options: Todo / Em andamento / Concluído |
| `priority` | `<select>` | options: Baixa / Média / Alta |
| `dueDate` | `<Input>` reutilizável | `date` |
| `tags` | botões de seleção múltipla | array de checkboxes visuais usando a cor da tag |
| `alert` | `<Input>` reutilizável | `text` (placeholder: opcional) |

#### Design (consistente com o restante do projeto)

- Fundo do card: `bg-zinc-950 border border-zinc-800`
- Inputs e selects: `bg-zinc-800 border-zinc-700 focus:border-amber-400`
- Botão submit: `bg-amber-400 text-zinc-900`
- Erro: `text-red-400 role="alert"`
- Tags selecionadas: borda ou anel com a cor da tag

### `app/home/page.tsx` — modificar

Substituir o placeholder `"Em construção."` por `<CreateTaskForm>` dentro do `<AuthGuard>`. A `page.tsx` permanece Server Component; o `CreateTaskForm` carrega com `'use client'`.

---

## 7. Verificação End-to-End

```bash
# 1. Backend
cd sdd-backend && npm run dev
# Espera: "MongoDB connected" + "Server running on port 3333"

# 2. Happy path
curl -s -X POST http://localhost:3333/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Minha tarefa","description":"Desc","status":"todo","priority":"high","dueDate":"2025-12-31","tags":[]}'
# Espera: 201 { "message": "Tarefa criada com sucesso" }

# 3. Campo obrigatório ausente
curl -s -X POST http://localhost:3333/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"description":"Desc","status":"todo","priority":"high","dueDate":"2025-12-31"}'
# Espera: 400 { "message": "O campo title é obrigatório" }

# 4. Status inválido
curl -s -X POST http://localhost:3333/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"T","description":"D","status":"invalid","priority":"high","dueDate":"2025-12-31","tags":[]}'
# Espera: 400 { "message": "Status inválido" }

# 5. Priority inválida
curl -s -X POST http://localhost:3333/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"T","description":"D","status":"todo","priority":"urgent","dueDate":"2025-12-31","tags":[]}'
# Espera: 400 { "message": "Prioridade inválida" }

# 6. Tag inexistente
curl -s -X POST http://localhost:3333/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"T","description":"D","status":"todo","priority":"low","dueDate":"2025-12-31","tags":["000000000000000000000000"]}'
# Espera: 400 { "message": "Tag não encontrada" }

# 7. Sem token
curl -s -X POST http://localhost:3333/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"T","description":"D","status":"todo","priority":"low","dueDate":"2025-12-31"}'
# Espera: 401 (padrão RF3)

# 8. TypeScript
cd sdd-backend && npx tsc --noEmit
cd sdd-frontend && npx tsc --noEmit
```

---

## 8. Ordem de Implementação

1. `src/config/taskEnums.ts`
2. `src/infra/mongo/schemas/task.schema.ts`
3. `src/modules/task/dto/create-task.dto.ts`
4. `src/modules/task/port/task-repository.port.ts`
5. `src/modules/task/port/task-service.port.ts`
6. `src/modules/task/infra/repository/task.repository.ts`
7. `src/modules/task/services/task.service.ts` (inclui `TagNotFoundError`)
8. `src/modules/task/infra/controllers/task.controller.ts`
9. `src/modules/task/factories/task.factory.ts`
10. `src/routes/task.routes.ts`
11. Atualizar `src/server.ts`
12. Testes curl (happy path, campos ausentes, status/priority inválidos, tag inválida, sem token)
13. `npx tsc --noEmit` no backend
14. `types/index.ts` — adicionar interface `Tag`
15. `components/CreateTaskForm.tsx`
16. Atualizar `app/home/page.tsx`
17. `npx tsc --noEmit` no frontend
18. Verificação visual no browser

---

## Arquivos Críticos

- `sdd-backend/src/config/taskEnums.ts`
- `sdd-backend/src/infra/mongo/schemas/task.schema.ts`
- `sdd-backend/src/modules/task/services/task.service.ts`
- `sdd-backend/src/modules/task/infra/controllers/task.controller.ts`
- `sdd-backend/src/modules/task/factories/task.factory.ts`
- `sdd-frontend/components/CreateTaskForm.tsx`
