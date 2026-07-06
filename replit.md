# Oficinas Mecânicas

Sistema web completo para gerenciamento de oficinas mecânicas e veículos — CRUD de oficinas e veículos, histórico de manutenções e dashboard com estatísticas em tempo real.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/oficinas-app run dev` — run the frontend (port varies)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TanStack Query, Wouter, Tailwind CSS, Recharts, Sonner
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/db/src/schema/` — Drizzle table definitions (oficinas, veiculos, manutencoes)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/oficinas-app/src/` — React frontend (pages, components, hooks)
- `lib/api-client-react/src/generated/` — Generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — Generated Zod schemas for server validation (do not edit)

## Architecture decisions

- OpenAPI-first: all endpoints defined in `openapi.yaml`, then generated via Orval into hooks + Zod schemas
- Manutencoes schema omits an `oficina_id` FK — the `oficinaNome` in GET /veiculos/:id is derived from the vehicle's current oficina (best-effort display label)
- All route handlers use `return` after `res.*()` calls to satisfy TypeScript TS7030 (no implicit returns)

## Product

- **Dashboard**: cards with totals (oficinas, veículos, manutenções) + bar chart by year + recent vehicles list
- **Oficinas**: list with real-time search, create/edit/delete (with confirm dialog), detail view showing vehicles served
- **Veículos**: list with real-time search, create/edit/delete, detail view showing maintenance history

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any OpenAPI spec change, always run `pnpm --filter @workspace/api-spec codegen` before touching backend or frontend code
- Drizzle `oficinasTable` uses `set null` on delete (veiculos.oficina_id); `manutencoesTable` uses `cascade` on delete (from veiculos)
- Route handlers must use explicit `return` before `res.json()/res.status()` calls to avoid TS7030 errors

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
