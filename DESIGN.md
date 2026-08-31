# Agenda 80/20 — Design System Specification

Este documento é a fonte canônica de verdade de design para o **Agenda 80/20** (Design System v1.0).
Ele define a identidade visual, a psicologia de interface, a escala de tokens OKLCH e as regras ergonômicas para desenvolvimento no Next.js App Router e Tailwind CSS v4.

---

## 1. Princípios de Design & Arquétipo do Usuário

### Público-Alvo (Solo Service Pro)
- **Nicho:** Profissionais autônomos e pequenos negócios de serviços (Beleza, Estética, Saúde, Bem-estar, Serviços Locais).
- **Contexto de Uso:** Mobile-first / Mobile-only, uso com 1 polegar em intervalos de 2 a 5 minutos entre atendimentos.
- **Modelo Mental:** Aversão a dashboards estressantes; necessidade de direção clara ("O que fazer agora?").
- **Modelo Comportamental (BJ Fogg $B = MAP$):**
  - **Motivação:** Ganho financeiro claro e agenda cheia.
  - **Habilidade (Facilidade):** Micro-missões rápidas com mensagens pré-escritas para WhatsApp.
  - **Gatilho:** Alertas calmos de horários vagos e anéis diários de metas.

---

## 2. Paleta de Cores Semântica (OKLCH)

Utilizamos o espaço de cores **OKLCH (Lightness, Chroma, Hue)** com **Neutral Tinting** (Chroma 0.005 a 0.015 no matiz 250) para garantir acessibilidade visual (WCAG 2.1 AAA / APCA) e eliminar o "cinza plástico" genérico de IA.

| Papel Semântico | Token CSS | Valor OKLCH | Finalidade de Uso |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `--color-canvas` | `oklch(0.985 0.005 250)` | Fundo principal da aplicação |
| **Card Surface** | `--color-surface-card` | `oklch(1 0 0)` | Superfície de cards e modais |
| **Muted Surface** | `--color-surface-muted`| `oklch(0.97 0.008 250)` | Fundos de inputs, previews e tags |
| **Action Primary** | `--color-action-primary`| `oklch(0.64 0.21 38)` | Botões de ação, CTAs, foco e momentum |
| **Action Subtle** | `--color-action-subtle` | `oklch(0.94 0.05 38)` | Badges de ação e fundos ativos |
| **Revenue / Sucesso**| `--color-revenue-primary`| `oklch(0.68 0.18 152)` | Impacto financeiro e slots preenchidos |
| **Revenue Subtle** | `--color-revenue-subtle`| `oklch(0.95 0.04 152)` | Fundo de celebração de receita |
| **Opportunity / Vaga**| `--color-opportunity-primary`| `oklch(0.75 0.16 75)` | Horários vagos e oportunidades |
| **Opportunity Subtle**| `--color-opportunity-subtle`| `oklch(0.96 0.04 75)` | Fundo de aviso calmo de vaga |
| **Texto Principal** | `--color-ink-solid` | `oklch(0.16 0.015 250)` | Títulos e leitura primária |
| **Texto Secundário**| `--color-ink-muted` | `oklch(0.42 0.02 250)` | Legendas e descrições (Contraste 4.9:1) |
| **Bordas** | `--color-border-subtle`| `oklch(0.91 0.01 250)` | Divisores e bordas estruturais |

---

## 3. Ergonomia Mobile & Touch Targets

1. **Touch Target Mínimo:** Todo elemento interativo (botões, switches, cards clicáveis) deve ter altura mínima de `min-h-[48px]`.
2. **Zona do Polegar (One-Thumb Reach):** As ações principais devem estar localizadas no terço inferior da viewport mobile.
3. **Tipografia Fluida:** Textos com `text-balance` em títulos e `text-pretty` em parágrafos para evitar órfãos.

---

## 4. Matriz de Qualidade Anti-Slop (Regras do Impeccable)

- ❌ **Proibido Side-Stripe Borders:** Nunca usar `border-left: 4px solid ...` em cards. Usar badges ou fundos sutis.
- ❌ **Proibido Gradient Text:** Nunca aplicar degradês decorativos em títulos.
- ❌ **Proibido Over-Rounding:** Cards têm `border-radius: 14px` (máximo 16px). Pílulas (`rounded-full`) apenas para badges e botões específicos.
- ❌ **Proibido Ghost Cards:** Nunca combinar borda de 1px com sombra difusa > 16px. Usar `--shadow-card-resting` (0 1px 3px).
- ❌ **Proibido Monocultura Bege:** O fundo deve manter pureza e frescor com neutral tinting frio/azulado, nunca creme amarelado de template.
