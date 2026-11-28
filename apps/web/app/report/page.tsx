import Link from "next/link";
import { RiskBadge } from "@/components/risk-badge";
import { ResultPanel } from "@/components/result-panel";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { analysisResults, normalizeRiskLevel } from "@/lib/analysis";

export const instant = false;

type ReportPageProps = {
  searchParams: Promise<{
    escenario?: string | string[];
    origen?: string | string[];
  }>;
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const params = await searchParams;
  const result = analysisResults[normalizeRiskLevel(params.escenario)];
  const origin = firstValue(params.origen) === "protect" ? "Protect" : "Check";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-5 px-5 py-10 sm:px-6">
        <Card className="rounded-3xl ring-soft-green">
          <CardContent className="flex flex-col gap-6 px-6 py-10 sm:px-10">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Report</Badge>
              <Badge variant="outline" className="border-info text-info">
                Demo
              </Badge>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl leading-tight font-semibold text-petroleum sm:text-4xl">
                Vista previa del reporte
              </h1>
              <p className="leading-7 text-info">
                Este resumen muestra el tipo de escenario y el resultado de la
                evaluación. Puedes continuar con el formulario de reporte; el
                envío real requiere la API de reportes.
              </p>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-soft-green/70 p-4">
                <dt className="text-sm text-info">Tipo de escenario</dt>
                <dd className="mt-2">
                  <RiskBadge level={result.level}>{result.badge}</RiskBadge>
                </dd>
              </div>
              <div className="rounded-2xl bg-soft-green/70 p-4">
                <dt className="text-sm text-info">Resultado de la evaluación</dt>
                <dd className="mt-2 font-semibold text-petroleum">
                  {result.title}
                </dd>
              </div>
              <div className="rounded-2xl bg-soft-green/70 p-4">
                <dt className="text-sm text-info">Origen</dt>
                <dd className="mt-2 font-semibold text-petroleum">{origin}</dd>
              </div>
              <div className="rounded-2xl bg-soft-green/70 p-4">
                <dt className="text-sm text-info">Estado</dt>
                <dd className="mt-2 font-semibold text-petroleum">
                  Pendiente de envío
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/report/formulario?escenario=${result.level}`}
                className={buttonVariants({ size: "lg", className: "min-h-12 w-full text-base sm:w-auto" })}
              >
                Hacer un reporte
              </Link>
              <Link
                href="/"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "min-h-12 w-full text-base sm:w-auto",
                })}
              >
                Volver al inicio
              </Link>
              <Link
                href="/check"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "min-h-12 w-full text-base sm:w-auto",
                })}
              >
                Revisar otro mensaje
              </Link>
            </div>
          </CardContent>
        </Card>

        <ResultPanel result={result} />
      </main>
    </>
  );
}
