# RF1 — Cadastro de Usuário

## História de Usuário

**Como** um visitante do sistema,  
**Quero** me cadastrar informando meu nome, e-mail e senha,  
**Para** criar uma conta e ter acesso às funcionalidades da plataforma.

---

## Contrato da API

**Endpoint:** `POST /users`

### Corpo da requisição
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

### Respostas

| Cenário | Status | Corpo |
|---|---|---|
| Cadastro bem-sucedido | `201` | `{ "message": "Usuário cadastrado com sucesso" }` |
| Campo obrigatório ausente | `400` | `{ "message": "O campo {campo} é obrigatório" }` |
| E-mail já cadastrado | `409` | `{ "message": "E-mail já cadastrado, por favor tente outro" }` |

---

## Critérios de Aceite

1. Dado uma requisição com `name`, `email` e `password` válidos e e-mail não cadastrado, o sistema deve persistir o usuário e retornar `201`.
2. Dado uma requisição sem `name`, o sistema deve retornar `400` com a mensagem `"O campo name é obrigatório"`.
3. Dado uma requisição sem `email`, o sistema deve retornar `400` com a mensagem `"O campo email é obrigatório"`.
4. Dado uma requisição sem `password`, o sistema deve retornar `400` com a mensagem `"O campo password é obrigatório"`.
5. Dado uma requisição com um `email` já presente no banco, o sistema deve retornar `409` com a mensagem `"E-mail já cadastrado, por favor tente outro"`.
6. A senha jamais deve ser armazenada em texto puro — deve ser criptografada com bcrypt antes de persistir.
7. Após o cadastro bem-sucedido, o usuário deve ser redirecionado automaticamente para a tela de home.

---

## Regras de Negócio

- **RN1:** E-mail deve ser único no sistema. A verificação ocorre antes de qualquer persistência.
- **RN2:** A senha deve ser hasheada com bcrypt (fator de custo padrão) antes de ser salva no banco.

---

## Decisões Técnicas

- A validação dos campos obrigatórios ocorre no controller, antes de chegar ao service.
- A verificação de e-mail duplicado ocorre no service, via consulta ao repositório.
- O endpoint não retorna os dados do usuário criado — apenas a mensagem de sucesso.
- O campo `createdAt` é gerado automaticamente pelo schema do Mongoose.
