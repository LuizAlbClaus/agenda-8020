export type AdminRow = Record<string, unknown>;

export type AdminResult = {
  ok: boolean;
  error?: string;
  data?: unknown;
};

export function readableValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
