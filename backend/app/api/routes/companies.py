from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.core.models import Company
import uuid
from datetime import datetime

router = APIRouter()


class CompanyCreate(BaseModel):
    name: str
    bin_iin: str | None = None
    phone: str | None = None
    email: str | None = None
    website: str | None = None
    address: str | None = None
    industry: str | None = None
    company_type: str = "customer"
    assigned_to: str | None = None


class CompanyResponse(BaseModel):
    id: str
    name: str
    bin_iin: str | None
    phone: str | None
    email: str | None
    website: str | None
    address: str | None
    industry: str | None
    company_type: str
    assigned_to: str | None
    created_at: datetime


@router.post("/", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(payload: CompanyCreate, db: AsyncSession = Depends(get_db)):
    company = Company(
        id=str(uuid.uuid4()),
        name=payload.name,
        bin_iin=payload.bin_iin,
        phone=payload.phone,
        email=payload.email,
        website=payload.website,
        address=payload.address,
        industry=payload.industry,
        company_type=payload.company_type,
        assigned_to=payload.assigned_to,
    )
    db.add(company)
    await db.commit()
    await db.refresh(company)
    return company


@router.get("/", response_model=list[CompanyResponse])
async def list_companies(db: AsyncSession = Depends(get_db)):
    stmt = select(Company).order_by(desc(Company.created_at))
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(company_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Company).where(Company.id == company_id)
    result = await db.execute(stmt)
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company
