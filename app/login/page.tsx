import LoginForm from "./login-form";

export default function LoginPage() {
  return <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12"><p className="text-sm font-semibold text-teal-700">Agenda 80/20</p><h1 className="mt-3 text-3xl font-bold text-slate-900">Entre para montar seu plano</h1><p className="mt-3 text-slate-600">Digite seu email. Enviaremos um link seguro para acessar sua conta.</p><LoginForm /><p className="mt-8 text-sm text-slate-500"><a className="underline" href="/privacy">Leia nossa política de privacidade</a>.</p></main>;
}
