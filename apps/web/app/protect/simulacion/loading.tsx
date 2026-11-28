import { SiteHeader } from "@/components/site-header";

export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-5 py-10 sm:px-6">
        <div
          role="status"
          aria-live="polite"
          className="rounded-3xl border border-soft-green bg-white p-8 text-center"
        >
          <p className="font-semibold text-petroleum">Simulación · Demo</p>
          <p className="mt-2 leading-7 text-info">
            Preparando la bandeja de mensajes ficticios...
          </p>
        </div>
      </main>
    </>
  );
}
