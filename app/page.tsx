import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Check,
  Clock3,
  MessageCircle,
  ShieldAlert,
  Sparkles,
  UserCheck,
  X,
  Zap,
} from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";
import { PricingSection } from "@/components/pricing-section";
import { HeroCopilotPreview } from "@/components/hero-copilot-preview";

export default async function Home(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;

  return (
    <main className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink-solid)]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-10">
        {/* Top Header */}
        <header className="flex items-center justify-between py-5 sm:py-7 border-b border-[var(--color-border-subtle)]">
          <Link
            href="/"
            className="flex items-center rounded-[var(--radius-button)] focus-visible:outline-none"
            aria-label="Agenda 80/20 — Página Inicial"
          >
            <BrandMark />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex min-h-[44px] items-center rounded-[var(--radius-button)] px-4 py-2 text-sm font-semibold text-[var(--color-ink-solid)] transition-colors hover:text-[var(--color-action-primary)] focus-visible:outline-none"
            >
              Entrar
              <ArrowRight className="ml-2 size-4" aria-hidden="true" />
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="grid gap-10 pb-16 pt-8 sm:pb-20 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-action-subtle)] px-3 py-1 text-xs font-bold text-[var(--color-action-primary)]">
              <Zap className="size-3.5" />
              Aplicativo Prático de Clientes & Agendamento
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-[1.08] tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl">
              Pare de tentar fazer tudo para conseguir clientes para o seu serviço.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--color-ink-muted)] text-pretty sm:text-lg sm:leading-8">
              O <strong>Agenda 80/20</strong> é o aplicativo prático que diz exatamente o que fazer hoje, com roteiros prontos em <strong>áudio e texto para WhatsApp</strong> que quebram objeções de preço sem você precisar dar desconto.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="#planos"
                className="inline-flex min-h-[50px] items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-7 text-sm font-bold text-white shadow-sm transition-all hover:bg-[var(--color-action-hover)] focus-visible:outline-none"
              >
                <span>Garantir acesso anual por R$ 147</span>
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Link>
              <div className="flex items-center gap-2 text-xs text-[var(--color-ink-muted)] sm:text-sm">
                <span className="size-2 rounded-full bg-[var(--color-revenue-primary)]" />
                <span>Inclui 30 dias de Belevy Pro</span>
              </div>
            </div>
          </div>

          {/* Interactive Showcase Artifact */}
          <div className="w-full">
            <HeroCopilotPreview />
          </div>
        </section>

        {/* Section: Quem é você hoje? (Personas e Momentos) */}
        <section className="border-t border-[var(--color-border-subtle)] py-14 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-revenue-primary)]">
              Princípio 80/20 Aplicado
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--color-ink-solid)] sm:text-4xl">
              O método se ajusta ao seu momento real.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
              Você não precisa executar um plano de marketing inteiro. Precisa dos poucos movimentos que geram resultado para o seu estágio agora.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {/* Card 1: Zero Clientes */}
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-6 shadow-[var(--shadow-card-resting)] flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-action-subtle)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-action-primary)]">
                  Estou no Zero
                </span>
                <h3 className="mt-3 text-lg font-bold text-[var(--color-ink-solid)]">
                  Começando sem clientes nem seguidores
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                  O app orienta o convite das primeiras modelos de treino, organização do portfólio inicial e abertura de horários no seu bairro sem pressão.
                </p>
              </div>
              <p className="mt-5 text-xs font-semibold text-[var(--color-action-primary)] border-t border-[var(--color-border-subtle)] pt-3">
                Resultado: Primeiras fotos e clientes reais.
              </p>
            </div>

            {/* Card 2: Poucas Clientes / Horários Vazios */}
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-6 shadow-[var(--shadow-card-resting)] flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-revenue-subtle)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-revenue-primary)]">
                  Horários Vazios
                </span>
                <h3 className="mt-3 text-lg font-bold text-[var(--color-ink-solid)]">
                  Já atendo, mas sobram vagas na semana
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                  O app ativa a <strong>Janela de Ouro de Retorno</strong> no tempo biológico ideal e orienta a divulgação de 2 vagas reais sem queimar seu preço.
                </p>
              </div>
              <p className="mt-5 text-xs font-semibold text-[var(--color-revenue-primary)] border-t border-[var(--color-border-subtle)] pt-3">
                Resultado: Menos buracos na grade semanal.
              </p>
            </div>

            {/* Card 3: Perguntam preço e somem */}
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-6 shadow-[var(--shadow-card-resting)] flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-opportunity-subtle)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-opportunity-primary)]">
                  Baixa Conversão
                </span>
                <h3 className="mt-3 text-lg font-bold text-[var(--color-ink-solid)]">
                  Pessoas pedem o valor e desaparecem
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                  Abra o <strong>SOS Copiloto</strong> no celular e veja a resposta exata em áudio ou texto para responder com segurança e postura de especialista.
                </p>
              </div>
              <p className="mt-5 text-xs font-semibold text-[var(--color-opportunity-primary)] border-t border-[var(--color-border-subtle)] pt-3">
                Resultado: Conversas viram agendamentos reais.
              </p>
            </div>
          </div>
        </section>

        {/* Section: 3 Armas Secretas do Software */}
        <section className="border-t border-[var(--color-border-subtle)] py-14 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
                Tecnologia no seu Bolso
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--color-ink-solid)] sm:text-4xl">
                Três recursos feitos para quem atende com as próprias mãos.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
                Esqueça planilhas complicadas ou telas cheias de gráficos. O Agenda 80/20 foi desenhado para ser operado com 1 polegar em intervalos de 2 a 5 minutos.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 flex items-start gap-4 shadow-xs">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-action-subtle)] text-[var(--color-action-primary)] font-bold">
                  <ShieldAlert className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--color-ink-solid)]">
                    SOS Copiloto com Roteiros em Áudio e Texto
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    A cliente disse que "achou caro" ou que "vai ver com o marido"? Escolha a objeção e tenha o texto pronto ou o roteiro com tom de voz orientado para mandar no WhatsApp em 20 segundos.
                  </p>
                </div>
              </div>

              <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 flex items-start gap-4 shadow-xs">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-revenue-subtle)] text-[var(--color-revenue-primary)] font-bold">
                  <Clock3 className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--color-ink-solid)]">
                    Janela de Ouro de Retorno (Ciclo Biológico)
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    O aplicativo acompanha o tempo exato de manutenção (21 a 28 dias) e avisa o dia perfeito para convidar cada cliente antes que ela vá na concorrente.
                  </p>
                </div>
              </div>

              <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 flex items-start gap-4 shadow-xs">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-opportunity-subtle)] text-[var(--color-opportunity-primary)] font-bold">
                  <Calendar className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--color-ink-solid)]">
                    Sua Agenda Oficial Integrada (Belevy Pro)
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    Você ganha 30 dias de Belevy inclusos para centralizar seus horários e mandar confirmações automáticas por WhatsApp para acabar com as faltas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Tabela Comparativa (Por que software vence) */}
        <section className="border-t border-[var(--color-border-subtle)] py-14 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-revenue-primary)]">
              Comparativo Real
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--color-ink-solid)] sm:text-4xl">
              Por que você precisa de software e não de outro curso?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
              Você já sabe executar seu serviço. O que falta é apoio à decisão e execução rápida no dia a dia.
            </p>
          </div>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] shadow-xs">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] text-left text-xs font-bold uppercase tracking-wider text-[var(--color-ink-solid)]">
                  <th className="p-4">Critério</th>
                  <th className="p-4 text-[var(--color-ink-muted)]">Cursos & PDFs</th>
                  <th className="p-4 text-[var(--color-ink-muted)]">ChatGPT Genérico</th>
                  <th className="p-4 text-[var(--color-action-primary)] bg-[var(--color-action-subtle)]">Agenda 80/20</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)] text-xs sm:text-sm">
                <tr>
                  <td className="p-4 font-bold">Tempo para aplicar</td>
                  <td className="p-4 text-[var(--color-ink-muted)]">Horas assistindo vídeo</td>
                  <td className="p-4 text-[var(--color-ink-muted)]">Precisa pensar em prompts</td>
                  <td className="p-4 font-bold text-[var(--color-action-primary)] bg-[var(--color-action-subtle)]/50">2 a 5 minutos no intervalo</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold">Respostas para WhatsApp</td>
                  <td className="p-4 text-[var(--color-ink-muted)]">Exemplos genéricos</td>
                  <td className="p-4 text-[var(--color-ink-muted)]">Textos longos e robóticos</td>
                  <td className="p-4 font-bold text-[var(--color-action-primary)] bg-[var(--color-action-subtle)]/50">Áudio e texto no tom de voz real</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold">Direção do que fazer</td>
                  <td className="p-4 text-[var(--color-ink-muted)]">Overdose de teoria</td>
                  <td className="p-4 text-[var(--color-ink-muted)]">Lista de 50 ideias soltas</td>
                  <td className="p-4 font-bold text-[var(--color-action-primary)] bg-[var(--color-action-subtle)]/50">1 próxima ação focada por dia</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold">Organização de clientes</td>
                  <td className="p-4 text-[var(--color-ink-muted)]">Nenhuma</td>
                  <td className="p-4 text-[var(--color-ink-muted)]">Nenhuma</td>
                  <td className="p-4 font-bold text-[var(--color-action-primary)] bg-[var(--color-action-subtle)]/50">Integrado com Agenda Belevy Pro</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section: Autoridade da Especialista Flávia Claus */}
        <section className="border-t border-[var(--color-border-subtle)] py-14 sm:py-20">
          <div className="mx-auto max-w-4xl rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-6 sm:p-10 shadow-[var(--shadow-card-resting)]">
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              <div className="size-24 sm:size-28 shrink-0 rounded-full bg-[var(--color-action-subtle)] border-2 border-[var(--color-action-primary)] flex items-center justify-center text-[var(--color-action-primary)] font-bold text-2xl">
                <UserCheck className="size-12" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
                  Método Validado em Bancada
                </span>
                <h3 className="mt-1 text-xl sm:text-2xl font-bold text-[var(--color-ink-solid)]">
                  Criado por Flávia Claus
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                  Criadora do método <strong>Soft Gel Express</strong> e mentora de profissionais de estética e beleza. O Agenda 80/20 nasceu da necessidade real observada em centenas de alunas que dominavam a técnica perfeita do serviço, mas travavam na hora de divulgar, responder orçamentos no WhatsApp e organizar a própria agenda.
                </p>
                <p className="mt-3 text-xs font-semibold text-[var(--color-ink-solid)]">
                  “Você não precisa ser blogueira nem gastar rios de dinheiro com anúncio. Só precisa saber conversar com quem já tem interesse.”
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section (Unificada e Otimizada) */}
        <PricingSection searchParams={searchParams} />

        {/* Footer */}
        <footer className="flex flex-col gap-6 border-t border-[var(--color-border-subtle)] py-8 text-xs text-[var(--color-ink-muted)] sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <BrandMark size="sm" />
            <span className="text-xs text-[var(--color-ink-muted)]">
              Apoio à decisão e agendamento para autônomos. Não promete renda ou agenda cheia.
            </span>
          </div>
          <div className="flex items-center gap-5 shrink-0">
            <Link
              href="/privacy"
              className="underline underline-offset-4 transition-colors hover:text-[var(--color-ink-solid)] focus-visible:outline-none"
            >
              Privacidade
            </Link>
            <Link
              href="/terms"
              className="underline underline-offset-4 transition-colors hover:text-[var(--color-ink-solid)] focus-visible:outline-none"
            >
              Termos
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
