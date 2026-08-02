"""FastAPI application entry (docs/20 §5)."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.routes import health, products
from app.config import settings
from app.core.errors import AppError, app_error_handler, http_error_handler, validation_error_handler


@asynccontextmanager
async def lifespan(_app: FastAPI):
    settings.log_optional_warnings()
    yield


app = FastAPI(
    title="OSOOL API",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url=None if settings.ENV == "production" else "/docs",
    redoc_url=None if settings.ENV == "production" else "/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Idempotency-Key"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(StarletteHTTPException, http_error_handler)
app.add_exception_handler(RequestValidationError, validation_error_handler)

app.include_router(health.router)
app.include_router(products.router)
