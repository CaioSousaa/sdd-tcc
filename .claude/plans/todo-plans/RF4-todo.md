# RF4 — Todo de Implementação

## Backend

- [x] **T1** Criar `src/config/tagColors.ts`
  - Exportar array `TAG_COLORS` como `const` com os 7 valores hex: `#F59E0B`, `#EF4444`, `#22C55E`, `#3B82F6`, `#A855F7`, `#EC4899`, `#06B6D4`
  - Exportar tipo `TagColor = typeof TAG_COLORS[number]`

- [x] **T2** Criar `src/infra/mongo/schemas/tag.schema.ts`
  - Interface `ITag` com campos: `name: string`, `color: string`, `owner: mongoose.Types.ObjectId`, `createdAt: Date`
  - Schema com `name` required, `color` required, `owner` ObjectId ref `'User'` required
  - Opções: `{ timestamps: { createdAt: true, updatedAt: false } }`
  - Exportar `TagModel = mongoose.model<ITag>('Tag', tagSchema)`

- [x] **T3** Criar `src/modules/tag/dto/create-tag.dto.ts`
  - Interface `CreateTagDTO` com campos: `name: string`, `color: string`, `owner: string`

- [x] **T4** Criar `src/modules/tag/port/tag-repository.port.ts`
  - Interface `TagRepositoryPort` com:
    - `create(data: CreateTagDTO): Promise<void>`
    - `findByOwner(owner: string): Promise<{ color: string }[]>`

- [x] **T5** Criar `src/modules/tag/port/tag-service.port.ts`
  - Interface `TagServicePort` com:
    - `createTag(data: CreateTagDTO): Promise<void>`

- [x] **T6** Criar `src/modules/tag/infra/repository/tag.repository.ts`
  - Implementar `TagRepositoryPort`
  - `create`: chamar `TagModel.create(data)`
  - `findByOwner`: `TagModel.find({ owner }).select('color').lean()` — projeção mínima

- [x] **T7** Criar `src/modules/tag/services/tag.service.ts`
  - Exportar classes de erro no topo do arquivo (padrão do projeto):
    - `InvalidTagColorError` com mensagem `'cor inválida'`
    - `ColorAlreadyInUseError` com mensagem `'esta cor já está em uso'`
  - Classe `TagService` implementando `TagServicePort`; recebe `TagRepositoryPort` no construtor
  - `createTag`: validar se `color` está em `TAG_COLORS` (lançar `InvalidTagColorError` se não)
  - `createTag`: chamar `findByOwner`, mapear colors usadas, lançar `ColorAlreadyInUseError` se cor já existe
  - `createTag`: chamar `repository.create(data)` em caso de sucesso

- [x] **T8** Criar `src/modules/tag/infra/controllers/tag.controller.ts`
  - Classe `TagController`; recebe `TagServicePort` no construtor
  - Método `create(req, res)`: extrair `name` e `color` de `req.body`
  - Validar presença de `name` → `400 "o name é obrigatório"` com `return`
  - Validar presença de `color` → `400 "o color é obrigatório"` com `return`
  - Chamar `this.tagService.createTag({ name, color, owner: req.userId! })`
  - Sucesso → `201 { message: 'tag criada com sucesso' }`
  - Catch `InvalidTagColorError` → `400 { message: error.message }`
  - Catch `ColorAlreadyInUseError` → `400 { message: error.message }`
  - Catch genérico → `500 { message: 'erro interno do servidor' }`

- [x] **T9** Criar `src/modules/tag/factories/tag.factory.ts`
  - Função `makeTagController()`: instanciar `TagRepository`, `TagService`, `TagController` e retornar o controller

- [x] **T10** Criar `src/routes/tag.routes.ts`
  - Importar `Router` do Express, `authenticate` de `shared/http/authenticate`, `makeTagController` da factory
  - Registrar `router.post('/', authenticate, (req, res) => makeTagController().create(req, res))`
  - Exportar o router

- [x] **T11** Atualizar `src/server.ts`
  - Importar `tagRoutes` de `./routes/tag.routes`
  - Adicionar `app.use('/tags', tagRoutes)` junto aos demais registros de rota
