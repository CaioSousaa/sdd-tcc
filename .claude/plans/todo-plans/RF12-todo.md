# RF12 — Todo: Agendamento de Job para Alerta de Tarefa

- [ ] 1. Instalar dependências: `node-schedule` e `@types/node-schedule`
- [ ] 2. Criar `src/modules/task/port/scheduler-service.port.ts` (interface `SchedulerServicePort`)
- [ ] 3. Criar `src/infra/scheduler/scheduler.service.ts` (implementação singleton com `node-schedule`)
- [ ] 4. Criar `src/modules/notification/port/notification-service.port.ts` (port placeholder para RF13)
- [ ] 5. Adicionar `AlertInPastError` e injetar `SchedulerServicePort` em `task.service.ts`
- [ ] 6. Atualizar `task.controller.ts` para tratar `AlertInPastError` com status 400
- [ ] 7. Atualizar `task.factory.ts` para injetar `schedulerService` no `TaskService`
