alter table public.departments enable row level security;
alter table public.plants enable row level security;
alter table public.areas enable row level security;
alter table public.production_systems enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.asset_categories enable row level security;
alter table public.assets enable row level security;
alter table public.asset_components enable row level security;
alter table public.asset_history enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.has_role(required_role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = required_role
  );
$$;

create or replace function public.is_department_user()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
  );
$$;

create policy "department users can read organization" on public.departments for select using (public.is_department_user());
create policy "department users can read plants" on public.plants for select using (public.is_department_user());
create policy "department users can read areas" on public.areas for select using (public.is_department_user());
create policy "department users can read systems" on public.production_systems for select using (public.is_department_user());
create policy "department users can read profiles" on public.profiles for select using (id = auth.uid() or public.has_role('department_head'));
create policy "department head reads roles" on public.user_roles for select using (public.has_role('department_head') or user_id = auth.uid());
create policy "department users read categories" on public.asset_categories for select using (public.is_department_user());
create policy "department users read assets" on public.assets for select using (public.is_department_user());
create policy "engineers manage assets" on public.assets for all using (
  public.has_role('department_head') or public.has_role('electrical_engineer') or public.has_role('automation_engineer')
) with check (
  public.has_role('department_head') or public.has_role('electrical_engineer') or public.has_role('automation_engineer')
);
create policy "department users read components" on public.asset_components for select using (public.is_department_user());
create policy "engineers manage components" on public.asset_components for all using (
  public.has_role('department_head') or public.has_role('electrical_engineer') or public.has_role('automation_engineer')
) with check (
  public.has_role('department_head') or public.has_role('electrical_engineer') or public.has_role('automation_engineer')
);
create policy "department users read history" on public.asset_history for select using (public.is_department_user());
create policy "users read own audit and heads read all" on public.audit_logs for select using (
  actor_id = auth.uid() or public.has_role('department_head')
);
