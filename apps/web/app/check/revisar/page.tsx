"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function CheckReviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  const scenario = searchParams.get("escenario") ?? "alto";
  const showError = searchParams.get("estado") === "error";
  const canSubmit = message.trim().length > 0 && status === "idle";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setStatus("loading");
    router.push(`/check/resultado?escenario=${scenario}`);
  }

  if (showError) {
    return (
      <Card className="rounded-3xl ring-soft-green">
        <CardContent className="flex flex-col gap-5 px-6 py-10 sm:px-10">
          <Badge variant="outline" className="border-danger text-danger">
            No pudimos continuar
          </Badge>
          <h1 className="text-3xl font-semibold text-petroleum">
            No pudimos revisar el mensaje
          </h1>
          <p className="leading-7 text-ink">
            Inténtalo otra vez. Si el problema continúa, pide ayuda a una
            persona de confianza.
          </p>
          <Button
            type="button"
            size="lg"
            className="min-h-12 w-full sm:w-auto sm:self-start"
            onClick={() => router.replace(`/check/revisar?escenario=${scenario}`)}
          >
            Volver a intentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl ring-soft-green">
      <CardContent className="flex flex-col gap-6 px-6 py-10 sm:px-10">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Check</Badge>
          <Badge variant="outline" className="border-info text-info">
            Demo
          </Badge>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl leading-tight font-semibold text-petroleum sm:text-4xl">
            Vamos a revisar si es seguro
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-ink">
            Comparte el mensaje, correo electrónico o enlace que te genera
            dudas. Te ayudaremos a identificar posibles señales de fraude.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="space-y-2">
            <Label htmlFor="mensaje">Mensaje, correo electrónico o enlace</Label>
            <Textarea
              id="mensaje"
              name="mensaje"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Pega aquí el contenido que quieres revisar"
              className="min-h-40 resize-y rounded-2xl bg-white text-base"
              aria-describedby="mensaje-ayuda"
              required
            />
            <p id="mensaje-ayuda" className="text-sm leading-6 text-info">
              Evita compartir contraseñas, códigos o datos personales sensibles.
              Esta demostración no envía tus datos a un servidor.
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={!canSubmit}
            className="min-h-12 w-full text-base sm:w-auto sm:self-start"
          >
            {status === "loading" ? "Revisando..." : "Revisar mensaje"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function CheckReviewPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-10 sm:px-6">
        <p className="mb-4 text-sm text-info">
          <Link href="/check" className="underline underline-offset-4">
            Volver a Check
          </Link>
        </p>
        <Suspense
          fallback={
            <Card className="rounded-3xl ring-soft-green">
              <CardContent className="px-6 py-10">Preparando revisión...</CardContent>
            </Card>
          }
        >
          <CheckReviewForm />
        </Suspense>
      </main>
    </>
  );
}
