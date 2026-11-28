"""Modelos internos de persistencia del servicio API."""

import re
from datetime import date, datetime, timedelta, timezone
from enum import StrEnum
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ReportStatus(StrEnum):
    """Estados publicados para ReportRecord."""

    RECEIVED = "received"
    PROCESSING = "processing"
    COMPLETED = "completed"
    REJECTED = "rejected"
    FAILED = "failed"


class SanitizedTarget(BaseModel):
    """Destino saneado que puede persistirse."""

    model_config = ConfigDict(extra="forbid")

    kind: Literal["app", "link"]
    value: str = Field(min_length=1)

    @model_validator(mode="after")
    def validate_link_target(self) -> "SanitizedTarget":
        if self.kind == "link" and re.fullmatch(
            r"(?:https?://[^/@?#]+(?:/[^?#]*)?|[^:/@?#]+(?:/[^?#]*)?)",
            self.value,
        ) is None:
            raise ValueError(
                "Los destinos link saneados no pueden incluir credenciales, "
                "parámetros ni fragmentos"
            )
        return self


class ReportRecord(BaseModel):
    """Registro saneado persistido por el servicio API."""

    model_config = ConfigDict(extra="forbid")

    contract_type: Literal["ReportRecord"]
    report_id: UUID
    created_at: datetime
    target: SanitizedTarget
    sanitized_message: str = Field(min_length=1)
    sanitized_context: str
    abuse_id: str = Field(min_length=1)
    abuse_id_expires_at: datetime
    status: ReportStatus

    @model_validator(mode="after")
    def validate_sensitive_identifier_expiration(self) -> "ReportRecord":
        """Limita el identificador antiabuso a 14 días desde su emisión."""
        if (
            self.created_at.tzinfo is None
            or self.created_at.utcoffset() is None
            or self.abuse_id_expires_at.tzinfo is None
            or self.abuse_id_expires_at.utcoffset() is None
        ):
            raise ValueError("Las fechas del reporte deben incluir zona horaria")

        created_at = self.created_at.astimezone(timezone.utc)
        expires_at = self.abuse_id_expires_at.astimezone(timezone.utc)
        if not created_at < expires_at <= created_at + timedelta(days=14):
            raise ValueError("abuse_id debe expirar dentro de los 14 días")
        return self


class StoredReport(BaseModel):
    """Datos saneados retenidos después de expirar el identificador antiabuso."""

    model_config = ConfigDict(extra="forbid")

    report_id: UUID
    created_at: datetime
    target: SanitizedTarget
    sanitized_message: str = Field(min_length=1)
    sanitized_context: str
    status: ReportStatus


class OfficialIdentity(BaseModel):
    """Identidad de organización incluida en el catálogo de dominios oficiales."""

    model_config = ConfigDict(extra="forbid")

    organization: str = Field(min_length=1)
    domain: str = Field(min_length=1)
    sector: str = Field(min_length=1)
    source_url: str = Field(min_length=1)
    verified_at: date
    notes: str | None = None
