import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CheckPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-10 sm:px-6">
        <Card className="rounded-3xl ring-soft-green">
          <CardContent className="flex flex-col gap-6 px-6 py-10 sm:px-10">
            <p className="text-sm font-semibold tracking-wide text-info uppercase">
              Check
            </p>
            <h1 className="text-3xl leading-tight font-semibold text-petroleum sm:text-4xl">
              ¿Tienes duda sobre un mensaje?
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-ink">
              No te preocupes. Podemos ayudarte a revisar mensajes, correos
              electrónicos o enlaces que te parezcan sospechosos.
            </p>
            <Link
              href="/check/revisar"
              className={buttonVariants({
                size: "lg",
                className: "min-h-12 w-full text-base sm:w-auto sm:self-start",
              })}
            >
              Revisar mensaje
            </Link>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
