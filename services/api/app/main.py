"""Punto de entrada HTTP del servicio API."""

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.config import get_settings
from routes.reports import configure_report_state, router as reports_router


settings = get_settings()
app = FastAPI(title=settings.app_name)
configure_report_state(app)
app.include_router(reports_router)


@app.exception_handler(RequestValidationError)
async def invalid_request(
    _request: Request, _exc: RequestValidationError
) -> JSONResponse:
    """Evita exponer valores inválidos y conserva la estructura ApiError."""
    return JSONResponse(
        status_code=400,
        content={
            "contract_type": "ApiError",
            "code": "invalid_report",
            "message": "La solicitud contiene datos inválidos.",
            "retryable": False,
        },
    )


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    """Indica que el proceso API está disponible."""
    return {"status": "ok"}
