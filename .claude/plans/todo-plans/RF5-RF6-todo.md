# RF5 e RF6 — Todo de Implementação

## Backend

- [x] **T1** Atualizar `src/modules/tag/port/tag-repository.port.ts`
  - Adicionar métodos à interface:
    - `findAllByOwner(owner: string): Promise<{ id: string, name: string, color: string }[]>`
    - `findById(id: string): Promise<{ id: string, name: string, color: string, owner: string } | null>`
    - `update(id: string, data: Partial<{ name: string, color: string }>): Promise<void>`
    - `delete(id: string): Promise<void>`

- [x] **T2** Atualizar `src/modules/tag/port/tag-service.port.ts`
  - Adicionar métodos à interface:
    - `listTags(owner: string): Promise<{ id: string, name: string, color: string }[]>`
    - `updateTag(tagId: string, owner: string, data: Partial<{ name: string, color: string }>): Promise<void>`
    - `deleteTag(tagId: string, owner: string): Promise<void>`

- [x] **T3** Atualizar `src/modules/tag/infra/repository/tag.repository.ts`
  - Implementar `findAllByOwner`: Usar `TagModel.find({ owner })`, projetar `_id`, `name`, `color` e mapear `_id` para `id`.
  - Implementar `findById`: Usar `TagModel.findById(id)`, mapear para objeto com `owner` (string) e retornar.
  - Implementar `update`: Usar `TagModel.updateOne({ _id: id }, data)`.
  - Implementar `delete`: Usar `TagModel.deleteOne({ _id: id })`.

- [x] **T4** Atualizar `src/modules/tag/services/tag.service.ts`
  - Exportar `TagNotFoundError` com mensagem `'Tag não encontrada'`.
  - Implementar `listTags`: Apenas retornar `this.tagRepository.findAllByOwner(owner)`.
  - Implementar `updateTag`:
    - Buscar tag existente com `findById`.
    - Se for `null` OU `tag.owner !== owner`, lançar `TagNotFoundError`.
    - Se `data.color` for fornecido e for diferente do atual:
      - Validar contra `TAG_COLORS`.
      - Buscar cores em uso pelo usuário (`findByOwner`) e validar se a nova cor já existe (em outra tag).
    - Chamar `this.tagRepository.update(tagId, data)`.
  - Implementar `deleteTag`:
    - Buscar tag existente com `findById`.
    - Se for `null` OU `tag.owner !== owner`, lançar `TagNotFoundError`.
    - Chamar `this.tagRepository.delete(tagId)`.

- [x] **T5** Atualizar `src/modules/tag/infra/controllers/tag.controller.ts`
  - Implementar `list(req, res)`:
    - Chamar `service.listTags(req.userId!)`.
    - Retornar status 200 com o array de tags.
  - Implementar `update(req, res)`:
    - Extrair `tagId` de `req.params`.
    - Extrair `name` e `color` de `req.body`.
    - Chamar `service.updateTag(tagId, req.userId!, { name, color })`.
    - Retornar status 200 com a mensagem `"Tag editada com sucesso"` e os dados (recomenda-se retornar os dados atualizados).
    - Capturar `TagNotFoundError` -> 400.
    - Capturar `InvalidTagColorError` e `ColorAlreadyInUseError` -> 400.
  - Implementar `delete(req, res)`:
    - Extrair `tagId` de `req.params`.
    - Chamar `service.deleteTag(tagId, req.userId!)`.
    - Retornar status 200 com a mensagem `"Tag deletada"`.
    - Capturar `TagNotFoundError` -> 400.

- [x] **T6** Atualizar `src/routes/tag.routes.ts`
  - Adicionar rota `GET /`: `router.get('/', authenticate, (req, res) => makeTagController().list(req, res))`
  - Adicionar rota `PATCH /:tagId`: `router.patch('/:tagId', authenticate, (req, res) => makeTagController().update(req, res))`
  - Adicionar rota `DELETE /:tagId`: `router.delete('/:tagId', authenticate, (req, res) => makeTagController().delete(req, res))`
