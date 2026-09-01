import { BrandMark } from "@/components/ui/brand-mark";
import { TodayInteractiveHub } from "@/app/today/today-interactive-hub";
import type { CopilotTemplate, DueRetentionItem } from "@/lib/copilot-types";
import type {
  MicroLearningPillUI,
  DiagnosticQuestionUI,
} from "@/lib/value-diagnostic-types";

const mockTemplates: CopilotTemplate[] = [
  {
    id: "e1a9657b-72ea-4d1a-8c88-e994e433f7c1",
    slug: "achei-caro-custo-dia",
    objection_category: "price_too_high",
    title: "Achei Caro — Desconstrução por Custo/Dia",
    psychological_rationale: "Quando a cliente diz 'achei caro', ela não está dizendo que não tem dinheiro; ela está dizendo que o risco de se arrepender é maior que o valor percebido. Ao quebrar o valor por 30 dias (R$ 4 por dia) e reforçar a durabilidade e garantia, o cérebro límbico troca o foco de 'gasto grande hoje' para 'cuidado diário imperceptível'.",
    client_subtext: "Tenho medo de pagar isso tudo e o resultado durar 3 dias ou estragar rápido.",
    script_text: "Entendo perfeitamente, Ju! Mas deixa eu te contar um segredo: o nosso procedimento dura em média 28 a 30 dias impecável. Se você dividir, dá menos de R$ 4 por dia para você acordar pronta todo santo dia sem perder 40 minutos no espelho. Além disso, eu te dou garantia de 7 dias: se qualquer detalhe soltar, eu refaço sem cobrar nada. Eu tenho quinta às 15h ou sexta às 11h. Qual fica mais tranquilo para você?",
    script_audio: "Oi Ju! Super entendo você, de verdade... Mas deixa eu te contar um detalhe: esse procedimento dura de 28 a 30 dias perfeitinho. Se você colocar na ponta do lápis, dá menos de R$ 4 por dia pra você acordar maravilhosa todo dia sem perder tempo. E você ainda tem minha garantia de 7 dias. Eu separei dois horários bem concorridos aqui: quinta às 15h ou sexta às 11h. Qual dos dois cabe melhor na sua rotina?",
    audio_duration_seconds: 22,
    audio_tone_guide: "Voz calorosa, calma, com um sorrisinho leve e segurança absoluta, sem afobação.",
    approach_type: "consultative",
  },
  {
    id: "b2b9657b-72ea-4d1a-8c88-e994e433f7c2",
    slug: "vou-ver-reserva-cortesia",
    objection_category: "procrastination",
    title: "Vou Ver e Te Aviso — Reserva de Cortesia",
    psychological_rationale: "O 'vou ver e te aviso' é uma saída educada para procrastinar a decisão sem confronto. Ao segurar o horário como 'reserva de cortesia' por 2 horas, você ativa o gatilho da aversão à perda (Kahneman) sem parecer insistente.",
    client_subtext: "Quero fazer, mas estou com preguiça de decidir agora ou vou pesquisar outras opções.",
    script_text: "Combinado, Ju! Para você não correr o risco de ficar sem o horário que me pediu, eu vou deixar a vaga de quinta às 15h pré-reservada em seu nome até às 17h, tá bom? Se até lá você me confirmar, ela é sua! Um beijo!",
    script_audio: "Perfeito, Ju! Faz assim então: como a minha agenda dessa semana tá quase esgotando, eu vou deixar esse horário de quinta às 15h pré-reservado no seu nome até o final da tarde, tá bom? Assim você não perde a vaga se decidir fazer. Qualquer coisa me dá um alô por aqui!",
    audio_duration_seconds: 18,
    audio_tone_guide: "Tom solícito, gentil e desapegado, passando a sensação de que a agenda é disputada.",
    approach_type: "direct",
  },
  {
    id: "c3c9657b-72ea-4d1a-8c88-e994e433f7c3",
    slug: "marido-beneficio-duplo",
    objection_category: "third_party_decision",
    title: "Ver com Marido — Foco no Bem-Estar",
    psychological_rationale: "Geralmente é um escudo para não dizer 'não'. Ao validar o companheiro e dar um argumento de bem-estar e praticidade, você empodera a cliente a decidir por si mesma.",
    client_subtext: "Quero que ele aprove ou estou usando isso de desculpa para pensar mais.",
    script_text: "Claro, Ju, super apoio vocês conversarem! Inclusive muitas clientes minhas comentam que o marido até prefere quando elas fazem aqui, porque elas economizam tempo no dia a dia e ficam super bem dispostas. Fico no seu aguardo!",
    script_audio: "Com certeza Ju, conversa com ele sim! Inclusive, várias clientes me dizem que os maridos adoram o resultado porque elas ficam super felizes e economizam horas se arrumando. Fica à vontade e me avisa assim que conversarem!",
    audio_duration_seconds: 19,
    audio_tone_guide: "Amigável, descontraída e acolhedora.",
    approach_type: "consultative",
  },
  {
    id: "d4d9657b-72ea-4d1a-8c88-e994e433f7c4",
    slug: "so-preco-conectar-diagnostico",
    objection_category: "just_browsing",
    title: "Só o Preço — Conexão Antes do Número",
    psychological_rationale: "Falar o preço seco commoditiza o seu serviço instantaneamente. Ao responder de volta com uma pergunta sobre o histórico da cliente antes de revelar o valor, você assume a postura de especialista e quebra o padrão de cotação fria.",
    client_subtext: "Estou disparando mensagem para 5 profissionais no WhatsApp e vou na mais barata.",
    script_text: "Olá! Tudo bem? Fica entre R$ 120 e R$ 150 dependendo do estado atual e do efeito que você deseja. Me conta: você já fez esse procedimento antes ou seria a primeira vez?",
    script_audio: "Oi, tudo bem? O valor varia entre R$ 120 e R$ 150, depende muito do resultado que você tá buscando e do efeito que você prefere. Me conta uma coisa rapidinho: você já fez esse procedimento antes ou seria a sua primeira vez?",
    audio_duration_seconds: 20,
    audio_tone_guide: "Interessada, atenciosa e profissional.",
    approach_type: "consultative",
  },
];

