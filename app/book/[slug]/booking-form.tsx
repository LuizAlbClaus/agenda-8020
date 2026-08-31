"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { createBooking } from "./actions";

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  description?: string | null;
  price_minor?: number | null;
  currency?: string | null;
};

type Day = {
  date: string;
  slots: Array<{ starts_at: string; ends_at: string }>;
};

interface BookingFormProps {
  slug: string;
  services: Service[];
  days: Day[];
  businessName?: string;
}

export default function BookingForm({
  slug,
  services,
  days,
  businessName,
}: BookingFormProps) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(days[0]?.date ?? "");
  const [startsAt, setStartsAt] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmedData, setConfirmedData] = useState<{
    serviceName: string;
    duration: number;
    startsAt: string;
    customerName: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedDay = days.find((item) => item.date === date);
  const selectedService = services.find((item) => item.id === serviceId) ?? services[0];

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMsg("");

    if (!startsAt) {
      setErrorMsg("Por favor, selecione um dos horários disponíveis.");
      return;
    }

    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg("Por favor, informe seu nome completo.");
      return;
    }

    startTransition(async () => {
      const result = await createBooking({
        slug,
        serviceId,
        startsAt,
        customerName: name,
        customerContact: contact,
      });

      if (result.ok) {
        setConfirmedData({
          serviceName: selectedService?.name ?? "Serviço",
          duration: selectedService?.duration_minutes ?? 0,
          startsAt,
          customerName: name.trim(),
        });
        setErrorMsg("");
      } else {
        setErrorMsg(
          result.error ??
            "Não foi possível confirmar o agendamento no momento. Tente novamente."
        );
      }
    });
  }

  function handleReset() {
    setConfirmedData(null);
    setStartsAt("");
    setErrorMsg("");
  }

  if (confirmedData) {
    const appointmentDate = new Date(confirmedData.startsAt);
    const formattedDate = appointmentDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const formattedTime = appointmentDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div
        role="status"
        aria-live="polite"
        className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-6 shadow-[var(--shadow-card-elevated)] sm:p-8"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-[var(--color-revenue-subtle)] text-[var(--color-revenue-primary)]">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </div>

        <div className="mt-5">
          <div className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-revenue-subtle)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-revenue-primary)]">
            Reserva confirmada
          </div>
          <h2 className="mt-3 text-2xl font-bold leading-tight tracking-[-0.03em] text-balance sm:text-3xl text-[var(--color-ink-solid)]">
            Horário reservado com sucesso!
          </h2>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            {businessName ? `Seu agendamento em ${businessName} foi registrado.` : "Seu agendamento foi registrado com sucesso."}
          </p>
        </div>

        {/* Structured Summary Box */}
        <div className="mt-6 space-y-3 rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-5">
          <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-3">
            <div>
              <p className="text-xs font-medium text-[var(--color-ink-muted)]">Serviço</p>
              <p className="text-base font-bold text-[var(--color-ink-solid)]">
                {confirmedData.serviceName}
              </p>
            </div>
            {confirmedData.duration > 0 && (
              <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-surface-card)] px-2.5 py-1 text-xs font-semibold text-[var(--color-ink-muted)] border border-[var(--color-border-subtle)]">
                <Clock3 className="size-3" aria-hidden="true" />
                {confirmedData.duration} min
              </span>
            )}
          </div>

          <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-3">
            <div>
              <p className="text-xs font-medium text-[var(--color-ink-muted)]">Data e Horário</p>
              <p className="text-base font-bold capitalize text-[var(--color-ink-solid)]">
                {formattedDate} às {formattedTime}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-[var(--color-ink-muted)]">Nome informado</p>
            <p className="text-sm font-semibold text-[var(--color-ink-solid)]">
              {confirmedData.customerName}
            </p>
          </div>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-[var(--color-ink-muted)]">
          Caso precise alterar o horário ou desmarcar o atendimento, entre em contato diretamente com o espaço.
        </p>

        <div className="mt-6 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-[var(--color-surface-card)] px-5 text-sm font-bold text-[var(--color-ink-solid)] transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-none"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            <span>Fazer novo agendamento</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-8 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 shadow-[var(--shadow-card-resting)] sm:p-8"
      noValidate
    >
      {/* 1. Service Selection */}
      <div>
        <label
          htmlFor="service-select"
          className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink-solid)]"
        >
          1. Escolha o serviço
        </label>

        <div className="mt-3 grid gap-2.5">
          {services.map((service) => {
            const isSelected = service.id === serviceId;
            const formattedPrice =
              service.price_minor && service.price_minor > 0
                ? (service.price_minor / 100).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: service.currency || "BRL",
                  })
                : null;

            return (
              <button
                key={service.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setServiceId(service.id)}
                className={`flex min-h-[52px] w-full items-center justify-between rounded-[var(--radius-button)] border p-4 text-left transition-all ${
                  isSelected
                    ? "border-[var(--color-action-primary)] bg-[var(--color-action-subtle)] text-[var(--color-ink-solid)] ring-1 ring-[var(--color-action-primary)]"
                    : "border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] hover:border-[var(--color-border-strong)]"
                }`}
              >
                <div className="pr-3">
                  <p className="text-sm font-bold text-[var(--color-ink-solid)]">
                    {service.name}
                  </p>
                  {service.description && (
                    <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                      {service.description}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-ink-muted)]">
                    <Clock3 className="size-3" aria-hidden="true" />
                    {service.duration_minutes} min
                  </span>
                  {formattedPrice && (
                    <p className="mt-0.5 text-xs font-bold text-[var(--color-ink-solid)]">
                      {formattedPrice}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Date Selection */}
      <div>
        <label
          htmlFor="date-select"
          className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink-solid)]"
        >
          2. Escolha o dia
        </label>
        <div className="mt-3">
          <select
            id="date-select"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setStartsAt("");
            }}
            className="min-h-[48px] w-full rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-[var(--color-surface-card)] px-4 text-sm font-semibold text-[var(--color-ink-solid)] outline-none transition-colors focus:border-[var(--color-action-primary)]"
          >
            {days.map((day) => {
              const d = new Date(`${day.date}T12:00:00`);
              const label = d.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              });
              return (
                <option key={day.date} value={day.date}>
                  {label.charAt(0).toUpperCase() + label.slice(1)} ({day.slots.length} horários)
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* 3. Time Slots */}
      <fieldset>
        <legend className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink-solid)]">
          3. Horário disponível
        </legend>
        <div className="mt-3">
          {selectedDay?.slots && selectedDay.slots.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
              {selectedDay.slots.map((slot) => {
                const isSelected = startsAt === slot.starts_at;
                const timeString = new Date(slot.starts_at).toLocaleTimeString(
                  "pt-BR",
                  { hour: "2-digit", minute: "2-digit" }
                );

                return (
                  <button
                    key={slot.starts_at}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setStartsAt(slot.starts_at)}
                    className={`flex min-h-[48px] items-center justify-center rounded-[var(--radius-button)] border px-3 text-sm font-bold transition-colors focus-visible:outline-none ${
                      isSelected
                        ? "border-[var(--color-action-primary)] bg-[var(--color-action-subtle)] text-[var(--color-action-primary)] ring-1 ring-[var(--color-action-primary)]"
                        : "border-[var(--color-border-strong)] bg-[var(--color-surface-card)] text-[var(--color-ink-solid)] hover:border-[var(--color-action-primary)]"
                    }`}
                  >
                    {timeString}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-4 text-center text-xs text-[var(--color-ink-muted)]">
              Não há horários disponíveis para este dia. Escolha outra data.
            </div>
          )}
        </div>
      </fieldset>

      {/* 4. Customer Info */}
      <div className="space-y-4 border-t border-[var(--color-border-subtle)] pt-6">
        <div>
          <label
            htmlFor="customer-name"
            className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink-solid)]"
          >
            Seu nome completo
          </label>
          <input
            id="customer-name"
            type="text"
            required
            maxLength={120}
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 min-h-[48px] w-full rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-[var(--color-surface-card)] px-4 text-base text-[var(--color-ink-solid)] outline-none transition-colors placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-action-primary)]"
            placeholder="Como podemos chamar você?"
          />
        </div>

        <div>
          <label
            htmlFor="customer-contact"
            className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink-solid)]"
          >
            WhatsApp ou E-mail <span className="font-normal text-[var(--color-ink-muted)]">(opcional)</span>
          </label>
          <input
            id="customer-contact"
            type="text"
            maxLength={240}
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            className="mt-2 min-h-[48px] w-full rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-[var(--color-surface-card)] px-4 text-base text-[var(--color-ink-solid)] outline-none transition-colors placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-action-primary)]"
            placeholder="(00) 00000-0000 ou seu@email.com"
          />
        </div>

        <p className="text-xs leading-relaxed text-[var(--color-ink-muted)]">
          Seus dados serão utilizados estritamente para administrar este agendamento. Consulte nossa{" "}
          <Link
            href="/privacy"
            className="font-medium text-[var(--color-ink-solid)] underline underline-offset-4 transition-colors hover:text-[var(--color-action-primary)] focus-visible:outline-none"
          >
            política de privacidade
          </Link>
          .
        </p>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-2.5 rounded-[var(--radius-sm)] border border-[var(--color-danger-primary)]/20 bg-[var(--color-danger-subtle)] p-3 text-xs leading-relaxed text-[var(--color-danger-primary)]"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={pending || !serviceId || !startsAt || !name.trim()}
        className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-action-hover)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
            <span>Confirmando agendamento…</span>
          </>
        ) : (
          <>
            <span>Confirmar agendamento</span>
            <ArrowRight className="ml-2 size-4" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
