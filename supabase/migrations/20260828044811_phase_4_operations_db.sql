-- Fase 4 — operação editorial, flags, métricas e auditoria.
-- Todas as mutações administrativas passam por RPCs auditadas. Não aplicar
-- diretamente por cliente; esta migration é preparada para aplicação via MCP.

create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(), slug text not null unique,
  category text not null, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.message_versions (
  id uuid primary key default gen_random_uuid(), template_id uuid not null references public.message_templates(id) on delete restrict,
  version_number integer not null check (version_number > 0), title text not null, body text not null,
  eligible_professions text[] not null default '{nail_design}', status public.action_version_status not null default 'draft',
  created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), published_at timestamptz,
  unique(template_id, version_number)
);
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null,
  event_name text not null, event_id text not null unique, properties jsonb not null default '{}'::jsonb,
  server_created_at timestamptz not null default now(), client_created_at timestamptz,
  check (jsonb_typeof(properties) = 'object')
);
create table if not exists public.feature_flags (
  key text primary key, enabled boolean not null default false, config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(), check (jsonb_typeof(config) = 'object')
);
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(), admin_user_id uuid not null references auth.users(id) on delete restrict,
  action text not null, entity_type text not null, entity_id uuid, before jsonb, after jsonb,
  created_at timestamptz not null default now()
);
create index if not exists message_versions_template_idx on public.message_versions(template_id,status,version_number desc);
create index if not exists analytics_events_name_idx on public.analytics_events(event_name,server_created_at desc);
create index if not exists analytics_events_user_idx on public.analytics_events(user_id,server_created_at desc);
create index if not exists admin_audit_logs_created_idx on public.admin_audit_logs(created_at desc);
create index if not exists admin_audit_logs_entity_idx on public.admin_audit_logs(entity_type,entity_id,created_at desc);

insert into public.feature_flags(key,enabled,config) values
 ('global_learning_enabled',false,'{}'),('ai_message_personalization',false,'{}'),
 ('pwa_push_enabled',false,'{}'),('belevy_activation_enabled',false,'{}')
on conflict(key) do nothing;

create or replace function private.require_any_role(p_roles public.app_role[])
returns uuid language plpgsql stable security definer set search_path=pg_catalog,public as $$
declare v uuid:=auth.uid();
begin
 if v is null then raise exception using errcode='28000',message='authentication_required'; end if;
 if not exists(select 1 from public.user_roles r where r.user_id=v and r.role=any(p_roles)) then
  raise exception using errcode='42501',message='admin_role_required';
 end if; return v;
end; $$;
revoke all on function private.require_any_role(public.app_role[]) from public,anon,authenticated;

create or replace function private.write_admin_audit(p_action text,p_entity text,p_id uuid,p_before jsonb,p_after jsonb)
returns uuid language sql security definer set search_path=pg_catalog,public as $$
 insert into public.admin_audit_logs(admin_user_id,action,entity_type,entity_id,before,after)
 values(auth.uid(),p_action,p_entity,p_id,p_before,p_after) returning id;
$$;
revoke all on function private.write_admin_audit(text,text,uuid,jsonb,jsonb) from public,anon,authenticated;

create or replace function private.prevent_published_message_mutation()
returns trigger language plpgsql set search_path=pg_catalog as $$
begin if old.status='published' and new is distinct from old then raise exception using errcode='42501',message='published_message_version_immutable'; end if; return new; end; $$;
revoke all on function private.prevent_published_message_mutation() from public,anon,authenticated;
drop trigger if exists message_versions_immutable on public.message_versions;
create trigger message_versions_immutable before update on public.message_versions for each row execute function private.prevent_published_message_mutation();
drop trigger if exists message_templates_updated_at on public.message_templates;
create trigger message_templates_updated_at before update on public.message_templates for each row execute function private.set_updated_at();

alter table public.message_templates enable row level security;
alter table public.message_versions enable row level security;
alter table public.analytics_events enable row level security;
alter table public.feature_flags enable row level security;
alter table public.admin_audit_logs enable row level security;
revoke all on table public.message_templates,public.message_versions,public.feature_flags,public.admin_audit_logs from public,anon,authenticated;
revoke all on table public.analytics_events from public,anon;
grant insert,select on table public.analytics_events to authenticated;
create policy analytics_events_insert_own on public.analytics_events for insert to authenticated with check(user_id is null or user_id=(select auth.uid()));
create policy analytics_events_select_own on public.analytics_events for select to authenticated using(user_id=(select auth.uid()));

create or replace function public.admin_list_actions() returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v uuid; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); return jsonb_build_object('items',coalesce((select jsonb_agg(jsonb_build_object('protocol',to_jsonb(p),'versions',(select coalesce(jsonb_agg(to_jsonb(a) order by a.version_number desc),'[]') from public.action_versions a where a.protocol_id=p.id)) order by p.slug) from public.action_protocols p),'[]')); end; $$;

create or replace function public.admin_create_action_protocol(p_slug text,p_type public.action_type,p_category text,p_measurement_class text) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v uuid; r public.action_protocols%rowtype; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); insert into public.action_protocols(slug,action_type,category,measurement_class) values(lower(trim(p_slug)),p_type,trim(p_category),p_measurement_class) returning * into r; perform private.write_admin_audit('create','action_protocol',r.id,null,to_jsonb(r)); return to_jsonb(r); end; $$;

