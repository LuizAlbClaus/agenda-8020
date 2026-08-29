import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const eventSchema = z.object({
  event_id: z.string().trim().min(1).max(160),
  event_type: z.enum(["created", "confirmed", "cancelled", "completed", "no_show", "rescheduled"]),
  appointment_id: z.string().trim().min(1).max(160),
  service_name: z.string().trim().min(1).max(160),
  starts_at: z.string().datetime({ offset: true }),
  ends_at: z.string().datetime({ offset: true }),
  status: z.string().trim().min(1).max(48),
  occurred_at: z.string().datetime({ offset: true }).optional(),
  source: z.literal("belevy"),
});

type EventInput = z.infer<typeof eventSchema>;
type AdminClient = ReturnType<typeof createAdminClient>;

export interface BelevyEventsDeps {
  expectedSecret?: string;
  createAdminClient: () => AdminClient;
}

function unauthorized() {
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}

function sameSecret(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

export async function postBelevyEventWithDeps(request: Request, deps: BelevyEventsDeps) {
  if (!deps.expectedSecret) return unauthorized();
  const authorization = request.headers.get("authorization") ?? "";
  if (!sameSecret(authorization.replace(/^Bearer\s+/i, ""), deps.expectedSecret)) return unauthorized();

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 16_384) return NextResponse.json({ error: "Payload inválido" }, { status: 400 });

  let input: EventInput;
  try {
    input = eventSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  try {
    const admin = deps.createAdminClient();
    const rpc = admin.rpc as unknown as (name: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { code?: string; message?: string } | null }>;
    const { data, error } = await rpc("record_belevy_appointment_event", {
      p_event_id: input.event_id,
      p_event_type: input.event_type,
      p_appointment_id: input.appointment_id,
      p_service_name: input.service_name,
      p_starts_at: input.starts_at,
      p_ends_at: input.ends_at,
      p_status: input.status,
      p_occurred_at: input.occurred_at ?? new Date().toISOString(),
    });
    if (error) {
      console.error("[belevy-events] record failed", { code: error.code });
      return NextResponse.json({ error: "Evento temporariamente indisponível" }, { status: 503 });
    }
    const result = data && typeof data === "object" ? data as { duplicate?: boolean } : {};
    return NextResponse.json({ ok: true, duplicate: result.duplicate === true });
  } catch (error) {
    console.error("[belevy-events] unexpected failure", { code: error instanceof Error ? error.name : "unknown" });
    return NextResponse.json({ error: "Evento temporariamente indisponível" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  return postBelevyEventWithDeps(request, {
    expectedSecret: process.env.BELEVY_EVENTS_SHARED_SECRET,
    createAdminClient,
  });
}
