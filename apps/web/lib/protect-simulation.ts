import {
  checkResponses,
  getCheckPresentation,
  type CheckResponse,
  type CheckScenario,
} from "@/lib/check-result";

export type ProtectScenario = Extract<
  CheckScenario,
  "alto" | "moderado" | "bajo" | "no_concluyente"
>;

export type ProtectRiskLevel = Extract<
  ProtectScenario,
  "alto" | "moderado" | "bajo"
>;

export const protectScenarios: ProtectScenario[] = [
  "alto",
  "moderado",
  "bajo",
  "no_concluyente",
];

export const protectScenarioLabels: Record<ProtectScenario, string> = {
  alto: "Riesgo alto",
  moderado: "Precaución",
  bajo: "Sin señales",
  no_concluyente: "Sin conclusión",
};

export type ProtectMessage = {
  sender: string;
  channel: string;
  time: string;
  badge: string;
  body: string;
  link?: string;
  receivedStatus: string;
};

/** Mensajes sintéticos: no se solicitan permisos ni se leen SMS reales. */
export const protectMessages: Record<ProtectScenario, ProtectMessage> = {
  alto: {
    sender: "Supuesto banco",
    channel: "Mensaje de texto",
    time: "Hace 1 min",
    badge: "Sospechoso",
    body: "Estimado usuario: su cuenta será suspendida en las próximas horas. Ingrese al siguiente enlace para verificar sus datos inmediatamente.",
    link: "www.ejemplo-falso.com",
    receivedStatus:
      "Mensaje recibido (simulado). Prevención Mayor detectó una posible amenaza.",
  },
  moderado: {
    sender: "Envíos de ejemplo",
    channel: "Mensaje de texto",
    time: "Hace 3 min",
    badge: "Revisar",
    body: "Tu paquete está detenido. Paga la diferencia aquí antes de las 18:00 para evitar la devolución.",
    link: "envios-ejemplo.com/pagar",
    receivedStatus:
      "Mensaje recibido (simulado). Encontramos señales que requieren tu atención.",
  },
  bajo: {
    sender: "Clínica de ejemplo",
    channel: "Mensaje de texto",
    time: "Hace 5 min",
    badge: "Sin señales",
    body: "Recordatorio: tu cita confirmada para el martes a las 10:00. Si necesitas cambiarla, llama al número de siempre.",
    receivedStatus:
      "Mensaje recibido (simulado). No encontramos señales importantes en el mensaje.",
  },
  no_concluyente: {
    sender: "Remitente desconocido",
    channel: "Mensaje de texto",
    time: "Hace 8 min",
    badge: "Sin conclusión",
    body: "Hola, ¿puedes revisar esto cuando tengas un momento? Te lo agradecería mucho.",
    link: "ejemplo-compartir.com/documento",
    receivedStatus:
      "Mensaje recibido (simulado). No tenemos información suficiente para concluir.",
  },
};

export function getProtectScenario(
  value?: string | string[] | null,
): ProtectScenario {
  const raw = Array.isArray(value) ? value[0] : value;
  return protectScenarios.find((scenario) => scenario === raw) ?? "alto";
}

export function getProtectCheckHref(scenario: ProtectScenario): string {
  return `/check/resultado?escenario=${scenario}&origen=protect`;
}

export type ProtectAlertPresentation = {
  title: string;
  badge: string;
  riskLevel?: ProtectRiskLevel;
  accent: string;
  intro: string;
  signals: string[];
  actions: string[];
  support: string;
};

const alertTitles: Record<ProtectScenario, string> = {
  alto: "¡Hemos detectado algo sospechoso!",
  moderado: "Ten precaución",
  bajo: "No detectamos señales importantes",
  no_concluyente: "No pudimos concluir el análisis",
};

const alertAccents: Record<ProtectScenario, string> = {
  alto: "bg-danger",
  moderado: "bg-warning",
  bajo: "bg-safe",
  no_concluyente: "bg-info",
};

const alertSupport: Record<ProtectScenario, string> = {
  alto: "No estás solo/a. Estamos aquí para orientarte.",
  moderado: "Tómate tu tiempo. Podemos revisar juntos el mensaje.",
  bajo: "Gracias por confiar en nosotros. Sigue cuidando tus datos.",
  no_concluyente:
    "No saber con certeza también es información. Pide ayuda si lo necesitas.",
};

const fallbackSignals: Record<ProtectScenario, string[]> = {
  alto: [],
  moderado: [],
  bajo: ["No encontramos indicios que requieran tu atención."],
  no_concluyente: [
    "No encontramos indicios suficientes para clasificar el mensaje.",
  ],
};

/** Presentación de alerta derivada de la respuesta `Check` del escenario. */
export function getProtectAlertPresentation(
  scenario: ProtectScenario,
): ProtectAlertPresentation {
  const check: CheckResponse = checkResponses[scenario];
  const checkPresentation = getCheckPresentation(check);
  const riskLevel =
    scenario === "alto" || scenario === "moderado" || scenario === "bajo"
      ? scenario
      : undefined;

  const safeAction = "Verifica el mensaje por un canal oficial antes de actuar.";
  const actions = [...check.recommendations];
  const needsSafeAction =
    scenario === "no_concluyente" || scenario === "bajo" || actions.length === 0;

  if (needsSafeAction && !actions.includes(safeAction)) {
    actions.push(safeAction);
  }

  return {
    title: alertTitles[scenario],
    badge:
      checkPresentation.levelLabel === "Riesgo alto"
        ? "Alerta de riesgo alto"
        : checkPresentation.levelLabel,
    riskLevel,
    accent: alertAccents[scenario],
    intro: check.summary,
    signals:
      check.indicators.length > 0 ? check.indicators : fallbackSignals[scenario],
    actions,
    support: alertSupport[scenario],
  };
}
