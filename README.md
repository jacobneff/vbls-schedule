# VBLS Lifeguard Scheduling & Muster System

## Project Overview
The goal is to deliver an end-to-end scheduling and day-of operations platform for VBLS that automates weekly scheduling, supports real-time muster and reassignments, preserves audit history, and ships in formats that guards and supervisors already trust (PDF/Excel + mobile UI). See `AGENTS.MD` for the full domain briefing and architecture baseline.

## Implementation Progress
- ✅ Repository initialized with project documentation (`README.md`, `AGENTS.MD`).
- ⬜️ Codebase, tooling, and project scaffolding still to be created (Next.js app, Prisma schema, testing harness, etc.).
- ⬜️ No environments or integrations configured yet (Supabase/Neon, Pusher, Sentry).

## Roadmap Snapshot
| Milestone | Scope Highlights | Status |
|-----------|-----------------|--------|
| **M0 – Data & Admin** | Auth, seniority import, stands/zones CRUD UI, admin rule toggles. | Not started |
| **M1 – Availability & Parser** | Guard availability submission, legacy text parser, guard schedule view. | Not started |
| **M2 – Scheduler v1** | Weekly auto-scheduler with hard constraints, REL ratios, AS pattern, MR-AS cap, Excel/PDF export. | Not started |
| **M3 – Muster** | QR + geofence check-in, supervisor drag-drop board, extras/no-shows handling. | Not started |
| **M4 – Trades & History** | Trade workflow with approvals, full assignment audit trail, reporting. | Not started |
| **M5 – Hotspot Bias** | Admin hotspot controls, scheduling biasing, analytics. | Not started |

## Immediate Next Steps
1. Establish monorepo or single-app structure (e.g., Next.js with Turborepo or standalone) and configure base tooling (TypeScript, ESLint, Prettier, Tailwind, testing framework).
2. Define initial Prisma schema aligned with the domain model (Users, Stands, DailyPlan, Assignment, Availability, Trade).
3. Stand up database connection layer (local Postgres + Supabase-ready config) and seed scripts for sample data/seniority import.
4. Implement basic admin UI to manage stands/zones and seniority lists (Milestone M0 foundation).

## Backlog & Open Questions
- Deployment target confirmation: Vercel + Supabase vs. single Fly.io deployment?
- Preferred auth provider (Supabase Auth vs. Clerk) and MFA expectations for supervisors/admins.
- Geo-fencing parameters: initial polygon source and override workflow.
- Export fidelity requirements: match legacy spreadsheet exactly or acceptable to improve layout?
- Incident ingestion: any roadmap for Watchtower integration beyond manual hotspot flags?

## Change Log
- **2025-11-03:** Kick-off documentation created; mission, architecture, and milestone plan captured.
