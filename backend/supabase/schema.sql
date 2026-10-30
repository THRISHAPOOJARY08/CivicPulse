-- ==============================================================================
-- CivicPulse — PostgreSQL Database Schema for Supabase
-- Version: 1.0 (Milestone 7 Migration Foundation)
-- 
-- IMPORTANT SECURITY ARCHITECTURE NOTE:
-- Backend operations performed using the service_role key (`SUPABASE_SERVICE_ROLE_KEY`)
-- bypass PostgreSQL Row Level Security (RLS). Therefore, backend Express controllers
-- and middleware MUST continue performing explicit authorization checks (`requireAuth`,
-- `requireAdmin`) before executing database queries or modifications.
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 1. USERS TABLE
-- Synchronized with Supabase Auth (auth.users).
-- Stores user display profile and authoritative application roles.
-- ==============================================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text default '',
  role text not null default 'citizen' check (role in ('citizen', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for role-based queries and lookups
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_role on public.users(role);

-- ==============================================================================
-- 2. COMPLAINTS TABLE
-- Core civic complaint records with AI analysis and status history.
-- ==============================================================================
create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null check (char_length(title) > 0 and char_length(title) <= 120),
  description text not null check (char_length(description) > 0 and char_length(description) <= 1000),
  category text not null check (
    category in (
      'Roads and Potholes',
      'Garbage and Waste Management',
      'Water Supply',
      'Drainage and Sewage',
      'Streetlights and Electricity',
      'Public Sanitation',
      'Public Infrastructure',
      'Other'
    )
  ),
  ai_summary text default '',
  ai_keywords jsonb not null default '[]'::jsonb,
  ai_status text not null default 'pending' check (
    ai_status in ('pending', 'completed', 'unavailable', 'failed')
  ),
  priority text not null default 'Medium' check (
    priority in ('Low', 'Medium', 'High', 'Critical')
  ),
  priority_score integer not null default 25 check (
    priority_score >= 0 and priority_score <= 100
  ),
  priority_reasons jsonb not null default '[]'::jsonb,
  suggested_department text not null default 'General Municipal Administration',
  status text not null default 'Submitted' check (
    status in (
      'Submitted',
      'Under Review',
      'Assigned',
      'In Progress',
      'Resolved',
      'Rejected'
    )
  ),
  latitude numeric(9,6) not null check (latitude >= -90.0 and latitude <= 90.0),
  longitude numeric(9,6) not null check (longitude >= -180.0 and longitude <= 180.0),
  location_description text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status_history jsonb not null default '[]'::jsonb
);

-- Indexes for frequent queries (citizen listing, status filtering, geographic scans)
create index if not exists idx_complaints_user_id on public.complaints(user_id);
create index if not exists idx_complaints_created_at on public.complaints(created_at desc);
create index if not exists idx_complaints_status on public.complaints(status);
create index if not exists idx_complaints_category on public.complaints(category);
create index if not exists idx_complaints_priority on public.complaints(priority);

-- ==============================================================================
-- 3. DUPLICATE CANDIDATES TABLE
-- Ephemeral heuristic matches detected within 300 meters and 30-day window.
-- ==============================================================================
create table if not exists public.duplicate_candidates (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  candidate_complaint_id uuid not null references public.complaints(id) on delete cascade,
  similarity_score integer not null check (similarity_score >= 0 and similarity_score <= 100),
  distance_meters numeric(10,2) not null check (distance_meters >= 0),
  reasons jsonb not null default '[]'::jsonb,
  reviewed boolean not null default false,
  created_at timestamptz not null default now(),
  constraint unique_duplicate_pair unique (complaint_id, candidate_complaint_id)
);

create index if not exists idx_duplicate_candidates_complaint_id on public.duplicate_candidates(complaint_id);
create index if not exists idx_duplicate_candidates_candidate_id on public.duplicate_candidates(candidate_complaint_id);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.users enable row level security;
alter table public.complaints enable row level security;
alter table public.duplicate_candidates enable row level security;

-- Helper function to check if the authenticated user has the 'admin' role
-- Uses explicit search_path to prevent security-definer hijacking
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 4.1 USERS RLS POLICIES
-- Anyone authenticated can view their own profile; admins can view all profiles
create policy "Users can view own profile"
  on public.users for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

-- Users can update their own full_name, but NEVER their own role!
-- Role must remain 'citizen' unless the caller is already an admin
create policy "Users can update own non-role fields"
  on public.users for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id and (
      public.is_admin() or role = 'citizen'
    )
  );

-- 4.2 COMPLAINTS RLS POLICIES
-- Citizens can read their own complaints; Admins can read all complaints
create policy "Users can read own complaints, admins read all"
  on public.complaints for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

-- Citizens can insert complaints with their own user_id
create policy "Users can submit own complaints"
  on public.complaints for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Only Admins can update complaint status and administrative fields directly via client
create policy "Admins can update complaints"
  on public.complaints for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4.3 DUPLICATE CANDIDATES RLS POLICIES
-- Users can view duplicate matches involving their complaints; Admins can view all
create policy "Users can view their complaint duplicates"
  on public.duplicate_candidates for select
  to authenticated
  using (
    public.is_admin() or
    exists (
      select 1 from public.complaints
      where id = public.duplicate_candidates.complaint_id and user_id = auth.uid()
    )
  );

-- ==============================================================================
-- 5. AUTOMATIC USER PROFILE TRIGGER
-- Auto-creates a public.users row upon Supabase Auth user registration.
-- Default role is always 'citizen'. Admin role must be granted via trusted script.
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'citizen'
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = case when excluded.full_name <> '' then excluded.full_name else public.users.full_name end,
      updated_at = now();
  return new;
end;
$$;

-- Trigger firing after a new user confirms / signs up via Supabase Auth
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger for auto-updating updated_at timestamp on record changes
-- Uses SET search_path to prevent search-path hijacking without requiring security-definer elevation
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_complaints_updated_at on public.complaints;
create trigger set_complaints_updated_at
  before update on public.complaints
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
  before update on public.users
  for each row execute procedure public.handle_updated_at();
