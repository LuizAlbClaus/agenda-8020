"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${
            process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
          }/auth/confirm`,
        },
      });
      if (authError) throw authError;
      setSent(true);
    } catch {
      setError(
        "Não foi possível enviar o link de acesso agora. Verifique seu e-mail e tente novamente em instantes."
      );
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-revenue-primary)]/20 bg-[var(--color-revenue-subtle)] p-5 text-[var(--color-ink-solid)]"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="mt-0.5 size-5 shrink-0 text-[var(--color-revenue-primary)]"
            aria-hidden="true"
          />
          <div>
            <h3 className="font-bold text-[var(--color-ink-solid)]">
              Confira seu e-mail
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-solid)]">
              Se houver uma conta para este endereço, enviaremos um link de acesso.
            </p>
            <p className="mt-2 text-xs leading-5 text-[var(--color-ink-muted)]">
              Verifique também sua caixa de spam caso não encontre a mensagem na caixa de entrada.
            </p>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setError("");
              }}
              className="mt-4 inline-flex min-h-[48px] items-center text-xs font-bold text-[var(--color-action-primary)] underline underline-offset-4 transition-colors hover:text-[var(--color-action-hover)] focus-visible:outline-none"
            >
              Usar outro e-mail
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
      <div>
        <label
          htmlFor="email"
          className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink-solid)]"
        >
          Seu e-mail cadastrado
        </label>
        <div className="relative mt-2">
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "login-error" : undefined}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading}
            className="min-h-[48px] w-full rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-[var(--color-surface-card)] px-4 text-base text-[var(--color-ink-solid)] outline-none transition-colors placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-action-primary)] disabled:opacity-60"
            placeholder="seu@email.com"
          />
        </div>
      </div>

      {error && (
        <div
          id="login-error"
          role="alert"
          aria-live="assertive"
          className="rounded-[var(--radius-sm)] border border-[var(--color-danger-primary)]/20 bg-[var(--color-danger-subtle)] p-3 text-xs leading-relaxed text-[var(--color-danger-primary)]"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-action-hover)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
            <span>Enviando link mágico…</span>
          </>
        ) : (
          <>
            <span>Enviar link de acesso</span>
            <ArrowRight className="ml-2 size-4" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
