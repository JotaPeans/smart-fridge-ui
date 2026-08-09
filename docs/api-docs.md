# Guia de integração — Frontend × API da Geladeira Inteligente

Este documento existe para uma IA (ou dev) implementar as chamadas de API no frontend sem precisar ler o código do backend. Contém todos os endpoints, contratos de request/response, autenticação e regras de negócio relevantes para a UI.

> Fonte viva (sempre mais atual que este arquivo se divergirem): o backend expõe Swagger em `GET /docs` (UI) e `GET /docs/json` (OpenAPI spec). Use este `.md` para implementar rápido; use o Swagger para tirar dúvida de schema.

## Convenções gerais

- **Base path**: todos os endpoints de negócio ficam sob `/api/v1/<feature>`. Autenticação (login/signup/logout) fica sob `/api/auth/*` (Better Auth, ver seção própria).
- **Formato**: JSON em request e response (`Content-Type: application/json`), exceto o webhook de pagamento (uso exclusivo do gateway, não é chamado pelo frontend).
- **Autenticação**: sessão via **cookie httpOnly** (Better Auth). Toda requisição autenticada do frontend precisa ser feita com `credentials: "include"` (fetch) ou `withCredentials: true` (axios) — não existe Bearer token para o usuário final.
- **Datas**: sempre string ISO 8601 (`date-time`) nas respostas. Nas queries de filtro, também string ISO 8601.
- **IDs**: strings (UUID).
- **Valores monetários**: `number` em unidade decimal normal (ex.: `12.5` = R$ 12,50), não em centavos.

### Paginação

Endpoints de listagem aceitam query params:

| Campo | Tipo | Default | Observação |
|---|---|---|---|
| `page` | number | 1 | mínimo 1 |
| `pageSize` | number | 20 | mínimo 1, máximo 100 |

E respondem sempre neste formato:

```json
{
  "items": [ /* array do recurso */ ],
  "total": 123,
  "page": 1,
  "pageSize": 20,
  "totalPages": 7
}
```

### Formato de erro

Dois formatos possíveis para o **mesmo status code** — trate ambos no client HTTP:

1. **Erro de domínio** (regra de negócio, permissão, recurso não encontrado) — corpo JSON:
   ```json
   { "error": "mensagem legível", "code": 400 }
   ```
2. **Erro de gate de autenticação** (sem sessão / sessão inválida / usuário inativo / chave de serviço inválida) — corpo é **texto puro**, não JSON:
   ```
   Unauthorized
   ```
   Status `401` (sem sessão / não autorizado) ou `403` (usuário autenticado mas `active: false`).

Recomendação para o client: tente `response.json()`; se falhar o parse, trate como erro genérico usando o `status` HTTP e um texto padrão ("Sessão expirada, faça login novamente" etc.).

### Roles

| Role | Significado |
|---|---|
| `USER` | Cliente final — compra produtos, vê apenas as próprias compras. |
| `ADMIN` | Dono de uma ou mais geladeiras — gerencia produtos e vê vendas/analytics só das suas geladeiras. |
| `MASTER` | Administrador do sistema — acesso total, cria geladeiras e vincula admins. |

O role do usuário logado vem em `GET /api/v1/user/me` (campo `role`) e deve guiar quais telas/ações mostrar na UI.

---

## Autenticação (Better Auth)

Montada em `/api/auth/*`. Os principais endpoints (padrão Better Auth, email/senha habilitado):

| Ação | Método | Path |
|---|---|---|
| Cadastro | POST | `/api/auth/sign-up/email` |
| Login | POST | `/api/auth/sign-in/email` |
| Logout | POST | `/api/auth/sign-out` |
| Sessão atual (cru, do Better Auth) | GET | `/api/auth/get-session` |

Campos extras do usuário (definidos no schema do Better Auth, além dos padrões `email`/`password`/`name`):

| Campo | Tipo | Obrigatório no cadastro | Observação |
|---|---|---|---|
| `phone` | string | sim | |
| `cpf` | string | não | |
| `role` | string | — | **não enviável pelo client** (`input: false`), sempre `USER` no cadastro; só MASTER promove alguém a `ADMIN` (hoje isso é feito diretamente no banco/seed, não há endpoint de promoção). |
| `active` | boolean | — | **não enviável pelo client**, default `true`. |

Body de exemplo para `POST /api/auth/sign-up/email`:
```json
{
  "email": "user@example.com",
  "password": "senha-forte",
  "name": "Nome Completo",
  "phone": "+5511999999999",
  "cpf": "12345678900"
}
```

