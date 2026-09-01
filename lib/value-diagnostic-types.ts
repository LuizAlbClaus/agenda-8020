import { z } from "zod";

// ============================================================================
// Enums e Literais Canônicos
// ============================================================================

export const ValueDiagnosticTriggerSchema = z.enum([
  "copilot_objection",
  "checkin_flow",
  "action_outcome",
  "manual_audit",
]);
export type ValueDiagnosticTrigger = z.infer<typeof ValueDiagnosticTriggerSchema>;

export const ValueArchetypeSchema = z.enum([
  "price_prisoner",
  "hidden_artisan",
  "polishing_specialist",
  "premium_brand",
]);
export type ValueArchetype = z.infer<typeof ValueArchetypeSchema>;

export const ValueLeakCategorySchema = z.enum([
  "showcase_commodity",
  "climax_rushed",
  "intangible_vacuum",
  "pricing_fear",
  "balanced",
]);
export type ValueLeakCategory = z.infer<typeof ValueLeakCategorySchema>;

export const QuestionDimensionSchema = z.enum([
  "positioning_showcase",
  "service_climax_ritual",
  "physical_tangibility",
  "pricing_anchoring",
]);
export type QuestionDimension = z.infer<typeof QuestionDimensionSchema>;

export const ActionExecutionStatusSchema = z.enum([
  "not_started",
  "in_progress",
  "completed",
  "dismissed",
]);
export type ActionExecutionStatus = z.infer<typeof ActionExecutionStatusSchema>;

export const LearningThemeSchema = z.enum([
  "positioning",
  "fearless_pricing",
  "enchantment_ritual",
  "client_retention",
]);
export type LearningTheme = z.infer<typeof LearningThemeSchema>;

// ============================================================================
// Schemas de Validação de Payloads de Entrada (Zod 4)
// ============================================================================

export const AnswerItemSchema = z.object({
  question_id: z.string().uuid("ID de questão inválido"),
  option_id: z.string().min(1, "Opção selecionada é obrigatória"),
});

export const SubmitValueDiagnosticInputSchema = z.object({
  workspaceId: z.string().uuid("Workspace inválido"),
  trigger: ValueDiagnosticTriggerSchema,
  answers: z.array(AnswerItemSchema).min(1, "Ao menos uma resposta deve ser enviada"),
});
export type SubmitValueDiagnosticInput = z.infer<typeof SubmitValueDiagnosticInputSchema>;

export const CompleteValueActionInputSchema = z.object({
  workspaceId: z.string().uuid("Workspace inválido"),
  actionId: z.string().uuid("ID de ação inválido"),
});
export type CompleteValueActionInput = z.infer<typeof CompleteValueActionInputSchema>;

export const ConsumeLearningPillInputSchema = z.object({
  workspaceId: z.string().uuid("Workspace inválido"),
  pillId: z.string().uuid("ID de pílula inválido"),
});
export type ConsumeLearningPillInput = z.infer<typeof ConsumeLearningPillInputSchema>;

// ============================================================================
// Interfaces de Dados de Frontend
// ============================================================================

export interface DiagnosticOptionUI {
  id: string;
  label: string;
  description: string;
  points: number;
  leak_flag?: ValueLeakCategory | null;
}

export interface DiagnosticQuestionUI {
  id: string;
  slug: string;
  dimension: QuestionDimension;
  step_order: number;
  title: string;
  helper_text: string;
  options: DiagnosticOptionUI[];
}

export interface ValueActionMissionUI {
  progress_id: string;
  action_id: string;
  mission_number: number;
  title: string;
  subtitle: string;
  duration_minutes: number;
  scientific_principle: string;
  action_steps: string[];
  ready_to_use_script?: string | null;
  status: ActionExecutionStatus;
  completed_at?: string | null;
}

export interface ActiveValueDiagnosticUI {
  diagnostic_id: string;
  ivp_score: number;
  archetype: ValueArchetype;
  primary_leak: ValueLeakCategory;
  headline: string;
  empathic_rationale: string;
  client_perception_gap: {
    sees_today: string;
    will_see_after: string;
  };
  created_at: string;
  missions: ValueActionMissionUI[];
}

export interface VisualLearningCard {
  step: 1 | 2 | 3;
  tag: string;
  text: string;
  actionScript?: string;
}

export interface MicroLearningPillUI {
  pill_id: string;
  slug: string;
  theme: LearningTheme;
  expert_reference: string;
  title: string;
  catchphrase: string;
  audio_url?: string | null;
  duration_seconds: number;
  audio_transcript: string;
  visual_cards: VisualLearningCard[];
  quick_script_to_copy?: string | null;
  consumed_today: boolean;
}
