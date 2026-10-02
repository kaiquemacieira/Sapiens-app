-- SAPIENS initial schema (Supabase / PostgreSQL + PostGIS)
-- Enable extensions in Supabase dashboard: postgis

create extension if not exists postgis;

-- Astronomical objects (can sync from catalog later)
create table if not exists astronomical_objects (
  id text primary key,
  canonical_name text not null,
  object_type text not null,
  ra double precision not null,
  dec double precision not null,
  -- geography for cone searches (lon=RA mapped carefully; see docs)
  position geography(point, 4326),
  magnitude real,
  identifiers jsonb default '{}'::jsonb,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_objects_position on astronomical_objects using gist (position);
create index if not exists idx_objects_name on astronomical_objects (canonical_name);

-- Sky regions queried by users
create table if not exists sky_regions (
  id uuid primary key default gen_random_uuid(),
  center_ra double precision not null,
  center_dec double precision not null,
  search_radius_deg double precision not null,
  field_of_view_deg double precision,
  coordinate_system text default 'ICRS',
  epoch text default 'J2000',
  region_hash text unique not null,
  publication_count integer default 0,
  last_queried_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_sky_regions_hash on sky_regions (region_hash);

-- Scientific records (deduplicated)
create table if not exists scientific_records (
  id text primary key, -- canonical id: doi:... | arxiv:... | ads:...
  title text not null,
  authors text[] default '{}',
  abstract text,
  publication_year integer,
  publication_date date,
  doi text unique,
  arxiv_id text unique,
  ads_bibcode text unique,
  journal text,
  publisher text,
  open_access boolean default false,
  citation_count integer,
  source_primary text,
  source_url text,
  pdf_url text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_sci_year on scientific_records (publication_year);
create index if not exists idx_sci_oa on scientific_records (open_access);

-- Region ↔ records
create table if not exists sky_region_records (
  sky_region_id uuid references sky_regions(id) on delete cascade,
  scientific_record_id text references scientific_records(id) on delete cascade,
  primary key (sky_region_id, scientific_record_id)
);

-- Object ↔ records
create table if not exists object_scientific_records (
  object_id text references astronomical_objects(id) on delete cascade,
  scientific_record_id text references scientific_records(id) on delete cascade,
  primary key (object_id, scientific_record_id)
);

-- Multi-source provenance
create table if not exists scientific_record_sources (
  scientific_record_id text references scientific_records(id) on delete cascade,
  source text not null,
  source_id text,
  raw_metadata jsonb,
  primary key (scientific_record_id, source)
);

-- Optional durable scientific cache (alternative to in-memory)
create table if not exists scientific_cache (
  cache_key text primary key,
  payload jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create index if not exists idx_sci_cache_expires on scientific_cache (expires_at);

-- Provider health (admin)
create table if not exists provider_health (
  provider text primary key,
  status text not null,
  latency_ms integer,
  last_success timestamptz,
  last_error text,
  updated_at timestamptz default now()
);

-- RLS: public read for scientific metadata later; writes via service role only
alter table scientific_records enable row level security;
alter table sky_regions enable row level security;
alter table astronomical_objects enable row level security;

-- Allow anon read of objects and records (metadata only)
create policy "Public read objects"
  on astronomical_objects for select
  using (true);

create policy "Public read scientific_records"
  on scientific_records for select
  using (true);
