from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.core.seed import seed_database
from app.api.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create database tables if they do not exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Seed sample database entities if newly created
    try:
        await seed_database()
    except Exception as e:
        print(f"Error seeding database: {e}")
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title="Nexus CRM API",
    description="AI-native SaaS CRM Platform Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 router
app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["System"])
async def health():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": "development" if settings.DEBUG else "production"
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "message": "Nexus CRM API",
        "docs": "/docs",
        "version": "1.0.0"
    }
