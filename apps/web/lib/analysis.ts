export type RiskLevel = "alto" | "moderado" | "bajo";

export type AnalysisResult = {
  level: RiskLevel;
  badge: string;
  title: string;
  intro: string;
  body: string;
  supportTitle?: string;
  supportBody?: string;
  note?: string;
  recommendationsTitle: string;
  recommendations: string[];
  actionLabel: string;
  actionHref: string;
};

export const analysisResults: Record<RiskLevel, AnalysisResult> = {
  alto: {
    level: "alto",
    badge: "Riesgo alto",
    title: "¡Atención! Posible fraude",
    intro: "Analizamos tu mensaje y queremos ayudarte.",
    body: "Encontramos señales que podrían indicar un intento de fraude. Es importante que tengas cuidado antes de responder o realizar cualquier acción.",
    supportTitle: "No estás solo/a.",
    supportBody:
      "Queremos que sepas que no tienes por qué resolver esta situación sin ayuda. Estamos aquí para orientarte y ayudarte a proteger tu información y tu tranquilidad.",
    recommendationsTitle: "¿Qué te recomendamos?",
    recommendations: [
      "No respondas al mensaje.",
      "No abras enlaces ni descargues archivos.",
      "No compartas contraseñas o códigos.",
      "Consulta con una persona de confianza.",
    ],
    actionLabel: "Ver cómo protegerme",
    actionHref: "/protect/alerta?escenario=alto",
  },
  moderado: {
    level: "moderado",
    badge: "Riesgo moderado",
    title: "Ten precaución",
    intro: "Queremos que estés tranquilo/a, pero es mejor revisar antes de actuar.",
    body: "Encontramos algunos elementos que merecen atención. No podemos asegurar que sea un fraude, pero te recomendamos verificar quién envió el mensaje.",
    note: "Recuerda: no tienes que apresurarte. Tómate tu tiempo y verifica la información antes de responder.",
    recommendationsTitle: "¿Qué puedes hacer?",
    recommendations: [
      "Comprueba quién envió el mensaje.",
      "Verifica la información por canales oficiales.",
      "Evita compartir datos personales.",
    ],
    actionLabel: "Ver recomendaciones",
    actionHref: "/protect/acompanamiento?escenario=moderado",
  },
  bajo: {
    level: "bajo",
    badge: "Riesgo bajo",
    title: "No detectamos señales importantes",
    intro: "¡Gracias por confiar en nosotros!",
    body: "En nuestro análisis no encontramos señales importantes asociadas con un posible fraude.",
    supportTitle: "Sigue cuidándote.",
    supportBody:
      "Aunque el mensaje no presenta señales de riesgo relevantes, siempre es importante proteger tus datos y mantenerte atento/a.",
    recommendationsTitle: "Recuerda:",
    recommendations: [
      "No compartas información confidencial.",
      "Verifica los remitentes desconocidos.",
      "Si algo te genera dudas, puedes volver a consultarnos.",
    ],
    actionLabel: "Volver al inicio",
    actionHref: "/",
  },
};

export function normalizeRiskLevel(
  value?: string | string[] | null,
): RiskLevel {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "moderado" || raw === "bajo" ? raw : "alto";
}
