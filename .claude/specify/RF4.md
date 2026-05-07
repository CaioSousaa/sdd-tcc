# RF4 — Criação de Tag

## História de Usuário

**Como** um usuário autenticado,  
**Quero** criar tags com nome e cor,  
**Para** categorizar minhas tarefas de forma visual e organizada.

---

## Contrato da API

**Endpoint:** `POST /tags`  
**Autenticação:** obrigatória — header `Authorization: Bearer <token>`

### Corpo da requisição
```json
{
  "name": "string",
  "color": "string"
}
```

### Respostas

| Cenário | Status | Corpo |
|---|---|---|
| Tag criada com sucesso | `201` | `{ "message": "tag criada com sucesso" }` |
| Campo `name` ausente | `400` | `{ "message": "o name é obrigatório" }` |
| Campo `color` ausente | `400` | `{ "message": "o color é obrigatório" }` |
| Cor inválida (fora do catálogo) | `400` | `{ "message": "cor inválida" }` |
| Cor já utilizada pelo usuário | `400` | `{ "message": "esta cor já está em uso" }` |
| Token ausente ou inválido | `401` | *(conforme RF3)* |

---

## Catálogo de Cores

As 7 cores disponíveis são fixas no sistema e identificadas por seus valores hex:

| Nome | Hex |
|---|---|
| Amber | `#F59E0B` |
| Red | `#EF4444` |
| Green | `#22C55E` |
| Blue | `#3B82F6` |
| Purple | `#A855F7` |
| Pink | `#EC4899` |
| Cyan | `#06B6D4` |

O campo `color` na requisição deve ser um desses valores hex exatamente. O backend valida se o valor pertence ao catálogo.

---

## Critérios de Aceite

1. Dado uma requisição autenticada com `name` e `color` válidos e cor ainda não utilizada pelo usuário, o sistema deve retornar `201` com `"tag criada com sucesso"`.
2. Dado uma requisição sem o campo `name`, o sistema deve retornar `400` com `"o name é obrigatório"`.
3. Dado uma requisição sem o campo `color`, o sistema deve retornar `400` com `"o color é obrigatório"`.
4. Dado uma requisição com um valor de `color` fora do catálogo de 7 cores, o sistema deve retornar `400` com `"cor inválida"`.
5. Dado uma requisição com uma cor já associada a outra tag do mesmo usuário, o sistema deve retornar `400` com `"esta cor já está em uso"`.
6. A tag criada deve ter `owner` preenchido com o `userId` extraído do token — nunca com valor do corpo da requisição.
7. O frontend deve exibir apenas as cores ainda não utilizadas pelo usuário no seletor de cores do formulário de criação.

---

## Regras de Negócio

- **RN1:** O usuário precisa estar autenticado (token JWT válido via middleware de RF3).
- **RN2:** O sistema disponibiliza exatamente 7 cores pré-definidas (catálogo fixo no backend).
- **RN3:** Uma cor escolhida pelo usuário fica indisponível para novas tags do mesmo usuário — o limite máximo de tags é, portanto, 7 por usuário.
- **RN4:** A validação de campos obrigatórios (`name`, `color`) ocorre antes da validação de regras de negócio (cor inválida, cor em uso).

---

## Decisões Técnicas

- O catálogo de 7 cores é definido como constante no backend (ex: `src/config/tagColors.ts`) e reutilizado tanto na validação do controller quanto em futuras listagens (RF6).
- A verificação de cor em uso é feita no service: busca tags existentes do usuário (`owner = userId`) e compara com a cor solicitada.
- O campo `owner` da tag é sempre preenchido pelo service a partir do `req.userId` injetado pelo middleware; o corpo da requisição não expõe esse campo.
- No frontend, o formulário de criação de tag deve consultar as tags existentes do usuário (via RF6) para calcular quais cores já estão em uso e desabilitar essas opções no seletor.
