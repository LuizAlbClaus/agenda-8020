-- Agenda 80/20 — Fase 2: índices para FKs e consultas de domínio.
create index if not exists action_swaps_recommendation_id_idx on public.action_swaps (recommendation_id);
create index if not exists action_swaps_replacement_recommendation_id_idx on public.action_swaps (replacement_recommendation_id);
create index if not exists action_versions_created_by_idx on public.action_versions (created_by);
create index if not exists recommendation_policy_versions_created_by_idx on public.recommendation_policy_versions (created_by);
create index if not exists recommendations_context_checkin_id_idx on public.recommendations (context_checkin_id);
create index if not exists recommendations_policy_version_id_idx on public.recommendations (policy_version_id);
create index if not exists user_action_preferences_protocol_id_idx on public.user_action_preferences (protocol_id);
