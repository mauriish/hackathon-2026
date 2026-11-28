import { expect, test } from "@playwright/test";

const scenarios = [
  {
    id: "alto",
    label: "Riesgo alto",
    sender: "Supuesto banco",
    message: "su cuenta será suspendida",
    title: "¡Atención! Posible fraude",
  },
  {
    id: "moderado",
    label: "Precaución",
    sender: "Envíos de ejemplo",
    message: "Tu paquete está detenido",
    title: "Ten precaución",
  },
  {
    id: "bajo",
    label: "Sin señales",
    sender: "Clínica de ejemplo",
    message: "tu cita confirmada",
    title: "No detectamos señales importantes",
  },
  {
    id: "no_concluyente",
    label: "Sin conclusión",
    sender: "Remitente desconocido",
    message: "¿puedes revisar esto",
    title: "No pudimos concluir el análisis",
  },
] as const;

test("muestra cuatro escenarios sintéticos reproducibles y su resultado Check", async ({
  page,
}) => {
  for (const scenario of scenarios) {
    await page.goto(`/protect/simulacion?escenario=${scenario.id}`);

    await expect(
      page.getByRole("navigation", { name: "Escenarios de simulación" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: scenario.label, exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(page.getByTestId("protect-message")).toContainText(
      scenario.sender,
    );
    await expect(page.getByTestId("protect-message")).toContainText(
      scenario.message,
    );
    await expect(page.getByTestId("protect-status")).toContainText(
      /Mensaje recibido \(simulado\)/,
    );

    const checkLink = page.getByRole("link", {
      name: "Ver resultado de Check",
    });
    await expect(checkLink).toHaveAttribute(
      "href",
      `/check/resultado?escenario=${scenario.id}&origen=protect`,
    );

    await checkLink.click();
    await expect(page).toHaveURL(
      new RegExp(`/check/resultado\\?escenario=${scenario.id}&origen=protect$`),
    );
    await expect(
      page.getByRole("heading", { name: scenario.title }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Volver a la simulación de Protect" }),
    ).toBeVisible();
  }
});

test("marca la simulación y no solicita permisos ni lee SMS reales", async ({
  page,
}) => {
  await page.addInitScript(() => {
    type TrackedWindow = Window & { __protectPermissionCalls?: string[] };
    const calls: string[] = [];
    (window as TrackedWindow).__protectPermissionCalls = calls;

    const permissions = navigator.permissions;
    if (permissions) {
      const originalQuery = permissions.query.bind(permissions);
      Object.defineProperty(permissions, "query", {
        configurable: true,
        value: (descriptor: PermissionDescriptor) => {
          calls.push(`permissions.query:${descriptor.name}`);
          return originalQuery(descriptor);
        },
      });
    }

    if (typeof Notification !== "undefined") {
      type PermissionCallback = Parameters<
        typeof Notification.requestPermission
      >[0];
      const originalRequest = Notification.requestPermission.bind(Notification);
      Object.defineProperty(Notification, "requestPermission", {
        configurable: true,
        value: (callback?: PermissionCallback) => {
          calls.push("notification.requestPermission");
          return originalRequest(callback);
        },
      });
    }
  });

  let dialogCount = 0;
  page.on("dialog", async (dialog) => {
    dialogCount += 1;
    await dialog.dismiss();
  });

  await page.goto("/protect/simulacion");

  await expect(page.getByText("Simulación", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText(/No solicita permisos ni lee mensajes reales/),
  ).toBeVisible();
  await expect(page.getByTestId("protect-message")).toContainText(
    "Mensaje ficticio utilizado con fines educativos.",
  );

  const calls = await page.evaluate(() => {
    const tracked = window as Window & { __protectPermissionCalls?: string[] };
    return tracked.__protectPermissionCalls ?? [];
  });
  expect(calls).toEqual([]);
  expect(dialogCount).toBe(0);
});

test("muestra el estado de carga de la recepción simulada", async ({ page }) => {
  await page.goto("/protect/simulacion?estado=cargando&escenario=moderado");

  const status = page.getByTestId("protect-status");
  await expect(status).toContainText("Recibiendo mensaje simulado...");
  await expect(page.getByTestId("protect-message")).toHaveCount(0);

  await expect(status).toContainText(/Mensaje recibido \(simulado\)/, {
    timeout: 5000,
  });
  await expect(page.getByTestId("protect-message")).toContainText(
    "Envíos de ejemplo",
  );

  await page.getByRole("button", { name: "Volver a recibir el mensaje" }).click();
  await expect(status).toContainText("Recibiendo mensaje simulado...");
  await expect(status).toContainText(/Mensaje recibido \(simulado\)/, {
    timeout: 5000,
  });
});

test("muestra un error controlado y permite reintentar", async ({ page }) => {
  await page.goto("/protect/simulacion?estado=error&escenario=moderado");

  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "No pudimos recibir el mensaje simulado" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "No pudimos recibir el mensaje simulado",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Simulación", { exact: true }).first(),
  ).toBeVisible();

  await page.getByRole("button", { name: "Volver a intentar" }).click();

  await expect(page).toHaveURL(/\/protect\/simulacion\?escenario=moderado$/);
  await expect(page.getByTestId("protect-status")).toContainText(
    /Mensaje recibido \(simulado\)/,
  );
});

test("conserva el escenario en alerta, acompañamiento, Check y Report", async ({
  page,
}) => {
  await page.goto("/protect/simulacion?escenario=moderado");
  await page.getByRole("link", { name: "Ver análisis de riesgo" }).click();

  await expect(page).toHaveURL(/\/protect\/alerta\?escenario=moderado$/);
  await expect(
    page.getByRole("heading", { name: "Ten precaución" }),
  ).toBeVisible();
  await expect(page.getByText("Solicita actuar rápidamente.")).toBeVisible();

  await page.getByRole("link", { name: "Entiendo, quiero protegerme" }).click();
  await expect(page).toHaveURL(
    /\/protect\/acompanamiento\?escenario=moderado$/,
  );
  await expect(
    page.getByRole("link", { name: "Ver resultado de Check" }),
  ).toHaveAttribute(
    "href",
    "/check/resultado?escenario=moderado&origen=protect",
  );

  await page.getByRole("link", { name: "Ver reporte" }).click();
  await expect(page).toHaveURL(/\/report\?escenario=moderado&origen=protect$/);
});

test("el escenario no concluyente ofrece una alternativa segura", async ({
  page,
}) => {
  await page.goto("/protect/alerta?escenario=no_concluyente");

  await expect(
    page.getByRole("heading", { name: "No pudimos concluir el análisis" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "No encontramos indicios suficientes para clasificar el mensaje.",
    ),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Verifica el mensaje por un canal oficial antes de actuar.",
    ),
  ).toBeVisible();
});
