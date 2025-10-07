-- Create table to track per-user daily token usage for chat rate limiting
create table if not exists public.user_token_usage (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    date date not null default current_date,
    token_used integer not null default 0,
    token_limit integer not null default 10000,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint user_token_usage_unique_user_date unique(user_id, date)
);

-- Indexes
create index if not exists idx_user_token_usage_user_id on public.user_token_usage(user_id);
create index if not exists idx_user_token_usage_date on public.user_token_usage(date);
create index if not exists idx_user_token_usage_user_date on public.user_token_usage(user_id, date);

-- Ensure trigger function exists (created in initial migration)
-- Attach trigger to auto-update updated_at
drop trigger if exists update_user_token_usage_updated_at on public.user_token_usage;
create trigger update_user_token_usage_updated_at
    before update on public.user_token_usage
    for each row
    execute function update_updated_at_column();

-- Comments
comment on table public.user_token_usage is 'ユーザーごとの日次トークン使用量を管理するテーブル';
comment on column public.user_token_usage.date is '使用日（日次レート制限のキー）';
comment on column public.user_token_usage.token_used is 'その日に使用したトークン数';

-- RLS: enable and deny by default; only service role should access
alter table public.user_token_usage enable row level security;
-- No permissive policies for anon/authenticated; rely on service role or server-side operations

