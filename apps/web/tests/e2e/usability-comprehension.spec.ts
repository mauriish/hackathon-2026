import { expect, test } from "@playwright/test";

/**
 * Tareas de uso de H26-40. Cada prueba comprueba una pista observable de
 * comprensión; la observación con personas se documenta en
 * `reports/usabilidad/`.
 */

test("T1 reconoce el resultado de Check como demostración", async ({ page }) => {
  await page.goto("/check/resultado?escenario=alto");

  await expect(page.getByText("Demo", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Resultado de tu mensaje")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "¡Atención! Posible fraude" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Volver a revisar" }).first(),
  ).toBeVisible();
});

test("T2 interpreta ratings, confianza y recomendaciones", async ({ page }) => {
  await page.goto("/check/resultado?escenario=moderado");

  await expect(
    page.getByRole("heading", { name: "¿Qué encontramos?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("listitem", { name: /Comunidad: Precaución/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("listitem", { name: /IA: Riesgo alto/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("listitem", { name: /Identidad: No verificada/ }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "El sistema cuenta con información suficiente para realizar esta evaluación.",
    ),
  ).toBeVisible();
  await expect(
    page.getByText("Una señal no disponible no significa que el mensaje sea seguro."),
  ).toBeVisible();
  await expect(
    page.getByText("No abras enlaces desconocidos."),
  ).toBeVisible();
  await expect(
    page.getByText("Consulta con alguien de confianza."),
  ).toBeVisible();
});

test("T3 distingue un resultado sin conclusión de señales en conflicto", async ({
  page,
}) => {
  await page.goto("/check/resultado?escenario=no_concluyente");

  await expect(
    page.getByRole("heading", { name: "No pudimos concluir el análisis" }),
  ).toBeVisible();
  await expect(
    page.getByRole("status").filter({
      hasText:
        "No hay información suficiente para evaluar el mensaje. Esto no significa que sea seguro.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "La información es limitada o las señales no coinciden; no tomes una decisión basada solo en este resultado.",
    ),
  ).toBeVisible();
  await expect(page.getByText("Señales en conflicto")).toHaveCount(0);

  await page.goto("/check/resultado?escenario=conflicto");

  await expect(
    page.getByRole("heading", { name: "Señales en conflicto" }),
  ).toBeVisible();
  await expect(
    page.getByRole("status").filter({
      hasText:
        "Las señales disponibles no coinciden. No podemos afirmar que sea un fraude ni descartarlo.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("listitem", { name: /Comunidad: Riesgo alto/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("listitem", { name: /IA: Sin señales relevantes/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Volver a revisar" }).first(),
  ).toBeVisible();
});

test("T4 reconoce Protect como simulación antes de actuar", async ({ page }) => {
  await page.goto("/protect/simulacion?escenario=alto");

  await expect(
    page.getByText("Simulación", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByText("Demo", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText("Mensaje ficticio utilizado con fines educativos."),
  ).toBeVisible();
  await expect(
    page.getByText(/No solicita permisos ni lee mensajes reales/),
  ).toBeVisible();
  await expect(page.getByTestId("protect-status")).toContainText(
    /Mensaje recibido \(simulado\)/,
  );

  await page.getByRole("link", { name: "Ver resultado de Check" }).click();

  await expect(page).toHaveURL(
    /\/check\/resultado\?escenario=alto&origen=protect$/,
  );
  await expect(page.getByText("Protect · Simulación", { exact: true })).toBeVisible();
  await expect(page.getByText("Demo", { exact: true }).first()).toBeVisible();
});

test("T5 reporta un caso sintético sin enviar datos personales", async ({
  page,
}) => {
  const escrituras: string[] = [];
  page.on("request", (request) => {
    if (!["GET", "HEAD"].includes(request.method())) {
      escrituras.push(`${request.method()} ${request.url()}`);
    }
  });

  await page.goto("/report/nuevo");

  await expect(
    page.getByText("Evita escribir contraseñas, códigos o datos bancarios."),
  ).toBeVisible();

  await page
    .getByLabel("Mensaje que recibiste")
    .fill("Mensaje sintético de prueba para la sesión de usabilidad.");
  await page.getByRole("button", { name: "Continuar al paso 2" }).click();

  await page.getByLabel("¿Dónde lo viste?").selectOption("app");
  await page.getByLabel("Nombre de la aplicación").fill("Mensajería de ejemplo");
  await page.getByRole("button", { name: "Continuar al paso 3" }).click();

  await expect(page.getByLabel("Correo o teléfono (opcional)")).toHaveValue("");
  await page
    .getByLabel(/Confirmo que los datos son correctos/)
    .check();
  await page.getByRole("button", { name: "Soy una persona" }).click();
  await expect(page.getByText("Listo, podemos continuar")).toBeVisible();
  await page.getByRole("button", { name: "Enviar reporte" }).click();

  await expect(
    page.getByRole("heading", {
      name: "¡Listo! Ya recibimos tu reporte. Ya puedes cerrar esta ventana",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Demostración: este reporte todavía no se envía a un servidor.",
    ),
  ).toBeVisible();
  expect(escrituras).toEqual([]);
});
