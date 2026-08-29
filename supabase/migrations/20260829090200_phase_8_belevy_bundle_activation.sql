-- Render and activate the included promo plus its paid bump as one 60-day
-- commercial package, while retaining two immutable purchase-level records.
create or replace function public.get_belevy_benefit()
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_user uuid := auth.uid(); v public.benefit_entitlements%rowtype; v_handoff boolean; v_total_days integer;
begin
  if v_user is null then raise exception using errcode='28000', message='authentication_required'; end if;
  select * into v from public.benefit_entitlements
   where user_id=v_user and status in ('available','activating','active')
   order by (status='available') desc, (status='activating') desc,
            (benefit_code='belevy_promo') desc, created_at asc limit 1;
  select coalesce(sum(duration_days),0)::integer into v_total_days
    from public.benefit_entitlements
   where user_id=v_user and status in ('available','activating','active');
  if not found then
    return jsonb_build_object('benefit_id',null,'status',null,'duration_days',0,'total_days',0,
      'activation_enabled',exists(select 1 from public.feature_flags where key='belevy_activation_enabled' and enabled),'show_handoff',false);
  end if;
  select exists(select 1 from public.action_outcomes where user_id=v_user and status in ('interest','booking')) into v_handoff;
  return jsonb_build_object('benefit_id',v.id,'status',v.status,'duration_days',v.duration_days,'total_days',v_total_days,
    'benefit_code',v.benefit_code,'external_benefit_id',v.external_benefit_id,
    'activation_enabled',exists(select 1 from public.feature_flags where key='belevy_activation_enabled' and enabled),
    'show_handoff',coalesce(v_handoff,false),'available_at',v.available_at,'eligible_until',v.eligible_until,
    'activated_at',v.activated_at,'expires_at',v.expires_at);
end;
$$;
revoke all on function public.get_belevy_benefit() from public, anon;
grant execute on function public.get_belevy_benefit() to authenticated;
