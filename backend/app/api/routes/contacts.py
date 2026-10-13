from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.core.models import Contact
import uuid
from datetime import datetime

router = APIRouter()


class ContactCreate(BaseModel):
    first_name: str
    last_name: str | None = None
    phone: str | None = None
    email: str | None = None
    whatsapp: str | None = None
    telegram: str | None = None
    company_id: str | None = None
    position: str | None = None
    source: str | None = None
    status: str = "lead"
    tags: list[str] = []
    assigned_to: str | None = None


class ContactResponse(BaseModel):
    id: str
    first_name: str
    last_name: str | None
    phone: str | None
    email: str | None
    whatsapp: str | None
    telegram: str | None
    company_id: str | None
    position: str | None
    source: str | None
    status: str
    tags: list[str] | None
    assigned_to: str | None
    created_at: datetime


@router.post("/", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def create_contact(payload: ContactCreate, db: AsyncSession = Depends(get_db)):
    contact = Contact(
        id=str(uuid.uuid4()),
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone=payload.phone,
        email=payload.email,
        whatsapp=payload.whatsapp,
        telegram=payload.telegram,
        company_id=payload.company_id,
        position=payload.position,
        source=payload.source,
        status=payload.status,
        tags=payload.tags,
        assigned_to=payload.assigned_to,
    )
    db.add(contact)
    await db.commit()
    await db.refresh(contact)
    return contact


@router.get("/", response_model=list[ContactResponse])
async def list_contacts(db: AsyncSession = Depends(get_db)):
    stmt = select(Contact).order_by(desc(Contact.created_at))
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{contact_id}", response_model=ContactResponse)
async def get_contact(contact_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Contact).where(Contact.id == contact_id)
    result = await db.execute(stmt)
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact
