"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { RiskBadge } from "@/components/risk-badge";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AnalysisResult } from "@/lib/analysis";

type Step = 1 | 2 | 3;

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: { transcript: string };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: { length: number; [index: number]: SpeechRecognitionResultLike };
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  const scope = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

const allowedPhotoTypes = ["image/png", "image/jpeg", "image/webp"];
const maxPhotoBytes = 10 * 1024 * 1024;

export function ReportForm({ result }: { result: AnalysisResult }) {
  const [step, setStep] = useState<Step>(1);
  const [completed, setCompleted] = useState(false);
  const [story, setStory] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [dictating, setDictating] = useState(false);
  const [dictationMessage, setDictationMessage] = useState("");

  const titleRef = useRef<HTMLHeadingElement>(null);
  const storyRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const previewRef = useRef<string | null>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, [step, completed]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  function goToStep(next: Step) {
    setError("");
    setStep(next);
  }

  function handleContinue() {
    if (step === 1) {
      if (!story.trim()) {
        setError("Cuéntanos qué pasó para poder ayudarte.");
        storyRef.current?.focus();
        return;
      }
      goToStep(2);
      return;
    }
    if (step === 2) {
      goToStep(3);
      return;
    }
    setCompleted(true);
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setPhotoError("");

    if (!file) {
      setPhoto(null);
      setPreviewUrl(null);
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
      return;
    }

    if (!allowedPhotoTypes.includes(file.type)) {
      setPhotoError("Usa una imagen PNG, JPG o WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > maxPhotoBytes) {
      setPhotoError("La imagen es muy grande. Usa una de menos de 10 MB.");
      event.target.value = "";
      return;
    }

    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = URL.createObjectURL(file);
    setPhoto(file);
    setPreviewUrl(previewRef.current);
  }

  function removePhoto() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setPhoto(null);
    setPreviewUrl(null);
    const input = document.getElementById("evidencia") as HTMLInputElement | null;
    if (input) input.value = "";
  }

  function handleDictation() {
    if (dictating) {
      recognitionRef.current?.stop();
      setDictating(false);
      return;
    }

    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setDictationMessage(
        "El dictado no está disponible en este navegador. Puedes escribir tu relato.",
      );
      return;
    }

    try {
      const recognition = new Recognition();
      recognition.lang = "es-ES";
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        let transcript = "";
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          if (event.results[index].isFinal) {
            transcript += event.results[index][0].transcript;
          }
        }
        if (transcript) {
          setStory((current) => `${current}${current ? " " : ""}${transcript}`);
        }
      };
      recognition.onerror = () => {
        recognitionRef.current = null;
        setDictationMessage("No pudimos usar el micrófono. Puedes escribir tu relato.");
        setDictating(false);
      };
      recognition.onend = () => {
        recognitionRef.current = null;
        setDictating(false);
      };
      recognition.start();
      recognitionRef.current = recognition;
      setDictationMessage("");
      setDictating(true);
    } catch {
      setDictationMessage("No pudimos usar el micrófono. Puedes escribir tu relato.");
    }
  }

  const backHref = `/report?escenario=${result.level}`;

  if (completed) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-10 sm:px-6">
          <Card className="overflow-hidden rounded-3xl bg-safe text-white ring-soft-green">
            <CardContent className="flex flex-col items-center px-6 py-14 text-center sm:px-10">
              <div
                aria-hidden="true"
                className="flex size-20 items-center justify-center rounded-full bg-white/20 text-5xl font-semibold"
              >
                ✓
              </div>
              <h1
                ref={titleRef}
                tabIndex={-1}
                className="mt-6 text-3xl leading-tight font-semibold sm:text-4xl"
              >
                ¡Listo! Ya recibimos tu reporte.
              </h1>
              <p className="mt-3 text-lg">Ya puedes cerrar esta ventana.</p>
              <p className="mt-8 w-full rounded-2xl bg-white/15 p-4 text-sm leading-6">
                Demostración: tus datos no se enviaron a ningún servidor.
              </p>
              <Link
                href="/"
                className={buttonVariants({
                  variant: "secondary",
                  size: "lg",
                  className: "mt-8 min-h-12 w-full text-base text-ink sm:w-auto",
                })}
              >
                Volver al inicio
              </Link>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-10 sm:px-6">
        <Card className="rounded-3xl ring-soft-green">
          <CardContent className="flex flex-col gap-6 px-6 py-10 sm:px-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Report</Badge>
                <Badge variant="outline" className="border-info text-info">
                  Demo
                </Badge>
              </div>
              {step === 1 ? (
                <Link
                  href={backHref}
                  className={buttonVariants({
                    variant: "secondary",
                    className: "min-h-11 w-full text-sm sm:w-auto",
                  })}
                >
                  Volver atrás
                </Link>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-11 w-full text-sm sm:w-auto"
                  onClick={() => goToStep((step - 1) as Step)}
                >
                  Volver atrás
                </Button>
              )}
            </div>

            <div aria-live="polite" aria-atomic="true">
              <p className="text-sm font-semibold text-info">Paso {step} de 3</p>
              <div className="mt-2 flex gap-2" aria-hidden="true">
                {([1, 2, 3] as const).map((value) => (
                  <span
                    key={value}
                    className={`h-2 flex-1 rounded-full ${
                      value <= step ? "bg-petroleum" : "bg-soft-green"
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="flex flex-wrap items-center gap-2 text-sm text-info">
              Escenario analizado:
              <RiskBadge level={result.level}>{result.badge}</RiskBadge>
            </p>

            {step === 1 ? (
              <>
                <div className="space-y-3">
                  <h1
                    ref={titleRef}
                    tabIndex={-1}
                    className="text-3xl leading-tight font-semibold text-petroleum sm:text-4xl"
                  >
                    Cuéntanos qué pasó
                  </h1>
                  <p className="text-lg leading-8 text-ink">
                    Escribe con tus propias palabras qué mensaje recibiste o qué
                    te preocupó. No hay respuestas correctas.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relato">Tu relato</Label>
                  <Textarea
                    ref={storyRef}
                    id="relato"
                    name="relato"
                    value={story}
                    onChange={(event) => setStory(event.target.value)}
                    placeholder="Por ejemplo: recibí un mensaje que decía que mi cuenta sería suspendida..."
                    className="min-h-44 rounded-2xl bg-white text-base"
                    aria-describedby={error ? "relato-error" : undefined}
                    aria-invalid={error ? true : undefined}
                  />
                  {error ? (
                    <p id="relato-error" role="alert" className="text-sm font-medium text-danger">
                      {error}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleDictation}
                    className="min-h-12 w-full text-base sm:w-auto sm:self-start"
                  >
                    {dictating ? "Detener dictado" : "Dictar mi relato"}
                  </Button>
                  <p className="text-sm leading-6 text-info" role="status">
                    {dictationMessage ||
                      (dictating
                        ? "Estamos escuchando. Habla con normalidad y luego detén el dictado."
                        : "Si lo prefieres, puedes dictar en lugar de escribir.")}
                  </p>
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <div className="space-y-3">
                  <h1
                    ref={titleRef}
                    tabIndex={-1}
                    className="text-3xl leading-tight font-semibold text-petroleum sm:text-4xl"
                  >
                    ¿Tienes una foto o captura del mensaje?
                  </h1>
                  <p className="text-lg leading-8 text-ink">
                    Si puedes, súbela aquí. Si no sabes cómo, no pasa nada:
                    puedes continuar sin ella.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evidencia">Foto o captura (opcional)</Label>
                  <Input
                    id="evidencia"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handlePhotoChange}
                    aria-describedby="evidencia-ayuda"
                    className="min-h-12 cursor-pointer rounded-2xl bg-white p-3 text-base"
                  />
                  <p id="evidencia-ayuda" className="text-sm leading-6 text-info">
                    PNG, JPG o WEBP. Máximo 10 MB.
                  </p>
                  {photoError ? (
                    <p role="alert" className="text-sm font-medium text-danger">
                      {photoError}
                    </p>
                  ) : null}
                </div>

                {photo && previewUrl ? (
                  <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-soft-green p-4">
                    <Image
                      src={previewUrl}
                      alt="Vista previa de la captura"
                      width={200}
                      height={140}
                      unoptimized
                      className="h-auto w-32 rounded-lg object-contain"
                    />
                    <div className="flex flex-1 flex-col gap-2">
                      <p className="break-all text-sm text-ink">{photo.name}</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={removePhoto}
                        className="min-h-11 w-full sm:w-auto"
                      >
                        Quitar foto
                      </Button>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="texto-mensaje">
                    ¿Prefieres pegar el texto del mensaje? (opcional)
                  </Label>
                  <Textarea
                    id="texto-mensaje"
                    value={pastedText}
                    onChange={(event) => setPastedText(event.target.value)}
                    placeholder="Pega aquí el texto que recibiste"
                    className="min-h-28 rounded-2xl bg-white text-base"
                  />
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <div className="space-y-3">
                  <h1
                    ref={titleRef}
                    tabIndex={-1}
                    className="text-3xl leading-tight font-semibold text-petroleum sm:text-4xl"
                  >
                    ¿Cómo podemos contactarte o identificar el caso?
                  </h1>
                  <p className="rounded-2xl bg-soft-green/70 p-5 text-lg leading-8 text-ink">
                    Este paso es opcional. No necesitas dar tus datos para enviar
                    el reporte.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="correo">Correo electrónico (opcional)</Label>
                    <Input
                      id="correo"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="nombre@ejemplo.com"
                      className="min-h-12 rounded-2xl bg-white text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono (opcional)</Label>
                    <Input
                      id="telefono"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="600 000 000"
                      className="min-h-12 rounded-2xl bg-white text-base"
                    />
                  </div>
                </div>

                <p className="text-sm leading-6 text-info">
                  Solo sirve para que podamos contactarte si lo necesitamos.
                </p>
              </>
            ) : null}

            <div className="flex flex-col items-start gap-3 border-t border-soft-green pt-6">
              {step === 2 ? (
                <Button
                  type="button"
                  variant="link"
                  onClick={() => goToStep(3)}
                  className="min-h-11 text-info"
                >
                  Omitir este paso
                </Button>
              ) : null}
              <Button
                type="button"
                onClick={handleContinue}
                className="min-h-12 w-full text-base sm:w-auto"
              >
                {step === 1
                  ? "Continuar al paso 2"
                  : step === 2
                    ? "Continuar al paso 3"
                    : "Enviar reporte"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
