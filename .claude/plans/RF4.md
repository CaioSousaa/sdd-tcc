# Plano Técnico — RF4: Criação de Tag

## Stack

- **Backend**: Express 5 + TypeScript + Mongoose (padrão do projeto)
- **Autenticação**: Middleware `authenticate` já existente em `src/shared/http/authenticate.ts`
- **Arquitetura**: Clean Architecture com Factory Pattern (idêntico aos módulos `user` e `auth`)

---

## Modelo de Dados

### Schema Mongoose — `src/infra/mongo/schemas/tag.schema.ts`

```typescript
interface ITag {
  name: string;
  color: string;           // hex do catálogo (ex: "#F59E0B")
  owner: mongoose.Types.ObjectId;  // referência ao User
  createdAt: Date;
}
```

Configuração do schema:
- `name`: `String`, required
- `color`: `String`, required
- `owner`: `ObjectId`, ref `'User'`, required
- `timestamps: { createdAt: true, updatedAt: false }`

### Catálogo de Cores — `src/config/tagColors.ts`

```typescript
export const TAG_COLORS = [
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#22C55E", // Green
  "#3B82F6", // Blue
  "#A855F7", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
] as const;

export type TagColor = typeof TAG_COLORS[number];
```

---

## Estrutura de Arquivos

```
src/
├── config/
│   ├── jwt.ts                          (já existe)
│   └── tagColors.ts                    (NOVO)
├── infra/mongo/schemas/
│   ├── user.schema.ts                  (já existe)
│   └── tag.schema.ts                   (NOVO)
├── modules/
│   └── tag/
│       ├── dto/
│       │   └── create-tag.dto.ts       (NOVO)
│       ├── port/
│       │   ├── tag-service.port.ts     (NOVO)
│       │   └── tag-repository.port.ts  (NOVO)
│       ├── services/
│       │   └── tag.service.ts          (NOVO)
│       ├── infra/
│       │   ├── repository/
│       │   │   └── tag.repository.ts   (NOVO)
│       │   └── controllers/
│       │       └── tag.controller.ts   (NOVO)
│       └── factories/
│           └── tag.factory.ts          (NOVO)
└── routes/
    ├── user.routes.ts                  (já existe)
    ├── auth.routes.ts                  (já existe)
    └── tag.routes.ts                   (NOVO)
```

`server.ts` recebe uma linha extra para registrar `/tags`.

---

## Contrato do Endpoint

**`POST /tags`** — protegida pelo middleware `authenticate`

### Fluxo de execução

```
Request
  → authenticate middleware (valida JWT, injeta req.userId)
  → TagController.create()
      → valida presença de name
      → valida presença de color
      → chama TagService.createTag({ name, color, owner: req.userId })
          → valida se color está no catálogo TAG_COLORS
          → busca tags existentes do usuário (findByOwner)
          → valida se color já está em uso
          → TagRepository.create({ name, color, owner })
  → Response
```

### Respostas por cenário

| Cenário | Quem detecta | Status | Body |
|---|---|---|---|
| Sucesso | Repository | `201` | `{ "message": "tag criada com sucesso" }` |
| `name` ausente | Controller | `400` | `{ "message": "o name é obrigatório" }` |
| `color` ausente | Controller | `400` | `{ "message": "o color é obrigatório" }` |
| Cor fora do catálogo | Service | `400` | `{ "message": "cor inválida" }` |
| Cor já em uso | Service | `400` | `{ "message": "esta cor já está em uso" }` |
| Token ausente/inválido/expirado | Middleware | `401` | *(mensagens de RF3)* |

---

## Tratamento de Erros

Seguindo o padrão de `DuplicateEmailError` e `InvalidCredentialsError` do projeto:

### `src/modules/tag/` — erros internos do módulo