create or replace function public.admin_create_action_version(p_protocol_id uuid,p_payload jsonb) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v uuid; r public.action_versions%rowtype; n int; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); if p_payload->>'title' is null or jsonb_typeof(p_payload->'steps')<>'array' or jsonb_array_length(p_payload->'steps') not between 1 and 3 then raise exception using errcode='22023',message='invalid_action_version_payload'; end if; select coalesce(max(version_number),0)+1 into n from public.action_versions where protocol_id=p_protocol_id; insert into public.action_versions(protocol_id,version_number,title,short_description,why_now_template,when_to_use,when_not_to_use,steps,eligible_professions,eligible_stages,eligible_bottlenecks,required_channels,requirements,duration_minutes,difficulty,exposure_mode,max_exposure,cooldown_hours,maturation_hours,finalization_hours,editorial_prior,ethical_guardrail,message_template,created_by) values(p_protocol_id,n,p_payload->>'title',coalesce(p_payload->>'short_description',''),coalesce(p_payload->>'why_now_template',''),coalesce(p_payload->>'when_to_use',''),coalesce(p_payload->>'when_not_to_use',''),p_payload->'steps',coalesce(array(select jsonb_array_elements_text(p_payload->'eligible_professions')),'{nail_design}'),coalesce(array(select jsonb_array_elements_text(p_payload->'eligible_stages'))::public.user_stage[],'{}'),coalesce(array(select jsonb_array_elements_text(p_payload->'eligible_bottlenecks'))::public.bottleneck[],'{}'),coalesce(array(select jsonb_array_elements_text(p_payload->'required_channels')),'{}'),coalesce(p_payload->'requirements','{}'),greatest(1,coalesce((p_payload->>'duration_minutes')::int,10)),coalesce(p_payload->>'difficulty','simple'),coalesce(p_payload->>'exposure_mode','none'),nullif(p_payload->>'max_exposure','')::int,greatest(0,coalesce((p_payload->>'cooldown_hours')::int,0)),greatest(0,coalesce((p_payload->>'maturation_hours')::int,0)),greatest(0,coalesce((p_payload->>'finalization_hours')::int,0)),least(1,greatest(0,coalesce((p_payload->>'editorial_prior')::numeric,.5))),coalesce(p_payload->>'ethical_guardrail',''),nullif(p_payload->>'message_template',''),v) returning * into r; perform private.write_admin_audit('create','action_version',r.id,null,to_jsonb(r)); return to_jsonb(r); end; $$;

create or replace function public.admin_update_action_draft(p_version_id uuid,p_payload jsonb) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v uuid; b public.action_versions%rowtype; r public.action_versions%rowtype; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); select * into b from public.action_versions where id=p_version_id for update; if not found or b.status<>'draft' then raise exception using errcode='42501',message='draft_action_version_required'; end if; update public.action_versions set title=coalesce(nullif(p_payload->>'title',''),title),short_description=coalesce(p_payload->>'short_description',short_description),why_now_template=coalesce(p_payload->>'why_now_template',why_now_template),when_to_use=coalesce(p_payload->>'when_to_use',when_to_use),when_not_to_use=coalesce(p_payload->>'when_not_to_use',when_not_to_use),steps=coalesce(p_payload->'steps',steps),requirements=coalesce(p_payload->'requirements',requirements),ethical_guardrail=coalesce(p_payload->>'ethical_guardrail',ethical_guardrail),message_template=case when p_payload ? 'message_template' then nullif(p_payload->>'message_template','') else message_template end where id=p_version_id returning * into r; perform private.write_admin_audit('update_draft','action_version',p_version_id,to_jsonb(b),to_jsonb(r)); return to_jsonb(r); end; $$;
create or replace function public.admin_publish_action_version(p_version_id uuid) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v uuid; b public.action_versions%rowtype; r public.action_versions%rowtype; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); select * into b from public.action_versions where id=p_version_id for update; if not found or b.status<>'draft' then raise exception using errcode='42501',message='draft_action_version_required'; end if; update public.action_versions set status='published',published_at=now() where id=p_version_id returning * into r; perform private.write_admin_audit('publish','action_version',p_version_id,to_jsonb(b),to_jsonb(r)); return to_jsonb(r); end; $$;
create or replace function public.admin_set_action_protocol_active(p_protocol_id uuid,p_active boolean) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v uuid; b public.action_protocols%rowtype; r public.action_protocols%rowtype; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); select * into b from public.action_protocols where id=p_protocol_id for update; if not found then raise exception using errcode='22023',message='action_protocol_not_found'; end if; update public.action_protocols set active=p_active where id=p_protocol_id returning * into r; perform private.write_admin_audit(case when p_active then 'activate' else 'deactivate' end,'action_protocol',p_protocol_id,to_jsonb(b),to_jsonb(r)); return to_jsonb(r); end; $$;

