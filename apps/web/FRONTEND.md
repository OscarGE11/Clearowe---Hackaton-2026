# Frontend — ClearOwe

## Stack

| Tecnología               | Decisión                                           |
| ------------------------ | -------------------------------------------------- |
| **Next.js 16**           | App Router, rutas dinámicas `[id]`                 |
| **Tailwind CSS v4**      | `@theme` inline, sin archivo de config separado    |
| **shadcn/ui**            | `Button`, `Card`, `Input` como base de componentes |
| **TanStack React Query** | Provider global en `app/providers/Providers.tsx`   |
| **Phosphor Icons**       | Iconografía (`@phosphor-icons/react`)              |
| **JetBrains Mono**       | Fuente monoespaciada por defecto en toda la app    |

---

## Paleta de colores

| Token           | Valor                  | Uso                                |
| --------------- | ---------------------- | ---------------------------------- |
| `--background`  | `#1A1A1F`              | Fondo de la app                    |
| `--primary`     | `oklch(0.5 0.257 293)` | Violeta — botones, enlaces, badges |
| `--destructive` | `oklch(0.62 0.22 27)`  | Rojo — deudas, borrar              |
| `--success`     | `oklch(0.7 0.15 162)`  | Verde — saldos positivos           |

---

## Estructura de archivos

```
apps/web/
├── lib/
│   └── api.ts                          # Cliente HTTP + tipos + gestión JWT
├── app/
│   ├── page.tsx                        # Landing
│   ├── (components)/
│   │   └── AppHeader.tsx               # Header reutilizable con título
│   ├── login/
│   │   ├── page.tsx
│   │   └── (components)/LoginCard.tsx  # Formulario login → POST /auth/login
│   ├── register/
│   │   ├── page.tsx
│   │   └── (components)/RegisterCard.tsx # Formulario registro → POST /auth/register
│   ├── groups/
│   │   ├── page.tsx                    # Dashboard de grupos → GET /groups
│   │   ├── new/
│   │   │   └── page.tsx               # Crear grupo → POST /groups
│   │   └── [id]/
│   │       ├── page.tsx               # Detalle grupo + gastos
│   │       ├── expenses/
│   │       │   └── new/
│   │       │       └── page.tsx       # Añadir gasto (modo texto IA / manual)
│   │       └── balance/
│   │           └── page.tsx          # Balance y liquidaciones
│   └── providers/
│       └── Providers.tsx              # React Query provider
└── components/
    └── ui/                            # Button, Card, Input (shadcn)
```

---

## Pantallas implementadas

### Landing (`/`)

Pantalla de bienvenida con el título **ClearOwe**, dos cards informativas y botón _Get Started_ que lleva al login.

### Login (`/login`)

Formulario con email y contraseña. Llama a `POST /auth/login`, guarda el JWT en `localStorage` y redirige a `/groups`.

### Register (`/register`)

Formulario con nombre, email y contraseña. Llama a `POST /auth/register`, guarda el JWT y redirige a `/groups`.

### Groups Dashboard (`/groups`)

Lista todos los grupos del usuario autenticado (`GET /groups`). Muestra estado vacío con CTA si no hay grupos. Redirige a `/login` si no hay token.

### Create Group (`/groups/new`)

Formulario con nombre del grupo y lista dinámica de participantes (mínimo 2). Llama a `POST /groups`.

### Group Detail (`/groups/[id]`)

Muestra:

- Badges de participantes
- Lista de gastos con quién pagó y el reparto
- Botón para borrar cada gasto (`DELETE /expenses/:id`)
- Accesos directos a _Add Expense_ y _Balance_

### Add Expense (`/groups/[id]/expenses/new`)

Dos modos en el mismo endpoint (`POST /groups/:id/expenses`):

- **Modo texto (IA parser):** campo libre — _"Cena 60€ pagada por Juan con Ana y Pedro"_ — el backend extrae todos los campos automáticamente.
- **Modo manual:** descripción, importe, selector de quién pagó, checkboxes de participantes.

El toggle entre modos está visible en la parte superior del formulario.

### Balance (`/groups/[id]/balance`)

Muestra:

- **Balance neto** de cada participante (verde = le deben, rojo = debe)
- **Lista de liquidaciones** — el número mínimo de pagos para saldar todo, con flechas _de → a_ y el importe

---

## Cliente API (`lib/api.ts`)

Wrapper sobre `fetch` que:

- Lee el JWT de `localStorage` e inyecta el header `Authorization: Bearer <token>`
- Expone `setToken` / `clearToken` / `getToken` para el flujo de auth
- Lanza `Error` con el mensaje del backend si la respuesta no es `2xx`

```ts
import { api, setToken, getToken, clearToken } from '@/lib/api';

// Auth
const { access_token } = await api.auth.login(email, password);
setToken(access_token);

// Grupos
const groups = await api.groups.list();
const group = await api.groups.get(id);
const newGroup = await api.groups.create('Viaje a Ibiza', ['Juan', 'Ana']);

// Gastos
const expenses = await api.expenses.list(groupId);
await api.expenses.create(groupId, { rawText: 'Cena 60€ con Juan y Ana' });
await api.expenses.remove(expenseId);

// Balance
const { balances, transactions } = await api.balance.get(groupId);
```

---

## Cómo levantar el front

```bash
# Desde la raíz del monorepo
bun run dev        # levanta web (puerto 3000) y api (puerto 3001)

# Solo el front
cd apps/web && bun run dev
```

Rutas disponibles en `http://localhost:3000`:

| Ruta                       | Pantalla                |
| -------------------------- | ----------------------- |
| `/`                        | Landing                 |
| `/login`                   | Login                   |
| `/register`                | Register                |
| `/groups`                  | Dashboard de grupos     |
| `/groups/new`              | Crear grupo             |
| `/groups/:id`              | Detalle del grupo       |
| `/groups/:id/expenses/new` | Añadir gasto            |
| `/groups/:id/balance`      | Balance y liquidaciones |
