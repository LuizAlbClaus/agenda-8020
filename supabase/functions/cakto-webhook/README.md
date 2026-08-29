# Cakto webhook

Endpoint deployed at:

`https://sepgbhztpktstzsgxvqk.supabase.co/functions/v1/cakto-webhook`

The function accepts only `POST` requests with the Cakto root `secret` matching
the `CAKTO_WEBHOOK_SECRET` Edge Function secret. JWT verification is disabled
for this endpoint because Cakto authenticates the request with that shared
secret. It supports `purchase_approved`, `refund`, and `chargeback`.

Required runtime variables:

- `CAKTO_WEBHOOK_SECRET` — configured outside the repository.
- `SUPABASE_URL` and `SUPABASE_SECRET_KEYS` (preferred) or
  `SUPABASE_SERVICE_ROLE_KEY` (legacy) — provided by Supabase Edge Functions.
- `WORKER_SHARED_SECRET` — same internal secret configured on `send-email-worker`.

The function forwards only validated, minimal fields to the transactional RPC.
It never stores or logs the raw Cakto payload, card data, document number,
phone, address, affiliate, or tracking fields.

After a processed `purchase_approved`, the webhook asynchronously nudges
`send-email-worker` with a small batch claim. The worker trigger runs through
`EdgeRuntime.waitUntil`, so Cakto receives the successful response without
waiting for email delivery. Trigger failures are handled operationally and do
not alter the webhook response.
