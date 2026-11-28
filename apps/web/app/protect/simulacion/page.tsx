import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export default function ProtectSimulationPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-5 py-10 sm:px-6">
        <div className="w-full max-w-sm overflow-hidden rounded-[2rem] border-8 border-petroleum bg-white shadow-xl">
          <div className="flex items-center justify-between bg-petroleum px-5 py-4 text-white">
            <h1 className="text-base font-semibold">Mensajes recibidos</h1>
            <span className="text-xs rounded-full bg-white/15 px-3 py-1">
              Simulación
            </span>
          </div>

          <div className="space-y-4 p-4">
            <article className="rounded-2xl border border-soft-green bg-cream p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-petroleum">Supuesto banco</p>
                  <p className="text-xs text-info">
                    Mensaje de texto · Hace 1 min
                  </p>
                </div>
                <Badge className="min-h-6 bg-warning text-ink">Sospechoso</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-ink">
                Estimado usuario: su cuenta será suspendida en las próximas
                horas. Ingrese al siguiente enlace para verificar sus datos
                inmediatamente.
              </p>
              <p className="mt-3 break-all text-sm font-medium text-danger">
                www.ejemplo-falso.com
              </p>
              <p className="mt-4 text-xs leading-5 text-info">
                Mensaje ficticio utilizado con fines educativos.
              </p>
            </article>

            <div
              role="status"
              aria-live="polite"
              className="rounded-2xl bg-soft-green/70 p-4"
            >
              <p className="font-semibold text-petroleum">
                Prevención Mayor detectó una posible amenaza
              </p>
              <p className="mt-1 text-sm leading-6 text-info">
                Estamos revisando el contenido para ayudarte a identificar
                posibles riesgos.
              </p>
            </div>

            <Link
              href="/protect/alerta?escenario=alto"
              className={buttonVariants({
                size: "lg",
                className: "min-h-12 w-full text-base",
              })}
            >
              Ver análisis de riesgo
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-info">
          <Link href="/protect" className="underline underline-offset-4">
            Volver al inicio de Protect
          </Link>
        </p>
      </main>
    </>
  );
}
