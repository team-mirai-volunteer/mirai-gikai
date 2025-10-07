create table if not exists public.user_token_usage (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    usage_date date not null default (current_timestamp at time zone 'Asia/Tokyo')::date,
    token_used integer not null default 0,
    token_limit integer not null default 10000,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint user_token_usage_user_date_unique unique (user_id, usage_date)
);

create index if not exists user_token_usage_user_id_idx on public.user_token_usage (user_id);
create index if not exists user_token_usage_usage_date_idx on public.user_token_usage (usage_date);
create index if not exists user_token_usage_user_date_idx on public.user_token_usage (user_id, usage_date);

create or replace function public.set_user_token_usage_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists user_token_usage_set_updated_at on public.user_token_usage;

create trigger user_token_usage_set_updated_at
    before update on public.user_token_usage
    for each row
    execute function public.set_user_token_usage_updated_at();

alter table public.user_token_usage enable row level security;

drop policy if exists "service-role-read-write-user-token-usage" on public.user_token_usage;

create policy "service-role-read-write-user-token-usage"
    on public.user_token_usage
    for all
    to service_role
    using (true)
    with check (true);

