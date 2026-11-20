-- Phase 3: operational module data foundations.
-- All tables are department-scoped through the existing is_department_user() RLS helper.

create table public.inspection_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  discipline text not null check (discipline in ('electrical','automation','instrumentation','general')),
  interval_days integer check (interval_days is null or interval_days > 0),
  checklist jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inspection_records (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.inspection_templates(id) on delete set null,
  asset_id uuid not null references public.assets(id) on delete restrict,
  inspector_id uuid not null references public.profiles(id),
  inspected_at timestamptz not null default now(),
  result text not null check (result in ('passed','failed','follow_up')),
  checklist_results jsonb not null default '[]'::jsonb,
  findings text,
  follow_up_work_order_id uuid references public.work_orders(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.calibration_equipment (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references public.assets(id) on delete set null,
  equipment_number text not null unique,
  name text not null,
  manufacturer text,
  model text,
  serial_number text,
  calibration_interval_days integer not null check (calibration_interval_days > 0),
  last_calibrated_at date,
  next_calibration_due date,
  status text not null default 'in_service' check (status in ('in_service','due','overdue','out_of_service')),
  certificate_reference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.calibration_events (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references public.calibration_equipment(id) on delete restrict,
  calibrated_at date not null,
  due_at date not null,
  result text not null check (result in ('passed','failed','limited_use')),
  provider text,
  certificate_reference text,
  notes text,
  recorded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.preventive_maintenance_plans (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete restrict,
  title text not null,
  description text,
  interval_days integer not null check (interval_days > 0),
  next_due_at date not null,
  estimated_duration_minutes integer check (estimated_duration_minutes is null or estimated_duration_minutes > 0),
  instructions jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.preventive_maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.preventive_maintenance_plans(id) on delete restrict,
  work_order_id uuid references public.work_orders(id) on delete set null,
  due_at date not null,
  completed_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled','in_progress','completed','overdue','cancelled')),
  completion_notes text,
  completed_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (plan_id, due_at)
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  item_number text not null unique,
  name text not null,
  description text,
  category text,
  unit text not null default 'each',
  quantity_on_hand numeric(14,3) not null default 0 check (quantity_on_hand >= 0),
  reorder_level numeric(14,3) not null default 0 check (reorder_level >= 0),
  unit_cost numeric(14,2) check (unit_cost is null or unit_cost >= 0),
  location text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.inventory_items(id) on delete restrict,
  transaction_type text not null check (transaction_type in ('receipt','issue','adjustment','return')),
  quantity numeric(14,3) not null check (quantity > 0),
  reference text,
  work_order_id uuid references public.work_orders(id) on delete set null,
  notes text,
  performed_by uuid references public.profiles(id),
  performed_at timestamptz not null default now()
);

create table public.safety_incidents (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  reported_by uuid not null references public.profiles(id),
  reported_at timestamptz not null default now(),
  incident_at timestamptz,
  location text,
  severity text not null check (severity in ('near_miss','minor','moderate','major','critical')),
  status text not null default 'reported' check (status in ('reported','investigating','actions_open','closed')),
  description text not null,
  immediate_action text,
  investigation_findings text,
  corrective_actions jsonb not null default '[]'::jsonb,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  project_number text not null unique,
  name text not null,
  description text,
  owner_id uuid references public.profiles(id),
  status text not null default 'planned' check (status in ('planned','active','on_hold','completed','cancelled')),
  priority text not null default 'medium' check (priority in ('low','medium','high','critical')),
  start_date date,
  target_date date,
  completed_at timestamptz,
  budget numeric(14,2) check (budget is null or budget >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (target_date is null or start_date is null or target_date >= start_date)
);

create table public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  title text not null,
  description text,
  assignee_id uuid references public.profiles(id),
  status text not null default 'not_started' check (status in ('not_started','in_progress','blocked','completed','cancelled')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.manual_kpi_entries (
  id uuid primary key default gen_random_uuid(),
  metric_name text not null,
  period_start date not null,
  period_end date not null,
  value numeric(16,4) not null,
  unit text not null,
  target numeric(16,4),
  notes text,
  entered_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  check (period_end >= period_start),
  unique (metric_name, period_start, period_end)
);

create index inspection_records_asset_time_idx on public.inspection_records(asset_id, inspected_at desc);
create index calibration_due_idx on public.calibration_equipment(next_calibration_due) where status <> 'out_of_service';
create index pm_plans_due_idx on public.preventive_maintenance_plans(next_due_at) where active;
create index pm_tasks_due_idx on public.preventive_maintenance_tasks(status, due_at);
create index inventory_low_stock_idx on public.inventory_items(quantity_on_hand, reorder_level) where active;
create index inventory_transactions_item_time_idx on public.inventory_transactions(item_id, performed_at desc);
create index safety_incidents_status_time_idx on public.safety_incidents(status, reported_at desc);
create index project_tasks_project_status_idx on public.project_tasks(project_id, status);
create index manual_kpi_period_idx on public.manual_kpi_entries(metric_name, period_start desc);

-- Restrict table access to authenticated department members; writes are scoped
-- to members of the relevant operational role set.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'inspection_templates', 'inspection_records', 'calibration_equipment',
    'calibration_events', 'preventive_maintenance_plans',
    'preventive_maintenance_tasks', 'inventory_items', 'inventory_transactions',
    'safety_incidents', 'projects', 'project_tasks', 'manual_kpi_entries'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format(
      'create policy %I on public.%I for select using (public.is_department_user())',
      table_name || '_department_read', table_name
    );
    execute format(
      'create policy %I on public.%I for all using (public.has_role(''department_head'') or public.has_role(''electrical_engineer'') or public.has_role(''automation_engineer'') or public.has_role(''technician'') or public.has_role(''storekeeper'')) with check (public.has_role(''department_head'') or public.has_role(''electrical_engineer'') or public.has_role(''automation_engineer'') or public.has_role(''technician'') or public.has_role(''storekeeper''))',
      table_name || '_operational_write', table_name
    );
  end loop;
end $$;
