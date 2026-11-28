import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  "Recibirás un mensaje ficticio.",
  "Prevención Mayor analizará su contenido.",
  "Recibirás una alerta si detectamos señales de riesgo.",
  "Te mostraremos cómo actuar.",
];

export default function ProtectPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-10 sm:px-6">
        <Card className="rounded-3xl ring-soft-green">
          <CardContent className="flex flex-col gap-7 px-6 py-10 sm:px-10">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Protect · Simulador</Badge>
              <Badge variant="outline" className="border-info text-info">
                Demo
              </Badge>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold tracking-wide text-info uppercase">
                Prevención Mayor
              </p>
              <h1 className="text-3xl leading-tight font-semibold text-petroleum sm:text-4xl">
                Tu seguridad está primero.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-ink">
                Aprende cómo Prevención Mayor puede ayudarte a identificar
                mensajes sospechosos y prevenir posibles fraudes.
              </p>
            </div>

            <section aria-labelledby="como-funciona">
              <h2
                id="como-funciona"
                className="text-lg font-semibold text-petroleum"
              >
                ¿Cómo funciona?
              </h2>
              <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                {steps.map((step, index) => (
                  <li
                    key={step}
                    className="flex items-start gap-3 rounded-2xl bg-soft-green/70 p-4 leading-7 text-ink"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-petroleum text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            <Link
              href="/protect/simulacion"
              className={buttonVariants({
                size: "lg",
                className: "min-h-12 w-full text-base sm:w-auto sm:self-start",
              })}
            >
              Iniciar simulación
            </Link>

            <p className="text-sm leading-6 text-info">
              Esta es una simulación educativa. No se recibirán mensajes reales.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