create or replace function public.admin_list_messages() returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); return jsonb_build_object('items',coalesce((select jsonb_agg(jsonb_build_object('template',to_jsonb(t),'versions',(select coalesce(jsonb_agg(to_jsonb(m) order by m.version_number desc),'[]') from public.message_versions m where m.template_id=t.id)) order by t.slug) from public.message_templates t),'[]')); end; $$;
create or replace function public.admin_create_message_template(p_slug text,p_category text) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; r public.message_templates%rowtype; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); insert into public.message_templates(slug,category) values(lower(trim(p_slug)),trim(p_category)) returning * into r; perform private.write_admin_audit('create','message_template',r.id,null,to_jsonb(r)); return to_jsonb(r); end; $$;
create or replace function public.admin_create_message_version(p_template_id uuid,p_payload jsonb) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; r public.message_versions%rowtype; n int; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); select coalesce(max(version_number),0)+1 into n from public.message_versions where template_id=p_template_id; insert into public.message_versions(template_id,version_number,title,body,eligible_professions,created_by) values(p_template_id,n,p_payload->>'title',p_payload->>'body',coalesce(array(select jsonb_array_elements_text(p_payload->'eligible_professions')),'{nail_design}'),v) returning * into r; perform private.write_admin_audit('create','message_version',r.id,null,to_jsonb(r)); return to_jsonb(r); end; $$;
create or replace function public.admin_update_message_draft(p_version_id uuid,p_payload jsonb) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; b public.message_versions%rowtype; r public.message_versions%rowtype; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); select * into b from public.message_versions where id=p_version_id for update; if not found or b.status<>'draft' then raise exception using errcode='42501',message='draft_message_version_required'; end if; update public.message_versions set title=coalesce(nullif(p_payload->>'title',''),title),body=coalesce(p_payload->>'body',body),eligible_professions=case when p_payload ? 'eligible_professions' then array(select jsonb_array_elements_text(p_payload->'eligible_professions')) else eligible_professions end where id=p_version_id returning * into r; perform private.write_admin_audit('update_draft','message_version',p_version_id,to_jsonb(b),to_jsonb(r)); return to_jsonb(r); end; $$;
create or replace function public.admin_publish_message_version(p_version_id uuid) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; b public.message_versions%rowtype; r public.message_versions%rowtype; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); select * into b from public.message_versions where id=p_version_id for update; if not found or b.status<>'draft' then raise exception using errcode='42501',message='draft_message_version_required'; end if; update public.message_versions set status='published',published_at=now() where id=p_version_id returning * into r; perform private.write_admin_audit('publish','message_version',p_version_id,to_jsonb(b),to_jsonb(r)); return to_jsonb(r); end; $$;
create or replace function public.admin_set_message_template_active(p_template_id uuid,p_active boolean) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; b public.message_templates%rowtype; r public.message_templates%rowtype; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); select * into b from public.message_templates where id=p_template_id for update; update public.message_templates set active=p_active where id=p_template_id returning * into r; perform private.write_admin_audit(case when p_active then 'activate' else 'deactivate' end,'message_template',p_template_id,to_jsonb(b),to_jsonb(r)); return to_jsonb(r); end; $$;

create or replace function public.admin_list_policies() returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); return jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(p) order by p.version desc) from public.recommendation_policy_versions p),'[]')); end; $$;
create or replace function public.admin_create_policy_version(p_params jsonb) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; r public.recommendation_policy_versions%rowtype; n int; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); select coalesce(max(version),0)+1 into n from public.recommendation_policy_versions; insert into public.recommendation_policy_versions(version,status,params,created_by) values(n,'draft',p_params,v) returning * into r; perform private.write_admin_audit('create','policy_version',r.id,null,to_jsonb(r)); return to_jsonb(r); end; $$;
create or replace function public.admin_update_policy_draft(p_version_id uuid,p_params jsonb) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; b public.recommendation_policy_versions%rowtype; r public.recommendation_policy_versions%rowtype; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); select * into b from public.recommendation_policy_versions where id=p_version_id for update; if not found or b.status<>'draft' then raise exception using errcode='42501',message='draft_policy_version_required'; end if; update public.recommendation_policy_versions set params=p_params where id=p_version_id returning * into r; perform private.write_admin_audit('update_draft','policy_version',p_version_id,to_jsonb(b),to_jsonb(r)); return to_jsonb(r); end; $$;
create or replace function public.admin_activate_policy_version(p_version_id uuid) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; b public.recommendation_policy_versions%rowtype; r public.recommendation_policy_versions%rowtype; old jsonb; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); select * into b from public.recommendation_policy_versions where id=p_version_id for update; if not found or b.status<>'draft' then raise exception using errcode='42501',message='draft_policy_version_required'; end if; select coalesce(jsonb_agg(to_jsonb(p)),'[]') into old from public.recommendation_policy_versions p where p.status='active'; update public.recommendation_policy_versions set status='retired' where status='active'; update public.recommendation_policy_versions set status='active',activated_at=now() where id=p_version_id returning * into r; perform private.write_admin_audit('activate','policy_version',p_version_id,old,to_jsonb(r)); return to_jsonb(r); end; $$;

create or replace function public.admin_list_users(p_email text default null) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; v_items jsonb; begin v:=private.require_any_role(array['support','admin']::public.app_role[]); select coalesce(jsonb_agg(jsonb_build_object('user_id',u.id,'email',u.email,'name',p.name,'access_status',e.status,'expires_at',e.expires_at,'onboarding_completed_at',b.onboarding_completed_at,'last_used_at',u.last_sign_in_at,'purchase_ids',coalesce((select jsonb_agg(x.id order by x.created_at desc) from public.purchases x where x.user_id=u.id),'[]'))),'[]') into v_items from auth.users u left join public.profiles p on p.user_id=u.id left join public.entitlements e on e.user_id=u.id and e.product_code='agenda_8020' left join public.business_profiles b on b.user_id=u.id where p_email is null or lower(u.email)=lower(trim(p_email)); return jsonb_build_object('items',v_items); end; $$;
create or replace function public.admin_resend_access(p_user_id uuid) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; eid uuid; email text; begin v:=private.require_any_role(array['support','admin']::public.app_role[]); select u.email into email from auth.users u where u.id=p_user_id; if email is null then raise exception using errcode='22023',message='user_not_found'; end if; insert into public.email_outbox(idempotency_key,template_key,recipient_email,user_id,payload) values('admin_access:'||gen_random_uuid()::text,'access_granted',lower(email),p_user_id,'{"reason":"admin_resend"}') returning id into eid; perform private.write_admin_audit('resend_access','user',p_user_id,null,jsonb_build_object('email_outbox_id',eid,'recipient_email',lower(email))); return jsonb_build_object('email_outbox_id',eid); end; $$;

