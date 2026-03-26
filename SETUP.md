# Setup del monorepo

## Qué se ha configurado

### Estructura

```
Clearowe---Hackaton-2026/
├── apps/
│   ├── api/        → Backend NestJS (puerto 3001)
│   └── web/        → Frontend Next.js 16 (puerto 3000)
├── packages/
│   └── types/      → Tipos TypeScript compartidos (@clearowe/types)
├── .github/
│   └── workflows/
│       └── ci.yml  → Pipeline de CI
├── .husky/
│   └── pre-commit  → Hook de pre-commit
├── .prettierrc.json → Reglas de formato
├── .prettierignore  → Exclusiones de Prettier
├── turbo.json       → Orquestador de tareas del monorepo
└── package.json     → Raíz del workspace (Bun)
```

### Problemas corregidos

| Problema                                                                         | Solución                                                                  |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `pnpm-lock.yaml` en `apps/api` conflictando con Bun                              | Eliminado                                                                 |
| Nombre de paquete incorrecto (`@hackaton/types`)                                 | Renombrado a `@clearowe/types` en tsconfigs e imports                     |
| Build de la API generaba output en ruta incorrecta (`dist/apps/api/src/main.js`) | Añadido `rootDir: "src"` al tsconfig de la API                            |
| `.tsbuildinfo` fuera de `dist/`, no se limpiaba entre builds                     | Movido a `dist/.tsbuildinfo` para que `deleteOutDir` lo elimine           |
| Archivos de `test/` incluidos en la compilación principal                        | Añadido `exclude: ["test"]` al tsconfig base de la API                    |
| `packages/types` sin campo `exports`                                             | Añadido con condición `types` para resolución correcta en modo `nodenext` |
| `.turbo/` no estaba en `.gitignore`                                              | Añadido                                                                   |

---

## Cómo levantar el proyecto

### Requisitos

- [Bun](https://bun.sh) instalado (`curl -fsSL https://bun.sh/install | bash`)

### Instalación

```bash
bun install
```

### Levantar todo a la vez (recomendado)

```bash
bun run dev
```

Turbo arranca los dos servicios en paralelo:

- **Frontend** → http://localhost:3000
- **Backend** → http://localhost:3001

### Levantar por separado

**Solo el backend:**

```bash
cd apps/api
bun run dev
# Disponible en http://localhost:3001
```

**Solo el frontend:**

```bash
cd apps/web
bun run dev
# Disponible en http://localhost:3000
```

### Todos los comandos disponibles

```bash
bun run build          # Compila ambas apps
bun run lint           # ESLint en ambas apps
bun run test           # Tests unitarios de la API
bun run typecheck      # Type check de ambas apps sin compilar
bun run format:check   # Comprueba el formato con Prettier
```

---

## CI — Jobs paralelos (`.github/workflows/ci.yml`)

El pipeline se ejecuta automáticamente en cada **push** o **pull request** a `main`.

Tiene **3 jobs que corren en paralelo**, cada uno independiente del resto:

### `build` — Compila el proyecto

Verifica que tanto el frontend como el backend compilan sin errores.
Si falla, significa que hay un error de TypeScript o de configuración que rompería producción.

### `test` — Ejecuta los tests de la API

Corre los tests unitarios de NestJS con Jest.
Independiente del build: si los tests fallan no bloquean la comprobación de lint, y viceversa.

### `lint` — Revisa el estilo de código

Ejecuta ESLint en ambas apps.
Detecta errores de código y problemas de estilo sin necesidad de compilar.

### ¿Por qué en paralelo?

Cada job corre en su propia máquina virtual de GitHub Actions de forma simultánea.
El tiempo total de CI es el del job más lento, no la suma de los tres.
Si un job falla, los otros dos siguen corriendo y puedes ver todos los errores de una vez en lugar de uno por uno.

---

## Pre-commit con Husky (`.husky/pre-commit`)

Corre automáticamente en tu máquina **antes de cada `git commit`**.
Si alguno falla, el commit se cancela y ves el error en la terminal.

### Checks configurados

| Check      | Comando                | Qué detecta                                   |
| ---------- | ---------------------- | --------------------------------------------- |
| Type check | `bun run typecheck`    | Errores de TypeScript en API y Web            |
| Lint       | `bun run lint`         | Errores de ESLint en API y Web                |
| Formato    | `bun run format:check` | Código no formateado según `.prettierrc.json` |

### Reglas de Prettier (`.prettierrc.json`)

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "semi": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### Formatear el código manualmente

```bash
bunx prettier --write "**/*.{ts,tsx,json,md}"
```
