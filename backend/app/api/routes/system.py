from fastapi import APIRouter
from app.core.seed import reset_database, seed_database

router = APIRouter()


@router.post("/reset-db")
async def reset_db_endpoint():
    """
    Purges all test entities and re-creates clean developer admin state with 0 records.
    """
    await reset_database()
    return {
        "status": "success",
        "message": "База данных успешно очищена. Доступен чистый аккаунт разработчика dongelek86@gmail.com",
    }