const mockDueRetentions: DueRetentionItem[] = [
  {
    appointment_id: "ret-1",
    customer_id: "cust-1",
    customer_name: "Camila Fernandes",
    customer_contact: "11987654321",
    service_id: "serv-1",
    service_name: "Alongamento em Fibra de Vidro",
    days_since_completed: 25,
    recurrence_cycle_days: 28,
    variance_days: -3,
    timing_status: "optimal_timing",
  },
  {
    appointment_id: "ret-2",
    customer_id: "cust-2",
    customer_name: "Juliana Costa",
    customer_contact: "11999998888",
    service_id: "serv-2",
    service_name: "Extensão de Cílios Volume Russo",
    days_since_completed: 26,
    recurrence_cycle_days: 21,
    variance_days: 5,
    timing_status: "overdue",
  },
];

const mockDailyPill: MicroLearningPillUI = {
  pill_id: "pill-1",
  slug: "alex-hormozi-equacao-valor",
  title: "A Equação de Valor de Alex Hormozi",
  theme: "fearless_pricing",
  duration_seconds: 50,
  expert_reference: "Alex Hormozi ($100M Offers)",
  catchphrase: "O cliente não paga pelo seu esforço. Ele paga pela certeza do resultado sem perder tempo.",
  audio_url: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
  audio_transcript: "Imagine duas manicures que cobram R$ 100. A primeira demora 2h30, não oferece café e a unha quebra em 5 dias. A segunda demora 1h15 num espaço cheiroso, abre materiais esterilizados na sua frente e garante 28 dias sem lascar. O preço é o mesmo, mas a segunda parece 3 vezes mais barata! Porque o valor percebido aumenta quando o tempo e o esforço da cliente diminuem.",
  visual_cards: [
    {
      step: 1,
      tag: "O Erro Comum",
      text: "Achar que para cobrar mais você precisa trabalhar mais horas ou fazer coisas complicadas. Na verdade, clientes pagam mais por quem resolve com menos atrito.",
    },
    {
      step: 2,
      tag: "A Fórmula de Hormozi",
      text: "Valor = (Sonho Desejado × Certeza do Resultado) ÷ (Tempo de Espera × Esforço da Cliente). Reduza o esforço dela e o seu valor dobra.",
    },
    {
      step: 3,
      tag: "Aplicação Prática",
      text: "Em vez de dizer 'demora 2 horas', diga: 'você sai pronta em 60 minutos e tem garantia total de 7 dias sem pagar nada a mais'.",
    },
  ],
  quick_script_to_copy: "Oi Ju! Para você não perder tempo na sua rotina, o nosso atendimento dura apenas 60 minutos e você ainda conta com nossa garantia de 7 dias: se qualquer detalhe soltar, eu refaço na hora!",
  consumed_today: false,
};

