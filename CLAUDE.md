# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

This project uses **Bun** exclusively. Always use `bun` instead of `npm`, `yarn`, or `pnpm`.

## Commands

### Root (runs all apps via Turborepo)

```bash
bun install          # Install all dependencies
bun run dev          # Start all apps in dev mode
bun run build        # Build all apps
```

### API (`apps/api`) — NestJS, port 3001

```bash
bun run dev          # nest start --watch
bun run build        # nest build
bun run lint         # eslint with autofix
bun test             # jest (unit tests in src/**/*.spec.ts)
bun run test:e2e     # jest with test/jest-e2e.json
bun run test:cov     # jest --coverage
```

### Web (`apps/web`) — Next.js 16

```bash
bun run dev          # next dev
bun run build        # next build
bun run lint         # eslint
```

To run a single Jest test file in the API:

```bash
cd apps/api && bun test -- src/path/to/file.spec.ts
```

## Architecture

This is a **Turborepo monorepo** with Bun workspaces:

```
apps/
  api/     – NestJS REST API (port 3001)
  web/     – Next.js 16 frontend (App Router)
packages/
  types/   – Shared TypeScript types (@clearowe/types)
```

### Shared Types (`packages/types`)

Exported from `packages/types/src/index.ts` as `@clearowe/types`. Currently defines `Balance` and `Transaction` interfaces used by both apps.

> Note: `apps/api/src/utils/utils.ts` currently imports from `@hackaton/types` — this is likely a bug and should be `@clearowe/types`.

### API (`apps/api`)

Standard NestJS structure: controllers → services. The core business logic lives in `src/utils/utils.ts` — a debt-settlement algorithm (`balanceSorting`) that computes the minimum set of transactions to settle balances among a group of people.

### Web (`apps/web`)

Next.js App Router with:

- **shadcn/ui** components in `components/ui/` (add new ones via `bunx shadcn add <component>`)
- **TanStack React Query** globally wrapped in `app/providers/Providers.tsx`
- **Tailwind CSS v4** with `@tailwindcss/postcss`
- **Phosphor Icons** (`@phosphor-icons/react`)
- Path alias `@/` maps to the web app root
