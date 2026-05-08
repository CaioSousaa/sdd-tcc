# RF5 e RF6 — Visualização, Edição e Exclusão de Tags

Este documento especifica o comportamento esperado para os endpoints de gerenciamento de tags existentes.

## Histórias de Usuário

**RF5 - Visualização**
**Como** um usuário autenticado,  
**Quero** visualizar todas as tags que cadastrei,  
**Para** que eu possa gerenciar minhas categorias de tarefas.

**RF6 - Edição e Exclusão**
**Como** um usuário autenticado,  
**Quero** editar ou excluir minhas tags,  
**Para** manter minha organização atualizada conforme minhas necessidades mudam.

---

## Contrato da API

### 1. Visualização de Tags (RF5)
**Endpoint:** `GET /tags`  
**Autenticação:** Obrigatória (Bearer Token)

**Respostas:**
| Cenário | Status | Corpo |
|---|---|---|
| Sucesso (com tags) | `200` | `[{ "id": "string", "name": "string", "color": "string" }]` |
| Sucesso (sem tags) | `200` | `[]` |
| Não autenticado | `401` | *(conforme padrão do sistema)* |

### 2. Edição de Tag (RF6)
**Endpoint:** `PATCH /tags/:tagId`  
**Autenticação:** Obrigatória (Bearer Token)

**Corpo da requisição (opcional):**
```json
{
  "name": "string",
  "color": "string"
}
```

**Respostas:**
| Cenário | Status | Corpo |
|---|---|---|
| Tag editada com sucesso | `200` | `{ "id": "...", "name": "...", "color": "...", "message": "Tag editada com sucesso" }` |
| Tag não encontrada ou de outro usuário | `400` | `{ "message": "Tag não encontrada" }` |
| Cor inválida (fora do catálogo) | `400` | `{ "message": "cor inválida" }` |
| Cor já utilizada em outra tag do usuário | `400` | `{ "message": "esta cor já está em uso" }` |
| Não autenticado | `401` | *(conforme padrão do sistema)* |

### 3. Exclusão de Tag (RF6)
**Endpoint:** `DELETE /tags/:tagId`  
**Autenticação:** Obrigatória (Bearer Token)

**Respostas:**
| Cenário | Status | Corpo |
|---|---|---|
| Tag deletada com sucesso | `200` | `{ "message": "Tag deletada" }` |
| Tag não encontrada ou de outro usuário | `400` | `{ "message": "Tag não encontrada" }` |
| Não autenticado | `401` | *(conforme padrão do sistema)* |

---

## Critérios de Aceite

1. **Listagem:** O sistema deve retornar apenas as tags cujo campo `owner` corresponde ao `userId` do token.
2. **Propriedade:** Qualquer tentativa de visualizar (se houver rota individual), editar ou deletar uma tag que não pertença ao usuário autenticado deve ser tratada como se a tag não existisse (`400 - Tag não encontrada`).
3. **Validação de Cor:** Na edição, se o campo `color` for enviado:
    - Deve pertencer ao catálogo de 7 cores (Amber, Red, Green, Blue, Purple, Pink, Cyan).
    - Não pode ser uma cor já em uso por **outra** tag do mesmo usuário (permitindo manter a cor atual da própria tag).
4. **Persistência:** Após a exclusão, a cor anteriormente ocupada pela tag deve ficar imediatamente disponível para novas tags ou edições de outras tags do mesmo usuário.
5. **Mensagens:** As mensagens de sucesso e erro devem seguir exatamente o texto especificado (ex: "Tag editada com sucesso", "Tag deletada", "Tag não encontrada").

---

## Regras de Negócio

- **RN1:** Apenas usuários autenticados podem interagir com o recurso de tags.
- **RN2:** Um usuário nunca deve ter acesso (leitura ou escrita) às tags de outros usuários.
- **RN3:** A validação de existência da tag deve ocorrer antes de qualquer processamento de edição ou remoção.
- **RN4:** O status `400` deve ser retornado tanto para IDs inexistentes quanto para IDs de tags que pertencem a outros usuários, visando não expor a existência de dados de terceiros.

---

## Decisões Técnicas

- Para a edição, utilizaremos o método HTTP `PATCH` para suportar atualizações parciais (apenas nome ou apenas cor).
- No backend, o service deve verificar a propriedade da tag antes de executar a lógica de negócio.
- O catálogo de cores deve ser centralizado para garantir consistência entre criação (RF4) e edição (RF6).
