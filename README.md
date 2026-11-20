# EAM Manager

Electrical & Automation Department Management System for industrial operations.

## Stack

Next.js 14, React 18, TypeScript, Tailwind CSS, Supabase PostgreSQL/Auth/Storage, deployable on Vercel.

## Development status

- Phase 1 foundation: sign-in, protected workspace, database migrations, dashboard counts, equipment register create/read/archive baseline.
- Phase 2 foundation: breakdown intake and automatic corrective work-order generation.
- Phase 3 operational foundations and database-backed workflows: inspections, calibration records, preventive-maintenance plans, inventory and stock movements, safety incident investigations, projects and tasks, manual KPIs, and operational snapshots.
- Remaining production readiness work: execute migrations and automated checks in staging; review access control, audit requirements, report definitions, and operational procedures before production.

See [setup](docs/SETUP.md), [Vercel deployment](docs/VERCEL.md), [operational module scope](docs/OPERATIONAL_MODULES.md), and [workflow notes](docs/WORKFLOW_COMPLETION.md). Configure environment values using `.env.example`; do not commit secrets.
