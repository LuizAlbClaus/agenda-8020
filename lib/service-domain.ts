export const serviceNiches = [
  { value: "beauty", label: "Beleza", description: "Unhas, cabelo, sobrancelhas, estética e maquiagem" },
  { value: "health_wellness", label: "Saúde e bem-estar", description: "Terapias, massagens, pilates e atendimentos de cuidado" },
  { value: "local_services", label: "Serviços locais", description: "Serviços feitos na casa do cliente ou em um espaço local" },
  { value: "education", label: "Educação", description: "Aulas, reforço, idiomas e acompanhamento" },
  { value: "professional_services", label: "Serviços profissionais", description: "Consultoria, atendimento especializado e trabalho autônomo" },
  { value: "other", label: "Outro serviço", description: "Um serviço que não aparece nas opções acima" },
] as const;

export const serviceTypes = [
  { value: "nail_design", label: "Unhas / nail design", niche: "beauty" },
  { value: "hair_stylist", label: "Cabelo", niche: "beauty" },
  { value: "brows_lashes", label: "Sobrancelhas e cílios", niche: "beauty" },
  { value: "esthetician", label: "Estética e skincare", niche: "beauty" },
  { value: "makeup_artist", label: "Maquiagem", niche: "beauty" },
  { value: "beauty_other", label: "Outro serviço de beleza", niche: "beauty" },
  { value: "health_wellness", label: "Saúde e bem-estar", niche: "health_wellness" },
  { value: "local_service", label: "Serviço local", niche: "local_services" },
  { value: "teacher", label: "Aulas e educação", niche: "education" },
  { value: "professional", label: "Consultoria ou serviço profissional", niche: "professional_services" },
  { value: "other", label: "Outro", niche: "other" },
] as const;

export const bookingModes = [
  { value: "in_person", label: "Presencial" },
  { value: "online", label: "Online" },
  { value: "hybrid", label: "Presencial e online" },
  { value: "home_visit", label: "Vou até o cliente" },
] as const;

export const proofTypes = [
  { value: "portfolio", label: "Fotos, portfólio ou antes e depois" },
  { value: "testimonials", label: "Avaliações, depoimentos ou indicações" },
  { value: "results", label: "Resultados, cases ou materiais de trabalho" },
  { value: "none", label: "Ainda estou construindo essa prova" },
] as const;

export type ServiceNiche = (typeof serviceNiches)[number]["value"];
export type ServiceType = (typeof serviceTypes)[number]["value"];
export type BookingMode = (typeof bookingModes)[number]["value"];
export type ProofType = (typeof proofTypes)[number]["value"];

export function serviceTypeFor(value: string) {
  return serviceTypes.find((item) => item.value === value) ?? serviceTypes[serviceTypes.length - 1];
}

export function nicheLabel(value: string) {
  return serviceNiches.find((item) => item.value === value)?.label ?? "Serviços";
}

export function serviceLabel(value: string, fallback = "seu serviço") {
  return serviceTypes.find((item) => item.value === value)?.label ?? fallback;
}
