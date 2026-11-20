-- Phase 2: breakdown intake and corrective work orders
create type public.breakdown_priority as enum ('emergency', 'critical', 'high', 'medium', 'low');
create type public.work_order_status as enum ('open', 'assigned', 'in_progress', 'repair_completed', 'tested', 'verified', 'closed', 'cancelled');

create sequence public.breakdown_reference_seq;
create sequence public.work_order_reference_seq;

create table public.breakdown_reports (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  asset_id uuid not null references public.assets(id) on delete restrict,
  reported_by uuid not null references public.profiles(id),
  reported_at timestamptz not null default now(),
  failure_at timestamptz,
  fault_description text not null,
  fault_category text,
  priority public.breakdown_priority not null default 'medium',
  production_impact text,
  safety_impact boolean not null default false,
  initial_observations text,
  status text not null default 'reported' check (status in ('reported','reviewed','work_order_created','resolved','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.work_orders (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  breakdown_id uuid unique references public.breakdown_reports(id) on delete restrict,
  asset_id uuid not null references public.assets(id) on delete restrict,
  title text not null,
  description text not null,
  priority public.breakdown_priority not null default 'medium',
  status public.work_order_status not null default 'open',
  reported_at timestamptz not null default now(),
  actual_failure_at timestamptz,
  work_started_at timestamptz,
  repair_completed_at timestamptz,
  restored_at timestamptz,
  downtime_minutes integer check (downtime_minutes is null or downtime_minutes >= 0),
  root_cause text,
  corrective_action text,
  verification_results text,
  created_by uuid references public.profiles(id),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.work_assignments (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete restrict,
  assignee_id uuid not null references public.profiles(id) on delete restrict,
  assigned_by uuid not null references public.profiles(id),
  assigned_at timestamptz not null default now(),
  unassigned_at timestamptz,
  notes text
);

create table public.work_order_events (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete restrict,
  actor_id uuid references public.profiles(id),
  event_type text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.work_order_approvals (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete restrict,
  approver_id uuid not null references public.profiles(id),
  decision text not null check (decision in ('approved','rejected')),
  comments text,
  decided_at timestamptz not null default now()
);

create index breakdown_asset_time_idx on public.breakdown_reports(asset_id, reported_at desc);
create index breakdown_priority_status_idx on public.breakdown_reports(priority, status);
create index work_orders_status_priority_idx on public.work_orders(status, priority);
create index work_orders_asset_idx on public.work_orders(asset_id, created_at desc);
create index work_assignments_assignee_idx on public.work_assignments(assignee_id, work_order_id) where unassigned_at is null;

create or replace function public.create_breakdown_work_order()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  new_work_order_id uuid;
  work_number text;
begin
  work_number := 'WO-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.work_order_reference_seq')::text, 6, '0');
  insert into public.work_orders(reference_number, breakdown_id, asset_id, title, description, priority, reported_at, actual_failure_at, created_by)
  values (work_number, new.id, new.asset_id, 'Breakdown: ' || new.fault_description, new.fault_description, new.priority, new.reported_at, new.failure_at, new.reported_by)
  returning id into new_work_order_id;
  update public.breakdown_reports set status = 'work_order_created' where id = new.id;
  insert into public.work_order_events(work_order_id, actor_id, event_type, details)
  values (new_work_order_id, new.reported_by, 'work_order_generated', jsonb_build_object('breakdown_reference', new.reference_number));
  return new;
end;
$$;

create or replace function public.assign_breakdown_reference()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.reference_number is null or new.reference_number = '' then
    new.reference_number := 'BRK-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.breakdown_reference_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

create trigger breakdown_reference_before_insert before insert on public.breakdown_reports
for each row execute function public.assign_breakdown_reference();
create trigger breakdown_create_work_order after insert on public.breakdown_reports
for each row execute function public.create_breakdown_work_order();

alter table public.breakdown_reports enable row level security;
alter table public.work_orders enable row level security;
alter table public.work_assignments enable row level security;
alter table public.work_order_events enable row level security;
alter table public.work_order_approvals enable row level security;

create policy "department reads breakdowns" on public.breakdown_reports for select using (public.is_department_user());
create policy "department reports breakdowns" on public.breakdown_reports for insert with check (
  reported_by = auth.uid() and public.is_department_user()
);
create policy "engineers review breakdowns" on public.breakdown_reports for update using (
  public.has_role('department_head') or public.has_role('electrical_engineer') or public.has_role('automation_engineer')
) with check (
  public.has_role('department_head') or public.has_role('electrical_engineer') or public.has_role('automation_engineer')
);

create policy "department reads work orders" on public.work_orders for select using (public.is_department_user());
create policy "engineers manage work orders" on public.work_orders for all using (
  public.has_role('department_head') or public.has_role('electrical_engineer') or public.has_role('automation_engineer')
) with check (
  public.has_role('department_head') or public.has_role('electrical_engineer') or public.has_role('automation_engineer')
);
create policy "assigned technicians update work orders" on public.work_orders for update using (
  public.has_role('technician') and exists (
    select 1 from public.work_assignments wa where wa.work_order_id = id and wa.assignee_id = auth.uid() and wa.unassigned_at is null
  )
) with check (public.has_role('technician'));

create policy "department reads assignments" on public.work_assignments for select using (public.is_department_user());
create policy "engineers manage assignments" on public.work_assignments for all using (
  public.has_role('department_head') or public.has_role('electrical_engineer') or public.has_role('automation_engineer')
) with check (
  public.has_role('department_head') or public.has_role('electrical_engineer') or public.has_role('automation_engineer')
);
create policy "department reads work events" on public.work_order_events for select using (public.is_department_user());
create policy "department records work events" on public.work_order_events for insert with check (
  actor_id = auth.uid() and public.is_department_user()
);
create policy "department reads approvals" on public.work_order_approvals for select using (public.is_department_user());
create policy "heads approve work orders" on public.work_order_approvals for insert with check (
  approver_id = auth.uid() and public.has_role('department_head')
);
