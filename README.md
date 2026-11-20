# EAM Manager

Electrical & Automation Department Management System for industrial operations.

## Stack

Next.js 14, React 18, TypeScript, Tailwind CSS, Supabase PostgreSQL/Auth/Storage, deployable on Vercel.

## Development status

- Phase 1 foundation: sign-in, protected workspace, database migrations, dashboard counts, equipment register create/read/archive baseline.
- Phase 2 foundation: breakdown intake and automatic corrective work-order generation.
- Phase 3 database foundations added for inspections, calibration, preventive maintenance, inventory, safety incidents, projects, and manual KPIs. These do not yet constitute complete user-facing workflows.

See [setup](docs/SETUP.md), [Vercel deployment](docs/VERCEL.md), and [operational module scope](docs/OPERATIONAL_MODULES.md). Configure environment values using `.env.example`; do not commit secrets.
