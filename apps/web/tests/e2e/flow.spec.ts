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

test("muestra los tres ratings, la confianza y la evidencia del contrato", async ({
  page,
}) => {
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
    page.getByRole("heading", {
      name: "¿Qué tan seguro es nuestro resultado?",
    }),
  ).toBeVisible();
  await expect(page.getByText("Confianza alta")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "¿Qué encontramos en el mensaje?" }),
  ).toBeVisible();
  await expect(page.getByText("Solicita actuar rápidamente.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Evidencia" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Resumen" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "¿Qué te recomendamos?" }),
  ).toBeVisible();
  await expect(page.getByText("No abras enlaces desconocidos.")).toBeVisible();
  await expect(page.getByText("actúa ahora")).toBeVisible();

  await page.setViewportSize({ width: 360, height: 800 });
  await expect(
    page.getByRole("heading", { name: "Ten precaución" }),
  ).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("distingue un resultado no concluyente de señales en conflicto", async ({
  page,
}) => {
  await page.goto("/check/resultado?escenario=no_concluyente");

  await expect(
    page.getByRole("heading", { name: "No pudimos concluir el análisis" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "No hay información suficiente para evaluar el mensaje. Esto no significa que sea seguro.",
    ),
  ).toBeVisible();
  await expect(page.getByText("Confianza baja")).toBeVisible();
  await expect(
    page.getByRole("listitem", { name: /Comunidad: No disponible/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("listitem", { name: /Identidad: No verificada/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Señales en conflicto" }),
  ).toHaveCount(0);

  await page.goto("/check/resultado?escenario=conflicto");

  await expect(
    page.getByRole("heading", { name: "Señales en conflicto" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Las señales disponibles no coinciden. No podemos afirmar que sea un fraude ni descartarlo.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("listitem", { name: /Comunidad: Riesgo alto/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("listitem", { name: /IA: Sin señales relevantes/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "No pudimos concluir el análisis" }),
  ).toHaveCount(0);
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
    page.getByRole("heading", { name: "Revisa y corrige los datos" }),
  ).toBeVisible();
  await expect(page.getByText("Comprobación sencilla")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Soy una persona" }),
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
    page.getByRole("heading", { name: "Revisa y corrige los datos" }),
  ).toBeVisible();
  await expect(page.getByText(/Puedes dejarlo vacío/)).toBeVisible();
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
  await expect(page.getByLabel("Correo o teléfono (opcional)")).toHaveValue(
    "abuela@ejemplo.com",
  );

  await page.getByRole("button", { name: "Enviar reporte" }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Confirma que los datos son correctos" }),
  ).toBeVisible();

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
  await expect(page.getByRole("link", { name: "Volver al inicio" })).toBeVisible();

  await page.getByRole("button", { name: "Hacer otro reporte" }).click();
  await expect(page.getByText("Paso 1 de 3", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Mensaje que recibiste")).toHaveValue("");
});

test("permite corregir la extracción, restaurarla y vuelve a verificar", async ({
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

  const mensajeExtraido = page.getByLabel("Mensaje que recibiste");
  await expect(mensajeExtraido).toHaveValue(
    "Me pidieron mis datos por un enlace.",
  );

  await page.getByLabel(/Confirmo que los datos son correctos/).check();
  await page.getByRole("button", { name: "Soy una persona" }).click();
  await expect(page.getByText("Listo, podemos continuar")).toBeVisible();

  await mensajeExtraido.fill("Ahora recuerdo que fue por correo.");
  await expect(mensajeExtraido).toHaveValue("Ahora recuerdo que fue por correo.");
  await expect(page.getByText("Sin verificar")).toBeVisible();
  await expect(page.getByRole("button", { name: "Soy una persona" })).toBeEnabled();
  await expect(
    page.getByLabel(/Confirmo que los datos son correctos/),
  ).not.toBeChecked();

  await page.getByRole("button", { name: "Restablecer datos originales" }).click();
  await expect(mensajeExtraido).toHaveValue(
    "Me pidieron mis datos por un enlace.",
  );
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
