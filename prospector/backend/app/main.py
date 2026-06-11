"""
PROSPECTOR - Asteroid Mining Feasibility Engine
FastAPI Main Application
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_db, dispose_db
from app.services.market_service import seed_default_prices
from app.database import AsyncSessionLocal

from app.routers import asteroids, evs, trajectories, compositions, market, mission

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s - %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan ───────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown event handler."""
    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await init_db()
    async with AsyncSessionLocal() as db:
        await seed_default_prices(db)
    logger.info("✅ Database initialized and commodity prices seeded.")
    yield
    await dispose_db()
    logger.info("👋 PROSPECTOR shutting down.")


# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    description="🚀 Asteroid Mining Feasibility Engine — Which asteroid should humanity mine first?",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ─────────────────────────────────────────────────────────────────────
app.include_router(asteroids.router, prefix=settings.API_PREFIX)
app.include_router(evs.router, prefix=settings.API_PREFIX)
app.include_router(trajectories.router, prefix=settings.API_PREFIX)
app.include_router(compositions.router, prefix=settings.API_PREFIX)
app.include_router(market.router, prefix=settings.API_PREFIX)
app.include_router(mission.router, prefix=settings.API_PREFIX)


# ── Health Check ───────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "🚀 PROSPECTOR API - Asteroid Mining Feasibility Engine",
        "docs": "/docs",
        "version": settings.APP_VERSION,
    }
