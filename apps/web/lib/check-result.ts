export type CheckScenario =
  | "alto"
  | "moderado"
  | "bajo"
  | "no_concluyente"
  | "conflicto";

export type CheckRiskLevel =
  | "riesgo_alto"
  | "riesgo_moderado"
  | "sin_senales_importantes"
  | "no_concluyente";

export type CheckConfidence = "baja" | "media" | "alta";
export type CheckSignalKey = "community" | "ai" | "identity";
export type CheckEvidenceSource =
  | "report"
  | "community"
  | "ai"
  | "identity"
  | "google_safe_browsing"
  | "rdap"
  | "dns";

export type CheckSignal = {
  status: "available" | "unavailable";
  score: number | null;
  weight: number;
};

export type CheckEvidence = {
  evidenceId: string;
  source: CheckEvidenceSource;
  description: string;
  excerpt?: string;
};

/** Subconjunto del contrato `Check` que consume la pantalla de resultados. */
export type CheckResponse = {
  contractType: "Check";
  status: "completed" | "inconclusive" | "failed";
  riskScore: number | null;
  riskLevel: CheckRiskLevel;
  confidence: CheckConfidence;
  summary: string;
  indicators: string[];
  evidence: CheckEvidence[];
  recommendations: string[];
  signals: Record<CheckSignalKey, CheckSignal>;
};

export const checkScenarios: CheckScenario[] = [
  "alto",
  "moderado",
  "bajo",
  "no_concluyente",
  "conflicto",
];

export const checkSignalKeys: CheckSignalKey[] = ["community", "ai", "identity"];

export const checkSignalNames: Record<CheckSignalKey, string> = {
  community: "Comunidad",
  ai: "IA",
  identity: "Identidad",
};

export const evidenceSourceNames: Record<CheckEvidenceSource, string> = {
  report: "Mensaje",
  community: "Comunidad",
  ai: "IA",
  identity: "Identidad digital",
  google_safe_browsing: "Navegación segura",
  rdap: "RDAP",
  dns: "DNS",
};

const unavailableSignal: CheckSignal = {
  status: "unavailable",
  score: null,
  weight: 0,
};

/**
 * Respuestas de demostración derivadas de `contracts/examples/v1/`.
 * Se sustituirán por la respuesta real cuando H26-12 y H26-30 estén integrados.
 */
export const checkResponses: Record<CheckScenario, CheckResponse> = {
  alto: {
    contractType: "Check",
    status: "completed",
    riskScore: 70,
    riskLevel: "riesgo_alto",
    confidence: "alta",
    summary:
      "El mensaje combina urgencia con una solicitud para verificar una cuenta.",
    indicators: [
      "Urgencia para actuar",
      "Solicitud de acceso mediante enlace",
    ],
    evidence: [
      {
        evidenceId: "evidence-1",
        source: "report",
        description: "El mensaje solicita verificar la cuenta.",
        excerpt: "pide verificar mi cuenta",
      },
      {
        evidenceId: "evidence-2",
        source: "google_safe_browsing",
        description: "La fuente externa reportó el destino como sospechoso.",
      },
    ],
    recommendations: [
      "No abras el enlace ni compartas credenciales.",
      "Verifica la solicitud desde el canal oficial de la organización.",
    ],
    signals: {
      community: { status: "available", score: 80, weight: 0.25 },
      ai: { status: "available", score: 70, weight: 0.5 },
      identity: { status: "available", score: 60, weight: 0.25 },
    },
  },
  moderado: {
    contractType: "Check",
    status: "completed",
    riskScore: 58,
    riskLevel: "riesgo_moderado",
    confidence: "alta",
    summary:
      "El mensaje presenta señales que podrían estar relacionadas con un intento de fraude. Te recomendamos verificar su origen antes de responder.",
    indicators: [
      "Solicita actuar rápidamente.",
      "Incluye un enlace sospechoso.",
    ],
    evidence: [
      {
        evidenceId: "evidence-moderado-1",
        source: "report",
        description: "El mensaje pide actuar sin dar tiempo a verificar.",
        excerpt: "actúa ahora",
      },
      {
        evidenceId: "evidence-moderado-2",
        source: "ai",
        description: "El enlace no coincide con el canal habitual.",
      },
    ],
    recommendations: [
      "No abras enlaces desconocidos.",
      "No compartas tus datos.",
      "Consulta con alguien de confianza.",
    ],
    signals: {
      community: { status: "available", score: 40, weight: 0.4 },
      ai: { status: "available", score: 70, weight: 0.6 },
      identity: unavailableSignal,
    },
  },
  bajo: {
    contractType: "Check",
    status: "completed",
    riskScore: 10,
    riskLevel: "sin_senales_importantes",
    confidence: "alta",
    summary: "No encontramos señales importantes en el mensaje.",
    indicators: [],
    evidence: [],
    recommendations: [
      "No compartas información confidencial.",
      "Si algo te genera dudas, puedes volver a consultarnos.",
    ],
    signals: {
      community: { status: "available", score: 10, weight: 0.3 },
      ai: { status: "available", score: 10, weight: 0.4 },
      identity: { status: "available", score: 10, weight: 0.3 },
    },
  },
  no_concluyente: {
    contractType: "Check",
    status: "inconclusive",
    riskScore: null,
    riskLevel: "no_concluyente",
    confidence: "baja",
    summary:
      "No fue posible obtener información suficiente para concluir el análisis.",
    indicators: [],
    evidence: [],
    recommendations: ["Intenta nuevamente más tarde."],
    signals: {
      community: unavailableSignal,
      ai: unavailableSignal,
      identity: unavailableSignal,
    },
  },
  conflicto: {
    contractType: "Check",
    status: "inconclusive",
    riskScore: null,
    riskLevel: "no_concluyente",
    confidence: "baja",
    summary:
      "Las señales disponibles no coinciden entre sí; no podemos dar una conclusión fiable.",
    indicators: [
      "Una fuente indica urgencia y otra no encuentra señales de riesgo.",
    ],
    evidence: [
      {
        evidenceId: "evidence-conflicto-1",
        source: "community",
        description: "La comunidad reportó varias señales de riesgo.",
      },
      {
        evidenceId: "evidence-conflicto-2",
        source: "ai",
        description: "El análisis de IA no encontró señales relevantes.",
      },
    ],
    recommendations: [
      "Verifica el mensaje por un canal oficial antes de actuar.",
      "Consulta con alguien de confianza.",
    ],
    signals: {
      community: { status: "available", score: 85, weight: 0.5 },
      ai: { status: "available", score: 15, weight: 0.5 },
      identity: unavailableSignal,
    },
  },
};

