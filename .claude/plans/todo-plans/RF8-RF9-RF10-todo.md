# TODO: Implementação RF8, RF9 e RF10 — Gestão e Visualização de Tarefas

Lista de tarefas detalhadas para a implementação das funcionalidades de edição, exclusão e visualização (Kanban) de tarefas.

## Fase 1: Backend (Tarefas e Propriedade)

### 1.1 DTOs e Portas
- [x] Criar `UpdateTaskDTO` em `sdd-backend/src/modules/task/dto/update-task.dto.ts`.
- [x] Atualizar `TaskServicePort` em `sdd-backend/src/modules/task/port/task-service.port.ts` adicionando `updateTask`, `deleteTask` e `listTasks`.
- [x] Atualizar `TaskRepositoryPort` em `sdd-backend/src/modules/task/port/task-repository.port.ts` adicionando `update`, `delete`, `findById` e `findAllByOwner`.

### 1.2 Repositório
- [x] Implementar `update(taskId, data)` no `TaskRepository`.
- [x] Implementar `delete(taskId)` no `TaskRepository`.
- [x] Implementar `findAllByOwner(userId)` no `TaskRepository`.
- [x] Implementar `findById(taskId)` no `TaskRepository`.

### 1.3 Service
- [x] Implementar `listTasks(userId)` no `TaskService`.
- [x] Implementar `updateTask(taskId, userId, data)` no `TaskService`.
    - Validar se a tarefa existe e pertence ao usuário.
    - Se houver tags, validar se pertencem ao usuário.
- [x] Implementar `deleteTask(taskId, userId)` no `TaskService`.
    - Validar se a tarefa existe e pertence ao usuário.

### 1.4 Controller e Rotas
- [x] Implementar métodos `list`, `update` e `delete` no `TaskController`.
- [x] Adicionar rotas no `sdd-backend/src/routes/task.routes.ts`:
    - `GET /` -> `list`
    - `PATCH /:taskId` -> `update`
    - `DELETE /:taskId` -> `delete`

## Fase 2: Frontend (Visualização e Gerenciamento)

### 2.1 Componentes de UI (Kanban)
- [x] Criar componente `TaskCard` para exibir resumo da tarefa (Título, Prioridade, Prazo).
- [x] Criar componente `TaskColumn` que recebe as tarefas e as ordena por prioridade e data.
- [x] Criar componente `TaskBoard` que gerencia o estado das tarefas e as distribui nas 3 colunas.

### 2.2 Modais e Ações
- [x] Refatorar `CreateTaskForm` para ser um modal reutilizável (`TaskFormModal`) que aceita dados iniciais para edição.
- [x] Criar `ConfirmDeleteModal` para confirmação de exclusão (RF9).
- [x] Integrar abertura dos modais no `TaskCard`.

### 2.3 Integração e Página Home
- [x] Atualizar `app/home/page.tsx` para renderizar o `TaskBoard`.
- [x] Implementar lógica de atualização da UI após edição ou exclusão (refetch ou atualização de estado local).

