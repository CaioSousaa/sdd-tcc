# Plano de Implementação — RF5 e RF6

Este plano detalha a implementação técnica para a visualização, edição e exclusão de tags no backend.

## Stack Tecnológica
- **Linguagem:** TypeScript
- **Framework:** Express.js
- **Banco de Dados:** MongoDB (via Mongoose)
- **Arquitetura:** Ports & Adapters (Hexagonal simplificada), seguindo o padrão atual do projeto.

## Modelo de Dados
Utilizaremos a `TagModel` já existente (`src/infra/mongo/schemas/tag.schema.ts`).
As tags possuem:
- `name`: string (obrigatório)
- `color`: string hex (obrigatório, validado contra catálogo)
- `owner`: ObjectId (referência a User, obrigatório)

## Estrutura de Endpoints e Fluxo

### 1. Visualização (GET `/tags`)
- **Controller:** `TagController.list`
- **Service:** `TagService.listTags(ownerId)`
- **Repository:** `TagRepository.findAllByOwner(ownerId)`
- **Retorno:** Status 200 com array de tags (id, name, color).

### 2. Edição (PATCH `/tags/:tagId`)
- **Controller:** `TagController.update`
- **Service:** `TagService.updateTag(tagId, ownerId, data)`
- **Repository:** `TagRepository.findById(tagId)` e `TagRepository.update(tagId, data)`
- **Lógica:**
    1. Buscar tag. Se não existir ou `owner` for diferente, erro "Tag não encontrada" (400).
    2. Se `color` for alterada, validar se pertence ao catálogo.
    3. Se `color` for alterada, validar se outra tag do mesmo usuário já usa essa cor.
    4. Atualizar e retornar sucesso.

### 3. Exclusão (DELETE `/tags/:tagId`)
- **Controller:** `TagController.delete`
- **Service:** `TagService.deleteTag(tagId, ownerId)`
- **Repository:** `TagRepository.findById(tagId)` e `TagRepository.delete(tagId)`
- **Lógica:**
    1. Buscar tag. Se não existir ou `owner` for diferente, erro "Tag não encontrada" (400).
    2. Deletar a tag.

## Tratamento de Erros

| Erro | Status | Mensagem |
|---|---|---|
| `TagNotFoundError` | 400 | "Tag não encontrada" |
| `InvalidTagColorError` | 400 | "cor inválida" |
| `ColorAlreadyInUseError` | 400 | "esta cor já está em uso" |
| Falha Auth | 401 | (Mensagem padrão do middleware) |

## Passos de Implementação

1. **Ports:**
    - Atualizar `TagRepositoryPort` com `findAllByOwner`, `findById`, `update` e `delete`.
    - Atualizar `TagServicePort` com `listTags`, `updateTag` e `deleteTag`.

2. **Repository (`TagRepository`):**
    - Implementar os métodos utilizando o `TagModel`.
    - Garantir que o retorno do `findAllByOwner` inclua o `id`.

3. **Service (`TagService`):**
    - Implementar a lógica de negócio e validação de propriedade.
    - Adicionar `TagNotFoundError` às exceções.

4. **Controller (`TagController`):**
    - Implementar métodos `list`, `update` e `delete`.
    - Capturar erros específicos e retornar status/mensagens corretos.

5. **Rotas:**
    - Registrar os novos métodos no `src/routes/tag.routes.ts`, todos protegidos pelo middleware `authenticate`.
