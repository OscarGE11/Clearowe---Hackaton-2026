# Backend — AI Expense Splitter

Documento de referencia para el equipo. Recoge las decisiones técnicas, el modelo de datos y todos los endpoints que va a exponer la API.

---

## Stack

| Tecnología          | Decisión     | Por qué                                                      |
| ------------------- | ------------ | ------------------------------------------------------------ |
| **NestJS**          | ✅ Ya estaba | Framework Node con estructura modular, ideal para APIs REST  |
| **PostgreSQL**      | ✅ Elegido   | Base de datos relacional robusta, se levanta con Docker      |
| **TypeORM**         | ✅ Elegido   | ORM nativo de NestJS, entidades con decoradores TypeScript   |
| **class-validator** | ✅ Elegido   | Validación de DTOs integrada con NestJS                      |
| **JWT + Passport**  | ✅ Elegido   | Auth estándar en NestJS, ligero y sin fricción               |
| **Parser propio**   | ✅ Elegido   | Regex inteligente en lugar de llamar a una API de IA externa |

### Por qué no usamos una API de IA externa

Para parsear textos como `"Cena 60€ con Juan y Pedro"` no necesitamos un LLM.
Los patrones son predecibles: cantidad + símbolo, nombres del grupo, palabras clave de quién pagó.
Un parser con regex es más rápido, funciona offline, sin coste y sin dependencia externa.
Para la demo es indistinguible de llamar a GPT — y si en el futuro queremos cambiarlo, el módulo está aislado.

### Por qué sí tenemos auth

El compañero de front ya tiene la pantalla de login. Auth básico con NestJS son ~3-4h de trabajo.
Los usuarios crean grupos y los poseen. Los participantes del grupo son solo nombres — no necesitan cuenta.

---

## Modelo de datos

```
User ──< Group ──< Expense ──< ExpenseSplit
                ──< Participant ──< ExpenseSplit
```

### `User`

| Campo        | Tipo      | Descripción         |
| ------------ | --------- | ------------------- |
| id           | uuid      | PK                  |
| email        | varchar   | único               |
| name         | varchar   | nombre para mostrar |
| passwordHash | varchar   | hash bcrypt         |
| createdAt    | timestamp |                     |

### `Group`

| Campo       | Tipo      | Descripción         |
| ----------- | --------- | ------------------- |
| id          | uuid      | PK                  |
| name        | varchar   | ej. "Viaje a Ibiza" |
| createdById | uuid      | FK → User           |
| createdAt   | timestamp |                     |

### `Participant`

Personas del grupo. Son solo nombres, **no necesitan cuenta**.
| Campo | Tipo | Descripción |
| --- | --- | --- |
| id | uuid | PK |
| name | varchar | ej. "Juan" |
| groupId | uuid | FK → Group |

### `Expense`

| Campo       | Tipo          | Descripción                                       |
| ----------- | ------------- | ------------------------------------------------- |
| id          | uuid          | PK                                                |
| groupId     | uuid          | FK → Group                                        |
| rawText     | varchar       | texto original que escribió el usuario (nullable) |
| description | varchar       | descripción del gasto                             |
| amount      | decimal(10,2) | importe total                                     |
| currency    | varchar       | default `EUR`                                     |
| paidById    | uuid          | FK → Participant (quién pagó)                     |
| createdAt   | timestamp     |                                                   |

### `ExpenseSplit`

Cuánto debe cada participante de un gasto concreto.
| Campo | Tipo | Descripción |
| --- | --- | --- |
| id | uuid | PK |
| expenseId | uuid | FK → Expense |
| participantId | uuid | FK → Participant |
| amount | decimal(10,2) | parte que le toca |

---

## Módulos

```
src/
├── auth/          → registro, login, JWT strategy
├── groups/        → CRUD de grupos y participantes
├── expenses/      → crear y listar gastos
├── balance/       → cálculo de deudas y transacciones mínimas
└── ai/            → parser de texto natural (regex, sin API externa)
```

---

## Endpoints

Base URL: `http://localhost:3001`

Las rutas marcadas con 🔒 requieren header `Authorization: Bearer <token>`.

---

### Auth

#### `POST /auth/register`

Crea una cuenta nueva.

**Body:**

```json
{
  "email": "juan@example.com",
  "name": "Juan",
  "password": "mipassword123"
}
```

**Response `201`:**

```json
{
  "access_token": "eyJhbGci..."
}
```

---

#### `POST /auth/login`

Inicia sesión.

**Body:**

```json
{
  "email": "juan@example.com",
  "password": "mipassword123"
}
```

**Response `200`:**

```json
{
  "access_token": "eyJhbGci..."
}
```

---

### Groups 🔒

#### `POST /groups`

Crea un grupo con sus participantes iniciales.

**Body:**

```json
{
  "name": "Viaje a Ibiza",
  "participants": ["Juan", "Ana", "Pedro"]
}
```

