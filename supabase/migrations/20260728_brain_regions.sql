/** @format */

-- ============================================================
-- Brain Regions — admin-driven mesh-to-content mapping for the
-- interactive 3D brain on the "Explore the mind" section (/stats).
-- Run this once in the Supabase SQL editor.
--
-- Design notes:
--   * `brain_regions` is intentionally FLAT (no parent_id/tree) —
--     each row maps one GLB mesh name to one content card. This
--     differs from `skill_nodes`, which stays untouched and unused
--     by the public brain going forward.
--   * `mesh_name` must exactly match a node/mesh name inside the
--     currently-active GLB (see `brain_model` below). The admin's
--     "sync mesh names" action keeps this in step after a GLB swap.
--   * `brain_model` is a single-row table (id is pinned to 1) that
--     points at whichever GLB is currently live in the `nngtw-assets`
--     bucket, so the model can be replaced from nngtw-admin without
--     any frontend code change — the public site always reads this
--     row for the current storage path.
--   * Rows below are seeded directly from the real mesh names found
--     in the initial GLB export (60 meshes), active by default with
--     `title = mesh_name` as a placeholder, so every mesh is clickable
--     immediately — curate the titles/descriptions in nngtw-admin
--     (Portfolio → Brain Regions), and deactivate any mesh that
--     shouldn't be its own region. Note that rows created later by the
--     admin's "Sync mesh names" action start *inactive* instead, since
--     by then the curated set is the norm and a new mesh is the exception.
-- ============================================================

