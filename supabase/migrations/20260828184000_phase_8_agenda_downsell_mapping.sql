-- Agenda 80/20 — Cakto single-payment downsell: R$97 for 180 days.
-- Product ID is the configured Cakto product UUID; offer ID comes from the
-- public checkout contract. It is intentionally distinct from the R$147 offer.
alter table public.commerce_products
  drop constraint if exists commerce_products_provider_internal_product_code_key;

insert into public.commerce_products
  (provider, provider_product_id, provider_offer_id, internal_product_code,
   access_days, belevy_benefit_days, belevy_benefit_type, active)
values
  ('cakto', 'e412eb02-ccf5-47e9-9fe1-ce846a074140', '3vcibb6', 'agenda_8020',
   180, 30, 'promo', true)
on conflict (provider, provider_product_id, provider_offer_id) do update
set access_days = excluded.access_days,
    belevy_benefit_days = excluded.belevy_benefit_days,
    belevy_benefit_type = excluded.belevy_benefit_type,
    active = excluded.active,
    updated_at = now();
