create extension if not exists pgcrypto with schema extensions;

create table if not exists public.sprite_collection_sync (
  sync_id uuid primary key,
  secret_hash bytea not null,
  collection jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default statement_timestamp(),
  constraint collection_is_object check (jsonb_typeof(collection) = 'object')
);

alter table public.sprite_collection_sync enable row level security;
revoke all on table public.sprite_collection_sync from anon, authenticated;

create or replace function public.sync_sprite_collection(
  p_sync_id uuid,
  p_sync_secret text,
  p_collection jsonb,
  p_base_updated_at timestamptz default null
)
returns table (collection jsonb, updated_at timestamptz, conflict boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_row public.sprite_collection_sync%rowtype;
begin
  if length(p_sync_secret) <> 43
    or p_sync_secret !~ '^[A-Za-z0-9_-]{43}$'
    or jsonb_typeof(p_collection) <> 'object'
    or pg_column_size(p_collection) > 262144
    or exists (
      select 1
      from jsonb_each(p_collection) as item(key, value)
      where item.key !~ '^[0-9]+$'
        or jsonb_typeof(item.value) <> 'object'
        or item.value <> jsonb_build_object(
          'owned', coalesce((item.value ->> 'owned')::boolean, false),
          'mastered', coalesce((item.value ->> 'mastered')::boolean, false)
        )
    ) then
    raise exception 'invalid sync request' using errcode = '22023';
  end if;

  insert into public.sprite_collection_sync (sync_id, secret_hash, collection)
  values (p_sync_id, extensions.digest(p_sync_secret, 'sha256'), p_collection)
  on conflict (sync_id) do nothing;

  select * into current_row
  from public.sprite_collection_sync as stored
  where stored.sync_id = p_sync_id
  for update;

  if current_row.secret_hash <> extensions.digest(p_sync_secret, 'sha256') then
    raise exception 'sync space not found' using errcode = 'P0002';
  end if;

  if p_base_updated_at is not null and current_row.updated_at = p_base_updated_at then
    update public.sprite_collection_sync as stored
    set collection = p_collection, updated_at = statement_timestamp()
    where stored.sync_id = p_sync_id
    returning stored.* into current_row;
    return query select current_row.collection, current_row.updated_at, false;
    return;
  end if;

  return query select current_row.collection, current_row.updated_at, p_base_updated_at is not null;
end;
$$;

create or replace function public.sync_health()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$ select true $$;

revoke all on function public.sync_sprite_collection(uuid, text, jsonb, timestamptz) from public;
revoke all on function public.sync_health() from public;
grant execute on function public.sync_sprite_collection(uuid, text, jsonb, timestamptz) to anon;
grant execute on function public.sync_health() to anon;
