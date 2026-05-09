# Lista de Tarefas (TODO): RF11 – Filtragem de Tarefas

Com base no plano de implementação da RF11, esta lista quebra as ações em subtarefas atômicas, testáveis e factíveis de correção individual (commit a commit).

## Fase 1: Ajustes em Repositórios (Infra)

- [x] **1.1. Interface TagRepository:** Adicionar assinatura do método na interface `ITagRepository` para buscar múltiplas tags do usuário (ex: `findTagsByIdsAndOwner(tagIds: string[], userId: string): Promise<Tag[]>`).
- [x] **1.2. Implementação TagRepository:** Implementar a lógica no `TagRepository` (Mongoose), utilizando um `find` que combine `{ _id: { $in: tagIds }, owner: userId }`.
- [x] **1.3. Interface TaskRepository:** Atualizar a assinatura do método de busca no `ITaskRepository` para permitir o recebimento do DTO de filtro (ex: `{ priority?: string; tags?: string[] }`).
- [x] **1.4. Implementação TaskRepository:** Refatorar o `TaskRepository` para montar o objeto de consulta condicional: aplicar o filtro de `priority` se preenchido e o filtro de `tags` com o operador `{ $all: tags }` (pois a especificação cita que se o usuário passar múltiplas tags, as tarefas devem possuir *as tags filtradas*, ou de acordo com a regra de negócios combinada). *Nota: O plano anterior mencionou `$in`, mas o ideal para combinar ambas é respeitar a regra combinada do Service.*

## Fase 2: Regras de Negócio (Service/UseCase)

- [x] **2.1. Injeção de Dependência:** Atualizar o construtor do Service que lista tarefas (ex: `ListUserTasksService`) para receber também a interface `ITagRepository`.
- [x] **2.2. Validação da Prioridade:** Adicionar bloco *fail-fast* no Service: se `priority` for informada e não bater com `"low"`, `"medium"` ou `"high"`, disparar erro HTTP 400 (`"Prioridade inválida"`).
- [x] **2.3. Validação das Tags (Existência e Posse):** Adicionar bloco *fail-fast*: se `tags` for informado, usar o repositório de tag. Se a contagem de tags retornadas pelo repositório divergir do tamanho do array filtrado, disparar erro HTTP 400 (`"Tag não encontrada"`).
- [x] **2.4. Integração do Fluxo:** Modificar a chamada interna para que o Service passe os parâmetros validados ao método do `TaskRepository`.
- [x] **2.5. Testes Unitários do Service:** Adicionar suites de testes testando:
  - Disparo de exceção de "Prioridade inválida".
  - Disparo de exceção de "Tag não encontrada".
  - Sucesso chamando o mock do repositório.

## Fase 3: Roteamento e Controle (Controller)

- [x] **3.1. Parsing de Query no Controller:** No `TaskController`, extrair `req.query.priority` (como string) e `req.query.tags` (lidando com cenários onde ele possa vir como string única ou um array de strings).
- [x] **3.2. Repasse para o Service:** Integrar a chamada para o Use Case com o DTO formatado e retornar a resposta do Service com status code `200`.

## Fase 4: Configuração (Factories)

- [x] **4.1. Atualizar Injeção na Factory:** Atualizar a `makeListUserTasksService` ou classe centralizadora de rotas para injetar a instância correta de `TagRepository` no construtor do `ListUserTasksService`.

## Fase 5: Homologação / Teste Integrado E2E

- [x] **5.1.** Testar rota localmente enviando nenhum filtro para validar a listagem padrão (status 200).
- [x] **5.2.** Testar filtro por `priority` ("high") e validar isolamento.
- [x] **5.3.** Testar com uma `tag` do dono, esperar status 200.
- [x] **5.4.** Testar com uma `tag` aleatória (ou de outro owner) validando o disparo do erro 400.
- [x] **5.5.** Testar prioridade quebrada e validar o 400.
