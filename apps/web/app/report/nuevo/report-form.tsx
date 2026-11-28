"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { CircleCheckBig, ImagePlus, Mic } from "lucide-react";
import { SimpleCaptcha } from "@/components/simple-captcha";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CaptchaStatus } from "@/lib/captcha";
import {
  buildDemoExtraction,
  buildReportSubmission,
  validateMessage,
  validateTarget,
  type ReportDraft,
  type ReportExtraction,
  type ReportSubmission,
  type ReportTargetKind,
} from "@/lib/report";
import { cn } from "@/lib/utils";

const STEP_TITLES = [
  "Cuéntanos qué pasó",
  "Destino y evidencia",
  "Revisa y confirma",
] as const;

const TOTAL_STEPS = STEP_TITLES.length;

const initialDraft: ReportDraft = {
  targetKind: "link",
  targetValue: "",
  message: "",
  context: "",
  contact: "",
};

const initialExtraction = buildDemoExtraction(initialDraft);

export function ReportForm() {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<ReportDraft>(initialDraft);
  const [extraction, setExtraction] =
    useState<ReportExtraction>(initialExtraction);
  const [originalExtraction, setOriginalExtraction] =
    useState<ReportExtraction>(initialExtraction);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [targetError, setTargetError] = useState<string | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [captchaStatus, setCaptchaStatus] = useState<CaptchaStatus>("idle");
  const [captchaKey, setCaptchaKey] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [submission, setSubmission] = useState<ReportSubmission | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (stepIndex > 0) {
      headingRef.current?.focus();
    }
  }, [stepIndex]);

  function goToStep(nextStep: number) {
    setReviewError(null);
    setExtractionError(null);
    setConfirmed(false);
    setCaptchaStatus("idle");
    setCaptchaKey((current) => current + 1);
    setStepIndex(nextStep);
  }

  function updateDraft(partial: Partial<ReportDraft>) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  function invalidateConfirmation() {
    setConfirmed(false);
    setCaptchaStatus("idle");
    setCaptchaKey((current) => current + 1);
  }

  function updateExtraction(partial: Partial<ReportExtraction>) {
    setExtraction((current) => ({ ...current, ...partial }));
    setExtractionError(null);
    invalidateConfirmation();
  }

  function restoreExtraction() {
    setExtraction(originalExtraction);
    setExtractionError(null);
    invalidateConfirmation();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFileName(event.target.files?.[0]?.name ?? null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (stepIndex === 0) {
      const error = validateMessage(draft.message);
      setMessageError(error);
      if (!error) {
        goToStep(1);
      }
      return;
    }

    if (stepIndex === 1) {
      const error = validateTarget(draft.targetKind, draft.targetValue);
      setTargetError(error);
      if (!error) {
        const detected = buildDemoExtraction(draft);
        setExtraction(detected);
        setOriginalExtraction(detected);
        goToStep(2);
      }
      return;
    }

    const dataError =
      validateMessage(extraction.message) ??
      validateTarget(extraction.targetKind, extraction.targetValue);

    if (dataError) {
      setExtractionError(dataError);
      return;
    }

    if (captchaStatus === "pending") {
      setReviewError("Estamos verificando. Espera un momento antes de enviar.");
      return;
    }

    if (!confirmed) {
      setReviewError("Confirma que los datos son correctos antes de enviar.");
      return;
    }

    if (captchaStatus === "error") {
      setReviewError(
        "La comprobación no se pudo completar. Prueba otra vez antes de enviar.",
      );
      return;
    }

    if (captchaStatus !== "verified") {
      setReviewError("Completa la comprobación sencilla antes de enviar.");
      return;
    }

    // El envío real requiere la API de reportes. En la demostración solo se
    // construye el contrato ReportSubmission en memoria.
    setSubmission(buildReportSubmission(extraction));
  }

  function resetForm() {
    setDraft(initialDraft);
    setExtraction(initialExtraction);
    setOriginalExtraction(initialExtraction);
    setMessageError(null);
    setTargetError(null);
    setExtractionError(null);
    setReviewError(null);
    setConfirmed(false);
    setCaptchaStatus("idle");
    setCaptchaKey((current) => current + 1);
    setFileName(null);
    setSubmission(null);
    setStepIndex(0);
  }

  if (submission) {
    return (
      <Card className="rounded-3xl bg-safe text-white ring-safe">
        <CardContent className="flex flex-col items-center gap-5 px-6 py-12 text-center sm:px-10">
          <CircleCheckBig aria-hidden="true" className="size-24" strokeWidth={1.5} />
          <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
            ¡Listo! Ya recibimos tu reporte. Ya puedes cerrar esta ventana
          </h1>
          <p className="max-w-xl text-lg leading-8">
            Gracias por contárnoslo.
          </p>
          <p className="max-w-xl rounded-2xl bg-white/15 px-4 py-3 text-base leading-7">
            Demostración: este reporte todavía no se envía a un servidor.
          </p>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className={buttonVariants({
                size: "lg",
                className:
                  "min-h-12 w-full bg-white text-base text-petroleum hover:bg-white/90 sm:w-auto",
              })}
            >
              Volver al inicio
            </Link>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={resetForm}
              className="min-h-12 w-full border-white/60 bg-transparent text-base text-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              Hacer otro reporte
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl ring-soft-green">
      <CardContent className="flex flex-col gap-6 px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Report</Badge>
          <Badge variant="outline" className="border-info text-info">
            Demo
          </Badge>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl leading-tight font-semibold text-petroleum sm:text-4xl">
            Reportar un mensaje sospechoso
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-ink">
            Son tres pasos cortos. Puedes volver atrás cuando quieras y no
            necesitas tener todo a mano para empezar.
          </p>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-info">
            <span>
              Paso {stepIndex + 1} de {TOTAL_STEPS}
            </span>
            <span>{STEP_TITLES[stepIndex]}</span>
          </div>
          <ol className="mt-2 flex gap-2" aria-label="Progreso del reporte">
            {STEP_TITLES.map((title, index) => (
              <li
                key={title}
                aria-current={index === stepIndex ? "step" : undefined}
                className={cn(
                  "h-2 flex-1 rounded-full",
                  index <= stepIndex ? "bg-petroleum" : "bg-soft-green",
                )}
              >
                <span className="sr-only">
                  Paso {index + 1} de {TOTAL_STEPS}: {title}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          {stepIndex > 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => goToStep(stepIndex - 1)}
              className="-ml-3 min-h-11 self-start px-3 text-base text-petroleum"
            >
              Volver atrás
            </Button>
          )}

          {stepIndex === 0 && (
            <div className="space-y-2">
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-2xl leading-snug font-semibold text-petroleum outline-none"
              >
                Cuéntanos qué pasó
              </h2>
              <p className="text-lg leading-8 text-info">
                No tienes que explicarlo perfecto. Con tus palabras es
                suficiente.
              </p>
            </div>
          )}

          {stepIndex === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="reporte-mensaje" className="text-base">
                  Mensaje que recibiste
                </Label>
                <Textarea
                  id="reporte-mensaje"
                  value={draft.message}
                  onChange={(event) => {
                    updateDraft({ message: event.target.value });
                    setMessageError(null);
                  }}
                  placeholder="Por ejemplo: recibí un mensaje que me pide mis datos para no bloquear mi cuenta."
                  className="min-h-56 resize-y rounded-2xl bg-white text-base"
                  aria-invalid={messageError ? true : undefined}
                  aria-describedby="reporte-mensaje-ayuda"
                />
                <p
                  id="reporte-mensaje-ayuda"
                  className="rounded-2xl bg-soft-green/70 p-4 text-lg leading-8 text-ink"
                >
                  Evita escribir contraseñas, códigos o datos bancarios.
                </p>
                {messageError && (
                  <p
                    role="alert"
                    className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
                  >
                    {messageError}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-dashed border-soft-green bg-soft-green/40 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-medium text-petroleum">
                      ¿Prefieres contarlo hablando?
                    </p>
                    <p className="text-base leading-7 text-info">
                      La grabación de audio estará disponible próximamente.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled
                    className="min-h-14 w-full bg-white text-base text-petroleum sm:w-auto"
                  >
                    <Mic aria-hidden="true" className="size-6" />
                    Grabar audio (próximamente)
                  </Button>
                </div>
              </div>
            </>
          )}

          {stepIndex === 1 && (
            <>
              <fieldset className="space-y-4 rounded-2xl border border-dashed border-soft-green bg-soft-green/40 p-4">
                <legend className="px-2 text-lg font-semibold text-petroleum">
                  Primero, dinos dónde lo viste
                </legend>

                <div className="space-y-2">
                  <Label htmlFor="reporte-tipo" className="text-base">
                    ¿Dónde lo viste?
                  </Label>
                  <select
                    id="reporte-tipo"
                    value={draft.targetKind}
                    onChange={(event) => {
                      updateDraft({
                        targetKind: event.target.value as ReportTargetKind,
                      });
                      setTargetError(null);
                    }}
                    className="min-h-12 w-full rounded-xl border border-input bg-white px-3 text-base text-ink focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="link">En un enlace</option>
                    <option value="app">En una aplicación</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reporte-destino" className="text-base">
                    {draft.targetKind === "link"
                      ? "Enlace que quieres reportar"
                      : "Nombre de la aplicación"}
                  </Label>
                  <input
                    id="reporte-destino"
                    type="text"
                    inputMode={draft.targetKind === "link" ? "url" : "text"}
                    value={draft.targetValue}
                    onChange={(event) => {
                      updateDraft({ targetValue: event.target.value });
                      setTargetError(null);
                    }}
                    placeholder={
                      draft.targetKind === "link"
                        ? "https://ejemplo.com/acceso"
                        : "Nombre de la aplicación"
                    }
                    className="min-h-12 w-full rounded-xl border border-input bg-white px-3 text-base text-ink placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    aria-invalid={targetError ? true : undefined}
                    aria-describedby="reporte-destino-ayuda"
                  />
                  <p
                    id="reporte-destino-ayuda"
                    className="text-sm leading-6 text-info"
                  >
                    No escribas contraseñas ni datos de acceso.
                  </p>
                  {targetError && (
                    <p
                      role="alert"
                      className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
                    >
                      {targetError}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reporte-contexto" className="text-base">
                    Texto del mensaje o contexto (opcional)
                  </Label>
                  <Textarea
                    id="reporte-contexto"
                    value={draft.context}
                    onChange={(event) =>
                      updateDraft({ context: event.target.value })
                    }
                    placeholder="Puedes pegar aquí el texto que viste o contar cuándo lo recibiste."
                    className="min-h-28 resize-y rounded-2xl bg-white text-base"
                    aria-describedby="reporte-contexto-ayuda"
                  />
                  <p
                    id="reporte-contexto-ayuda"
                    className="text-sm leading-6 text-info"
                  >
                    Si no lo recuerdas, puedes dejarlo vacío.
                  </p>
                </div>
              </fieldset>

              <div className="space-y-2">
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-2xl leading-snug font-semibold text-petroleum outline-none"
                >
                  ¿Tienes una foto o captura del mensaje? Súbela aquí
                </h2>
                <p className="rounded-2xl bg-soft-green/70 p-4 text-lg leading-8 text-ink">
                  Si no sabes subir una imagen o no tienes una captura, no pasa
                  nada: puedes continuar al paso 3 sin problema.
                </p>
              </div>

              <fieldset className="rounded-2xl border border-dashed border-soft-green bg-soft-green/40 p-4">
                <legend className="px-2 text-base font-medium text-petroleum">
                  Subir captura (opcional)
                </legend>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-6 text-info">
                    En esta demostración la imagen no se envía ni se guarda.
                  </p>
                  <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-input bg-white px-4 text-base font-medium text-petroleum hover:bg-soft-green/60">
                    <ImagePlus aria-hidden="true" className="size-5" />
                    Elegir captura
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {fileName && (
                  <p className="mt-3 text-sm font-medium break-all text-petroleum">
                    Archivo elegido: {fileName} (solo vista previa local)
                  </p>
                )}
              </fieldset>
            </>
          )}

          {stepIndex === 2 && (
            <>
              <div className="space-y-2">
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-2xl leading-snug font-semibold text-petroleum outline-none"
                >
                  Revisa y corrige los datos
                </h2>
                <p className="text-lg leading-8 text-info">
                  Estos son los datos que encontramos en tu mensaje. Si algo no
                  está bien, puedes cambiarlo antes de enviar.
                </p>
              </div>

              <fieldset className="space-y-4 rounded-2xl border border-dashed border-soft-green bg-soft-green/40 p-4">
                <legend className="px-2 text-lg font-semibold text-petroleum">
                  Datos del reporte
                </legend>

                <div className="space-y-2">
                  <Label
                    htmlFor="reporte-extraccion-mensaje"
                    className="text-base"
                  >
                    Mensaje que recibiste
                  </Label>
                  <Textarea
                    id="reporte-extraccion-mensaje"
                    value={extraction.message}
                    onChange={(event) =>
                      updateExtraction({ message: event.target.value })
                    }
                    className="min-h-36 resize-y rounded-2xl bg-white text-base"
                    aria-invalid={
                      extractionError && extraction.message.trim().length === 0
                        ? true
                        : undefined
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="reporte-extraccion-tipo"
                    className="text-base"
                  >
                    ¿Dónde lo viste?
                  </Label>
                  <select
                    id="reporte-extraccion-tipo"
                    value={extraction.targetKind}
                    onChange={(event) =>
                      updateExtraction({
                        targetKind: event.target.value as ReportTargetKind,
                      })
                    }
                    className="min-h-12 w-full rounded-xl border border-input bg-white px-3 text-base text-ink focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="link">En un enlace</option>
                    <option value="app">En una aplicación</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="reporte-extraccion-destino"
                    className="text-base"
                  >
                    {extraction.targetKind === "link"
                      ? "Enlace que quieres reportar"
                      : "Nombre de la aplicación"}
                  </Label>
                  <input
                    id="reporte-extraccion-destino"
                    type="text"
                    inputMode={
                      extraction.targetKind === "link" ? "url" : "text"
                    }
                    value={extraction.targetValue}
                    onChange={(event) =>
                      updateExtraction({ targetValue: event.target.value })
                    }
                    placeholder={
                      extraction.targetKind === "link"
                        ? "https://ejemplo.com/acceso"
                        : "Nombre de la aplicación"
                    }
                    className="min-h-12 w-full rounded-xl border border-input bg-white px-3 text-base text-ink placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="reporte-extraccion-contexto"
                    className="text-base"
                  >
                    Texto del mensaje o contexto (opcional)
                  </Label>
                  <Textarea
                    id="reporte-extraccion-contexto"
                    value={extraction.context}
                    onChange={(event) =>
                      updateExtraction({ context: event.target.value })
                    }
                    className="min-h-24 resize-y rounded-2xl bg-white text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reporte-contacto" className="text-base">
                    Correo o teléfono (opcional)
                  </Label>
                  <input
                    id="reporte-contacto"
                    type="text"
                    autoComplete="off"
                    inputMode="text"
                    value={extraction.contact}
                    onChange={(event) =>
                      updateExtraction({ contact: event.target.value })
                    }
                    placeholder="ejemplo@correo.com o 600 000 000"
                    className="min-h-12 w-full rounded-xl border border-input bg-white px-3 text-base text-ink placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    aria-describedby="reporte-contacto-ayuda"
                  />
                  <p
                    id="reporte-contacto-ayuda"
                    className="text-sm leading-6 text-info"
                  >
                    Puedes dejarlo vacío. Si lo cambias, vuelve a confirmar al
                    final.
                  </p>
                </div>

                {extractionError && (
                  <p
                    role="alert"
                    className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
                  >
                    {extractionError}
                  </p>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  onClick={restoreExtraction}
                  className="-ml-3 min-h-11 self-start px-3 text-base text-petroleum"
                >
                  Restablecer datos originales
                </Button>
              </fieldset>

              <div className="space-y-3">
                <p className="rounded-2xl bg-soft-green/70 p-4 text-base leading-7 text-ink">
                  Demostración: este reporte no se envía a ningún servidor.
                </p>
                <label className="flex items-start gap-3 text-base leading-7 text-ink">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(event) => {
                      setConfirmed(event.target.checked);
                      setReviewError(null);
                    }}
                    className="mt-1 size-6 shrink-0 accent-petroleum"
                  />
                  <span>
                    Confirmo que los datos son correctos y quiero enviar el
                    reporte.
                  </span>
                </label>
                <SimpleCaptcha
                  key={captchaKey}
                  onStatusChange={setCaptchaStatus}
                />
                <p className="text-sm leading-6 text-info">
                  Esta comprobación es simulada. El envío real necesitará la API
                  de reportes y la verificación anti-abuso del servidor.
                </p>
                {reviewError && (
                  <p
                    role="alert"
                    className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
                  >
                    {reviewError}
                  </p>
                )}
              </div>
            </>
          )}

          <div className="flex flex-col gap-3 border-t border-soft-green pt-5 sm:flex-row-reverse sm:items-center sm:justify-between">
            <Button
              type="submit"
              size="lg"
              className="min-h-12 w-full text-base sm:w-auto"
            >
              {stepIndex === 0 && "Continuar al paso 2"}
              {stepIndex === 1 && "Continuar al paso 3"}
              {stepIndex === 2 && "Enviar reporte"}
            </Button>
            <p className="text-sm leading-6 text-info sm:max-w-xs">
              No hay prisa. Puedes corregir lo que escribiste antes de enviar.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
