# Plano de Implementação: RF8, RF9 e RF10 — Gestão e Visualização de Tarefas

Este plano descreve a estratégia técnica para implementar a edição, exclusão e visualização de tarefas em formato Kanban.

## 1. Stack Tecnológica
- **Backend:** Node.js, Express 5, TypeScript, MongoDB (Mongoose).
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Axios.

## 2. Modelo de Dados (Task)
O schema do Mongoose e a interface TypeScript devem garantir:
- `owner`: Referência ao `User` para controle de acesso.
- `status`: Enum `['todo', 'in_progress', 'done']`.
- `priority`: Enum `['low', 'medium', 'high']`.
- `updatedAt`: Gerenciado automaticamente pelo Mongoose (`timestamps: true`).

## 3. Estrutura de Endpoints (Backend)

### GET `/tasks`
- **Objetivo:** Listar todas as tarefas do usuário autenticado.
- **Middleware:** `authenticate`.
- **Fluxo:** `Controller -> Service -> Repository (find by owner)`.

### PATCH `/tasks/:taskId`
- **Objetivo:** Atualizar campos de uma tarefa.
- **Middleware:** `authenticate`.
- **Corpo da Requisição:** `Partial<UpdateTaskDTO>`.
- **Tratamento de Erros:** 
    - 400 se a tarefa não existir ou não pertencer ao usuário.
    - Validação de Tags: Se enviadas, verificar se pertencem ao usuário.

### DELETE `/tasks/:taskId`
- **Objetivo:** Remover uma tarefa.
- **Middleware:** `authenticate`.
- **Tratamento de Erros:**
    - 400 se a tarefa não existir ou não pertencer ao usuário.

## 4. Implementação Frontend

### Componentes Necessários
1. **`TaskBoard`:** Componente principal na página Home.
    - Faz o fetch inicial de `GET /tasks`.
    - Filtra as tarefas para as colunas.
2. **`TaskColumn`:** Recebe uma lista de tarefas e um título (`Todo`, `In Progress`, `Done`).
    - Realiza a ordenação: 
        1. Prioridade (`high` > `medium` > `low`).
        2. Data de Vencimento (`dueDate`) ascendente.
3. **`TaskCard`:** Exibe as informações da tarefa.
    - Botões de ação: Editar (abre modal) e Excluir (abre confirmação).
4. **`TaskModal`:** Versão aprimorada do formulário de criação para suportar edição.
5. **`ConfirmDeleteModal`:** Modal de confirmação simples para a RF9.

### Lógica de Ordenação (Frontend)
```typescript
const priorityMap = { high: 3, medium: 2, low: 1 };
const sortedTasks = tasks.sort((a, b) => {
  if (priorityMap[b.priority] !== priorityMap[a.priority]) {
    return priorityMap[b.priority] - priorityMap[a.priority];
  }
  return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
});
```

## 5. Tratamento de Erros e UX
- **Backend:** Retornar mensagens claras ("Tarefa não encontrada", "Usuário não autenticado").
- **Frontend:**
    - Loading states durante o fetch das tarefas.
    - Toasts de sucesso ao editar/excluir.
    - Erro amigável se a API falhar.

## 6. Próximos Passos (Ordem de Execução)
1. **Backend:** Implementar Repositório -> Service -> Controller -> Rotas.
2. **Backend:** Testes unitários para garantir regras de propriedade (owner).
3. **Frontend:** Criar componentes de visualização (`TaskBoard`, `TaskColumn`, `TaskCard`).
4. **Frontend:** Integrar edição (modal) e exclusão (confirmação).
