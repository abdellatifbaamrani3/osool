"""Typed error responses (docs/22 §12)."""

from __future__ import annotations

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class AppError(Exception):
    def __init__(
        self,
        *,
        status_code: int,
        code: str,
        message_ar: str,
        field: str | None = None,
    ) -> None:
        self.status_code = status_code
        self.code = code
        self.message_ar = message_ar
        self.field = field


def _request_id(request: Request) -> str | None:
    return getattr(request.state, "request_id", None) or request.headers.get("X-Request-ID")


def error_payload(
    *,
    code: str,
    message_ar: str,
    field: str | None = None,
    request_id: str | None = None,
) -> dict:
    body: dict = {"code": code, "message_ar": message_ar, "request_id": request_id}
    if field:
        body["field"] = field
    return {"error": body}


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=error_payload(
            code=exc.code,
            message_ar=exc.message_ar,
            field=exc.field,
            request_id=_request_id(request),
        ),
    )


async def http_error_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    code_map = {
        404: "not_found",
        409: "conflict",
        410: "gone",
        422: "validation_error",
        429: "rate_limited",
        503: "unavailable",
    }
    code = code_map.get(exc.status_code, "bad_request" if exc.status_code < 500 else "server_error")
    message = exc.detail if isinstance(exc.detail, str) else "صار خطأ عندنا، مو عندك. جرّبي مرة ثانية أو كلّمينا واتساب."
    return JSONResponse(
        status_code=exc.status_code,
        content=error_payload(code=code, message_ar=message, request_id=_request_id(request)),
    )


async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    field = None
    if exc.errors():
        loc = exc.errors()[0].get("loc", ())
        field = str(loc[-1]) if loc else None
    return JSONResponse(
        status_code=422,
        content=error_payload(
            code="validation_error",
            message_ar="البيانات غير صحيحة — تأكدي من الحقول",
            field=field,
            request_id=_request_id(request),
        ),
    )