create or replace function public.admin_list_commerce_mappings() returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; begin v:=private.require_any_role(array['admin']::public.app_role[]); return jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(c) order by c.created_at) from public.commerce_products c),'[]')); end; $$;
create or replace function public.admin_upsert_commerce_mapping(p_id uuid,p_payload jsonb) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; b public.commerce_products%rowtype; r public.commerce_products%rowtype; begin v:=private.require_any_role(array['admin']::public.app_role[]); if p_id is null then insert into public.commerce_products(provider,provider_product_id,provider_offer_id,internal_product_code,access_days,active) values('cakto',p_payload->>'provider_product_id',p_payload->>'provider_offer_id',p_payload->>'internal_product_code',(p_payload->>'access_days')::int,coalesce((p_payload->>'active')::boolean,true)) returning * into r; else select * into b from public.commerce_products where id=p_id for update; update public.commerce_products set provider_product_id=coalesce(p_payload->>'provider_product_id',provider_product_id),provider_offer_id=coalesce(p_payload->>'provider_offer_id',provider_offer_id),internal_product_code=coalesce(p_payload->>'internal_product_code',internal_product_code),access_days=coalesce((p_payload->>'access_days')::int,access_days),active=coalesce((p_payload->>'active')::boolean,active),updated_at=now() where id=p_id returning * into r; end if; perform private.write_admin_audit(case when p_id is null then 'create' else 'update' end,'commerce_mapping',r.id,case when p_id is null then null else to_jsonb(b) end,to_jsonb(r)); return to_jsonb(r); end; $$;

create or replace function public.admin_list_feature_flags() returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; begin v:=private.require_any_role(array['admin']::public.app_role[]); return jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(f) order by f.key) from public.feature_flags f),'[]')); end; $$;
create or replace function public.admin_upsert_feature_flag(p_key text,p_enabled boolean,p_config jsonb default '{}') returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; b public.feature_flags%rowtype; r public.feature_flags%rowtype; begin v:=private.require_any_role(array['admin']::public.app_role[]); select * into b from public.feature_flags where key=lower(trim(p_key)) for update; insert into public.feature_flags(key,enabled,config) values(lower(trim(p_key)),p_enabled,coalesce(p_config,'{}')) on conflict(key) do update set enabled=excluded.enabled,config=excluded.config,updated_at=now() returning * into r; perform private.write_admin_audit(case when b.key is null then 'create' else 'update' end,'feature_flag',null,case when b.key is null then null else to_jsonb(b) end,to_jsonb(r)); return to_jsonb(r); end; $$;
create or replace function public.admin_list_audit_logs(p_limit int default 100) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; begin v:=private.require_any_role(array['admin']::public.app_role[]); return jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (select * from public.admin_audit_logs order by created_at desc limit greatest(1,least(p_limit,500))) x),'[]')); end; $$;

create or replace function public.admin_get_metrics() returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; begin v:=private.require_any_role(array['admin']::public.app_role[]); return jsonb_build_object(
 'active_users',(select count(*) from auth.users where last_sign_in_at>=now()-interval '30 days'),
 'onboarding_completed',(select count(*) from public.business_profiles where onboarding_completed_at is not null),
 'first_action_users',(select count(distinct user_id) from public.recommendations),
 'actions_completed',(select count(*) from public.action_executions),'swaps',(select count(*) from public.action_swaps),
 'pending',(select count(*) from public.action_outcomes where status='pending'),'interests',(select coalesce(sum(interest_count),0) from public.action_outcomes),'bookings',(select coalesce(sum(booking_count),0) from public.action_outcomes),
 'swap_reasons',(select coalesce(jsonb_object_agg(reason,total),'{}') from (select reason::text,count(*) total from public.action_swaps group by reason) x),
 'recommended_by_action',(select coalesce(jsonb_object_agg(title,total),'{}') from (select av.title,count(*) total from public.recommendations r join public.action_versions av on av.id=r.action_version_id group by av.title) x),
 'results_by_category',(select coalesce(jsonb_object_agg(category,results),'{}') from (select ap.category,jsonb_build_object('interest',sum(ao.interest_count),'booking',sum(ao.booking_count)) results from public.action_outcomes ao join public.action_executions ae on ae.id=ao.execution_id join public.action_versions av on av.id=ae.action_version_id join public.action_protocols ap on ap.id=av.protocol_id group by ap.category) x)
 ); end; $$;

-- SECURITY DEFINER functions above are the only administrative API surface.
do $$ declare x record; begin for x in select p.oid::regprocedure f from pg_proc p where p.pronamespace='public'::regnamespace and p.proname like 'admin_%' loop execute 'revoke all on function '||x.f||' from public,anon'; execute 'grant execute on function '||x.f||' to authenticated'; end loop; end $$;

comment on table public.message_versions is 'Fase 4: published é imutável; alterações criam nova versão.';
comment on table public.analytics_events is 'Fase 4: eventos mínimos, sem segredos ou tokens.';
comment on table public.admin_audit_logs is 'Fase 4: toda mutação administrativa deve ter before/after.';

