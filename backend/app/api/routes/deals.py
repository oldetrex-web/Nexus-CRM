from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.core.models import Deal
import uuid
from datetime import datetime
from typing import Any

router = APIRouter()


class DealCreate(BaseModel):
    title: str
    amount: float = 0.0
    currency: str = "KZT"
    stage: str = "new"
    pipeline_id: str | None = "default"
    contact_id: str | None = None
    company_id: str | None = None
    assigned_to: str | None = None
    status: str = "open"
    priority: str = "medium"
    expected_close_date: datetime | None = None
    items: list[dict[str, Any]] = []


class DealResponse(BaseModel):
    id: str
    title: str
    amount: float | None
    currency: str
    stage: str
    pipeline_id: str | None
    contact_id: str | None
    company_id: str | None
    assigned_to: str | None
    status: str
    priority: str
    expected_close_date: datetime | None
    items: list[dict[str, Any]] | None
    created_at: datetime


@router.post("/", response_model=DealResponse, status_code=status.HTTP_201_CREATED)
async def create_deal(payload: DealCreate, db: AsyncSession = Depends(get_db)):
    deal = Deal(
        id=str(uuid.uuid4()),
        title=payload.title,
        amount=payload.amount,
        currency=payload.currency,
        stage=payload.stage,
        pipeline_id=payload.pipeline_id,
        contact_id=payload.contact_id,
        company_id=payload.company_id,
        assigned_to=payload.assigned_to,
        status=payload.status,
        priority=payload.priority,
        expected_close_date=payload.expected_close_date,
        items=payload.items,
    )
    db.add(deal)
    await db.commit()
    await db.refresh(deal)
    return deal


@router.get("/", response_model=list[DealResponse])
async def list_deals(contact_id: str | None = None, db: AsyncSession = Depends(get_db)):
    stmt = select(Deal)
    if contact_id:
        stmt = stmt.where(Deal.contact_id == contact_id)
    stmt = stmt.order_by(desc(Deal.created_at))
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{deal_id}", response_model=DealResponse)
async def get_deal(deal_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Deal).where(Deal.id == deal_id)
    result = await db.execute(stmt)
    deal = result.scalar_one_or_none()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deal
