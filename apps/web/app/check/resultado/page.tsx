import Link from "next/link";
import { CheckResultPanel } from "@/components/check-result-panel";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { checkResponses, getCheckScenario } from "@/lib/check-result";
import {
  getProtectScenario,
  type ProtectScenario,
} from "@/lib/protect-simulation";

export const instant = false;

type ResultPageProps = {
  searchParams: Promise<{
    escenario?: string | string[];
    origen?: string | string[];
  }>;
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CheckResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;
  const scenario = getCheckScenario(params.escenario);
  const check = checkResponses[scenario];
  const fromProtect = firstValue(params.origen) === "protect";
  const protectScenario: ProtectScenario = getProtectScenario(scenario);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-5 px-5 py-10 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-info">
            <Link
              href={
                fromProtect
                  ? `/protect/simulacion?escenario=${protectScenario}`
                  : "/check/revisar"
              }
              className="underline underline-offset-4"
            >
              {fromProtect
                ? "Volver a la simulación de Protect"
                : "Volver a revisar"}
            </Link>
          </p>
          {fromProtect ? (
            <Badge variant="outline" className="border-info text-info">
              Protect · Simulación
            </Badge>
          ) : null}
        </div>
        <CheckResultPanel check={check} />
      </main>
    </>
  );
}