-- Complete the editorial controls omitted by the compact draft updater above.
create or replace function public.admin_update_action_draft(p_version_id uuid,p_payload jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare v uuid; b public.action_versions%rowtype; r public.action_versions%rowtype;
begin
 v:=private.require_any_role(array['content_editor','admin']::public.app_role[]);
 select * into b from public.action_versions where id=p_version_id for update;
 if not found or b.status<>'draft' then raise exception using errcode='42501',message='draft_action_version_required'; end if;
 update public.action_versions set
  title=coalesce(nullif(p_payload->>'title',''),title), short_description=coalesce(p_payload->>'short_description',short_description),
  why_now_template=coalesce(p_payload->>'why_now_template',why_now_template), when_to_use=coalesce(p_payload->>'when_to_use',when_to_use),
  when_not_to_use=coalesce(p_payload->>'when_not_to_use',when_not_to_use), steps=coalesce(p_payload->'steps',steps),
  eligible_professions=case when p_payload ? 'eligible_professions' then array(select jsonb_array_elements_text(p_payload->'eligible_professions')) else eligible_professions end,
  eligible_stages=case when p_payload ? 'eligible_stages' then array(select jsonb_array_elements_text(p_payload->'eligible_stages'))::public.user_stage[] else eligible_stages end,
  eligible_bottlenecks=case when p_payload ? 'eligible_bottlenecks' then array(select jsonb_array_elements_text(p_payload->'eligible_bottlenecks'))::public.bottleneck[] else eligible_bottlenecks end,
  required_channels=case when p_payload ? 'required_channels' then array(select jsonb_array_elements_text(p_payload->'required_channels')) else required_channels end,
  requirements=coalesce(p_payload->'requirements',requirements), duration_minutes=coalesce((p_payload->>'duration_minutes')::int,duration_minutes),
  difficulty=coalesce(p_payload->>'difficulty',difficulty), exposure_mode=coalesce(p_payload->>'exposure_mode',exposure_mode),
  max_exposure=case when p_payload ? 'max_exposure' then nullif(p_payload->>'max_exposure','')::int else max_exposure end,
  cooldown_hours=coalesce((p_payload->>'cooldown_hours')::int,cooldown_hours), maturation_hours=coalesce((p_payload->>'maturation_hours')::int,maturation_hours),
  finalization_hours=coalesce((p_payload->>'finalization_hours')::int,finalization_hours), editorial_prior=coalesce((p_payload->>'editorial_prior')::numeric,editorial_prior),
  ethical_guardrail=coalesce(p_payload->>'ethical_guardrail',ethical_guardrail), message_template=case when p_payload ? 'message_template' then nullif(p_payload->>'message_template','') else message_template end
 where id=p_version_id returning * into r;
 perform private.write_admin_audit('update_draft','action_version',p_version_id,to_jsonb(b),to_jsonb(r)); return to_jsonb(r);
end; $$;
revoke all on function public.admin_update_action_draft(uuid,jsonb) from public,anon;
grant execute on function public.admin_update_action_draft(uuid,jsonb) to authenticated;

-- Manual entitlement correction is an audited support operation (spec 107/125).
create or replace function public.admin_extend_entitlement(p_user_id uuid,p_access_days integer,p_reason text) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare v uuid; b public.entitlements%rowtype; r public.entitlements%rowtype;
begin
 v:=private.require_any_role(array['support','admin']::public.app_role[]);
 if p_access_days not between 1 and 3650 or nullif(trim(p_reason),'') is null then raise exception using errcode='22023',message='invalid_entitlement_extension'; end if;
 select * into b from public.entitlements where user_id=p_user_id and product_code='agenda_8020' for update;
 if found then update public.entitlements set status='active',expires_at=greatest(expires_at,now())+make_interval(days=>p_access_days),updated_at=now() where user_id=p_user_id and product_code='agenda_8020' returning * into r;
 else insert into public.entitlements(user_id,product_code,status,starts_at,expires_at) values(p_user_id,'agenda_8020','active',now(),now()+make_interval(days=>p_access_days)) returning * into r; end if;
 perform private.write_admin_audit('extend_entitlement','entitlement',p_user_id,case when b.user_id is null then null else to_jsonb(b) end,jsonb_build_object('after',to_jsonb(r),'reason',trim(p_reason)));
 return to_jsonb(r);
end; $$;
revoke all on function public.admin_extend_entitlement(uuid,integer,text) from public,anon;
grant execute on function public.admin_extend_entitlement(uuid,integer,text) to authenticated;

-- Compatibility API consumed by the server-rendered /admin MVP. It keeps the
-- database API flat and stable while the tables remain private to RPCs.
create or replace function public.admin_get_session_context() returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare v uuid; r public.app_role; begin v:=auth.uid(); if v is null then raise exception using errcode='28000',message='authentication_required'; end if;
 select ur.role into r from public.user_roles ur where ur.user_id=v order by case ur.role when 'admin' then 1 when 'support' then 2 when 'content_editor' then 3 else 4 end limit 1;
 return jsonb_build_object('is_admin',r is not null and r<>'user','role',coalesce(r::text,'user')); end; $$;
revoke all on function public.admin_get_session_context() from public,anon; grant execute on function public.admin_get_session_context() to authenticated;

create or replace function public.admin_list_actions() returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare v uuid; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]);
 return coalesce((select jsonb_agg(jsonb_build_object('id',av.id,'action_version_id',av.id,'version_id',av.id,'protocol_id',ap.id,'title',av.title,'short_description',av.short_description,'status',av.status,'version',av.version_number,'is_active',ap.active,'action_type',ap.action_type,'category',ap.category,'eligibility',av.requirements,'cooldown_days',av.cooldown_hours/24,'maturity_hours',av.maturation_hours,'prior',av.editorial_prior,'guardrail',av.ethical_guardrail,'requires_context_signal',coalesce((av.requirements->>'requires_context_signal')::boolean,false)) order by ap.slug,av.version_number desc) from public.action_protocols ap join public.action_versions av on av.protocol_id=ap.id),'[]'::jsonb); end; $$;