**Response `201`:**

```json
{
  "id": "uuid",
  "name": "Viaje a Ibiza",
  "participants": [
    { "id": "uuid", "name": "Juan" },
    { "id": "uuid", "name": "Ana" },
    { "id": "uuid", "name": "Pedro" }
  ],
  "createdAt": "2026-03-28T..."
}
```

---

#### `GET /groups/:id` 🔒

Devuelve el grupo con sus participantes.

**Response `200`:**

```json
{
  "id": "uuid",
  "name": "Viaje a Ibiza",
  "participants": [
    { "id": "uuid", "name": "Juan" },
    { "id": "uuid", "name": "Ana" }
  ],
  "createdAt": "2026-03-28T..."
}
```

---

#### `POST /groups/:id/participants` 🔒

Añade un participante al grupo después de crearlo.

**Body:**

```json
{ "name": "Luis" }
```

**Response `201`:**

```json
{ "id": "uuid", "name": "Luis" }
```

---

### Expenses 🔒

#### `POST /groups/:id/expenses`

Crea un gasto. Acepta **dos modos** en el mismo endpoint:

**Modo texto (IA parser):**

```json
{
  "rawText": "Cena 60€ pagada por Juan con Ana y Pedro"
}
```

**Modo manual:**

```json
{
  "description": "Cena",
  "amount": 60,
  "paidById": "uuid-juan",
  "participantIds": ["uuid-juan", "uuid-ana", "uuid-pedro"]
}
```

> Si viene `rawText`, el backend llama internamente al parser y construye el gasto automáticamente.
> Si el parser no puede resolverlo, devuelve `422` con el campo que no pudo extraer para que el front lo muestre como formulario manual.

**Response `201`:**

```json
{
  "id": "uuid",
  "description": "Cena",
  "amount": 60,
  "currency": "EUR",
  "rawText": "Cena 60€ pagada por Juan con Ana y Pedro",
  "paidBy": { "id": "uuid", "name": "Juan" },
  "splits": [
    { "participant": { "id": "uuid", "name": "Juan" }, "amount": 20 },
    { "participant": { "id": "uuid", "name": "Ana" }, "amount": 20 },
    { "participant": { "id": "uuid", "name": "Pedro" }, "amount": 20 }
  ],
  "createdAt": "2026-03-28T..."
}
```

---

#### `GET /groups/:id/expenses` 🔒

Lista todos los gastos del grupo.

**Response `200`:**

```json
[
  {
    "id": "uuid",
    "description": "Cena",
    "amount": 60,
    "currency": "EUR",
    "paidBy": { "id": "uuid", "name": "Juan" },
    "splits": [
      { "participant": { "id": "uuid", "name": "Juan" }, "amount": 20 },
      { "participant": { "id": "uuid", "name": "Ana" }, "amount": 20 }
    ],
    "createdAt": "2026-03-28T..."
  }
]
```

---

#### `DELETE /expenses/:id` 🔒

Elimina un gasto.

**Response `200`:**

```json
{ "ok": true }
```

---

### Balance 🔒

#### `GET /groups/:id/balance`

Devuelve el balance neto de cada participante y la lista mínima de pagos para saldar todo.

**Response `200`:**

```json
{
  "balances": [
    { "participant": { "id": "uuid", "name": "Juan" }, "net": 40 },
    { "participant": { "id": "uuid", "name": "Ana" }, "net": -20 },
    { "participant": { "id": "uuid", "name": "Pedro" }, "net": -20 }
  ],
  "transactions": [
    { "from": { "name": "Ana" }, "to": { "name": "Juan" }, "amount": 20 },
    { "from": { "name": "Pedro" }, "to": { "name": "Juan" }, "amount": 20 }
  ]
}
```

> `net` positivo → le deben dinero
> `net` negativo → debe dinero
> `transactions` → mínimo número de pagos para que todo quede a cero

---

## Cómo funciona el parser de texto

Dado un texto y la lista de participantes del grupo, extrae:

| Campo          | Ejemplos que detecta                                                                         |
| -------------- | -------------------------------------------------------------------------------------------- |
| `amount`       | `60€` · `€60` · `60 euros` · `60 EUR`                                                        |
| `paidBy`       | `pagado por Juan` · `pagué yo` · `pago Juan` · si no aparece, se asume el primero mencionado |
| `participants` | nombres que coincidan con los del grupo (fuzzy matching)                                     |
| `description`  | texto restante después de extraer cantidad y nombres                                         |

Si no puede extraer algún campo obligatorio (`amount` o `participants`), devuelve `422` con el detalle del error.

---

## Variables de entorno necesarias

El front no necesita estas, pero las documenta para el deploy:

```env
DATABASE_URL=postgresql://user:pass@host:5432/clearowe
JWT_SECRET=un-secreto-largo-y-aleatorio
JWT_EXPIRES_IN=7d
PORT=3001
```
