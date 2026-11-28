import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const options = [
  {
    title: "Reportar este mensaje",
    description: "Registrar el incidente para su validación.",
    href: "/report?escenario=alto&origen=protect",
    action: "Ver reporte",
  },
  {
    title: "Aprender a identificar fraudes",
    description: "Consultar consejos para protegerte.",
    href: "#consejos",
    action: "Ver consejos",
  },
  {
    title: "Volver al inicio",
    description: "Regresar a la pantalla principal.",
    href: "/",
    action: "Ir al inicio",
  },
];

const tips = [
  "Desconfía de las urgencias y de las amenazas de suspensión.",
  "Verifica siempre por canales oficiales.",
  "No compartas contraseñas, códigos ni datos personales.",
];

export default function ProtectCompanionPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-5 px-5 py-10 sm:px-6">
        <Card className="rounded-3xl ring-soft-green">
          <CardContent className="flex flex-col gap-7 px-6 py-10 sm:px-10">
            <div className="space-y-3">
              <p className="text-sm font-semibold tracking-wide text-info uppercase">
                Protect
              </p>
              <h1 className="text-3xl leading-tight font-semibold text-petroleum sm:text-4xl">
                Estamos contigo.
              </h1>
              <p className="text-lg leading-8 text-ink">
                Actuar con precaución es una forma de protegerte. Hiciste bien
                en consultar antes de responder.
              </p>
            </div>

            <div className="rounded-2xl bg-soft-green/70 p-5 leading-7 text-ink">
              <h2 className="font-semibold text-petroleum">Recuerda:</h2>
              <p className="mt-2">
                No tienes que tomar decisiones apresuradas. Si tienes dudas,
                puedes pedir ayuda a alguien de confianza.
              </p>
            </div>

            <section aria-labelledby="acciones-finales">
              <h2
                id="acciones-finales"
                className="text-lg font-semibold text-petroleum"
              >
                ¿Qué deseas hacer ahora?
              </h2>
              <div className="mt-4 grid gap-3">
                {options.map((option) => (
                  <div
                    key={option.title}
                    className="flex flex-col gap-3 rounded-2xl border border-soft-green p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-ink">{option.title}</h3>
                      <p className="text-sm leading-6 text-info">
                        {option.description}
                      </p>
                    </div>
                    <Link
                      href={option.href}
                      className={buttonVariants({
                        variant: "secondary",
                        className: "min-h-11 w-full sm:w-auto",
                      })}
                    >
                      {option.action}
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            <section id="consejos" aria-labelledby="consejos-titulo">
              <h2
                id="consejos-titulo"
                className="text-lg font-semibold text-petroleum"
              >
                Consejos para identificar fraudes
              </h2>
              <ul className="mt-3 space-y-2 leading-7 text-ink">
                {tips.map((tip) => (
                  <li key={tip} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-3 size-1.5 shrink-0 rounded-full bg-safe"
                    />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