revoke all on function public.admin_list_actions() from public,anon; grant execute on function public.admin_list_actions() to authenticated;

create or replace function public.admin_create_action_draft(p_id uuid,p_input jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare v uuid; pid uuid; r jsonb; slug text; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]);
 slug:=lower(coalesce(nullif(p_input->>'protocol_id',''),nullif(p_input->>'slug',''),'new_action'));
 select ap.id into pid from public.action_protocols ap where ap.id=case when slug~* '^[0-9a-f-]{36}$' then slug::uuid else null end or ap.slug=slug limit 1;
 if pid is null then insert into public.action_protocols(slug,action_type,category,measurement_class) values(slug,case when p_input->>'action_type'='acquisition' then 'acquisition' else 'foundation' end,coalesce(p_input->>'category','foundation'),case when p_input->>'action_type'='acquisition' then case lower(coalesce(p_input->>'channel','direct')) when 'broadcast' then 'broadcast' when 'return' then 'return' when 'referral' then 'referral' when 'partnership' then 'partnership' else 'direct_outreach' end else 'foundation' end) returning id into pid; end if;
 r:=public.admin_create_action_version(pid,p_input); return r; end; $$;
revoke all on function public.admin_create_action_draft(uuid,jsonb) from public,anon; grant execute on function public.admin_create_action_draft(uuid,jsonb) to authenticated;

drop function if exists public.admin_update_action_draft(uuid,jsonb);
create function public.admin_update_action_draft(p_id uuid,p_input jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare v uuid; b public.action_versions%rowtype; r public.action_versions%rowtype; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); select * into b from public.action_versions where id=p_id for update; if not found or b.status<>'draft' then raise exception using errcode='42501',message='draft_action_version_required'; end if;
 update public.action_versions set title=coalesce(nullif(p_input->>'title',''),title),short_description=coalesce(nullif(p_input->>'short_description',''),short_description),requirements=case when p_input ? 'eligibility' then jsonb_build_object('editorial_input',p_input->>'eligibility','requires_context_signal',coalesce((p_input->>'requires_context_signal')::boolean,false)) else requirements end,cooldown_hours=coalesce((p_input->>'cooldown_days')::int*24,cooldown_hours),maturation_hours=coalesce((p_input->>'maturity_hours')::int,maturation_hours),editorial_prior=coalesce((p_input->>'priority')::numeric,editorial_prior),ethical_guardrail=coalesce(p_input->>'guardrail',ethical_guardrail) where id=p_id returning * into r; perform private.write_admin_audit('update_draft','action_version',p_id,to_jsonb(b),to_jsonb(r)); return to_jsonb(r); end; $$;
revoke all on function public.admin_update_action_draft(uuid,jsonb) from public,anon; grant execute on function public.admin_update_action_draft(uuid,jsonb) to authenticated;
create or replace function public.admin_publish_action_draft(p_id uuid,p_input jsonb default '{}') returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ begin return public.admin_publish_action_version(p_id); end; $$;
revoke all on function public.admin_publish_action_draft(uuid,jsonb) from public,anon; grant execute on function public.admin_publish_action_draft(uuid,jsonb) to authenticated;
create or replace function public.admin_set_protocol_active(p_id uuid,p_input jsonb) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ begin return public.admin_set_action_protocol_active(p_id,coalesce((p_input->>'is_active')::boolean,(p_input->>'active')::boolean,true)); end; $$;
revoke all on function public.admin_set_protocol_active(uuid,jsonb) from public,anon; grant execute on function public.admin_set_protocol_active(uuid,jsonb) to authenticated;

create or replace function public.admin_list_messages() returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v uuid; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); return coalesce((select jsonb_agg(jsonb_build_object('id',mv.id,'version_id',mv.id,'template_id',mv.template_id,'protocol_id',null,'name',mt.slug,'message_template',mv.body,'channel',mt.category,'status',mv.status,'version',mv.version_number,'is_active',mt.active) order by mt.slug,mv.version_number desc) from public.message_templates mt join public.message_versions mv on mv.template_id=mt.id),'[]'::jsonb); end; $$;
revoke all on function public.admin_list_messages() from public,anon; grant execute on function public.admin_list_messages() to authenticated;
create or replace function public.admin_create_message_draft(p_id uuid,p_input jsonb) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v uuid; tid uuid; r jsonb; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); tid:=p_id; if tid is null then select id into tid from public.message_templates where slug=lower(coalesce(nullif(p_input->>'name',''),nullif(p_input->>'slug',''),'message')); if tid is null then insert into public.message_templates(slug,category) values(lower(coalesce(nullif(p_input->>'name',''),nullif(p_input->>'slug',''),'message')) ,coalesce(p_input->>'channel','direct')) returning id into tid; end if; end if; r:=public.admin_create_message_version(tid,jsonb_build_object('title',coalesce(p_input->>'name','Mensagem'),'body',coalesce(p_input->>'message_template',p_input->>'body',''),'eligible_professions',coalesce(p_input->'eligible_professions','["nail_design"]'::jsonb))); return r; end; $$;
revoke all on function public.admin_create_message_draft(uuid,jsonb) from public,anon; grant execute on function public.admin_create_message_draft(uuid,jsonb) to authenticated;
drop function if exists public.admin_update_message_draft(uuid,jsonb);
create function public.admin_update_message_draft(p_id uuid,p_input jsonb) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; b public.message_versions%rowtype; r public.message_versions%rowtype; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); select * into b from public.message_versions where id=p_id for update; if not found or b.status<>'draft' then raise exception using errcode='42501',message='draft_message_version_required'; end if; update public.message_versions set title=coalesce(nullif(p_input->>'name',''),nullif(p_input->>'title',''),title),body=coalesce(nullif(p_input->>'message_template',''),nullif(p_input->>'body',''),body) where id=p_id returning * into r; perform private.write_admin_audit('update_draft','message_version',p_id,to_jsonb(b),to_jsonb(r)); return to_jsonb(r); end; $$;
revoke all on function public.admin_update_message_draft(uuid,jsonb) from public,anon; grant execute on function public.admin_update_message_draft(uuid,jsonb) to authenticated;
create or replace function public.admin_publish_message_draft(p_id uuid,p_input jsonb default '{}') returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ begin return public.admin_publish_message_version(p_id); end; $$;
revoke all on function public.admin_publish_message_draft(uuid,jsonb) from public,anon; grant execute on function public.admin_publish_message_draft(uuid,jsonb) to authenticated;
create or replace function public.admin_set_message_template_active(p_id uuid,p_input jsonb) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ begin return public.admin_set_message_template_active(p_id,coalesce((p_input->>'is_active')::boolean,(p_input->>'active')::boolean,true)); end; $$;
revoke all on function public.admin_set_message_template_active(uuid,jsonb) from public,anon; grant execute on function public.admin_set_message_template_active(uuid,jsonb) to authenticated;

