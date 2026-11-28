import { expect, test } from "@playwright/test";
import {
  captchaReducer,
  initialCaptchaState,
  type CaptchaState,
} from "../../lib/captcha";

test("la comprobación pasa por pendiente y termina verificada", () => {
  const pending = captchaReducer(initialCaptchaState, { type: "start" });
  expect(pending).toEqual({ status: "pending", attempts: 0 });

  const verified = captchaReducer(pending, { type: "succeed" });
  expect(verified).toEqual({ status: "verified", attempts: 1 });
});

test("después de un error se puede reintentar", () => {
  const pending: CaptchaState = captchaReducer(initialCaptchaState, {
    type: "start",
  });
  const failed = captchaReducer(pending, { type: "fail" });
  expect(failed).toEqual({ status: "error", attempts: 1 });

  const retrying = captchaReducer(failed, { type: "retry" });
  expect(retrying).toEqual({ status: "pending", attempts: 1 });

  const verified = captchaReducer(retrying, { type: "succeed" });
  expect(verified).toEqual({ status: "verified", attempts: 2 });
});

test("ignora acciones fuera de orden y permite volver al inicio", () => {
  expect(captchaReducer(initialCaptchaState, { type: "succeed" })).toEqual(
    initialCaptchaState,
  );

  const verified: CaptchaState = {
    status: "verified",
    attempts: 1,
  };
  expect(captchaReducer(verified, { type: "start" })).toEqual(verified);
  expect(captchaReducer(verified, { type: "reset" })).toEqual(
    initialCaptchaState,
  );
});
