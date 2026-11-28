import { ReportForm } from "@/components/report-form";
import { analysisResults, normalizeRiskLevel } from "@/lib/analysis";

export const instant = false;

type ReportFormPageProps = {
  searchParams: Promise<{ escenario?: string | string[] }>;
};

export default async function ReportFormPage({ searchParams }: ReportFormPageProps) {
  const params = await searchParams;
  const result = analysisResults[normalizeRiskLevel(params.escenario)];

  return <ReportForm result={result} />;
}
