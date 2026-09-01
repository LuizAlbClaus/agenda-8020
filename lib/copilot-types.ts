export type ObjectionCategory =
  | "price_too_high"
  | "procrastination"
  | "third_party_decision"
  | "just_browsing"
  | "schedule_friction";

export type CopilotScriptMode = "text" | "audio";

export type RetentionTimingStatus = "early" | "optimal_timing" | "overdue";

export type ObjectionResolution = "converted" | "declined" | "dismissed" | "pending";

export interface CopilotTemplate {
  id: string;
  slug: string;
  objection_category: ObjectionCategory;
  title: string;
  psychological_rationale: string;
  client_subtext: string;
  script_text: string;
  script_audio: string;
  audio_duration_seconds: number;
  audio_tone_guide: string;
  approach_type: "direct" | "consultative" | "downsell";
}

export interface DueRetentionItem {
  appointment_id: string;
  customer_id: string;
  customer_name: string;
  customer_contact: string | null;
  service_id: string;
  service_name: string;
  recurrence_cycle_days: number;
  days_since_completed: number;
  variance_days: number;
  timing_status: RetentionTimingStatus;
}

export interface ReadinessLockResult {
  locked: boolean;
  reason: string | null;
  fix_url: string | null;
}
