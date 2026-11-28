import Link from "next/link";
import { RiskBadge } from "@/components/risk-badge";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getProtectAlertPresentation,
  getProtectCheckHref,
  getProtectScenario,
} from "@/lib/protect-simulation";

export const instant = false;

type AlertPageProps = {
  searchParams: Promise<{ escenario?: string | string[] }>;
};

export default async function ProtectAlertPage({ searchParams }: AlertPageProps) {
  const params = await searchParams;
  const scenario = getProtectScenario(params.escenario);
  const presentation = getProtectAlertPresentation(scenario);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-5 px-5 py-10 sm:px-6">
        <Card className="rounded-3xl ring-soft-green">
          <div className={`h-2 w-full ${presentation.accent}`} />
          <CardContent className="flex flex-col gap-7 px-6 py-10 sm:px-10">
            <div className="flex flex-wrap items-center gap-2">
              {presentation.riskLevel ? (
                <RiskBadge level={presentation.riskLevel}>
                  {presentation.badge}
                </RiskBadge>
              ) : (
                <Badge className="min-h-6 bg-info text-white">
                  {presentation.badge}
                </Badge>
              )}
              <Badge variant="outline" className="border-info text-info">
                Simulación
              </Badge>
              <span className="text-xs font-medium text-info">Protect</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl leading-tight font-semibold text-petroleum sm:text-4xl">
                {presentation.title}
              </h1>
              <p className="text-lg font-medium text-ink">
                Queremos ayudarte a mantenerte seguro.
              </p>
              <p className="leading-7 text-info">{presentation.intro}</p>
            </div>

            <section aria-labelledby="senales-identificadas">
              <h2
                id="senales-identificadas"
                className="text-lg font-semibold text-petroleum"
              >
                ¿Qué identificamos?
              </h2>
              <ul className="mt-3 space-y-2 leading-7 text-ink">
                {presentation.signals.map((signal) => (
                  <li key={signal} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-3 size-1.5 shrink-0 rounded-full bg-petroleum"
                    />
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="acciones-recomendadas">
              <h2
                id="acciones-recomendadas"
                className="text-lg font-semibold text-petroleum"
              >
                ¿Qué debes hacer?
              </h2>
              <ol className="mt-3 space-y-3 leading-7 text-ink">
                {presentation.actions.map((action, index) => (
                  <li key={action} className="flex items-start gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-petroleum text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ol>
            </section>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/protect/acompanamiento?escenario=${scenario}`}
                className={buttonVariants({
                  size: "lg",
                  className: "min-h-12 w-full text-base sm:w-auto",
                })}
              >
                Entiendo, quiero protegerme
              </Link>
              <Link
                href={getProtectCheckHref(scenario)}
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "min-h-12 w-full text-base sm:w-auto",
                })}
              >
                Ver resultado de Check
              </Link>
            </div>

            <p className="rounded-2xl bg-soft-green/70 p-5 leading-7 text-ink">
              {presentation.support}
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
