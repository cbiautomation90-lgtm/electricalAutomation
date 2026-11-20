-- Enable required extensions
create extension if not exists pgcrypto;

create type public.asset_status as enum ('operational', 'maintenance', 'out_of_service', 'inactive');
create type public.asset_criticality as enum ('low', 'medium', 'high', 'critical');
create type public.app_role as enum ('department_head', 'electrical_engineer', 'automation_engineer', 'technician', 'storekeeper', 'production_operator');

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plants (
  id uuid primary key default gen_random_uuid(),
  department_id uuid references public.departments(id),
  name text not null,
  code text not null unique,
  location text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.areas (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.plants(id) on delete restrict,
  name text not null,
  code text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plant_id, code)
);

create table public.production_systems (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references public.areas(id) on delete restrict,
  name text not null,
  code text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (area_id, code)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  employee_number text unique,
  full_name text not null,
  email text,
  department_id uuid references public.departments(id),
  employment_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  primary key (user_id, role)
);

create table public.asset_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique,
  active boolean not null default true
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  asset_number text not null unique,
  tag text not null unique,
  description text not null,
  plant_id uuid not null references public.plants(id) on delete restrict,
  area_id uuid references public.areas(id) on delete restrict,
  system_id uuid references public.production_systems(id) on delete restrict,
  category_id uuid references public.asset_categories(id) on delete restrict,
  manufacturer text,
  model text,
  serial_number text,
  voltage numeric,
  current numeric,
  power_rating numeric,
  frequency numeric,
  installation_date date,
  criticality public.asset_criticality not null default 'medium',
  status public.asset_status not null default 'operational',
  responsible_engineer_id uuid references public.profiles(id),
  technical_specifications jsonb not null default '{}'::jsonb,
  photograph_url text,
  archived_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.asset_components (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete restrict,
  component_tag text not null,
  description text not null,
  manufacturer text,
  model text,
  serial_number text,
  status public.asset_status not null default 'operational',
  created_at timestamptz not null default now(),
  unique (asset_id, component_tag)
);

create table public.asset_history (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete restrict,
  action text not null,
  change_data jsonb not null default '{}'::jsonb,
  performed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

create index assets_tag_idx on public.assets(tag);
create index assets_plant_idx on public.assets(plant_id);
create index assets_area_idx on public.assets(area_id);
create index assets_status_idx on public.assets(status);
create index asset_history_asset_idx on public.asset_history(asset_id, created_at desc);