Após login, o cookie de sessão é setado automaticamente pelo browser (resposta `Set-Cookie`). Para saber quem está logado e qual o role, **use o endpoint de negócio** `GET /api/v1/user/me` (não o `/api/auth/get-session` cru), pois ele já retorna o formato padronizado da API.

---

## User — `/api/v1/user`

### `GET /api/v1/user/me`
Retorna o usuário da sessão atual.

- **Auth**: sessão obrigatória.
- **Response 200**: [`UserResponse`](#userresponse)
- **Erros**: `401` (sem sessão, texto puro)

### `GET /api/v1/user/admins`
Lista usuários com role `ADMIN`. **Restrito a MASTER.**

- **Auth**: sessão obrigatória, role `MASTER`.
- **Query**: `page`, `pageSize`, `search?` (string — busca por nome/email/CPF)
- **Response 200**: `Paginated<UserResponse>`
- **Erros**: `401` (sem sessão, texto puro, ou JSON se role != MASTER)

---

## Fridge — `/api/v1/fridge`

### `GET /api/v1/fridge/list`
- **Auth**: sessão obrigatória. `MASTER` vê todas; `ADMIN` vê só as suas; `USER` **não tem acesso** (401).
- **Query**: `page`, `pageSize`
- **Response 200**: `Paginated<FridgeResponse>`
- **Erros**: `401`

### `GET /api/v1/fridge/:id`
- **Auth**: sessão obrigatória. `ADMIN` só pode ver a própria; `USER` não tem acesso.
- **Response 200**: [`FridgeResponse`](#fridgeresponse)
- **Erros**: `401`, `404`

### `POST /api/v1/fridge`
Cria geladeira. **Restrito a MASTER.**

- **Body**:
  | Campo | Tipo | Obrigatório | Observação |
  |---|---|---|---|
  | `name` | string (1–255) | sim | |
  | `location` | string (≤255) \| null | não | |
  | `serialNumber` | string | sim | identificador único do device IoT/MQTT |
  | `adminId` | string | sim | id de um usuário com role `ADMIN` |
  | `paymentCredential` | string | não | token do gateway de pagamento (AbacatePay) **dessa geladeira específica**; nunca retorna na response, é armazenado criptografado |
- **Response 200**: [`FridgeResponse`](#fridgeresponse)
- **Erros**: `400` (ex.: `adminId` não é um ADMIN), `401`, `404` (`adminId` não existe)

### `PATCH /api/v1/fridge/:id`
Atualiza geladeira (parcial). **Restrito a MASTER.**

- **Body**: todos os campos de `POST` são opcionais aqui (incluindo `paymentCredential`, que também aceita `null` para remover a credencial).
- **Response 200**: [`FridgeResponse`](#fridgeresponse)
- **Erros**: `401`, `404`

### `DELETE /api/v1/fridge/:id`
Desativa (soft-delete, `active: false`). **Restrito a MASTER.**

- **Response 200**: `{ "success": true }`
- **Erros**: `401`, `404`

### `POST /api/v1/fridge/:id/open-door`
Abre a porta manualmente via MQTT (fora do fluxo de pagamento — uso administrativo/manutenção).

- **Auth**: sessão obrigatória (mesmas regras de acesso do `GET /:id`).
- **Response 200**: `{ "success": true }`
- **Erros**: `400` (geladeira inativa), `401`, `404`

> **Nota de segurança**: `paymentCredential` nunca aparece em nenhuma response (list, get, create, update) — é write-only.

---

## Product — `/api/v1/product`

### `GET /api/v1/product/list/:fridgeId`
Lista produtos de uma geladeira. **Público** (sem auth) — é a tela de compra do cliente.

- **Params**: `fridgeId`
- **Query**: `page`, `pageSize`
- **Response 200**: `Paginated<ProductResponse>`

### `GET /api/v1/product/:id`
**Público** (sem auth).

- **Response 200**: [`ProductResponse`](#productresponse)
- **Erros**: `404`

### `POST /api/v1/product`
Cria produto. Restrito ao ADMIN dono da geladeira (`fridgeId` do body) ou MASTER.

- **Auth**: sessão obrigatória.
- **Body**:
  | Campo | Tipo | Obrigatório |
  |---|---|---|
  | `name` | string (1–255) | sim |
  | `description` | string (≤2000) \| null | não |
  | `imageUrl` | string (URL) \| null | não |
  | `price` | number (≥0) | sim |
  | `stock` | integer (≥0) | não (default 0) |
  | `fridgeId` | string | sim |
- **Response 200**: [`ProductResponse`](#productresponse)
- **Erros**: `401`, `404` (fridge não existe)

### `PATCH /api/v1/product/:id`
Atualiza produto (parcial). Mesma regra de acesso do create (baseada na `fridgeId` do produto).

- **Body**: `name?`, `description?`, `imageUrl?`, `price?`, `stock?`, `active?`
- **Response 200**: [`ProductResponse`](#productresponse)
- **Erros**: `401`, `404`

### `DELETE /api/v1/product/:id`
Desativa (soft-delete). Mesma regra de acesso.

- **Response 200**: `{ "success": true }`
- **Erros**: `401`, `404`

---

## Sale — `/api/v1/sale`

Vendas nunca são criadas diretamente pelo frontend — isso acontece via checkout de pagamento (ver seção [Payment](#payment--apiv1payment)). Este recurso é só leitura + analytics para o frontend (o `PATCH` é uso exclusivo de um serviço externo).

### `GET /api/v1/sale/list`
- **Auth**: sessão obrigatória. `USER` vê só as próprias compras; `ADMIN` só as vendas das suas geladeiras; `MASTER` vê tudo.
- **Query**: `page`, `pageSize`
- **Response 200**: `Paginated<SaleResponse>`
- **Erros**: `401` (só texto puro — sem sessão; não há regra de role que bloqueie aqui)

### `GET /api/v1/sale/:id`
- **Auth**: mesma regra de escopo da listagem.
- **Response 200**: [`SaleResponse`](#saleresponse)
- **Erros**: `401`, `404`

### Analytics
Todos exigem sessão; `USER` **não tem acesso** (401). `ADMIN` só enxerga dados das próprias geladeiras — se passar `fridgeId` de uma geladeira que não é dele, recebe `401`/`404`. Todos aceitam os mesmos filtros de query:

| Query param | Tipo | Observação |
|---|---|---|
| `fridgeId` | string | opcional — filtra por geladeira |
| `startDate` | string (date-time) | opcional |
| `endDate` | string (date-time) | opcional |

#### `GET /api/v1/sale/analytics/by-period`
- Query extra: `groupBy?` = `"day" \| "month" \| "year"` (default `"day"`)
- **Response 200**: array de `{ period: string, count: number, totalAmount: number }`

#### `GET /api/v1/sale/analytics/volume`
- **Response 200**: `{ count: number, totalAmount: number }`

#### `GET /api/v1/sale/analytics/top-products`
- Query extra: `limit?` (1–50, default 5)
- **Response 200**: array de `{ productId: string, productName: string, quantitySold: number }`

#### `GET /api/v1/sale/analytics/peak-hours`
- **Response 200**: array de `{ hour: number, count: number }` (`hour` 0–23)

### `PATCH /api/v1/sale/:id`
**Não chamar pelo frontend.** Autenticado por header `x-api-key` (serviço externo — módulo de câmera/device), sem sessão de usuário. Documentado aqui só para não confundir se aparecer no Swagger.

---

## Payment — `/api/v1/payment`

Fluxo real de compra do cliente. `POST /api/v1/sale` **não existe** — toda venda nasce por aqui.

### `POST /api/v1/payment/checkout`
Inicia o checkout: cria a venda como `AWAITING_PAYMENT` e retorna a URL de pagamento do gateway.

- **Auth**: sessão obrigatória (qualquer role logada — normalmente `USER`).
- **Body**:
  ```json
  {
    "fridgeId": "string",
    "items": [
      { "productId": "string", "quantity": 1 }
    ]
  }
  ```
  `items` precisa ter ao menos 1 item; `quantity` inteiro ≥ 1.
- **Response 200**:
  ```json
  { "saleId": "string", "checkoutUrl": "string" }
  ```
  **Ação da UI**: redirecionar o usuário para `checkoutUrl` (link de pagamento do gateway, ex. PIX da AbacatePay).
- **Erros**:
  - `400` — geladeira inativa, carrinho vazio, produto inválido para a geladeira, ou estoque insuficiente (mensagem no campo `error` já é apresentável ao usuário)
  - `401` — sem sessão (texto puro)
  - `404` — geladeira ou produto não encontrado

### `POST /api/v1/payment/webhook`
**Nunca chamado pelo frontend.** É o gateway de pagamento (AbacatePay) que chama o backend para confirmar/cancelar a cobrança. Documentado aqui só por completude.

### Como a UI acompanha o status da compra

Não existe WebSocket/SSE hoje. Padrão recomendado:

1. Após o checkout, mostrar tela de "aguardando pagamento" com o `saleId` retornado.
2. Fazer **polling** em `GET /api/v1/sale/:id` (a cada poucos segundos) e observar o campo `status`:
   - `AWAITING_PAYMENT` → continue aguardando.
   - `PAID` → pagamento confirmado; a porta da geladeira é aberta automaticamente pelo backend (MQTT) neste momento.
   - `DOOR_OPEN` / `DOOR_CLOSED` → cliente retirando o produto / já retirou.
   - `COMPLETED` → fluxo finalizado.
   - `CANCELLED` → pagamento cancelado/expirado, ou estoque ficou insuficiente entre o checkout e a confirmação — informar o usuário e permitir novo checkout.
3. Parar o polling quando `status` for um estado terminal (`COMPLETED` ou `CANCELLED`) ou após um timeout razoável (ex.: 10 min sem confirmação → avisar o usuário).

---

## Enums de referência

```ts
type Role = "MASTER" | "ADMIN" | "USER";

type SaleStatus =
  | "AWAITING_PAYMENT"
  | "PAID"
  | "DOOR_OPEN"
  | "DOOR_CLOSED"
  | "COMPLETED"
  | "CANCELLED";

type VideoStatus = "PENDING" | "UPLOADED" | "FAILED" | "PERMANENTLY_FAILED";
```

`VideoStatus` é interno (vídeo de comprovação da compra) — normalmente não precisa ser exibido na UI do cliente; pode ser útil num painel administrativo de auditoria.

---

## Schemas de resposta

### `UserResponse`
```ts
{
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string | null;
  role: Role;
  active: boolean;
  emailVerified: boolean;
  image: string | null;
  createdAt: string; // date-time
  updatedAt: string; // date-time
}
```

### `FridgeResponse`
```ts
{
  id: string;
  name: string;
  location: string | null;
  serialNumber: string;
  status: string;
  active: boolean;
  adminId: string;
  createdAt: string;
  updatedAt: string;
  // paymentCredential NUNCA é retornado
}
```

### `ProductResponse`
```ts
{
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  stock: number;
  active: boolean;
  fridgeId: string;
  createdAt: string;
  updatedAt: string;
}
```

### `SaleResponse`
```ts
{
  id: string;
  status: SaleStatus;
  startedAt: string | null;   // preenchido quando o pagamento é confirmado
  endedAt: string | null;     // preenchido quando a porta fecha
  totalAmount: number;
  paymentExternalId: string | null;
  videoStatus: VideoStatus;
  fileKey: string | null;
  userId: string;
  fridgeId: string;
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    saleId: string;
    productId: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

---

## Resumo rápido de endpoints

| Método | Path | Auth | Quem acessa |
|---|---|---|---|
| POST | `/api/auth/sign-up/email` | não | público |
| POST | `/api/auth/sign-in/email` | não | público |
| POST | `/api/auth/sign-out` | sessão | logado |
| GET | `/api/v1/user/me` | sessão | logado |
| GET | `/api/v1/user/admins` | sessão | MASTER |
| GET | `/api/v1/fridge/list` | sessão | ADMIN, MASTER |
| GET | `/api/v1/fridge/:id` | sessão | ADMIN (própria), MASTER |
| POST | `/api/v1/fridge` | sessão | MASTER |
| PATCH | `/api/v1/fridge/:id` | sessão | MASTER |
| DELETE | `/api/v1/fridge/:id` | sessão | MASTER |
| POST | `/api/v1/fridge/:id/open-door` | sessão | ADMIN (própria), MASTER |
| GET | `/api/v1/product/list/:fridgeId` | não | público |
| GET | `/api/v1/product/:id` | não | público |
| POST | `/api/v1/product` | sessão | ADMIN (dono), MASTER |
| PATCH | `/api/v1/product/:id` | sessão | ADMIN (dono), MASTER |
| DELETE | `/api/v1/product/:id` | sessão | ADMIN (dono), MASTER |
| GET | `/api/v1/sale/list` | sessão | USER (próprias), ADMIN (próprias geladeiras), MASTER |
| GET | `/api/v1/sale/:id` | sessão | idem |
| GET | `/api/v1/sale/analytics/*` | sessão | ADMIN, MASTER (USER sem acesso) |
| PATCH | `/api/v1/sale/:id` | `x-api-key` | serviço externo — **não usar no frontend** |
| POST | `/api/v1/payment/checkout` | sessão | qualquer logado (fluxo de compra) |
| POST | `/api/v1/payment/webhook` | secret na query | gateway de pagamento — **não usar no frontend** |