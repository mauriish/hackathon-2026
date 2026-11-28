"use client";

import { useEffect, useReducer, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  captchaReducer,
  initialCaptchaState,
  type CaptchaStatus,
} from "@/lib/captcha";

const SIMULATED_DELAY_MS = 600;

type SimpleCaptchaProps = {
  onStatusChange: (status: CaptchaStatus) => void;
};

/**
 * Comprobación simulada, pensada para personas que no quieren resolver
 * rompecabezas: una sola acción grande, sin tiempo límite y con mensajes claros.
 */
export function SimpleCaptcha({ onStatusChange }: SimpleCaptchaProps) {
  const [state, dispatch] = useReducer(captchaReducer, initialCaptchaState);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  function verify() {
    if (state.status === "pending" || state.status === "verified") {
      return;
    }

    dispatch({ type: state.status === "error" ? "retry" : "start" });
    onStatusChange("pending");

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      dispatch({ type: "succeed" });
      onStatusChange("verified");
    }, SIMULATED_DELAY_MS);
  }

  const statusText =
    state.status === "verified"
      ? "Listo, podemos continuar"
      : state.status === "pending"
        ? "Verificando, espera un momento…"
        : state.status === "error"
          ? "No pudimos verificar"
          : "Sin verificar";

  const buttonText =
    state.status === "verified"
      ? "Verificación completada"
      : state.status === "pending"
        ? "Verificando..."
        : state.status === "error"
          ? "Intentar otra vez"
          : "Soy una persona";

  return (
    <fieldset className="rounded-2xl border border-dashed border-soft-green bg-white p-4">
      <legend className="px-2 text-base font-semibold text-petroleum">
        Comprobación sencilla
      </legend>
      <p id="captcha-ayuda" className="text-sm leading-6 text-info">
        Esto solo confirma que eres una persona. No hay imágenes que elegir ni
        nada que adivinar.
      </p>
      <Button
        type="button"
        size="lg"
        onClick={verify}
        disabled={state.status === "pending" || state.status === "verified"}
        aria-describedby="captcha-ayuda captcha-estado"
        className="mt-4 min-h-14 w-full text-base sm:w-auto"
      >
        {buttonText}
      </Button>
      <p
        id="captcha-estado"
        aria-live="polite"
        className={`mt-3 text-sm font-medium ${
          state.status === "error" ? "text-danger" : "text-info"
        }`}
      >
        {statusText}
      </p>
      {state.status === "error" && (
        <p
          role="alert"
          className="mt-2 rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
        >
          No pudimos comprobarlo. Prueba otra vez; tus datos siguen aquí.
        </p>
      )}
    </fieldset>
  );
}
