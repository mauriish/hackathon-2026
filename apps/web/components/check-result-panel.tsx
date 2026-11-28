import Link from "next/link";
import { Bot, CircleCheckBig, Info, ShieldQuestionMark, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  checkSignalKeys,
  checkSignalNames,
  evidenceSourceNames,
  getCheckPresentation,
  getConfidenceText,
  getSignalLabel,
  type CheckResponse,
  type CheckRiskLevel,
} from "@/lib/check-result";

const accentStyles: Record<CheckRiskLevel, string> = {
  riesgo_alto: "bg-danger",
  riesgo_moderado: "bg-warning",
  sin_senales_importantes: "bg-safe",
  no_concluyente: "bg-info",
};

const signalIcons = {
  community: UsersRound,
  ai: Bot,
  identity: ShieldQuestionMark,
};

/** Panel de resultado de Check con los ratings, la evidencia y las recomendaciones del contrato. */
export function CheckResultPanel({ check }: { check: CheckResponse }) {
  const presentation = getCheckPresentation(check);
  const ConfidenceIcon = check.confidence === "alta" ? CircleCheckBig : Info;

  return (
    <Card className="w-full overflow-hidden rounded-3xl ring-soft-green">
      <div className={`h-2 w-full ${accentStyles[check.riskLevel]}`} />
      <CardContent className="flex flex-col gap-7 px-5 py-7 sm:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Check</Badge>
          <Badge variant="outline" className="border-info text-info">
            Demo
          </Badge>
          <Badge variant="outline" className="border-petroleum text-petroleum">
            {presentation.levelLabel}
          </Badge>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-info">{presentation.subtitle}</p>
          <h1 className="text-3xl leading-tight font-semibold text-petroleum sm:text-4xl">
            {presentation.title}
          </h1>
          <p className="text-lg font-medium text-ink">{presentation.intro}</p>
          {presentation.notice ? (
            <p
              role="status"
              className="rounded-2xl bg-soft-green/70 p-4 leading-7 text-ink"
            >
              {presentation.notice}
            </p>
          ) : null}
        </div>

        <section aria-labelledby="check-signals">
          <h2
            id="check-signals"
            className="text-lg font-semibold text-petroleum"
          >
            ¿Qué encontramos?
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {checkSignalKeys.map((key) => {
              const signal = check.signals[key];
              const label = getSignalLabel(key, signal);
              const unavailable = signal.status === "unavailable" || signal.score === null;
              const detail = unavailable
                ? "Sin datos disponibles"
                : `${signal.score} de 100 · peso ${Math.round(signal.weight * 100)} %`;
              const Icon = signalIcons[key];

              return (
                <li
                  key={key}
                  aria-label={`${checkSignalNames[key]}: ${label}. ${detail}.`}
                  className={`flex flex-col gap-2 rounded-2xl border p-4 ${
                    unavailable
                      ? "border-dashed border-info/60 bg-white"
                      : "border-soft-green bg-soft-green/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon aria-hidden="true" className="size-5 text-petroleum" />
                    <span className="font-semibold text-petroleum">
                      {checkSignalNames[key]}
                    </span>
                  </div>
                  <span className="text-base font-medium text-ink">{label}</span>
                  <span className="text-sm text-info">{detail}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-sm leading-6 text-info">
            Una señal no disponible no significa que el mensaje sea seguro.
          </p>
        </section>

        <section aria-labelledby="check-confidence">
          <h2
            id="check-confidence"
            className="text-lg font-semibold text-petroleum"
          >
            ¿Qué tan seguro es nuestro resultado?
          </h2>
          <div className="mt-3 flex gap-3 rounded-2xl bg-soft-green/70 p-4">
            <ConfidenceIcon aria-hidden="true" className="mt-1 size-5 shrink-0 text-petroleum" />
            <div className="space-y-1">
              <p className="font-semibold text-petroleum">
                Confianza {check.confidence}
              </p>
              <p className="leading-7 text-ink">
                {getConfidenceText(check.confidence)}
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="check-indicators">
          <h2
            id="check-indicators"
            className="text-lg font-semibold text-petroleum"
          >
            ¿Qué encontramos en el mensaje?
          </h2>
          {check.indicators.length > 0 ? (
            <ul className="mt-3 space-y-2 leading-7 text-ink">
              {check.indicators.map((indicator) => (
                <li key={indicator} className="flex gap-3">
                  <Info aria-hidden="true" className="mt-1.5 size-4 shrink-0 text-info" />
                  <span>{indicator}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 leading-7 text-info">
              No encontramos indicios concretos en el mensaje.
            </p>
          )}
        </section>

        <section aria-labelledby="check-evidence">
          <h2 id="check-evidence" className="text-lg font-semibold text-petroleum">
            Evidencia
          </h2>
          {check.evidence.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {check.evidence.map((evidence) => (
                <li
                  key={evidence.evidenceId}
                  className="rounded-2xl border border-soft-green p-4"
                >
                  <Badge variant="secondary" className="mb-2">
                    {evidenceSourceNames[evidence.source]}
                  </Badge>
                  <p className="leading-7 text-ink">{evidence.description}</p>
                  {evidence.excerpt ? (
                    <p className="mt-1 text-sm italic text-info">
                      «{evidence.excerpt}»
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 leading-7 text-info">
              No hay evidencia disponible para este resultado.
            </p>
          )}
        </section>

        <section aria-labelledby="check-summary">
          <h2 id="check-summary" className="text-lg font-semibold text-petroleum">
            Resumen
          </h2>
          <p className="mt-3 leading-7 text-ink">{check.summary}</p>
        </section>

        <section aria-labelledby="check-recommendations">
          <h2
            id="check-recommendations"
            className="text-lg font-semibold text-petroleum"
          >
            ¿Qué te recomendamos?
          </h2>
          <ul className="mt-3 space-y-2 leading-7 text-ink">
            {check.recommendations.map((recommendation) => (
              <li key={recommendation} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-3 size-1.5 shrink-0 rounded-full bg-petroleum"
                />
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </section>

        <Link
          href={presentation.actionHref}
          className={buttonVariants({
            size: "lg",
            className: "min-h-12 w-full text-base sm:w-auto sm:self-start",
          })}
        >
          {presentation.actionLabel}
        </Link>
      </CardContent>
    </Card>
  );
}
