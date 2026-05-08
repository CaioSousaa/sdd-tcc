# RF7 — Todo de Implementação

## Backend

- [x] **T1** Criar `src/config/taskEnums.ts`
  - Exportar array `TASK_STATUSES` como `const` com valores: `'todo'`, `'in_progress'`, `'done'`
  - Exportar tipo `TaskStatus = typeof TASK_STATUSES[number]`
  - Exportar array `TASK_PRIORITIES` como `const` com valores: `'low'`, `'medium'`, `'high'`
  - Exportar tipo `TaskPriority = typeof TASK_PRIORITIES[number]`

- [x] **T2** Criar `src/infra/mongo/schemas/task.schema.ts`
  - Interface `ITask` com campos: `title: string`, `description: string`, `status: 'todo' | 'in_progress' | 'done'`, `priority: 'low' | 'medium' | 'high'`, `dueDate: Date`, `owner: Types.ObjectId`, `tags: Types.ObjectId[]`, `alert?: string`, `createdAt: Date`, `updatedAt: Date`
  - Schema com: `title` required, `description` required, `status` enum + required, `priority` enum + required, `dueDate` Date required, `owner` ObjectId ref `'User'` required, `tags` array de ObjectId ref `'Tag'` (padrão `[]`), `alert` String opcional
  - Opções: `{ timestamps: true }` — gera `createdAt` e `updatedAt`
  - Exportar `TaskModel = model<ITask>('Task', taskSchema)`

- [x] **T3** Criar `src/modules/task/dto/create-task.dto.ts`
  - Interface `CreateTaskDTO` com campos: `title: string`, `description: string`, `status: string`, `priority: string`, `dueDate: string`, `tags: string[]`, `alert?: string`

- [x] **T4** Criar `src/modules/task/port/task-repository.port.ts`
  - Interface `TaskRepositoryPort` com:
    - `create(data: CreateTaskDTO & { owner: string }): Promise<void>`

- [x] **T5** Criar `src/modules/task/port/task-service.port.ts`
  - Interface `TaskServicePort` com:
    - `createTask(data: CreateTaskDTO, userId: string): Promise<void>`

- [x] **T6** Criar `src/modules/task/infra/repository/task.repository.ts`
  - Implementar `TaskRepositoryPort`
  - `create`: chamar `TaskModel.create(data)` com o objeto completo (incluindo `owner`)

- [x] **T7** Criar `src/modules/task/services/task.service.ts`
  - Exportar classe de erro no topo do arquivo:
    - `TagNotFoundError` com mensagem `'Tag não encontrada'`
  - Classe `TaskService` implementando `TaskServicePort`; recebe `TaskRepositoryPort` e `TagRepositoryPort` no construtor (nessa ordem)
  - `createTask`: iterar sobre `data.tags`; para cada `tagId`, chamar `tagRepository.findById(tagId)`
  - Se o resultado for `null` ou `tag.owner !== userId`, lançar `TagNotFoundError`
  - Após validar todas as tags, chamar `taskRepository.create({ ...data, owner: userId })`

- [x] **T8** Criar `src/modules/task/infra/controllers/task.controller.ts`
  - Classe `TaskController`; recebe `TaskServicePort` no construtor
  - Método `create(req, res)`: extrair `title`, `description`, `status`, `priority`, `dueDate`, `tags`, `alert` de `req.body`
  - Importar `TASK_STATUSES` e `TASK_PRIORITIES` de `src/config/taskEnums`
  - Importar `TagNotFoundError` de `../services/task.service`
  - **Etapa 1 — campos obrigatórios**: iterar `['title', 'description', 'status', 'priority', 'dueDate']`; se `!req.body[field]` → `400 { message: "O campo {field} é obrigatório" }` com `return`
  - **Etapa 2 — enum status**: se `!TASK_STATUSES.includes(status)` → `400 { message: 'Status inválido' }` com `return`
  - **Etapa 3 — enum priority**: se `!TASK_PRIORITIES.includes(priority)` → `400 { message: 'Prioridade inválida' }` com `return`
  - **Etapa 4 — try/catch**: chamar `this.taskService.createTask({ title, description, status, priority, dueDate, tags: tags ?? [], alert }, req.userId!)`
  - Sucesso → `201 { message: 'Tarefa criada com sucesso' }`
  - Catch `TagNotFoundError` → `400 { message: error.message }`
  - Catch genérico → `500 { message: 'erro interno do servidor' }`

