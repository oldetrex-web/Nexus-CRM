from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.core.models import Message
import uuid
from datetime import datetime

router = APIRouter()


class MessageCreate(BaseModel):
    channel: str
    direction: str  # inbound / outbound
    status: str = "queued"
    contact_id: str | None = None
    sender_external_id: str | None = None
    recipient_external_id: str | None = None
    text_content: str | None = None
    media_url: str | None = None
    is_ai_generated: bool = False


class MessageResponse(BaseModel):
    id: str
    channel: str
    direction: str
    status: str
    contact_id: str | None
    sender_external_id: str | None
    recipient_external_id: str | None
    text_content: str | None
    media_url: str | None
    is_ai_generated: bool
    created_at: datetime


@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(payload: MessageCreate, db: AsyncSession = Depends(get_db)):
    message = Message(
        id=str(uuid.uuid4()),
        channel=payload.channel,
        direction=payload.direction,
        status=payload.status,
        contact_id=payload.contact_id,
        sender_external_id=payload.sender_external_id,
        recipient_external_id=payload.recipient_external_id,
        text_content=payload.text_content,
        media_url=payload.media_url,
        is_ai_generated=payload.is_ai_generated,
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message


@router.get("/", response_model=list[MessageResponse])
async def list_messages(channel: str | None = None, contact_id: str | None = None, db: AsyncSession = Depends(get_db)):
    stmt = select(Message)
    if channel:
        stmt = stmt.where(Message.channel == channel)
    if contact_id:
        stmt = stmt.where(Message.contact_id == contact_id)
    stmt = stmt.order_by(desc(Message.created_at))
    result = await db.execute(stmt)
    return result.scalars().all()
