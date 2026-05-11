-- StackAudit Supabase Schema
-- Run in Supabase SQL Editor: Dashboard → SQL Editor → New query → paste → Run

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
  is_optimal            boolean not null default false
);

create index if not exists audits_created_at_idx on audits(created_at desc);
create index if not exists audits_savings_idx    on audits(total_monthly_savings desc);

alter table audits enable row level security;
create policy "Audits publicly readable"   on audits for select using (true);
create policy "Service role insert audits" on audits for insert with check (true);
create policy "Service role update audits" on audits for update using (true);

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

alter table leads enable row level security;
create policy "Service role only on leads" on leads for all using (false);

-- Dashboard views
create or replace view high_value_leads as
  select l.id, l.created_at, l.email, l.company_name, l.role, l.team_size,
         l.monthly_savings, l.monthly_savings * 12 as annual_savings, l.contacted,
         a.input->>'useCase' as use_case,
         jsonb_array_length(a.recommendations) as tool_count
  from leads l join audits a on a.id = l.audit_id
  where l.high_savings = true and l.contacted = false
  order by l.monthly_savings desc;

create or replace view daily_audit_stats as
  select date_trunc('day', created_at) as day,
         count(*) as total_audits,
         count(*) filter (where is_optimal = false) as audits_with_savings,
         avg(total_monthly_savings) as avg_monthly_savings,
         sum(total_monthly_savings) as total_savings_identified
  from audits group by 1 order by 1 desc;
