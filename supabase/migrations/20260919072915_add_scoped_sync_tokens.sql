create table public.career_sync_tokens (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  owner_id uuid not null,
  name text not null default 'Local device',
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint career_sync_tokens_workspace_owner_fk
    foreign key (workspace_id, owner_id)
    references public.career_workspaces(id, owner_id)
    on delete cascade
);

create index career_sync_tokens_workspace_owner_idx
  on public.career_sync_tokens(workspace_id, owner_id);

create index career_sync_tokens_owner_id_idx
  on public.career_sync_tokens(owner_id);

alter table public.career_sync_tokens enable row level security;

create policy "owners can read their sync tokens"
on public.career_sync_tokens for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "owners can create their sync tokens"
on public.career_sync_tokens for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "owners can update their sync tokens"
on public.career_sync_tokens for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "owners can delete their sync tokens"
on public.career_sync_tokens for delete
to authenticated
using ((select auth.uid()) = owner_id);

revoke all on table public.career_sync_tokens from anon;
grant select, insert, update, delete on table public.career_sync_tokens to authenticated;