- [x] **T9** Criar `src/modules/task/factories/task.factory.ts`
  - Importar `TagRepository` de `../../tag/infra/repository/tag.repository`
  - Importar `TaskRepository`, `TaskService`, `TaskController` dos respectivos módulos
  - Função `makeTaskController()`: instanciar `TaskRepository`, `TagRepository`, `TaskService(taskRepository, tagRepository)`, `TaskController(service)` e retornar o controller

- [x] **T10** Criar `src/routes/task.routes.ts`
  - Importar `Router` do Express, `authenticate` de `../shared/http/authenticate`, `makeTaskController` da factory
  - Registrar `router.post('/', authenticate, (req, res) => makeTaskController().create(req, res))`
  - Exportar o router como `default`

- [x] **T11** Atualizar `src/server.ts`
  - Importar `taskRouter` de `'./routes/task.routes'`
  - Adicionar `app.use('/tasks', taskRouter)` junto aos demais registros de rota

---

## Frontend

- [x] **T12** Atualizar `types/index.ts`
  - Adicionar interface `Tag` com campos: `id: string`, `name: string`, `color: string`

- [x] **T13** Criar `components/CreateTaskForm.tsx`
  - Diretiva `'use client'` no topo
  - Props: `onSuccess?: () => void`
  - Estado: `title`, `description`, `status` (default `'todo'`), `priority` (default `'low'`), `dueDate`, `selectedTags: string[]`, `alert`, `error`, `isLoading`, `availableTags: Tag[]`
  - Na montagem (`useEffect`), buscar `GET /tags` via `api.get('/tags')` e popular `availableTags`; em caso de erro, deixar a lista vazia silenciosamente
  - Toggle de tag: se o ID já está em `selectedTags`, remover; caso contrário, adicionar
  - `handleSubmit`: chamar `api.post('/tasks', { title, description, status, priority, dueDate, tags: selectedTags, alert: alert || undefined })`
  - Sucesso → chamar `onSuccess?.()`
  - Erro Axios → exibir `err.response?.data?.message ?? 'Erro inesperado. Tente novamente.'`
  - Erro genérico → exibir `'Erro inesperado. Tente novamente.'`
  - Campos do formulário:
    - `title`: `<Input>` reutilizável, tipo `text`
    - `description`: `<textarea>` com classes `bg-zinc-800 border border-zinc-700 focus:border-amber-400 rounded-md w-full p-2 text-white`
    - `status`: `<select>` com opções `todo` / `in_progress` / `done` (labels: "A fazer" / "Em andamento" / "Concluído")
    - `priority`: `<select>` com opções `low` / `medium` / `high` (labels: "Baixa" / "Média" / "Alta")
    - `dueDate`: `<Input>` reutilizável, tipo `date`
    - `tags`: botões visuais para cada tag em `availableTags`; tag selecionada recebe `ring-2` com a cor da tag via `style={{ ringColor: tag.color }}`
    - `alert`: `<Input>` reutilizável, tipo `text`, placeholder `"Opcional"`
  - Mensagem de erro: `<p role="alert" className="text-red-400 text-sm">`
  - Botão submit: `<Button isLoading={isLoading}>Criar tarefa</Button>`
  - Estilo do card: `bg-zinc-950 border border-zinc-800 rounded-xl p-6`
  - Selects: classes `bg-zinc-800 border border-zinc-700 focus:border-amber-400 rounded-md w-full p-2 text-white`

- [x] **T14** Atualizar `app/home/page.tsx`
  - Importar `CreateTaskForm` de `'@/components/CreateTaskForm'`
  - Substituir o parágrafo `"Em construção."` por `<CreateTaskForm />` dentro do `<AuthGuard>`
  - Manter a `page.tsx` como Server Component (sem `'use client'`)