export function getCheckScenario(
  value?: string | string[] | null,
): CheckScenario {
  const raw = Array.isArray(value) ? value[0] : value;
  return checkScenarios.find((scenario) => scenario === raw) ?? "alto";
}

/** Etiquetas legibles derivadas de los umbrales documentados en `contracts/`. */
export function getSignalLabel(key: CheckSignalKey, signal: CheckSignal): string {
  if (signal.status === "unavailable") {
    return key === "identity" ? "No verificada" : "No disponible";
  }

  if (signal.score === null) return "No disponible";
  if (signal.score >= 60) return "Riesgo alto";
  if (signal.score >= 20) return "Precaución";
  return "Sin señales relevantes";
}

export function getConfidenceText(confidence: CheckConfidence): string {
  if (confidence === "alta") {
    return "El sistema cuenta con información suficiente para realizar esta evaluación.";
  }
  if (confidence === "media") {
    return "La información disponible es parcial; revisa el resultado con cautela.";
  }
  return "La información es limitada o las señales no coinciden; no tomes una decisión basada solo en este resultado.";
}

export type CheckPresentation = {
  title: string;
  subtitle: string;
  intro: string;
  levelLabel: string;
  notice?: string;
  actionLabel: string;
  actionHref: string;
};

export function getCheckPresentation(check: CheckResponse): CheckPresentation {
  const hasAvailableSignal = checkSignalKeys.some(
    (key) => check.signals[key].status === "available",
  );
  const isConflict = check.riskLevel === "no_concluyente" && hasAvailableSignal;

  if (isConflict) {
    return {
      title: "Señales en conflicto",
      subtitle: "Resultado de tu mensaje",
      intro: "Algunas señales apuntan en direcciones distintas.",
      levelLabel: "No concluyente",
      notice:
        "Las señales disponibles no coinciden. No podemos afirmar que sea un fraude ni descartarlo.",
      actionLabel: "Volver a revisar",
      actionHref: "/check/revisar",
    };
  }

  if (check.riskLevel === "no_concluyente") {
    return {
      title: "No pudimos concluir el análisis",
      subtitle: "Resultado de tu mensaje",
      intro: "No reunimos información suficiente para evaluar el mensaje.",
      levelLabel: "No concluyente",
      notice:
        "No hay información suficiente para evaluar el mensaje. Esto no significa que sea seguro.",
      actionLabel: "Volver a revisar",
      actionHref: "/check/revisar",
    };
  }

  if (check.riskLevel === "riesgo_alto") {
    return {
      title: "¡Atención! Posible fraude",
      subtitle: "Resultado de tu mensaje",
      intro: "Encontramos señales que podrían indicar un intento de fraude.",
      levelLabel: "Riesgo alto",
      actionLabel: "Ver cómo protegerme",
      actionHref: "/protect/alerta?escenario=alto",
    };
  }

  if (check.riskLevel === "riesgo_moderado") {
    return {
      title: "Ten precaución",
      subtitle: "Resultado de tu mensaje",
      intro: "Encontramos algunas señales que necesitan tu atención.",
      levelLabel: "Riesgo moderado",
      actionLabel: "Ver cómo protegerme",
      actionHref: "/protect/acompanamiento?escenario=moderado",
    };
  }

  return {
    title: "No detectamos señales importantes",
    subtitle: "Resultado de tu mensaje",
    intro: "No encontramos elementos que requieran tu atención.",
    levelLabel: "Sin señales importantes",
    actionLabel: "Volver al inicio",
    actionHref: "/",
  };
}
