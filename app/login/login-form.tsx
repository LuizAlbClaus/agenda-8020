"use client";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); setLoading(true); try { const normalizedEmail = email.trim().toLowerCase(); const supabase = createClient(); const { error: authError } = await supabase.auth.signInWithOtp({ email: normalizedEmail, options: { shouldCreateUser: false, emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/confirm` } }); if (authError) throw authError; setSent(true); } catch { setError("O acesso está temporariamente indisponível. Tente novamente em instantes."); } finally { setLoading(false); } }
  if (sent) return <div role="status" className="mt-8 rounded-2xl border border-teal-200 bg-teal-50 p-5 text-teal-950"><h2 className="font-semibold">Confira seu email</h2><p className="mt-2 text-sm">Se houver uma conta para este endereço, enviaremos um link de acesso.</p></div>;
  return <form onSubmit={submit} className="mt-8 space-y-4"><label htmlFor="email" className="block text-sm font-semibold text-slate-800">Seu email</label><input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base" placeholder="voce@exemplo.com" />{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button disabled={loading} className="min-h-12 w-full rounded-full bg-teal-800 px-5 font-semibold text-white disabled:opacity-60">{loading ? "Enviando…" : "Enviar meu acesso"}</button></form>;
}
