# RF13-RF14-RF15 — Todo

## RF13 — Criação Automática de Notificação

- [ ] 1. Criar `src/infra/mongo/schemas/notification.schema.ts` (schema Mongoose com owner, task, message, read, createdAt)
- [ ] 2. Criar `src/modules/notification/port/notification-repository.port.ts` (interface com create, findByIdAndOwner, markAsRead, listByOwner)
- [ ] 3. Criar `src/modules/notification/infra/repository/notification.repository.ts` (implementação Mongoose)
- [ ] 4. Atualizar `src/modules/notification/port/notification-service.port.ts` (adicionar markAsRead e listNotifications)
- [ ] 5. Implementar `src/modules/notification/services/notification.service.ts` (createFromAlert, markAsRead, listNotifications + erros NotificationNotFoundError, NotificationAlreadyReadError)
- [ ] 6. Criar `src/modules/notification/factories/notification.factory.ts` (instanciar repository, service e controller)
- [ ] 7. Atualizar `src/modules/task/factories/task.factory.ts` para injetar `notificationService` no `TaskService`

## RF14 — Marcar Notificação como Lida

- [ ] 8. Criar `src/modules/notification/infra/controllers/notification.controller.ts` (handlers markAsRead e list)
- [ ] 9. Criar `src/routes/notification.routes.ts` (PATCH /:id/read e GET / com authenticate)
- [ ] 10. Registrar `notificationRouter` em `src/server.ts` no path `/notifications`

## RF15 — Listagem de Notificações (já coberta pelos itens 5, 8, 9, 10)

## RF15 — Atualização de Dados do Usuário

- [ ] 11. Adicionar `findById` e `update` em `src/modules/user/port/user-repository.port.ts`
- [ ] 12. Implementar `findById` e `update` em `src/modules/user/infra/repository/user.repository.ts`
- [ ] 13. Adicionar `updateUser` em `src/modules/user/port/user-service.port.ts`
- [ ] 14. Implementar `updateUser` em `src/modules/user/services/user.service.ts` (validação de campos, hash de senha, erros NoFieldsToUpdateError e WeakPasswordError)
- [ ] 15. Adicionar handler `update` em `src/modules/user/infra/controllers/user.controller.ts` (ignorar email, tratar erros)
- [ ] 16. Adicionar rota `PATCH /users/me` em `src/routes/user.routes.ts` com authenticate

## RF15 — Logout

- [ ] 17. Criar `src/infra/token-blacklist.ts` (Set em memória com addToBlacklist e isBlacklisted)
- [ ] 18. Atualizar `src/shared/http/authenticate.ts` para verificar blacklist após validar JWT
- [ ] 19. Adicionar `logout` em `src/modules/auth/port/auth-service.port.ts`
- [ ] 20. Implementar `logout` em `src/modules/auth/services/auth.service.ts` (chama addToBlacklist)
- [ ] 21. Adicionar handler `logout` em `src/modules/auth/infra/controllers/auth.controller.ts`
- [ ] 22. Adicionar rota `POST /auth/logout` em `src/routes/auth.routes.ts` com authenticate
