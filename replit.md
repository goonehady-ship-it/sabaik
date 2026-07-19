# مؤسسة سبائك الماسة — موقع الشركة ولوحة الإدارة

موقع شركة سبائك الماسة لتأجير الحاويات ونقل الأنقاض في الرياض، مع لوحة إدارة متكاملة.

## Run & Operate

- **Frontend** (port 19770): `PORT=19770 BASE_PATH=/ pnpm --filter @workspace/sabaik-almasa run dev`
- **API Server** (port 8080): `PORT=8080 pnpm --filter @workspace/api-server run dev`
- **DB schema push**: `pnpm --filter @workspace/db run push`
- **DB seed (reset & reseed)**: `pnpm --filter @workspace/db run seed`
- **Full typecheck**: `pnpm run typecheck`
- **Build**: `pnpm run build`
- **Regenerate API hooks from spec**: `pnpm --filter @workspace/api-spec run codegen`

## Database

- **Type**: SQLite (embedded, file-based) — no external server needed
- **File location**: `data/sabaik.db` (at workspace root)
- **Portable**: copy the `data/` directory to move data anywhere
- **ORM**: Drizzle ORM (`drizzle-orm/better-sqlite3`)
- The database is created automatically on first run
- To reset and reseed: `pnpm --filter @workspace/db run seed`

## Stack

- pnpm workspaces, Node.js 20, TypeScript 5.9
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + shadcn/ui + Wouter
- **API**: Express 5
- **DB**: SQLite + Drizzle ORM + drizzle-zod
- **Validation**: Zod v4
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec/`)
- **Build**: esbuild (API), Vite (frontend)

## Admin Dashboard

- URL: `/admin/login`
- Credentials: `admin` / `sabaik2024`
- Pages: Dashboard, Requests, Conversations, Notifications, Slides, Services, Containers, Testimonials, Partners

## Where things live

- `artifacts/sabaik-almasa/` — React frontend
- `artifacts/api-server/` — Express API server
- `lib/db/` — Drizzle schema + seed script + DB connection
- `lib/api-client-react/` — Generated React Query hooks (from OpenAPI spec)
- `lib/api-spec/` — OpenAPI 3.1 spec (source of truth for API contract)
- `lib/api-zod/` — Generated Zod schemas
- `data/sabaik.db` — SQLite database file (portable)

## Architecture decisions

- **SQLite over PostgreSQL**: Embedded database makes the project fully portable — no `DATABASE_URL` needed, works anywhere. Data moves with the project by copying `data/sabaik.db`.
- **Drizzle ORM**: Type-safe SQL, schema-as-code, easy migrations via `drizzle-kit push`.
- **Orval codegen**: API client hooks are auto-generated from the OpenAPI spec — edit `lib/api-spec/openapi.yaml` then run codegen, never edit `lib/api-client-react/src/generated/` manually.
- **better-sqlite3 externalized**: Listed in esbuild's `external` array and also in `artifacts/api-server/package.json` so Node.js can resolve it at runtime after bundling.

## Product

موقع احترافي لمؤسسة سبائك الماسة (تأسست 2018، الرياض) يشمل:
- صفحة رئيسية: سلايدر، إحصائيات، خدمات، حاويات، قيم، شهادات، شركاء، رسالة المدير
- نموذج طلب خدمة + شات مدعوم بالذكاء الاصطناعي
- لوحة إدارة كاملة لإدارة جميع محتوى الموقع

## User preferences

- قاعدة البيانات مدمجة (SQLite) لتكون محمولة مع المشروع
- جميع صفحات لوحة التحكم مكتملة

## Gotchas

- `better-sqlite3` is a native module — it must be in `onlyBuiltDependencies` in `pnpm-workspace.yaml` and listed as a direct dependency in both `lib/db/package.json` and `artifacts/api-server/package.json`.
- The DB file path is resolved relative to `lib/db/src/index.ts` (not `process.cwd()`), so it always lands at `data/sabaik.db` in the workspace root regardless of which package runs the server.
- Drizzle `text({ mode: 'json' })` is used for SQLite JSON columns (was `jsonb` in PostgreSQL).
- Admin auth is currently hardcoded in `Login.tsx` (`admin`/`sabaik2024`) — not DB-backed.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
