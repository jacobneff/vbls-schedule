# VBLS Lifeguard Scheduling & Muster System

## Project Overview
The goal is to deliver an end-to-end scheduling and day-of operations platform for VBLS that automates weekly scheduling, supports real-time muster and reassignments, preserves audit history, and ships in formats that guards and supervisors already trust (PDF/Excel + mobile UI). See `AGENTS.MD` for the full domain briefing and architecture baseline.

## Implementation Progress
- ✅ Repository initialized with project documentation (`README.md`, `AGENTS.MD`).
- ✅ Next.js App Router project scaffolded under `apps/web` with Tailwind, ESLint, Prettier, Vitest, and initial landing UI.
- ✅ Prisma schema drafted with VBLS domain models plus Postgres & seed scaffolding (`prisma/schema.prisma`, `docker-compose.yml`, `.env.example`).
- ✅ Admin console now lists stands from Prisma and supports creating new stands via server actions/API (`/admin`).
- ⬜️ Runtime dependencies still need to be installed locally (`npm install`) and migrations generated.
- ⬜️ External services (Supabase/Neon, Pusher, Sentry) not yet configured.

## Roadmap Snapshot
| Milestone | Scope Highlights | Status |
|-----------|-----------------|--------|
| **M0 – Data & Admin** | Auth, seniority import, stands/zones CRUD UI, admin rule toggles. | In progress (schema + stands CRUD) |
| **M1 – Availability & Parser** | Guard availability submission, legacy text parser, guard schedule view. | Not started |
| **M2 – Scheduler v1** | Weekly auto-scheduler with hard constraints, REL ratios, AS pattern, MR-AS cap, Excel/PDF export. | Not started |
| **M3 – Muster** | QR + geofence check-in, supervisor drag-drop board, extras/no-shows handling. | Not started |
| **M4 – Trades & History** | Trade workflow with approvals, full assignment audit trail, reporting. | Not started |
| **M5 – Hotspot Bias** | Admin hotspot controls, scheduling biasing, analytics. | Not started |

## Immediate Next Steps
1. Ensure dependencies are installed (`npm install`), then rerun `npm run typecheck --workspace web` and `npm run test --workspace web`.
2. Implement Prisma migrations plus seed data to stand up sample stands/zones, seniority roster, and baseline admin user.
3. Build authentication + role guard scaffolding (Supabase Auth or Clerk) and wire a protected admin console shell.
4. Extend admin tooling for seniority management and rule toggles (completing M0 scope).

## Workspace Layout
- `apps/web` — Next.js App Router frontend + API routes, Tailwind, Vitest setup.
- `prisma` — Prisma schema and future seed scripts for VBLS domain.
- `.env.example` — Local environment template; copy to `.env` and adjust secrets.
- `docker-compose.yml` — Local Postgres instance (`postgres:15-alpine`) for development.

## Local Development (once Node toolchain is installed)
1. `cp .env.example .env`
2. `docker compose up -d` (start Postgres)
3. `npm install`
4. `npm run prisma:push --workspace web` (or `npm run prisma:migrate --workspace web` once migrations exist)
5. `npm run db:seed --workspace web`
6. `npm run dev`

Supporting scripts: `npm run lint --workspace web`, `npm run test --workspace web`, `npm run typecheck --workspace web`.

> Sandbox note: if Docker or local Postgres cannot open sockets in your environment, point `DATABASE_URL` at an external Postgres instance (host machine, Supabase, etc.) before running Prisma commands.

## Backlog & Open Questions
- Deployment target confirmation: Vercel + Supabase vs. single Fly.io deployment?
- Preferred auth provider (Supabase Auth vs. Clerk) and MFA expectations for supervisors/admins.
- Geo-fencing parameters: initial polygon source and override workflow.
- Export fidelity requirements: match legacy spreadsheet exactly or acceptable to improve layout?
- Incident ingestion: any roadmap for Watchtower integration beyond manual hotspot flags?

## Change Log
- **2025-11-03:** Kick-off documentation created; mission, architecture, and milestone plan captured.
- **2025-11-03:** Added Next.js scaffold, tooling, Prisma schema, and local Postgres/docker templates.
- **2025-11-03:** Implemented stand management server action, API endpoint, and admin UI listing.
