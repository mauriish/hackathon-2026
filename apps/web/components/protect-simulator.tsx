"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  getProtectCheckHref,
  protectMessages,
  protectScenarioLabels,
  protectScenarios,
  type ProtectScenario,
} from "@/lib/protect-simulation";

type SimulatorPhase = "received" | "loading" | "error";

type ProtectSimulatorProps = {
  scenario: ProtectScenario;
  initialPhase: SimulatorPhase;
};

/**
 * Bandeja ficticia con recepción simulada. No usa permisos del navegador,
 * SMS reales ni servicios del dispositivo.
 */
export function ProtectSimulator({
  scenario,
  initialPhase,
}: ProtectSimulatorProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<SimulatorPhase>(initialPhase);
  const message = protectMessages[scenario];

  useEffect(() => {
    if (phase !== "loading") return;

    const timer = window.setTimeout(() => setPhase("received"), 900);
    return () => window.clearTimeout(timer);
  }, [phase]);

  function retry() {
    setPhase("received");
    router.replace(`/protect/simulacion?escenario=${scenario}`);
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-6 px-5 py-10 sm:px-6">
        <nav
          aria-label="Escenarios de simulación"
          className="w-full rounded-3xl border border-soft-green bg-white p-4"
        >
          <p className="text-sm font-semibold text-petroleum">
            Elige un escenario para simular
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {protectScenarios.map((id) => (
              <li key={id}>
                <Link
                  href={`/protect/simulacion?escenario=${id}`}
                  aria-current={id === scenario ? "page" : undefined}
                  className={buttonVariants({
                    variant: id === scenario ? "default" : "outline",
                    size: "sm",
                    className: "min-h-10",
                  })}
                >
                  {protectScenarioLabels[id]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="w-full max-w-sm overflow-hidden rounded-[2rem] border-8 border-petroleum bg-white shadow-xl">
          <div className="flex items-center justify-between bg-petroleum px-5 py-4 text-white">
            <h1 className="text-base font-semibold">Mensajes recibidos</h1>
            <Badge className="min-h-6 bg-white/15 text-white">Simulación</Badge>
          </div>

          <div className="space-y-4 p-4">
            {phase === "error" ? (
              <div
                role="alert"
                className="rounded-2xl border border-danger/40 bg-danger/10 p-4"
              >
                <h2 className="font-semibold text-petroleum">
                  No pudimos recibir el mensaje simulado
                </h2>
                <p className="mt-2 text-sm leading-6 text-info">
                  Este error es parte de la demostración. No se envió ni recibió
                  ningún mensaje real.
                </p>
                <button
                  type="button"
                  onClick={retry}
                  className={buttonVariants({
                    size: "lg",
                    className: "mt-4 min-h-12 w-full text-base",
                  })}
                >
                  Volver a intentar
                </button>
              </div>
            ) : (
              <>
                {phase === "loading" ? (
                  <div
                    aria-hidden="true"
                    data-testid="protect-message-placeholder"
                    className="h-32 animate-pulse rounded-2xl border border-soft-green bg-soft-green/40 p-4"
                  >
                    <div className="h-4 w-1/2 rounded bg-soft-green" />
                    <div className="mt-4 h-3 w-full rounded bg-soft-green" />
                    <div className="mt-2 h-3 w-4/5 rounded bg-soft-green" />
                  </div>
                ) : (
                  <article
                    data-testid="protect-message"
                    className="rounded-2xl border border-soft-green bg-cream p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-petroleum">
                          {message.sender}
                        </p>
                        <p className="text-xs text-info">
                          {message.channel} · {message.time}
                        </p>
                      </div>
                      <Badge
                        className={`min-h-6 ${
                          scenario === "bajo" || scenario === "no_concluyente"
                            ? "bg-info text-white"
                            : "bg-warning text-ink"
                        }`}
                      >
                        {message.badge}
                      </Badge>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-ink">
                      {message.body}
                    </p>
                    {message.link ? (
                      <p className="mt-3 break-all text-sm font-medium text-danger">
                        {message.link}
                      </p>
                    ) : null}
                    <p className="mt-4 text-xs leading-5 text-info">
                      Mensaje ficticio utilizado con fines educativos.
                    </p>
                  </article>
                )}

                <div
                  role="status"
                  aria-live="polite"
                  data-testid="protect-status"
                  className="rounded-2xl bg-soft-green/70 p-4"
                >
                  <p className="font-semibold text-petroleum">
                    {phase === "loading"
                      ? "Recibiendo mensaje simulado..."
                      : message.receivedStatus}
                  </p>
                  {phase === "loading" ? (
                    <p className="mt-1 text-sm leading-6 text-info">
                      Estamos preparando el mensaje de ejemplo.
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => setPhase("loading")}
                  disabled={phase === "loading"}
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "min-h-12 w-full text-base",
                  })}
                >
                  {phase === "loading"
                    ? "Recibiendo mensaje..."
                    : "Volver a recibir el mensaje"}
                </button>

                {phase === "received" ? (
                  <>
                    <Link
                      href={`/protect/alerta?escenario=${scenario}`}
                      className={buttonVariants({
                        size: "lg",
                        className: "min-h-12 w-full text-base",
                      })}
                    >
                      Ver análisis de riesgo
                    </Link>
                    <Link
                      href={getProtectCheckHref(scenario)}
                      className={buttonVariants({
                        variant: "secondary",
                        size: "lg",
                        className: "min-h-12 w-full text-base",
                      })}
                    >
                      Ver resultado de Check
                    </Link>
                  </>
                ) : null}
              </>
            )}
          </div>
        </div>

        <p className="text-center text-sm leading-6 text-info">
          <Badge variant="outline" className="border-info text-info">
            Demo
          </Badge>{" "}
          No solicita permisos ni lee mensajes reales.
        </p>
        <p className="text-center text-sm text-info">
          <Link href="/protect" className="underline underline-offset-4">
            Volver al inicio de Protect
          </Link>
        </p>
      </main>
    </>
  );
}
