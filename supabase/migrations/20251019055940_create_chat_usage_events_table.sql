create table if not exists public.chat_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  session_id text,
  prompt_name text,
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  total_tokens integer not null default 0,
  cost_usd numeric(12, 6) not null default 0,
  metadata jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists chat_usage_events_user_id_occurred_at_idx
  on public.chat_usage_events (user_id, occurred_at);

alter table public.chat_usage_events enable row level security;
