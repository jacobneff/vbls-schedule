# VBLS Schedule – Agent Handbook

## Mission Snapshot
- **Objective:** Build the VBLS Lifeguard Scheduling & Muster platform that automates weekly scheduling, simplifies day-of operations, and preserves an auditable history.
- **Core Users:** Guards, Supervisors (Captains/Lieutenants), Admin/Boss.
- **Key Outcomes:** Weekly schedules honoring seniority & preferences, smooth muster/trade workflows, reliable reporting, and familiar exports (PDF/Excel) with an excellent mobile UI.

## Architecture Baseline
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind + TanStack Query. PWA-first with offline support for the supervisor board and camera access for QR scans.
- **Backend:** Next.js API routes or dedicated Express service (Node 20+), Prisma ORM, PostgreSQL (Supabase/Neon).
- **Realtime:** Supabase Realtime or Pusher for live updates (assignments, muster, trades).
- **Exports:** SheetJS for Excel, `@react-pdf/renderer` or PDFKit for PDFs.
- **Infra:** Vercel (web/API) + Supabase (auth/db/realtime) as default; alternatives (Fly.io, Render) acceptable if justified.
- **Telemetry:** Sentry for errors; Logtail/Datadog for logs.

## Working Agreements
- **Planning:** For non-trivial work, outline steps with the plan tool (minimum two steps, update after progress) unless the task is clearly straightforward.
- **Edits:** Prefer `apply_patch` for targeted changes; keep files ASCII unless necessary. Do not revert user-authored changes.
- **Testing:** Add or run tests when meaningful; document skipped test coverage.
- **Approvals:** Current harness mode: `workspace-write`, network restricted, `approval_policy=on-request`. Request escalation via `with_escalated_permissions` only when unavoidable.
- **Comments:** Only add code comments when they clarify complex logic or domain nuances.
- **Docs:** Update `README.md` (progress tracker) and any relevant specs when scope shifts or new constraints emerge.

## Repo Structure (initial)
- Root `package.json` uses npm workspaces; primary web app lives in `apps/web`.
- Prisma schema and seeds live under `/prisma`; database defaults to Postgres (see `docker-compose.yml`).
- Shared developer config: `.env.example`, `.prettierrc.json`, `.gitignore`.
- `/apps/web/src/app/admin` currently surfaces stand CRUD: Prisma-backed list + create form via server actions to accelerate M0 progress.

## Domain Highlights
- **Zones & Stands:** Croatan, Resort (South/Middle/North), 57th Street; some stands disallow AS shifts.
- **Shift Types:** `REG`, `REL`, `AS`, `FM`, `MR_AS`, `OFF` with specific muster/start times and constraints.
- **Scheduling Rules:** Enforce “ALWAYS OFF”, honor availability/preference where feasible, seed hotspots with senior guards, manage REL ratios, avoid FM unless requested, maintain MR-AS ≈ 1/week/guard.
- **Day-Of Operations:** QR + geofence muster, drag-drop board for reassignment, no-show handling, trade approvals.
- **History & Audit:** Every assignment/trade/change must be recorded with actor + timestamp.

## Milestone Guide
1. **M0 – Data/Admin:** Auth, seniority import, stands/zones CRUD.
2. **M1 – Availability:** In-app submission & parser, guard week view.
3. **M2 – Scheduler v1:** Hard constraints, MR-AS cap, exports.
4. **M3 – Muster:** QR/geofence check-in, supervisor board.
5. **M4 – Trades & History:** Trade workflow, audit trails, reporting.
6. **M5 – Hotspot Bias:** Admin hotspot flags, analytics.

## Collaboration Checklist
- Sync with `README.md` roadmap before starting work.
- Capture assumptions and open questions in commits or docs.
- Surface blockers early; note required approvals or sandbox limitations.
- Ensure outputs (exports, mobile views) stay aligned with guard expectations.

Stay aligned with the mission: reduce manual workload, retain flexibility, keep the beach safe.
