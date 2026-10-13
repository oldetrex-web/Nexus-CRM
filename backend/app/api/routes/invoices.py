from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.core.models import Invoice
import uuid
import random
from datetime import datetime
from typing import Any

router = APIRouter()


class InvoiceItem(BaseModel):
    name: str
    quantity: int = 1
    price: float
    total: float | None = None


class InvoiceCreate(BaseModel):
    contact_id: str | None = None
    company_id: str | None = None
    deal_id: str | None = None
    items: list[InvoiceItem] = []
    currency: str = "KZT"
    invoice_date: datetime | None = None
    due_date: datetime | None = None


class InvoiceResponse(BaseModel):
    id: str
    invoice_number: str
    status: str
    contact_id: str | None
    company_id: str | None
    deal_id: str | None
    items: list[dict[str, Any]] | None
    subtotal: float
    tax_amount: float
    total: float
    currency: str
    invoice_date: datetime | None
    due_date: datetime | None
    paid_at: datetime | None
    created_at: datetime


@router.post("/", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(payload: InvoiceCreate, db: AsyncSession = Depends(get_db)):
    # Calculate subtotal
    subtotal = 0.0
    processed_items = []
    for item in payload.items:
        line_total = item.quantity * item.price
        subtotal += line_total
        processed_items.append({
            "name": item.name,
            "quantity": item.quantity,
            "price": item.price,
            "total": line_total
        })

    tax_rate = 0.12  # 12% VAT
    tax_amount = round(subtotal * tax_rate, 2)
    total = round(subtotal + tax_amount, 2)

    current_year = datetime.utcnow().year
    random_suffix = f"{random.randint(100000, 999999)}"
    invoice_number = f"INV-{current_year}-{random_suffix}"

    invoice = Invoice(
        id=str(uuid.uuid4()),
        invoice_number=invoice_number,
        status="draft",
        contact_id=payload.contact_id,
        company_id=payload.company_id,
        deal_id=payload.deal_id,
        items=processed_items,
        subtotal=subtotal,
        tax_amount=tax_amount,
        total=total,
        currency=payload.currency,
        invoice_date=payload.invoice_date or datetime.utcnow(),
        due_date=payload.due_date,
    )
    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)
    return invoice


@router.get("/", response_model=list[InvoiceResponse])
async def list_invoices(db: AsyncSession = Depends(get_db)):
    stmt = select(Invoice).order_by(desc(Invoice.created_at))
    result = await db.execute(stmt)
    return result.scalars().all()
