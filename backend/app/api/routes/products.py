from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.core.models import Product
import uuid
from datetime import datetime

router = APIRouter()


class ProductCreate(BaseModel):
    sku: str
    name: str
    category: str | None = None
    price: float
    cost_price: float | None = None
    min_stock: int = 0
    is_active: bool = True


class ProductResponse(BaseModel):
    id: str
    sku: str
    name: str
    category: str | None
    price: float
    cost_price: float | None
    min_stock: int
    is_active: bool
    created_at: datetime


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(payload: ProductCreate, db: AsyncSession = Depends(get_db)):
    stmt = select(Product).where(Product.sku == payload.sku)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Product with this SKU already exists")

    product = Product(
        id=str(uuid.uuid4()),
        sku=payload.sku,
        name=payload.name,
        category=payload.category,
        price=payload.price,
        cost_price=payload.cost_price,
        min_stock=payload.min_stock,
        is_active=payload.is_active,
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


@router.get("/", response_model=list[ProductResponse])
async def list_products(db: AsyncSession = Depends(get_db)):
    stmt = select(Product).order_by(desc(Product.created_at))
    result = await db.execute(stmt)
    return result.scalars().all()
