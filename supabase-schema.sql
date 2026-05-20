-- StackAudit Supabase Schema (Round 2 — run full file in SQL Editor)
-- Includes Round 1 tables + Round 2 additions

-- ─── AUDITS (Round 1 + Round 2 columns) ────────────────────────────────────
create table if not exists audits (
  id                    text primary key,
  created_at            timestamptz not null default now(),
  input                 jsonb not null,
  recommendations       jsonb not null,
  total_current_spend   numeric not null default 0,
  total_projected_spend numeric not null default 0,
  total_monthly_savings numeric not null default 0,
  total_annual_savings  numeric not null default 0,
  ai_summary            text,
  is_optimal            boolean not null default false,
  -- Round 2 additions
  user_email            text,
  pricing_snapshot      jsonb,
  notified_at           timestamptz,
  stale                 boolean not null default false,
  unsubscribed          boolean not null default false
);

create index if not exists audits_created_at_idx    on audits(created_at desc);
create index if not exists audits_savings_idx        on audits(total_monthly_savings desc);
create index if not exists audits_user_email_idx     on audits(user_email);
create index if not exists audits_stale_idx          on audits(stale) where stale = true;

alter table audits disable row level security;
grant all on audits to service_role, anon;

-- ─── LEADS (Round 1 unchanged) ─────────────────────────────────────────────
create table if not exists leads (
  id              bigserial primary key,
  created_at      timestamptz not null default now(),
  audit_id        text references audits(id),
  email           text not null,
  company_name    text,
  role            text,
  team_size       int,
  monthly_savings numeric default 0,
  high_savings    boolean not null default false,
  contacted       boolean not null default false
);

create index if not exists leads_email_idx        on leads(email);
create index if not exists leads_audit_id_idx     on leads(audit_id);
create index if not exists leads_high_savings_idx on leads(high_savings) where high_savings = true;
create index if not exists leads_created_at_idx   on leads(created_at desc);

alter table leads disable row level security;
grant all on leads to service_role, anon;

-- ─── PRICING CHANGE LOG (Round 2) ──────────────────────────────────────────
create table if not exists pricing_changes (
  id          bigserial primary key,
  detected_at timestamptz not null default now(),
  tool_id     text not null,
  plan        text not null,
  old_price   numeric,
  new_price   numeric,
  change_type text not null -- 'price_changed' | 'plan_added' | 'plan_removed'
);

alter table pricing_changes disable row level security;
grant all on pricing_changes to service_role, anon;

-- ─── EMAIL LOG (Round 2 — dedup + click tracking) ──────────────────────────
create table if not exists email_log (
  id          bigserial primary key,
  sent_at     timestamptz not null default now(),
  email       text not null,
  audit_ids   text[] not null,
  clicked_at  timestamptz
);

create index if not exists email_log_email_idx on email_log(email);

alter table email_log disable row level security;
grant all on email_log to service_role, anon;
