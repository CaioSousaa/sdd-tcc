# RF7 — Criação de Tarefa

## História de Usuário

**Como** um usuário autenticado,  
**Quero** criar tarefas informando título, descrição, status, tags, prioridade e data de vencimento,  
**Para** organizar e acompanhar meu trabalho dentro do sistema.

---

## Contrato da API

**Endpoint:** `POST /tasks`  
**Autenticação:** obrigatória — header `Authorization: Bearer <token>`

### Corpo da requisição
```json
{
  "title": "string",
  "description": "string",
  "status": "todo | in_progress | done",
  "priority": "low | medium | high",
  "dueDate": "ISO 8601 string",
  "tags": ["ObjectId", "..."],
  "alert": "string (opcional)"
}
```

### Respostas

| Cenário | Status | Corpo |
|---|---|---|
| Tarefa criada com sucesso | `201` | `{ "message": "Tarefa criada com sucesso" }` |
| Campo `title` ausente | `400` | `{ "message": "O campo title é obrigatório" }` |
| Campo `description` ausente | `400` | `{ "message": "O campo description é obrigatório" }` |
| Campo `status` ausente | `400` | `{ "message": "O campo status é obrigatório" }` |
| Campo `priority` ausente | `400` | `{ "message": "O campo priority é obrigatório" }` |
| Campo `dueDate` ausente | `400` | `{ "message": "O campo dueDate é obrigatório" }` |
| Valor inválido em `status` | `400` | `{ "message": "Status inválido" }` |
| Valor inválido em `priority` | `400` | `{ "message": "Prioridade inválida" }` |
| Tag inexistente ou de outro usuário | `400` | `{ "message": "Tag não encontrada" }` |
| Token ausente ou inválido | `401` | *(conforme RF3)* |

---

## Valores Permitidos

### `status`
| Valor | Descrição |
|---|---|
| `todo` | Tarefa a fazer |
| `in_progress` | Tarefa em andamento |
| `done` | Tarefa concluída |

### `priority`
| Valor | Descrição |
|---|---|
| `low` | Baixa prioridade |
| `medium` | Média prioridade |
| `high` | Alta prioridade |

---

## Critérios de Aceite

1. Dado uma requisição autenticada com todos os campos obrigatórios válidos, o sistema deve retornar `201` com `"Tarefa criada com sucesso"`.
2. Dado uma requisição sem o campo `title`, o sistema deve retornar `400` com `"O campo title é obrigatório"`.
3. Dado uma requisição sem o campo `description`, o sistema deve retornar `400` com `"O campo description é obrigatório"`.
4. Dado uma requisição sem o campo `status`, o sistema deve retornar `400` com `"O campo status é obrigatório"`.
5. Dado uma requisição sem o campo `priority`, o sistema deve retornar `400` com `"O campo priority é obrigatório"`.
6. Dado uma requisição sem o campo `dueDate`, o sistema deve retornar `400` com `"O campo dueDate é obrigatório"`.
7. Dado uma requisição com `status` fora dos valores permitidos, o sistema deve retornar `400` com `"Status inválido"`.
8. Dado uma requisição com `priority` fora dos valores permitidos, o sistema deve retornar `400` com `"Prioridade inválida"`.
9. Dado uma requisição com um ID em `tags` que não existe ou pertence a outro usuário, o sistema deve retornar `400` com `"Tag não encontrada"`.
10. Dado uma requisição sem token ou com token inválido, o sistema deve retornar `401` conforme o comportamento padrão do middleware de autenticação (RF3).
11. O campo `owner` deve ser preenchido automaticamente com o `userId` extraído do token — nunca a partir do corpo da requisição.
12. Os campos `createdAt` e `updatedAt` devem ser gerados automaticamente pelo sistema.
13. O campo `alert` é opcional; sua ausência não deve impedir a criação da tarefa.
14. A validação de campos obrigatórios ocorre antes da validação de valores permitidos (status/priority) e antes da verificação de tags.

---

## Regras de Negócio

- **RN1:** Apenas usuários autenticados (token JWT válido via middleware de RF3) podem criar tarefas.
- **RN2:** O campo `owner` é sempre preenchido pelo service a partir de `req.userId`; o corpo da requisição não expõe esse campo.
- **RN3:** O sistema valida cada ID em `tags` verificando se existe e se pertence ao usuário autenticado (`owner === userId`). Qualquer ID inválido ou de outro usuário rejeita toda a requisição com `400`.
- **RN4:** `status` só aceita os valores `todo`, `in_progress` e `done`.
- **RN5:** `priority` só aceita os valores `low`, `medium` e `high`.
- **RN6:** O campo `alert` é opcional; se enviado, é armazenado como string sem validação adicional nesta RF.
- **RN7:** `createdAt` e `updatedAt` são gerenciados automaticamente pelo Mongoose (`timestamps: true`).

---

## Decisões Técnicas

- A validação de campos obrigatórios segue a mesma ordem declarada no schema: `title`, `description`, `status`, `priority`, `dueDate`.
- Os valores permitidos de `status` e `priority` são definidos como constantes no backend (ex: `src/config/taskEnums.ts`) e reutilizados na validação do controller.
- A verificação de tags é feita no service: para cada ID recebido, busca no repositório de tags filtrando `{ _id, owner: userId }`. Se qualquer ID não retornar resultado, lança `TagNotFoundError`, que o controller mapeia para `400`.
- O campo `tags` pode ser um array vazio `[]`; nesse caso a verificação é ignorada.
- O campo `owner` nunca é lido do `req.body`; é sempre injetado pelo service a partir do `req.userId` definido pelo middleware de autenticação.
