# Operational module data foundations

This change adds the initial relational data model for the Phase 3 operational modules:

- **Inspections:** reusable checklist templates and asset inspection records, including follow-up work-order linkage.
- **Calibration:** equipment register, calibration due dates, results, and certificate references.
- **Preventive maintenance:** recurring asset plans and scheduled/completed tasks, with optional corrective work-order linkage.
- **Inventory:** stock items, reorder thresholds, and traceable receipt/issue/return/adjustment transactions.
- **Safety:** incident reporting, investigation status, and corrective-action data.
- **Projects:** project register and assigned, due-dated tasks.
- **KPIs:** manual period-based metric entries with optional targets.

## Applying the migration

Apply `supabase/migrations/202611200004_operational_modules.sql` after the three Phase 1/2 migrations using Supabase CLI (`supabase db push`) or the Supabase SQL editor. The migration uses the existing `public.profiles`, `public.assets`, `public.work_orders`, `public.is_department_user()`, and `public.has_role()` objects.

Tables have RLS enabled. Department members can read records; department heads, engineers, technicians, and storekeepers can write them. Validate these role grants against local operating procedures before production rollout.

## Scope

This is the database foundation for the modules, not a claim that every end-user workflow, approval, report, or integration is complete. UI forms, audit trails for module-specific changes, inventory balance posting/locking, scheduled PM generation, calibration reminders, and production-grade KPI/reporting workflows remain follow-up work. Apply to a staging Supabase project and run the project's typecheck, lint, test, and production build before deployment.
