export type CaptchaStatus = "idle" | "pending" | "verified" | "error";

export type CaptchaState = {
  status: CaptchaStatus;
  attempts: number;
};

export type CaptchaAction =
  | { type: "start" }
  | { type: "retry" }
  | { type: "succeed" }
  | { type: "fail" }
  | { type: "reset" };

export const initialCaptchaState: CaptchaState = {
  status: "idle",
  attempts: 0,
};

/**
 * Máquina de estados de la comprobación simulada. Se mantiene pura para poder
 * probar el estado pendiente, el éxito, el error y el reintento sin temporizadores.
 */
export function captchaReducer(
  state: CaptchaState,
  action: CaptchaAction,
): CaptchaState {
  switch (action.type) {
    case "start":
      if (state.status === "pending" || state.status === "verified") {
        return state;
      }
      return { ...state, status: "pending" };
    case "retry":
      if (state.status !== "error") {
        return state;
      }
      return { ...state, status: "pending" };
    case "succeed":
      if (state.status !== "pending") {
        return state;
      }
      return { status: "verified", attempts: state.attempts + 1 };
    case "fail":
      if (state.status !== "pending") {
        return state;
      }
      return { status: "error", attempts: state.attempts + 1 };
    case "reset":
      return initialCaptchaState;
    default:
      return state;
  }
}
