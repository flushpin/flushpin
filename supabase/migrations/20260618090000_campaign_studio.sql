-- FlushPin Campaign Studio schema.
-- Keeps paid business QR campaigns separate from public restroom source data.

create extension if not exists pgcrypto;

create table if not exists public.business_locations (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  location_name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  address text,
  city text,
  state text default 'CA',
  restroom_id bigint references public.restroom(id) on delete set null,
  plan text not null default 'gold',
  status text not null default 'lead'
    check (status in ('lead', 'active', 'paused', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_campaigns (
  id uuid primary key default gen_random_uuid(),
  business_location_id uuid references public.business_locations(id) on delete cascade,
  restroom_id bigint references public.restroom(id) on delete set null,
  name text not null,
  offer_title text,
  offer_description text,
  cta_text text,
  destination_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'draft'
    check (status in ('draft', 'pending_review', 'active', 'paused', 'expired', 'rejected')),
  review_note text,
  created_by text,
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_creatives (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.business_campaigns(id) on delete cascade,
  storage_bucket text not null default 'campaign-creatives',
  storage_path text not null,
  public_url text,
  file_name text,
  mime_type text not null,
  file_size integer not null,
  width integer,
  height integer,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'approved', 'rejected', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  business_location_id uuid references public.business_locations(id) on delete cascade,
  campaign_id uuid references public.business_campaigns(id) on delete set null,
  restroom_id bigint references public.restroom(id) on delete set null,
  slug text not null unique,
  status text not null default 'active'
    check (status in ('active', 'paused', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_events (
  id bigserial primary key,
  campaign_id uuid references public.business_campaigns(id) on delete set null,
  qr_code_id uuid references public.qr_codes(id) on delete set null,
  restroom_id bigint references public.restroom(id) on delete set null,
  event_type text not null
    check (event_type in ('qr_scan', 'ad_view_start', 'ad_view_complete', 'access_reveal', 'cta_click', 'save_offer')),
  user_id uuid,
  session_id text,
  user_agent text,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists business_locations_restroom_idx on public.business_locations(restroom_id);
create index if not exists business_campaigns_status_idx on public.business_campaigns(status);
create index if not exists business_campaigns_location_idx on public.business_campaigns(business_location_id);
create index if not exists campaign_creatives_campaign_idx on public.campaign_creatives(campaign_id);
create index if not exists campaign_events_campaign_type_idx on public.campaign_events(campaign_id, event_type, created_at desc);
create index if not exists campaign_events_qr_idx on public.campaign_events(qr_code_id, created_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('campaign-creatives', 'campaign-creatives', true, 2097152, array['image/png', 'image/jpeg'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
