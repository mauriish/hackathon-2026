import Link from "next/link";
import { CheckResultPanel } from "@/components/check-result-panel";
import { SiteHeader } from "@/components/site-header";
import { checkResponses, getCheckScenario } from "@/lib/check-result";

export const instant = false;

type ResultPageProps = {
  searchParams: Promise<{ escenario?: string | string[] }>;
};

export default async function CheckResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;
  const scenario = getCheckScenario(params.escenario);
  const check = checkResponses[scenario];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-5 px-5 py-10 sm:px-6">
        <p className="text-sm text-info">
          <Link href="/check/revisar" className="underline underline-offset-4">
            Volver a revisar
          </Link>
        </p>
        <CheckResultPanel check={check} />
      </main>
    </>
  );
}
