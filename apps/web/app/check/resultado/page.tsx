import Link from "next/link";
import { ResultPanel } from "@/components/result-panel";
import { SiteHeader } from "@/components/site-header";
import { analysisResults, normalizeRiskLevel } from "@/lib/analysis";

export const instant = false;

type ResultPageProps = {
  searchParams: Promise<{ escenario?: string | string[] }>;
};

export default async function CheckResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;
  const result = analysisResults[normalizeRiskLevel(params.escenario)];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-5 px-5 py-10 sm:px-6">
        <p className="text-sm text-info">
          <Link href="/check/revisar" className="underline underline-offset-4">
            Volver a revisar
          </Link>
        </p>
        <ResultPanel result={result} />
      </main>
    </>
  );
}
