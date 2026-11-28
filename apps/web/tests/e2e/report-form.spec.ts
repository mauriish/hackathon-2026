import { expect, test } from "@playwright/test";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8AAAwAB/AF+g6PAAAAAElFTkSuQmCC",
  "base64",
);

test("el resumen de report enlaza al formulario conservando el escenario", async ({
  page,
}) => {
  await page.goto("/report?escenario=moderado");

  await expect(page.getByText("Tipo de escenario", { exact: true })).toBeVisible();
  await expect(page.locator("dl").getByText("Riesgo moderado")).toBeVisible();
  await expect(
    page.getByText("Resultado de la evaluación", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Ten precaución" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Hacer un reporte" }).click();

  await expect(page).toHaveURL(/\/report\/formulario\?escenario=moderado$/);
  await expect(page.getByText("Paso 1 de 3")).toBeVisible();
});

test("muestra el escenario recibido en el formulario", async ({ page }) => {
  await page.goto("/report/formulario?escenario=moderado");

  await expect(page.getByText("Riesgo moderado", { exact: true })).toHaveCount(1);
});

test("valida que el paso 1 tenga un relato antes de continuar", async ({ page }) => {
  await page.goto("/report/formulario?escenario=alto");

  await page.getByRole("button", { name: "Continuar al paso 2" }).click();

  await expect(
    page.getByText("Cuéntanos qué pasó para poder ayudarte."),
  ).toBeVisible();
  await expect(page.getByText("Paso 1 de 3")).toBeVisible();
  await expect(page.getByLabel("Tu relato")).toBeFocused();
});

test("completa los tres pasos y muestra la confirmación con aviso de demostración", async ({
  page,
}) => {
  await page.goto("/report/formulario?escenario=alto");

  await page
    .getByLabel("Tu relato")
    .fill("Recibí un mensaje que decía que mi cuenta sería suspendida.");
  await page.getByRole("button", { name: "Continuar al paso 2" }).click();

  await expect(page.getByText("Paso 2 de 3")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "¿Tienes una foto o captura del mensaje?" }),
  ).toBeFocused();

  await page.getByRole("button", { name: "Continuar al paso 3" }).click();

  await expect(page.getByText("Paso 3 de 3")).toBeVisible();
  await page.getByLabel("Correo electrónico (opcional)").fill("prueba@example.com");
  await page.getByRole("button", { name: "Enviar reporte" }).click();

  await expect(
    page.getByRole("heading", { name: "¡Listo! Ya recibimos tu reporte." }),
  ).toBeVisible();
  await expect(page.getByText("Ya puedes cerrar esta ventana.")).toBeVisible();
  await expect(
    page.getByText("Demostración: tus datos no se enviaron a ningún servidor."),
  ).toBeVisible();
});

test("permite volver atrás sin perder el relato", async ({ page }) => {
  await page.goto("/report/formulario?escenario=bajo");

  const relato = "Me pidieron un código por mensaje.";
  await page.getByLabel("Tu relato").fill(relato);
  await page.getByRole("button", { name: "Continuar al paso 2" }).click();
  await page.getByRole("button", { name: "Volver atrás" }).click();

  await expect(page.getByText("Paso 1 de 3")).toBeVisible();
  await expect(page.getByLabel("Tu relato")).toHaveValue(relato);
});

test("acepta una captura opcional, permite quitarla y omitir el paso", async ({
  page,
}) => {
  await page.goto("/report/formulario?escenario=alto");
  await page.getByLabel("Tu relato").fill("Mensaje sospechoso recibido.");
  await page.getByRole("button", { name: "Continuar al paso 2" }).click();

  await page.locator('input[type="file"]').setInputFiles({
    name: "captura.png",
    mimeType: "image/png",
    buffer: onePixelPng,
  });

  await expect(
    page.getByRole("img", { name: "Vista previa de la captura" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Quitar foto" }).click();
  await expect(
    page.getByRole("img", { name: "Vista previa de la captura" }),
  ).toHaveCount(0);

  await page.getByRole("button", { name: "Omitir este paso" }).click();
  await expect(page.getByText("Paso 3 de 3")).toBeVisible();
});

test("mantiene el formulario usable en viewport móvil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/report/formulario?escenario=alto");

  await expect(page.getByText("Paso 1 de 3")).toBeVisible();
  await expect(page.getByRole("button", { name: "Dictar mi relato" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continuar al paso 2" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Volver atrás" })).toBeVisible();
});
