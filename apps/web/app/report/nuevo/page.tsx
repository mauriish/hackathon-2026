import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ReportForm } from "./report-form";

export default function NewReportPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-4 px-5 py-10 sm:px-6">
        <p className="text-sm text-info">
          <Link href="/report" className="underline underline-offset-4">
            Volver a Report
          </Link>
        </p>
        <ReportForm />
      </main>
    </>
  );
}