const mockQuestions: DiagnosticQuestionUI[] = [
  {
    id: "q1",
    slug: "sensory_ritual",
    dimension: "service_climax_ritual",
    step_order: 1,
    title: "1. Como é o ritual de chegada da sua cliente?",
    helper_text: "A percepção de luxo começa nos primeiros 3 minutos de contato sensorial.",
    options: [
      {
        id: "opt1",
        label: "Entra direto e eu já começo a fazer o procedimento na cadeira",
        description: "Atendimento direto, sem ritual de recepção ou acolhimento inicial.",
        points: 15,
      },
      {
        id: "opt2",
        label: "Ofereço água ou cafezinho básico se ela pedir",
        description: "Hospitalidade padrão do mercado.",
        points: 50,
      },
      {
        id: "opt3",
        label: "Ritual completo: xícara elegante, ambiente cheiroso e acolhimento nominal",
        description: "Experiência multissensorial ativa inspirada na psicologia de Rory Sutherland.",
        points: 100,
      },
    ],
  },
  {
    id: "q2",
    slug: "biosecurity",
    dimension: "positioning_showcase",
    step_order: 2,
    title: "2. Como você demonstra biossegurança e esterilização?",
    helper_text: "A confiança biológica é o maior redutor de atrito de preço na estética.",
    options: [
      {
        id: "opt4",
        label: "Uso materiais limpos, mas não costumo abrir embalagens na frente dela",
        description: "A cliente não enxerga o trabalho invisível de esterilização.",
        points: 20,
      },
      {
        id: "opt5",
        label: "Abro a embalagem lacrada de autoclave e uso descartáveis na presença dela",
        description: "Tangibiliza o cuidado com a saúde e segurança.",
        points: 95,
      },
    ],
  },
  {
    id: "q3",
    slug: "packaging_postcare",
    dimension: "physical_tangibility",
    step_order: 3,
    title: "3. O que a cliente leva com ela ao sair do atendimento?",
    helper_text: "Serviço sem embalagem pós-atendimento parece serviço comum de bairro.",
    options: [
      {
        id: "opt6",
        label: "Apenas o comprovante do Pix e um 'tchau, até a próxima'",
        description: "Sem tangibilização ou instruções de cuidado.",
        points: 10,
      },
      {
        id: "opt7",
        label: "Envelope VIP com guia de cuidados, mini mimo e certificado de garantia",
        description: "Efeito Chivas Regal: tangibiliza o valor do investimento.",
        points: 100,
      },
    ],
  },
];

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[var(--color-canvas)] pb-24">
      <div className="mx-auto w-full max-w-xl px-5 py-5 sm:px-8 sm:py-7">
        <header className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
          <BrandMark showLabel={false} />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-revenue-subtle)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-revenue-primary)]">
              Modo Demonstração Interativo
            </span>
          </div>
        </header>

        <section className="pt-6 pb-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
            Hoje • Simulação de Usuária
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink-solid)]">
            Seu Hub de Atendimento 80/20
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-ink-muted)]">
            Experimente o SOS Copiloto, a Retenção Biológica, o Diagnóstico de Valor e a Pílula de Café.
          </p>
        </section>

        <TodayInteractiveHub
          workspaceId="demo-workspace"
          dueRetentions={mockDueRetentions}
          copilotTemplates={mockTemplates}
          dailyPill={mockDailyPill}
          diagnosticQuestions={mockQuestions}
          activeDiagnostic={null}
        />
      </div>
    </main>
  );
}
