import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookingForm from "./booking-form";

export default async function PublicBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_booking_context", { p_slug: slug });
  if (error || !data || data.error) notFound();
  const context = data as { workspace: { name: string; timezone: string; slug: string }; services: Array<{ id: string; name: string; duration_minutes: number; description?: string | null }>; days: Array<{ date: string; slots: Array<{ starts_at: string; ends_at: string }> }> };
  return <main className="mx-auto min-h-screen w-full max-w-xl px-5 py-8 sm:px-8"><p className="text-sm font-semibold text-teal-700">Agenda 80/20</p><header className="mt-10"><p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Agendamento</p><h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900">Marque seu horário com {context.workspace.name.replace(/^Agenda de /, "")}</h1><p className="mt-3 text-slate-600">Escolha o serviço e um horário disponível. O fuso usado é {context.workspace.timezone}.</p></header>{context.services.length ? <BookingForm slug={slug} services={context.services} days={context.days} /> : <p className="mt-8 rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-600">Ainda não há serviços disponíveis para agendamento.</p>}</main>;
}
