-- PostgreSQL text values cannot contain NUL bytes, so chr(0) is not a
-- valid value to evaluate in a text CHECK constraint. The original checks
-- raised "null character not permitted" for every insert instead of
-- validating the path. Keep the path traversal protections without the
-- impossible NUL-byte branch.

alter table public.career_files
  drop constraint if exists career_files_relative_path_check;

alter table public.career_files
  add constraint career_files_relative_path_check
  check (
    length(path) between 1 and 500
    and path !~ '^[\\/]'
    and path !~ '(^|[\\/])\\.\\.([\\/]|$)'
  );

alter table public.career_artifacts
  drop constraint if exists career_artifacts_relative_path_check;

alter table public.career_artifacts
  add constraint career_artifacts_relative_path_check
  check (
    length(path) between 1 and 500
    and path !~ '^[\\/]'
    and path !~ '(^|[\\/])\\.\\.([\\/]|$)'
  );
