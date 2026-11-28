import { expect, test } from "@playwright/test";

test("el inicio lleva a Check y muestra la pantalla de revisión", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByAltText("Logo de Prevención Mayor")).toBeVisible();
  await page.getByRole("link", { name: "Entrar a Check" }).click();

  await expect(page).toHaveURL(/\/check$/);
  await expect(
    page.getByRole("heading", { name: "¿Tienes duda sobre un mensaje?" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Revisar mensaje" }).click();

  await expect(page).toHaveURL(/\/check\/revisar$/);
  await expect(
    page.getByRole("heading", { name: "Vamos a revisar si es seguro" }),
  ).toBeVisible();

  const textarea = page.getByLabel("Mensaje, correo electrónico o enlace");
  await textarea.fill("Su cuenta será suspendida. Verifique sus datos aquí.");
  await page.getByRole("button", { name: "Revisar mensaje" }).click();

  await expect(page).toHaveURL(/\/check\/resultado\?escenario=alto$/);
  await expect(
    page.getByRole("heading", { name: "¡Atención! Posible fraude" }),
  ).toBeVisible();
});

test("valida el mensaje antes de revisar", async ({ page }) => {
  await page.goto("/check/revisar");

  const submit = page.getByRole("button", { name: "Revisar mensaje" });
  const message = page.getByLabel("Mensaje, correo electrónico o enlace");

  await expect(submit).toBeDisabled();

  await message.fill("   ");
  await expect(submit).toBeDisabled();

  await message.fill("Mensaje de prueba para revisar.");
  await expect(submit).toBeEnabled();
});

test("muestra el error controlado y permite reintentar", async ({ page }) => {
  await page.goto("/check/revisar?estado=error&escenario=moderado");

  await expect(
    page.getByRole("heading", { name: "No pudimos revisar el mensaje" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Volver a intentar" }).click();

  await expect(page).toHaveURL(/\/check\/revisar\?escenario=moderado$/);
  await expect(
    page.getByRole("heading", { name: "Vamos a revisar si es seguro" }),
  ).toBeVisible();
});

test("muestra los tres resultados según el escenario", async ({ page }) => {
  const scenarios = [
    { level: "alto", title: "¡Atención! Posible fraude" },
    { level: "moderado", title: "Ten precaución" },
    { level: "bajo", title: "No detectamos señales importantes" },
  ];

  for (const scenario of scenarios) {
    await page.goto(`/check/resultado?escenario=${scenario.level}`);
    await expect(
      page.getByRole("heading", { name: scenario.title }),
    ).toBeVisible();
  }
});

test("no expone Watch en la navegación principal", async ({ page }) => {
  for (const path of ["/", "/check", "/report", "/protect"]) {
    await page.goto(path);
    await expect(page.getByRole("link", { name: "Watch" })).toHaveCount(0);
  }
});

test("permite navegar con teclado", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const firstLink = page.getByRole("link", { name: "Entrar a Check" });
  await expect(firstLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/check$/);
});

test("mantiene la navegación visible en viewport móvil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/check");

  await expect(
    page.getByRole("heading", { name: "¿Tienes duda sobre un mensaje?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Navegación principal" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Revisar mensaje" }),
  ).toBeVisible();
});

test("Protect muestra la alerta y permite llegar a Report", async ({
  page,
}) => {
  await page.goto("/protect/simulacion");
  await page.getByRole("link", { name: "Ver análisis de riesgo" }).click();

  await expect(page).toHaveURL(/\/protect\/alerta\?escenario=alto$/);
  await expect(
    page.getByRole("heading", { name: "¡Hemos detectado algo sospechoso!" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Entiendo, quiero protegerme" }).click();
  await expect(page).toHaveURL(/\/protect\/acompanamiento\?escenario=alto$/);

  await page.getByRole("link", { name: "Ver reporte" }).click();
  await expect(page).toHaveURL(/\/report\?escenario=alto&origen=protect$/);
  await expect(
    page.getByRole("heading", { name: "Vista previa del reporte" }),
  ).toBeVisible();
});

test("Report permite abrir el asistente de tres pasos", async ({ page }) => {
  await page.goto("/report");
  await page.getByRole("link", { name: "Reportar este caso" }).click();

  await expect(page).toHaveURL(/\/report\/nuevo$/);
  await expect(
    page.getByRole("heading", { name: "Reportar un mensaje sospechoso" }),
  ).toBeVisible();
  await expect(page.getByText("Paso 1 de 3", { exact: true })).toBeVisible();
});

test("el asistente valida cada paso antes de avanzar", async ({ page }) => {
  await page.goto("/report/nuevo");

  await page.getByRole("button", { name: "Continuar al paso 2" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Cuéntanos brevemente qué pasó" }),
  ).toBeVisible();
  await expect(page.getByText("Paso 1 de 3", { exact: true })).toBeVisible();

  await page.getByLabel("Mensaje que recibiste").fill("Recibí un mensaje sospechoso.");
  await page.getByRole("button", { name: "Continuar al paso 2" }).click();
  await expect(page.getByText("Paso 2 de 3", { exact: true })).toBeVisible();

  await page.getByLabel("Enlace que quieres reportar").fill("javascript:alert(1)");
  await page.getByRole("button", { name: "Continuar al paso 3" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Revisa el enlace" }),
  ).toBeVisible();

  await page
    .getByLabel("Enlace que quieres reportar")
    .fill("https://ejemplo.com/acceso");
  await page.getByRole("button", { name: "Continuar al paso 3" }).click();
  await expect(page.getByText("Paso 3 de 3", { exact: true })).toBeVisible();
  await expect(
    page.getByText("verificación simulada", { exact: false }),
  ).toBeVisible();
});

test("muestra avisos de privacidad y permite continuar sin evidencia ni contacto", async ({
  page,
}) => {
  await page.goto("/report/nuevo");

  await expect(
    page.getByText("Evita escribir contraseñas, códigos o datos bancarios."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Grabar audio (próximamente)" }),
  ).toBeDisabled();

  await page
    .getByLabel("Mensaje que recibiste")
    .fill("Me enviaron un enlace para verificar mi cuenta.");
  await page.getByRole("button", { name: "Continuar al paso 2" }).click();

  await expect(
    page.getByRole("heading", {
      name: "¿Tienes una foto o captura del mensaje? Súbela aquí",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/puedes continuar al paso 3 sin problema/),
  ).toBeVisible();
  await expect(page.getByText(/Archivo elegido/)).toHaveCount(0);

  await page.getByLabel("¿Dónde lo viste?").selectOption("link");
  await page
    .getByLabel("Enlace que quieres reportar")
    .fill("https://ejemplo.com/verificar");
  await page.getByRole("button", { name: "Continuar al paso 3" }).click();

  await expect(
    page.getByRole("heading", {
      name: "¿Cómo podemos contactarte o identificar el caso?",
    }),
  ).toBeVisible();
  await expect(page.getByText(/Este dato no es obligatorio/)).toBeVisible();
  await expect(page.getByText("Sin contacto")).toBeVisible();

  await page
    .getByLabel(/Entiendo que este reporte es una demostración/)
    .check();
  await page.getByLabel(/No soy un robot/).check();
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
});

test("completa el reporte con contacto opcional y muestra la confirmación", async ({
  page,
}) => {
  await page.goto("/report/nuevo");

  await page
    .getByLabel("Mensaje que recibiste")
    .fill("Me pidieron mis datos por un enlace.");
  await page.getByRole("button", { name: "Continuar al paso 2" }).click();

  await page.getByLabel("¿Dónde lo viste?").selectOption("app");
  await page.getByLabel("Nombre de la aplicación").fill("Mensajería de ejemplo");
  await page.getByRole("button", { name: "Continuar al paso 3" }).click();

  await page
    .getByLabel("Correo o teléfono (opcional)")
    .fill("abuela@ejemplo.com");
  await expect(page.getByText("abuela@ejemplo.com")).toBeVisible();

  await page.getByRole("button", { name: "Enviar reporte" }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Marca el consentimiento y la verificación simulada" }),
  ).toBeVisible();

  await page
    .getByLabel(/Entiendo que este reporte es una demostración/)
    .check();
  await page.getByLabel(/No soy un robot/).check();
  await page.getByRole("button", { name: "Enviar reporte" }).click();

  await expect(
    page.getByRole("heading", {
      name: "¡Listo! Ya recibimos tu reporte. Ya puedes cerrar esta ventana",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Volver al inicio" })).toBeVisible();

  await page.getByRole("button", { name: "Hacer otro reporte" }).click();
  await expect(page.getByText("Paso 1 de 3", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Mensaje que recibiste")).toHaveValue("");
});

test("Volver atrás conserva lo que la persona escribió", async ({ page }) => {
  await page.goto("/report/nuevo");

  const message = page.getByLabel("Mensaje que recibiste");
  await message.fill("Quiero corregir este relato.");
  await page.getByRole("button", { name: "Continuar al paso 2" }).click();
  await page.getByRole("button", { name: "Volver atrás" }).click();

  await expect(page.getByText("Paso 1 de 3", { exact: true })).toBeVisible();
  await expect(message).toHaveValue("Quiero corregir este relato.");
});
