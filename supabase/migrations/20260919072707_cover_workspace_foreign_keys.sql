create index career_files_workspace_owner_idx
  on public.career_files(workspace_id, owner_id);

create index career_artifacts_workspace_owner_idx
  on public.career_artifacts(workspace_id, owner_id);

create index career_changes_workspace_owner_idx
  on public.career_changes(workspace_id, owner_id);
