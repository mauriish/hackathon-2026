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

test("muestra los tres resultados según el escenario", async ({ page }) => {
  const scenarios = [
    { level: "alto", title: "¡Atención! Posible fraude" },
    { level: "moderado", title: "Ten precaución" },
    { level: "bajo", title: "No detectamos señales importantes" },
  ];

  for (const scenario of scenarios) {
    await page.goto(`/check/resultado?escenario=${scenario.level}`);
    await expect(page.getByRole("heading", { name: scenario.title })).toBeVisible();
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
  await expect(page.getByRole("navigation", { name: "Navegación principal" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Revisar mensaje" })).toBeVisible();
});

test("Protect muestra la alerta y permite llegar a Report", async ({ page }) => {
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
