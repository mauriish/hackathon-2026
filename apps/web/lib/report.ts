export type ReportTargetKind = "app" | "link";

export type ReportDraft = {
  targetKind: ReportTargetKind;
  targetValue: string;
  message: string;
  context: string;
  contact: string;
};

export type ReportSubmission = {
  contract_type: "ReportSubmission";
  target: {
    kind: ReportTargetKind;
    value: string;
  };
  message: string;
  context: string;
  turnstile_token: string;
};

/**
 * Token ficticio para la demostración. La verificación real de Turnstile
 * corresponde a la API y todavía no está disponible en el frontend.
 */
export const DEMO_TURNSTILE_TOKEN = "demo-token-no-verificado";

const LINK_PATTERN =
  /^(?:https?:\/\/[^/@?#]+(?:\/[^?#]*)?|[^:/@?#]+(?:\/[^?#]*)?)$/;

export function validateMessage(message: string): string | null {
  if (message.trim().length === 0) {
    return "Cuéntanos brevemente qué pasó para poder ayudarte.";
  }
  return null;
}

export function validateTarget(
  kind: ReportTargetKind,
  value: string,
): string | null {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return kind === "link"
      ? "Escribe el enlace que quieres reportar."
      : "Escribe el nombre de la aplicación que quieres reportar.";
  }

  if (kind === "link" && !LINK_PATTERN.test(trimmed)) {
    return "Revisa el enlace. No debe incluir usuario, contraseña, parámetros ni fragmentos.";
  }

  return null;
}

function buildContext(draft: ReportDraft): string {
  const parts = [draft.context.trim()];
  const contact = draft.contact.trim();

  if (contact.length > 0) {
    parts.push(`Contacto opcional: ${contact}`);
  }

  return parts.filter(Boolean).join("\n");
}

export function buildReportSubmission(draft: ReportDraft): ReportSubmission {
  return {
    contract_type: "ReportSubmission",
    target: {
      kind: draft.targetKind,
      value: draft.targetValue.trim(),
    },
    message: draft.message.trim(),
    context: buildContext(draft),
    turnstile_token: DEMO_TURNSTILE_TOKEN,
  };
}
