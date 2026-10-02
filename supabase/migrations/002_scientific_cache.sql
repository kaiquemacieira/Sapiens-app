-- Phase 8: distributed scientific cache (shared across Vercel instances)
-- Run in Supabase SQL editor after 001_initial.sql

create table if not exists scientific_cache (
  cache_key text primary key,
  payload jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_scientific_cache_expires
  on scientific_cache (expires_at);

-- Optional: auto-purge helper (call from cron / edge function)
-- delete from scientific_cache where expires_at < now();

comment on table scientific_cache is
  'L2 cache for region literature queries (counts + paper lists). TTL enforced by app.';