create or replace function public.admin_list_policies() returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); return coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'version_id',p.id,'name',coalesce(p.params->>'name','Policy '||p.version),'version',p.version,'status',p.status,'is_active',p.status='active','prior_weight',p.params->>'prior_weight','half_life_days',p.params->>'recency_half_life_days') order by p.version desc) from public.recommendation_policy_versions p),'[]'::jsonb); end; $$;
revoke all on function public.admin_list_policies() from public,anon; grant execute on function public.admin_list_policies() to authenticated;
create or replace function public.admin_create_policy_draft(p_id uuid,p_input jsonb) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ begin return public.admin_create_policy_version(coalesce(p_input->'params',p_input)); end; $$;
revoke all on function public.admin_create_policy_draft(uuid,jsonb) from public,anon; grant execute on function public.admin_create_policy_draft(uuid,jsonb) to authenticated;
drop function if exists public.admin_update_policy_draft(uuid,jsonb);
create function public.admin_update_policy_draft(p_id uuid,p_input jsonb) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; b public.recommendation_policy_versions%rowtype; r public.recommendation_policy_versions%rowtype; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); select * into b from public.recommendation_policy_versions where id=p_id for update; if not found or b.status<>'draft' then raise exception using errcode='42501',message='draft_policy_version_required'; end if; update public.recommendation_policy_versions set params=coalesce(p_input->'params',p_input) where id=p_id returning * into r; perform private.write_admin_audit('update_draft','policy_version',p_id,to_jsonb(b),to_jsonb(r)); return to_jsonb(r); end; $$;
revoke all on function public.admin_update_policy_draft(uuid,jsonb) from public,anon; grant execute on function public.admin_update_policy_draft(uuid,jsonb) to authenticated;
create or replace function public.admin_activate_policy(p_id uuid,p_input jsonb default '{}') returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ begin return public.admin_activate_policy_version(p_id); end; $$;
revoke all on function public.admin_activate_policy(uuid,jsonb) from public,anon; grant execute on function public.admin_activate_policy(uuid,jsonb) to authenticated;

create or replace function public.admin_list_commerce_products() returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; begin v:=private.require_any_role(array['admin']::public.app_role[]); return coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'product_id',c.provider_product_id,'offer_id',c.provider_offer_id,'access_days',c.access_days,'benefit',c.internal_product_code,'is_active',c.active) order by c.created_at) from public.commerce_products c),'[]'::jsonb); end; $$;
revoke all on function public.admin_list_commerce_products() from public,anon; grant execute on function public.admin_list_commerce_products() to authenticated;
create or replace function public.admin_update_commerce_product(p_id uuid,p_input jsonb) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ begin return public.admin_upsert_commerce_mapping(p_id,jsonb_build_object('provider_product_id',p_input->>'product_id','provider_offer_id',p_input->>'offer_id','internal_product_code',coalesce(p_input->>'benefit','agenda_8020'),'access_days',p_input->>'access_days','active',coalesce(p_input->'is_active','true'::jsonb))); end; $$;
revoke all on function public.admin_update_commerce_product(uuid,jsonb) from public,anon; grant execute on function public.admin_update_commerce_product(uuid,jsonb) to authenticated;
create or replace function public.admin_update_feature_flag(p_id text,p_input jsonb) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ begin return public.admin_upsert_feature_flag(coalesce(nullif(p_input->>'flag_key',''),p_id),coalesce((p_input->>'is_enabled')::boolean,false),jsonb_build_object('description',coalesce(p_input->>'description',''))); end; $$;
revoke all on function public.admin_update_feature_flag(text,jsonb) from public,anon; grant execute on function public.admin_update_feature_flag(text,jsonb) to authenticated;

create or replace function public.admin_list_users(p_email text default null) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare v uuid; begin v:=private.require_any_role(array['support','admin']::public.app_role[]);
 return coalesce((select jsonb_agg(jsonb_build_object('id',u.id,'user_id',u.id,'email',u.email,'name',p.name,'access_status',e.status,'expires_at',e.expires_at,'onboarding_status',case when b.onboarding_completed_at is null then 'pending' else 'completed' end,'onboarding_completed_at',b.onboarding_completed_at,'last_used_at',u.last_sign_in_at,'purchase_id',(select x.id from public.purchases x where x.user_id=u.id order by x.created_at desc limit 1))) from auth.users u left join public.profiles p on p.user_id=u.id left join public.entitlements e on e.user_id=u.id and e.product_code='agenda_8020' left join public.business_profiles b on b.user_id=u.id where p_email is null or lower(u.email)=lower(trim(p_email))),'[]'::jsonb); end; $$;
