"""Shared response shapes (docs/22 §12)."""

from __future__ import annotations

from pydantic import BaseModel


class ErrorBody(BaseModel):
    code: str
    message_ar: str
    field: str | None = None
    request_id: str | None = None


class ErrorResponse(BaseModel):
    error: ErrorBody
