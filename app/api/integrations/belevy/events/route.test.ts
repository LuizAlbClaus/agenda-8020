import assert from "node:assert/strict";
import { test } from "node:test";
import { postBelevyEventWithDeps } from "./route";

const validBody = {
  event_id: "event-1",
  event_type: "created",
  appointment_id: "appointment-1",
  service_name: "Consultoria",
  starts_at: "2026-09-01T12:00:00.000Z",
  ends_at: "2026-09-01T13:00:00.000Z",
  status: "confirmed",
  source: "belevy",
};

function request(body: unknown, authorization = "Bearer shared") {
  return new Request("https://agenda.local/api/integrations/belevy/events", {
    method: "POST",
    headers: { authorization, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function deps(data: unknown = { ok: true, duplicate: false }) {
  const calls: unknown[] = [];
  const admin = {
    rpc: async (name: string, args: unknown) => {
      calls.push({ name, args });
      return { data, error: null };
    },
  };
  return { expectedSecret: "shared", createAdminClient: () => admin as never, calls };
}

test("rejects an invalid secret before reading the event", async () => {
  const result = await postBelevyEventWithDeps(request(validBody, "Bearer wrong"), deps());
  assert.equal(result.status, 401);
});

test("rejects an invalid event without calling Supabase", async () => {
  const d = deps();
  const result = await postBelevyEventWithDeps(request({ ...validBody, ends_at: validBody.starts_at }), d);
  assert.equal(result.status, 400);
  assert.equal(d.calls.length, 0);
});

test("records a safe event and exposes idempotency", async () => {
  const d = deps({ ok: true, duplicate: true });
  const result = await postBelevyEventWithDeps(request(validBody), d);
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), { ok: true, duplicate: true });
  assert.equal(d.calls.length, 1);
});
