-- Fase 3 incremental delta: expose maturity state for the pending outcome UI.
create or replace function public.get_recommendation_detail(p_recommendation_id uuid)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  v_user uuid := auth.uid();
  v_rec public.recommendations%rowtype;
  v_action public.action_versions%rowtype;
  v_outcome public.action_outcomes%rowtype;
  v_type public.action_type;
begin
  if v_user is null then raise exception using errcode='28000', message='authentication_required'; end if;
  if not exists (select 1 from public.entitlements where user_id=v_user and product_code='agenda_8020' and status='active' and expires_at>pg_catalog.now()) then
    raise exception using errcode='42501', message='entitlement_required';
  end if;
  select * into v_rec from public.recommendations where id=p_recommendation_id and user_id=v_user;
  if not found then return null; end if;
  if v_rec.status='presented' then
    update public.recommendations set status='opened', opened_at=coalesce(opened_at,pg_catalog.now()) where id=v_rec.id;
    v_rec.status='opened';
  end if;
  select * into v_action from public.action_versions where id=v_rec.action_version_id;
  select ap.action_type into v_type from public.action_protocols ap where ap.id=v_action.protocol_id;
  select ao.* into v_outcome
  from public.action_outcomes ao
  join public.action_executions ae on ae.id=ao.execution_id
  where ae.recommendation_id=v_rec.id;
  return jsonb_build_object(
    'id',v_rec.id,'status',v_rec.status,'title',v_action.title,'short_description',v_action.short_description,
    'why_now',v_rec.why_now_rendered,'when_to_use',v_action.when_to_use,'when_not_to_use',v_action.when_not_to_use,
    'steps',v_action.steps,'duration_minutes',v_action.duration_minutes,'ethical_guardrail',v_action.ethical_guardrail,
    'message_template',v_action.message_template,'action_type',v_type,'exposure_mode',v_action.exposure_mode,
    'confidence_level',coalesce(v_rec.score_components->>'confidence_level','learning'),
    'outcome',case when v_outcome.id is null then null else jsonb_build_object(
      'id',v_outcome.id,'execution_id',v_outcome.execution_id,'status',v_outcome.status,
      'maturation_at',v_outcome.maturation_at,'finalization_at',v_outcome.finalization_at,
      'finalized_at',v_outcome.finalized_at,'matured',v_outcome.maturation_at<=pg_catalog.now()) end
  );
end; $$;

revoke all on function public.get_recommendation_detail(uuid) from public, anon;
grant execute on function public.get_recommendation_detail(uuid) to authenticated;
