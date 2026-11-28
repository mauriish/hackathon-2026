import Link from "next/link";
import { RiskBadge } from "@/components/risk-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { AnalysisResult, RiskLevel } from "@/lib/analysis";

const accentStyles: Record<RiskLevel, string> = {
  alto: "bg-danger",
  moderado: "bg-warning",
  bajo: "bg-safe",
};

export function ResultPanel({ result }: { result: AnalysisResult }) {
  return (
    <Card className="w-full overflow-hidden rounded-3xl ring-soft-green">
      <div className={`h-2 w-full ${accentStyles[result.level]}`} />
      <CardContent className="flex flex-col gap-6 px-5 py-7 sm:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <RiskBadge level={result.level}>{result.badge}</RiskBadge>
          <Badge variant="outline" className="border-info text-info">
            Demo
          </Badge>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl leading-tight font-semibold text-petroleum sm:text-4xl">
            {result.title}
          </h1>
          <p className="text-lg font-medium text-ink">{result.intro}</p>
          <p className="text-base leading-7 text-info">{result.body}</p>
        </div>

        {result.supportTitle ? (
          <div className="rounded-2xl bg-soft-green/70 p-5">
            <h2 className="text-lg font-semibold text-petroleum">
              {result.supportTitle}
            </h2>
            <p className="mt-2 leading-7 text-ink">{result.supportBody}</p>
          </div>
        ) : null}

        {result.note ? (
          <p className="rounded-2xl bg-soft-green/70 p-5 leading-7 text-ink">
            {result.note}
          </p>
        ) : null}

        <section aria-labelledby="result-recommendations">
          <h2
            id="result-recommendations"
            className="text-lg font-semibold text-petroleum"
          >
            {result.recommendationsTitle}
          </h2>
          <ul className="mt-3 space-y-2 leading-7 text-ink">
            {result.recommendations.map((recommendation) => (
              <li key={recommendation} className="flex gap-3">
                <span aria-hidden="true" className="mt-3 size-1.5 shrink-0 rounded-full bg-petroleum" />
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </section>

        <Link
          href={result.actionHref}
          className={buttonVariants({ size: "lg", className: "min-h-12 w-full text-base sm:w-auto sm:self-start" })}
        >
          {result.actionLabel}
        </Link>
      </CardContent>
    </Card>
  );
}
