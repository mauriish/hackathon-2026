import { expect, test } from "@playwright/test";
import {
  DEMO_TURNSTILE_TOKEN,
  buildReportSubmission,
  validateMessage,
  validateTarget,
  type ReportDraft,
} from "../../lib/report";

const draft: ReportDraft = {
  targetKind: "app",
  targetValue: "  Mensajería de ejemplo  ",
  message: "  Me pidieron mis datos por un enlace.  ",
  context: "  Llegó por la mañana.  ",
  contact: "",
};

test("construye un ReportSubmission sin contacto cuando se omite", () => {
  const submission = buildReportSubmission(draft);

  expect(submission).toEqual({
    contract_type: "ReportSubmission",
    target: { kind: "app", value: "Mensajería de ejemplo" },
    message: "Me pidieron mis datos por un enlace.",
    context: "Llegó por la mañana.",
    turnstile_token: DEMO_TURNSTILE_TOKEN,
  });
  expect(submission).not.toHaveProperty("contact");
});

test("incluye el contacto opcional solo en el contexto transitorio", () => {
  const submission = buildReportSubmission({
    ...draft,
    contact: "  abuela@ejemplo.com  ",
  });

  expect(submission.context).toBe(
    "Llegó por la mañana.\nContacto opcional: abuela@ejemplo.com",
  );
  expect(submission).not.toHaveProperty("contact");
});

test("valida mensaje y destino antes de construir el contrato", () => {
  expect(validateMessage("   ")).toContain("Cuéntanos brevemente");
  expect(validateMessage("Recibí un mensaje sospechoso.")).toBeNull();

  expect(validateTarget("link", "")).toContain("Escribe el enlace");
  expect(validateTarget("link", "javascript:alert(1)")).toContain("Revisa el enlace");
  expect(validateTarget("link", "https://ejemplo.com/acceso")).toBeNull();

  expect(validateTarget("app", "")).toContain("Escribe el nombre");
  expect(validateTarget("app", "Mensajería de ejemplo")).toBeNull();
});
