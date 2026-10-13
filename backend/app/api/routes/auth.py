from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.models import User, Tenant
from app.core.security import hash_password, verify_password, create_access_token
import uuid

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str | None = None
    company_name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    email: EmailStr = "dongelek86@gmail.com"
    first_name: str | None = "Александр"
    last_name: str | None = "Разработчик"


class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str | None
    is_active: bool
    is_superuser: bool
    tenant_id: str | None = None
    plan: str = "developer"
    role: str = "admin"


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


@router.post("/google", response_model=AuthResponse)
async def google_auth(payload: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    """
    1-Click Google OAuth simulation.
    For developer email (dongelek86@gmail.com), grants superuser privileges and unlimited dev tier.
    """
    stmt = select(User).where(User.email == payload.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    # Find or create initial tenant
    tenant_res = await db.execute(select(Tenant).limit(1))
    tenant = tenant_res.scalar_one_or_none()
    if not tenant:
        tenant = Tenant(
            id=str(uuid.uuid4()),
            name="Nexus Lab (Первый тенант)",
            slug="nexus-lab",
            plan="developer",
            is_active=True,
        )
        db.add(tenant)
        await db.flush()

    if not user:
        is_dev = payload.email.lower() == "dongelek86@gmail.com"
        user = User(
            id=str(uuid.uuid4()),
            tenant_id=tenant.id,
            email=payload.email,
            hashed_password=hash_password("admin"),
            first_name=payload.first_name or "Пользователь",
            last_name=payload.last_name or "",
            is_active=True,
            is_superuser=is_dev,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
            "tenant_id": user.tenant_id or tenant.id,
            "plan": "developer" if user.is_superuser else "trial",
            "role": "admin" if user.is_superuser else "user",
        },
    }


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == payload.email)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Create new Tenant for this user
    tenant_name = payload.company_name or f"Компания {payload.first_name}"
    tenant = Tenant(
        id=str(uuid.uuid4()),
        name=tenant_name,
        slug=f"org-{uuid.uuid4().hex[:8]}",
        plan="trial",
        is_active=True,
    )
    db.add(tenant)
    await db.flush()

    is_dev = payload.email.lower() == "dongelek86@gmail.com"
    new_user = User(
        id=str(uuid.uuid4()),
        tenant_id=tenant.id,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        is_active=True,
        is_superuser=is_dev,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    token = create_access_token({"sub": new_user.id, "email": new_user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "first_name": new_user.first_name,
            "last_name": new_user.last_name,
            "is_active": new_user.is_active,
            "is_superuser": new_user.is_superuser,
            "tenant_id": tenant.id,
            "plan": "developer" if is_dev else "trial",
            "role": "admin",
        },
    }


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == payload.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    # Developer bypass or password verification
    is_dev = payload.email.lower() == "dongelek86@gmail.com"
    if is_dev and not user:
        # Auto-create developer admin if not in DB yet
        tenant = Tenant(
            id=str(uuid.uuid4()),
            name="Nexus Lab (Первый тенант)",
            slug="nexus-lab",
            plan="developer",
            is_active=True,
        )
        db.add(tenant)
        await db.flush()

        user = User(
            id=str(uuid.uuid4()),
            tenant_id=tenant.id,
            email="dongelek86@gmail.com",
            hashed_password=hash_password("admin"),
            first_name="Александр",
            last_name="Разработчик",
            is_active=True,
            is_superuser=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
        )

    # If developer, allow login even if password was typed casually, else check password
    if not is_dev and not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": user.id, "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
            "tenant_id": user.tenant_id,
            "plan": "developer" if user.is_superuser else "trial",
            "role": "admin" if user.is_superuser else "user",
        },
    }


@router.get("/me", response_model=UserResponse)
async def get_me(db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == "dongelek86@gmail.com")
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        stmt_first = select(User).limit(1)
        res_first = await db.execute(stmt_first)
        user = res_first.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="No user found")

    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "is_active": user.is_active,
        "is_superuser": user.is_superuser,
        "tenant_id": user.tenant_id,
        "plan": "developer" if user.is_superuser else "trial",
        "role": "admin",
    }
