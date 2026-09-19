create schema if not exists private;

create table public.career_workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My career workspace',
  slug text not null default 'default',
  revision bigint not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug),
  unique (id, owner_id)
);

create table public.career_files (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  owner_id uuid not null,
  path text not null,
  content text not null default '',
  content_type text not null default 'text/plain',
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  revision bigint not null default 0 check (revision >= 0),
  source text not null default 'web' check (source in ('web', 'local', 'import', 'worker')),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint career_files_workspace_owner_fk
    foreign key (workspace_id, owner_id)
    references public.career_workspaces(id, owner_id)
    on delete cascade,
  constraint career_files_relative_path_check
    check (
      length(path) between 1 and 500
      and path !~ '^[\\/]'
      and path !~ '(^|[\\/])\.\.([\\/]|$)'
      and position(chr(0) in path) = 0
    ),
  unique (workspace_id, path)
);

create table public.career_artifacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  owner_id uuid not null,
  path text not null,
  object_name text not null unique,
  mime_type text not null default 'application/octet-stream',
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  revision bigint not null default 0 check (revision >= 0),
  source text not null default 'web' check (source in ('web', 'local', 'import', 'worker')),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint career_artifacts_workspace_owner_fk
    foreign key (workspace_id, owner_id)
    references public.career_workspaces(id, owner_id)
    on delete cascade,
  constraint career_artifacts_relative_path_check
    check (
      length(path) between 1 and 500
      and path !~ '^[\\/]'
      and path !~ '(^|[\\/])\.\.([\\/]|$)'
      and position(chr(0) in path) = 0
    ),
  unique (workspace_id, path)
);

create table public.career_changes (
  id bigint generated always as identity primary key,
  workspace_id uuid not null,
  owner_id uuid not null,
  revision bigint not null check (revision > 0),
  entity_type text not null check (entity_type in ('file', 'artifact')),
  path text not null,
  operation text not null check (operation in ('upsert', 'delete')),
  sha256 text,
  source text not null check (source in ('web', 'local', 'import', 'worker')),
  created_at timestamptz not null default now(),
  constraint career_changes_workspace_owner_fk
    foreign key (workspace_id, owner_id)
    references public.career_workspaces(id, owner_id)
    on delete cascade,
  unique (workspace_id, revision)
);

create index career_workspaces_owner_id_idx on public.career_workspaces(owner_id);
create index career_files_owner_workspace_idx on public.career_files(owner_id, workspace_id);
create index career_files_workspace_revision_idx on public.career_files(workspace_id, revision);
create index career_artifacts_owner_workspace_idx on public.career_artifacts(owner_id, workspace_id);
create index career_artifacts_workspace_revision_idx on public.career_artifacts(workspace_id, revision);
create index career_changes_owner_workspace_revision_idx
  on public.career_changes(owner_id, workspace_id, revision);

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.assign_workspace_revision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_revision bigint;
begin
  update public.career_workspaces
  set revision = revision + 1, updated_at = now()
  where id = new.workspace_id and owner_id = new.owner_id
  returning revision into next_revision;

  if next_revision is null then
    raise exception 'workspace not found';
  end if;

  new.revision = next_revision;
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.record_career_file_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.career_changes (
    workspace_id,
    owner_id,
    revision,
    entity_type,
    path,
    operation,
    sha256,
    source
  ) values (
    new.workspace_id,
    new.owner_id,
    new.revision,
    'file',
    new.path,
    case when new.deleted_at is null then 'upsert' else 'delete' end,
    new.sha256,
    new.source
  );
  return new;
end;
$$;

create or replace function private.record_career_artifact_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.career_changes (
    workspace_id,
    owner_id,
    revision,
    entity_type,
    path,
    operation,
    sha256,
    source
  ) values (
    new.workspace_id,
    new.owner_id,
    new.revision,
    'artifact',
    new.path,
    case when new.deleted_at is null then 'upsert' else 'delete' end,
    new.sha256,
    new.source
  );
  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.career_workspaces (owner_id)
  values (new.id)
  on conflict (owner_id, slug) do nothing;
  return new;
end;
$$;

create trigger career_workspaces_touch_updated_at
before update on public.career_workspaces
for each row execute function private.touch_updated_at();

create trigger career_files_assign_revision
before insert or update on public.career_files
for each row execute function private.assign_workspace_revision();

create trigger career_files_record_change
after insert or update on public.career_files
for each row execute function private.record_career_file_change();

create trigger career_artifacts_assign_revision
before insert or update on public.career_artifacts
for each row execute function private.assign_workspace_revision();

create trigger career_artifacts_record_change
after insert or update on public.career_artifacts
for each row execute function private.record_career_artifact_change();

create trigger on_auth_user_created_create_career_workspace
after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.career_workspaces enable row level security;
alter table public.career_files enable row level security;
alter table public.career_artifacts enable row level security;
alter table public.career_changes enable row level security;

create policy "owners can read their career workspaces"
on public.career_workspaces for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "owners can update their career workspaces"
on public.career_workspaces for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "owners can read their career files"
on public.career_files for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "owners can insert their career files"
on public.career_files for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "owners can update their career files"
on public.career_files for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "owners can delete their career files"
on public.career_files for delete
to authenticated
using ((select auth.uid()) = owner_id);

create policy "owners can read their career artifacts"
on public.career_artifacts for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "owners can insert their career artifacts"
on public.career_artifacts for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "owners can update their career artifacts"
on public.career_artifacts for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "owners can delete their career artifacts"
on public.career_artifacts for delete
to authenticated
using ((select auth.uid()) = owner_id);

create policy "owners can read their career change log"
on public.career_changes for select
to authenticated
using ((select auth.uid()) = owner_id);

revoke all on table public.career_workspaces from anon;
revoke all on table public.career_files from anon;
revoke all on table public.career_artifacts from anon;
revoke all on table public.career_changes from anon;

grant select, update on table public.career_workspaces to authenticated;
grant select, insert, update, delete on table public.career_files to authenticated;
grant select, insert, update, delete on table public.career_artifacts to authenticated;
grant select on table public.career_changes to authenticated;
grant usage, select on sequence public.career_changes_id_seq to authenticated;

revoke all on function private.touch_updated_at() from public;
revoke all on function private.assign_workspace_revision() from public;
revoke all on function private.record_career_file_change() from public;
revoke all on function private.record_career_artifact_change() from public;
revoke all on function private.handle_new_user() from public;

insert into storage.buckets (id, name, public, file_size_limit)
values ('career-artifacts', 'career-artifacts', false, 52428800)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

create policy "owners can read their career artifact objects"
on storage.objects for select
to authenticated
using (
  bucket_id = 'career-artifacts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "owners can upload their career artifact objects"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'career-artifacts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "owners can update their career artifact objects"
on storage.objects for update
to authenticated
using (
  bucket_id = 'career-artifacts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'career-artifacts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "owners can delete their career artifact objects"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'career-artifacts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