```typescript
// Definidos dentro de tag.service.ts (mesmo padrão de user.service.ts)

export class InvalidTagColorError extends Error {
  constructor() {
    super('cor inválida');
    this.name = 'InvalidTagColorError';
  }
}

export class ColorAlreadyInUseError extends Error {
  constructor() {
    super('esta cor já está em uso');
    this.name = 'ColorAlreadyInUseError';
  }
}
```

### Controller — mapeamento de erros para HTTP

```typescript
try {
  await this.tagService.createTag({ name, color, owner: req.userId! });
  res.status(201).json({ message: 'tag criada com sucesso' });
} catch (error) {
  if (error instanceof InvalidTagColorError) {
    res.status(400).json({ message: error.message });
  } else if (error instanceof ColorAlreadyInUseError) {
    res.status(400).json({ message: error.message });
  } else {
    res.status(500).json({ message: 'erro interno do servidor' });
  }
}
```

---

## Detalhamento por Camada

### DTO — `create-tag.dto.ts`

```typescript
export interface CreateTagDTO {
  name: string;
  color: string;
  owner: string;
}
```

### Port do Repositório — `tag-repository.port.ts`

```typescript
export interface TagRepositoryPort {
  create(data: CreateTagDTO): Promise<void>;
  findByOwner(owner: string): Promise<{ color: string }[]>;
}
```

`findByOwner` retorna apenas `{ color }` — é a única informação necessária para checar disponibilidade de cor.

### Port do Service — `tag-service.port.ts`

```typescript
export interface TagServicePort {
  createTag(data: CreateTagDTO): Promise<void>;
}
```

### Service — `tag.service.ts`

Recebe `TagRepositoryPort` via construtor.

```typescript
async createTag(data: CreateTagDTO): Promise<void> {
  if (!TAG_COLORS.includes(data.color as TagColor)) {
    throw new InvalidTagColorError();
  }
  const existing = await this.tagRepository.findByOwner(data.owner);
  const usedColors = existing.map(t => t.color);
  if (usedColors.includes(data.color)) {
    throw new ColorAlreadyInUseError();
  }
  await this.tagRepository.create(data);
}
```

### Repository — `tag.repository.ts`

Implementa `TagRepositoryPort` usando o Mongoose schema `TagModel`.

```typescript
async create(data: CreateTagDTO): Promise<void> {
  await TagModel.create(data);
}

async findByOwner(owner: string): Promise<{ color: string }[]> {
  return TagModel.find({ owner }).select('color').lean();
}
```

### Controller — `tag.controller.ts`

Recebe `TagServicePort` via construtor. Valida campos obrigatórios antes de chamar o service.

```typescript
async create(req: Request, res: Response): Promise<void> {
  const { name, color } = req.body;
  if (!name) { res.status(400).json({ message: 'o name é obrigatório' }); return; }
  if (!color) { res.status(400).json({ message: 'o color é obrigatório' }); return; }
  // ... try/catch com mapeamento de erros
}
```

### Factory — `tag.factory.ts`

```typescript
export function makeTagController(): TagController {
  const repository = new TagRepository();
  const service = new TagService(repository);
  return new TagController(service);
}
```

### Rota — `tag.routes.ts`

```typescript
router.post('/', authenticate, (req, res) => makeTagController().create(req, res));
```

### Registro em `server.ts`

```typescript
app.use('/tags', tagRoutes);
```

---

## Ordem de Implementação

1. `src/config/tagColors.ts`
2. `src/infra/mongo/schemas/tag.schema.ts`
3. `src/modules/tag/dto/create-tag.dto.ts`
4. `src/modules/tag/port/tag-repository.port.ts`
5. `src/modules/tag/port/tag-service.port.ts`
6. `src/modules/tag/infra/repository/tag.repository.ts`
7. `src/modules/tag/services/tag.service.ts` (com as classes de erro)
8. `src/modules/tag/infra/controllers/tag.controller.ts`
9. `src/modules/tag/factories/tag.factory.ts`
10. `src/routes/tag.routes.ts`
11. `server.ts` — registrar `/tags`
