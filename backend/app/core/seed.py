import uuid
from datetime import datetime
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.core.models import User, Tenant, Company, Contact, Deal, Task, Message, Product, Invoice
from app.core.security import hash_password


DEV_ADMIN_EMAIL = "dongelek86@gmail.com"
DEV_ADMIN_PASSWORD = "admin"
DEV_TENANT_NAME = "Nexus Lab (Первый тенант)"
DEV_TENANT_SLUG = "nexus-lab"


async def seed_database():
    """
    Initializes a completely CLEAN database with ZERO mock data.
    Only creates the primary developer admin user (dongelek86@gmail.com)
    and the initial tenant so the developer starts with a fresh empty canvas.
    """
    async with AsyncSessionLocal() as db:
        # Check if developer admin already exists
        user_res = await db.execute(select(User).where(User.email == DEV_ADMIN_EMAIL))
        admin_user = user_res.scalar_one_or_none()

        # Check or create primary Tenant
        tenant_res = await db.execute(select(Tenant).where(Tenant.slug == DEV_TENANT_SLUG))
        tenant = tenant_res.scalar_one_or_none()

        if not tenant:
            tenant = Tenant(
                id=str(uuid.uuid4()),
                name=DEV_TENANT_NAME,
                slug=DEV_TENANT_SLUG,
                plan="developer",
                is_active=True,
            )
            db.add(tenant)
            await db.flush()

        if not admin_user:
            admin_user = User(
                id=str(uuid.uuid4()),
                tenant_id=tenant.id,
                email=DEV_ADMIN_EMAIL,
                hashed_password=hash_password(DEV_ADMIN_PASSWORD),
                first_name="Александр",
                last_name="Разработчик",
                is_active=True,
                is_superuser=True,
            )
            db.add(admin_user)
            await db.commit()
            print(f"[CLEAN START] Created Developer Admin: {DEV_ADMIN_EMAIL} for Tenant: {tenant.name}")
        else:
            if not admin_user.tenant_id:
                admin_user.tenant_id = tenant.id
                await db.commit()
            print(f"[INFO] Developer Admin {DEV_ADMIN_EMAIL} already exists.")


async def reset_database():
    """
    Completely purges all data across companies, contacts, deals, tasks, messages, products, invoices.
    Restores the clean developer admin state with 0 entities.
    """
    async with AsyncSessionLocal() as db:
        await db.execute(delete(Invoice))
        await db.execute(delete(Product))
        await db.execute(delete(Message))
        await db.execute(delete(Task))
        await db.execute(delete(Deal))
        await db.execute(delete(Contact))
        await db.execute(delete(Company))
        await db.commit()
        await seed_database()
