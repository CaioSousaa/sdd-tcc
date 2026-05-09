# Especificação Técnica: RF8, RF9 e RF10 — Gestão e Visualização de Tarefas

Esta especificação detalha o comportamento esperado para a edição, exclusão e visualização de tarefas no sistema SDD.

## 1. RF8 — Edição de Tarefas
Permite que o usuário atualize as informações de uma tarefa existente.

### Comportamento do Backend
- **Endpoint:** `PATCH /tasks/:taskId`
- **Campos Editáveis:** `title`, `description`, `status`, `priority`, `dueDate`, `tags`, `alert`.
- **Regras de Negócio:**
    - Apenas usuários autenticados podem acessar.
    - O usuário só pode editar tarefas que ele mesmo criou (`owner == userId`).
    - O sistema deve validar se a tarefa existe antes da edição.
    - O campo `updatedAt` deve ser atualizado automaticamente.
- **Respostas Esperadas:**
    - **200 OK:** Tarefa atualizada + mensagem "Tarefa editada com sucesso".
    - **400 Bad Request:** Se `taskId` for inválido, inexistente ou não pertencer ao usuário (Mensagem: "Tarefa não encontrada").
    - **401 Unauthorized:** Token ausente ou inválido.

## 2. RF9 — Exclusão de Tarefas
Permite que o usuário remova permanentemente uma tarefa.

### Comportamento do Backend
- **Endpoint:** `DELETE /tasks/:taskId`
- **Regras de Negócio:**
    - Apenas usuários autenticados.
    - O usuário só pode excluir tarefas de sua propriedade.
    - O sistema deve validar a existência da tarefa.
- **Respostas Esperadas:**
    - **200 OK:** Mensagem "Tarefa deletada com sucesso".
    - **400 Bad Request:** Se `taskId` for inválido ou não pertencer ao usuário (Mensagem: "Tarefa não encontrada").
    - **401 Unauthorized:** Autenticação inválida.

### Comportamento do Frontend
- Antes de disparar a requisição DELETE, o sistema deve exibir um **modal de confirmação** perguntando se o usuário tem certeza que deseja excluir a tarefa.

## 3. RF10 — Visualização de Tarefas (Quadro Kanban)
Exibição organizada das tarefas do usuário.

### Comportamento do Frontend
- **Layout:** Quadro dividido em três colunas:
    1. **Todo**
    2. **In Progress**
    3. **Done**
- **Distribuição:** Cada tarefa deve ser renderizada na coluna correspondente ao seu `status`.
- **Ordenação:** Dentro de cada coluna, as tarefas devem seguir a hierarquia:
    1. **Prioridade:** High > Medium > Low.
    2. **Data de Vencimento (`dueDate`):** Ordem ascendente (mais próximas primeiro).
- **Atualização Automática:** Quando uma tarefa for editada e seu status alterado, a interface deve refletir a mudança imediatamente, movendo o card para a coluna correta.
- **Segurança:** Garantir que apenas tarefas do usuário logado sejam solicitadas e exibidas.

---

## História de Usuário

**Título:** Gerenciamento Dinâmico de Tarefas
**Como** um usuário autenticado no sistema SDD,
**Quero** visualizar minhas tarefas organizadas por status e ter a possibilidade de editá-las ou excluí-las,
**Para que** eu possa manter meu planejamento atualizado e focado nas prioridades.

### Critérios de Aceite

1. **Visualização:** Ao acessar a home, devo ver três colunas (Todo, In Progress, Done) contendo apenas as minhas tarefas.
2. **Ordenação:** As tarefas com prioridade "High" devem aparecer no topo da lista, seguidas por "Medium" e "Low". Se duas tarefas tiverem a mesma prioridade, a que vence antes aparece primeiro.
3. **Edição:** Ao clicar em editar, um formulário deve abrir com os dados atuais. Ao salvar, os dados devem ser atualizados no banco e a posição da tarefa no quadro deve ser recalculada se houver mudança de status ou prioridade.
4. **Exclusão:** Ao clicar em excluir, devo ver um aviso de confirmação. Se eu confirmar, a tarefa deve desaparecer do quadro e ser removida do banco de dados.
5. **Segurança:** Se eu tentar acessar a URL de edição ou exclusão de uma tarefa que não me pertence via API, devo receber um erro 400 "Tarefa não encontrada".