revoke all on function public.admin_list_users(text) from public,anon; grant execute on function public.admin_list_users(text) to authenticated;

create or replace function public.admin_get_metrics() returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare v uuid; begin v:=private.require_any_role(array['admin']::public.app_role[]); return jsonb_build_object(
 'active_users',(select count(*) from auth.users where last_sign_in_at>=now()-interval '30 days'),
 'onboarding_completed',(select count(*) from public.business_profiles where onboarding_completed_at is not null),
 'first_action_users',(select count(distinct user_id) from public.recommendations),
 'actions_completed',(select count(*) from public.action_executions),'swaps',(select count(*) from public.action_swaps),
 'pending',(select count(*) from public.action_outcomes where status='pending'),'pending_outcomes',(select count(*) from public.action_outcomes where status='pending'),
 'interests',(select coalesce(sum(interest_count),0) from public.action_outcomes),'bookings',(select coalesce(sum(booking_count),0) from public.action_outcomes),
 'swap_reasons',(select coalesce(jsonb_object_agg(reason,total),'{}') from (select reason::text,count(*) total from public.action_swaps group by reason) x),
 'recommended_by_action',(select coalesce(jsonb_object_agg(title,total),'{}') from (select av.title,count(*) total from public.recommendations r join public.action_versions av on av.id=r.action_version_id group by av.title) x),
 'results_by_category',(select coalesce(jsonb_object_agg(category,results),'{}') from (select ap.category,jsonb_build_object('interest',sum(ao.interest_count),'booking',sum(ao.booking_count)) results from public.action_outcomes ao join public.action_executions ae on ae.id=ao.execution_id join public.action_versions av on av.id=ae.action_version_id join public.action_protocols ap on ap.id=av.protocol_id group by ap.category) x)
 ); end; $$;
revoke all on function public.admin_get_metrics() from public,anon; grant execute on function public.admin_get_metrics() to authenticated;

create or replace function public.admin_list_feature_flags() returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare v uuid; begin v:=private.require_any_role(array['admin']::public.app_role[]); return coalesce((select jsonb_agg(jsonb_build_object('id',f.key,'flag_key',f.key,'description',coalesce(f.config->>'description',''),'is_enabled',f.enabled,'updated_at',f.updated_at) order by f.key) from public.feature_flags f),'[]'::jsonb); end; $$;
revoke all on function public.admin_list_feature_flags() from public,anon; grant execute on function public.admin_list_feature_flags() to authenticated;

-- Keep both human-facing aliases and schema-native names available to the UI.
create or replace function public.admin_list_actions() returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v uuid; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); return coalesce((select jsonb_agg(jsonb_build_object('id',av.id,'action_version_id',av.id,'version_id',av.id,'protocol_id',ap.id,'protocol_slug',ap.slug,'title',av.title,'short_description',av.short_description,'status',av.status,'version',av.version_number,'version_number',av.version_number,'is_active',ap.active,'active',ap.active,'action_type',ap.action_type,'category',ap.category,'exposure_mode',av.exposure_mode,'eligibility',av.requirements,'cooldown_days',av.cooldown_hours/24,'cooldown_hours',av.cooldown_hours,'maturity_hours',av.maturation_hours,'maturation_hours',av.maturation_hours,'prior',av.editorial_prior,'editorial_prior',av.editorial_prior,'guardrail',av.ethical_guardrail,'ethical_guardrail',av.ethical_guardrail,'requires_context_signal',coalesce((av.requirements->>'requires_context_signal')::boolean,false)) order by ap.slug,av.version_number desc) from public.action_protocols ap join public.action_versions av on av.protocol_id=ap.id),'[]'::jsonb); end; $$;
revoke all on function public.admin_list_actions() from public,anon; grant execute on function public.admin_list_actions() to authenticated;
create or replace function public.admin_list_messages() returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v uuid; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); return coalesce((select jsonb_agg(jsonb_build_object('id',mv.id,'version_id',mv.id,'message_version_id',mv.id,'template_id',mv.template_id,'template_slug',mt.slug,'protocol_id',null,'name',mt.slug,'message_template',mv.body,'body',mv.body,'channel',mt.category,'status',mv.status,'version',mv.version_number,'version_number',mv.version_number,'is_active',mt.active,'active',mt.active) order by mt.slug,mv.version_number desc) from public.message_templates mt join public.message_versions mv on mv.template_id=mt.id),'[]'::jsonb); end; $$;
revoke all on function public.admin_list_messages() from public,anon; grant execute on function public.admin_list_messages() to authenticated;
create or replace function public.admin_list_policies() returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$ declare v uuid; begin v:=private.require_any_role(array['content_editor','admin']::public.app_role[]); return coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'version_id',p.id,'version',p.version,'status',p.status,'params',p.params,'created_at',p.created_at,'activated_at',p.activated_at,'name',coalesce(p.params->>'name','Policy '||p.version),'is_active',p.status='active','prior_weight',p.params->>'prior_weight','half_life_days',p.params->>'recency_half_life_days') order by p.version desc) from public.recommendation_policy_versions p),'[]'::jsonb); end; $$;
revoke all on function public.admin_list_policies() from public,anon; grant execute on function public.admin_list_policies() to authenticated;
