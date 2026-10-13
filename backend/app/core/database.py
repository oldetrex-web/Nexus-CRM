from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

db_url = settings.DATABASE_URL

# Check if asyncpg driver is available for postgres; fallback to sqlite for local dev without Docker
if "asyncpg" in db_url:
    try:
        import asyncpg
    except ImportError:
        db_url = "sqlite+aiosqlite:///./nexus_crm.db"

is_sqlite = db_url.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine_kwargs = {"echo": settings.DEBUG, "future": True, "connect_args": connect_args}
if not is_sqlite:
    engine_kwargs["pool_pre_ping"] = True

engine = create_async_engine(
    db_url,
    **engine_kwargs
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
