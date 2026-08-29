-- Fase 4: cobertura do FK message_versions.created_by.
create index if not exists message_versions_created_by_idx
  on public.message_versions (created_by);
