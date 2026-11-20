-- Provision a profile and baseline role for every new auth user.
-- The very first account becomes department_head so the department can bootstrap itself;
-- later self sign-ups receive the least-privileged production_operator role.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first_user boolean;
begin
  perform pg_advisory_xact_lock(hashtext('public.handle_new_auth_user'));
  select not exists (select 1 from public.profiles) into is_first_user;

  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, case when is_first_user then 'department_head'::public.app_role else 'production_operator'::public.app_role end)
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create policy "users update own profile" on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());

create policy "department head manages roles" on public.user_roles
for all using (public.has_role('department_head')) with check (public.has_role('department_head'));