create table if not exists public.brain_regions (
  id uuid primary key default gen_random_uuid(),
  mesh_name text not null unique,
  title text not null,
  subtitle text,
  description text,
  icon text,
  color text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists brain_regions_display_order_idx on public.brain_regions(display_order);
create index if not exists brain_regions_is_active_idx on public.brain_regions(is_active);

create table if not exists public.brain_model (
  id smallint primary key default 1 check (id = 1),
  storage_path text not null,
  updated_at timestamptz not null default now()
);

-- keep updated_at current on every edit
create or replace function public.set_brain_regions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists brain_regions_set_updated_at on public.brain_regions;
create trigger brain_regions_set_updated_at
  before update on public.brain_regions
  for each row execute function public.set_brain_regions_updated_at();

drop trigger if exists brain_model_set_updated_at on public.brain_model;
create trigger brain_model_set_updated_at
  before update on public.brain_model
  for each row execute function public.set_brain_regions_updated_at();

-- RLS: matches this project's existing CMS tables (see skill_nodes) —
-- the anon key is used directly from the admin UI, gated by the admin
-- login cookie rather than table-level auth.
alter table public.brain_regions enable row level security;
alter table public.brain_model enable row level security;

drop policy if exists "brain_regions_public_all" on public.brain_regions;
create policy "brain_regions_public_all" on public.brain_regions
  for all using (true) with check (true);

drop policy if exists "brain_model_public_all" on public.brain_model;
create policy "brain_model_public_all" on public.brain_model
  for all using (true) with check (true);

-- ------------------------------------------------------------
-- Seed: the GLB already uploaded to the nngtw-assets bucket.
-- ------------------------------------------------------------
insert into public.brain_model (id, storage_path) values
  (1, 'models/brain/319ef39a-36ab-4a59-b19a-1bc936bae711.glb')
on conflict (id) do update set storage_path = excluded.storage_path;

-- ------------------------------------------------------------
-- Seed: the 60 real mesh names from the initial GLB export.
-- ------------------------------------------------------------
insert into public.brain_regions (mesh_name, title, display_order) values
  ('Brain_Part_02', 'Brain_Part_02', 0),
  ('Brain_Part_04', 'Brain_Part_04', 1),
  ('Brain_Part_05', 'Brain_Part_05', 2),
  ('Brain_Part_06', 'Brain_Part_06', 3),
  ('Brain_Part_04.001', 'Brain_Part_04.001', 4),
  ('Brain_Part_04.002', 'Brain_Part_04.002', 5),
  ('Brain_Part_04.003', 'Brain_Part_04.003', 6),
  ('Brain_Part_04.004', 'Brain_Part_04.004', 7),
  ('Brain_Part_04.005', 'Brain_Part_04.005', 8),
  ('Brain_Part_04.007', 'Brain_Part_04.007', 9),
  ('Brain_Part_04.008', 'Brain_Part_04.008', 10),
  ('Brain_Part_04.009', 'Brain_Part_04.009', 11),
  ('Brain_Part_04.010', 'Brain_Part_04.010', 12),
  ('Brain_Part_04.012', 'Brain_Part_04.012', 13),
  ('Brain_Part_04.013', 'Brain_Part_04.013', 14),
  ('Brain_Part_04.014', 'Brain_Part_04.014', 15),
  ('Brain_Part_04.015', 'Brain_Part_04.015', 16),
  ('Brain_Part_04.017', 'Brain_Part_04.017', 17),
  ('Brain_Part_04.018', 'Brain_Part_04.018', 18),
  ('Brain_Part_04.019', 'Brain_Part_04.019', 19),
  ('Brain_Part_04.020', 'Brain_Part_04.020', 20),
  ('Brain_Part_04.021', 'Brain_Part_04.021', 21),
  ('Brain_Part_04.022', 'Brain_Part_04.022', 22),
  ('Brain_Part_04.023', 'Brain_Part_04.023', 23),
  ('Brain_Part_04.024', 'Brain_Part_04.024', 24),
  ('Brain_Part_04.025', 'Brain_Part_04.025', 25),
  ('Brain_Part_04.026', 'Brain_Part_04.026', 26),
  ('Brain_Part_04.027', 'Brain_Part_04.027', 27),
  ('Brain_Part_04.029', 'Brain_Part_04.029', 28),
  ('Brain_Part_04.030', 'Brain_Part_04.030', 29),
  ('Brain_Part_04.031', 'Brain_Part_04.031', 30),
  ('Brain_Part_04.032', 'Brain_Part_04.032', 31),
  ('Brain_Part_04.033', 'Brain_Part_04.033', 32),
  ('Brain_Part_04.034', 'Brain_Part_04.034', 33),
  ('Brain_Part_04.035', 'Brain_Part_04.035', 34),
  ('Brain_Part_04.036', 'Brain_Part_04.036', 35),
  ('Brain_Part_04.037', 'Brain_Part_04.037', 36),
  ('Brain_Part_04.038', 'Brain_Part_04.038', 37),
  ('Brain_Part_04.039', 'Brain_Part_04.039', 38),
  ('Brain_Part_04.040', 'Brain_Part_04.040', 39),
  ('Brain_Part_04.042', 'Brain_Part_04.042', 40),
  ('Brain_Part_04.043', 'Brain_Part_04.043', 41),
  ('Brain_Part_04.044', 'Brain_Part_04.044', 42),
  ('Brain_Part_04.045', 'Brain_Part_04.045', 43),
  ('Brain_Part_04.046', 'Brain_Part_04.046', 44),
  ('Brain_Part_04.047', 'Brain_Part_04.047', 45),
  ('Brain_Part_04.048', 'Brain_Part_04.048', 46),
  ('Brain_Part_04.049', 'Brain_Part_04.049', 47),
  ('Brain_Part_04.050', 'Brain_Part_04.050', 48),
  ('Brain_Part_04.051', 'Brain_Part_04.051', 49),
  ('Brain_Part_04.052', 'Brain_Part_04.052', 50),
  ('Brain_Part_04.053', 'Brain_Part_04.053', 51),
  ('Brain_Part_04.054', 'Brain_Part_04.054', 52),
  ('Brain_Part_04.055', 'Brain_Part_04.055', 53),
  ('Brain_Part_04.056', 'Brain_Part_04.056', 54),
  ('Brain_Part_06.001', 'Brain_Part_06.001', 55),
  ('Brain_Part_06.002', 'Brain_Part_06.002', 56),
  ('Brain_Part_06.003', 'Brain_Part_06.003', 57),
  ('Brain_Part_06.004', 'Brain_Part_06.004', 58),
  ('Brain_Part_06.005', 'Brain_Part_06.005', 59)
on conflict (mesh_name) do nothing;
