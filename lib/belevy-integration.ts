export type BelevyAgendaAppointment = {
  id: string;
  serviceName: string;
  startsAt: string;
  endsAt: string;
  status: string;
};

export type BelevyAgendaSummary =
  | { status: "not_configured" | "not_connected" | "expired" | "unavailable" }
  | {
      status: "connected";
      slug: string;
      publicUrl: string;
      expiresAt: string | null;
      appointments: BelevyAgendaAppointment[];
      upcomingCount: number;
      completedLast30Days: number;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function publicUrlForSlug(slug: string): string | null {
  const base = process.env.BELEVY_PUBLIC_URL?.trim() || "https://belevy.com.br";
  try {
    return new URL(`/${encodeURIComponent(slug)}`, `${base.replace(/\/$/, "")}/`).toString();
  } catch {
    return null;
  }
}

function normalizeSummary(value: unknown): BelevyAgendaSummary {
  if (!isRecord(value)) return { status: "unavailable" };
  if (value.status === "not_connected" || value.status === "expired") return { status: value.status };
  if (value.status !== "connected" || typeof value.slug !== "string") return { status: "unavailable" };

  const publicUrl = publicUrlForSlug(value.slug.trim());
  if (!publicUrl) return { status: "unavailable" };

  const appointments = Array.isArray(value.upcoming_appointments)
    ? value.upcoming_appointments.flatMap((item) => {
        if (!isRecord(item)) return [];
        if (
          typeof item.id !== "string" ||
          typeof item.service_name !== "string" ||
          typeof item.starts_at !== "string" ||
          typeof item.ends_at !== "string" ||
          typeof item.status !== "string"
        ) return [];
        return [{
          id: item.id,
          serviceName: item.service_name,
          startsAt: item.starts_at,
          endsAt: item.ends_at,
          status: item.status,
        }];
      })
    : [];

  const metrics = isRecord(value.metrics) ? value.metrics : {};
  return {
    status: "connected",
    slug: value.slug.trim(),
    publicUrl,
    expiresAt: typeof value.expires_at === "string" ? value.expires_at : null,
    appointments,
    upcomingCount: typeof metrics.upcoming_count === "number" ? metrics.upcoming_count : appointments.length,
      completedLast30Days: typeof metrics.completed_last_30_days === "number" ? metrics.completed_last_30_days : 0,
  };
}

export async function getBelevyAgendaSummary(email: string | undefined): Promise<BelevyAgendaSummary> {
  const endpoint = process.env.BELEVY_AGENDA_SUMMARY_ENDPOINT?.trim();
  const secret = process.env.BELEVY_SHARED_SECRET?.trim();
  if (!endpoint || !secret || !email) return { status: "not_configured" };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${secret}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ email, source: "agenda" }),
      cache: "no-store",
      signal: AbortSignal.timeout(4_000),
    });
    if (response.status === 404) return { status: "not_connected" };
    if (!response.ok) return { status: "unavailable" };
    return normalizeSummary(await response.json());
  } catch {
    return { status: "unavailable" };
  }
}
