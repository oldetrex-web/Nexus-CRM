from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.core.models import Task
import uuid
from datetime import datetime
from typing import Optional

router = APIRouter()


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    type: Optional[str] = "task"          # frontend uses "type"
    task_type: Optional[str] = None       # legacy compat
    priority: str = "medium"
    status: str = "new"
    due_date: Optional[datetime] = None
    contact_id: Optional[str] = None
    deal_id: Optional[str] = None
    assigned_to: Optional[str] = None
    created_by: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    description: Optional[str] = None


class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    task_type: str
    type: Optional[str] = None
    priority: str
    status: str
    due_date: Optional[datetime]
    contact_id: Optional[str]
    deal_id: Optional[str]
    assigned_to: Optional[str]
    created_by: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_task(payload: TaskCreate, db: AsyncSession = Depends(get_db)):
    resolved_type = payload.type or payload.task_type or "task"
    task = Task(
        id=str(uuid.uuid4()),
        title=payload.title,
        description=payload.description,
        task_type=resolved_type,
        priority=payload.priority,
        status=payload.status,
        due_date=payload.due_date,
        contact_id=payload.contact_id,
        deal_id=payload.deal_id,
        assigned_to=payload.assigned_to or "system",
        created_by=payload.created_by,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "task_type": task.task_type,
        "type": task.task_type,
        "priority": task.priority,
        "status": task.status,
        "due_date": task.due_date,
        "contact_id": task.contact_id,
        "deal_id": task.deal_id,
        "assigned_to": task.assigned_to,
        "created_by": task.created_by,
        "created_at": task.created_at,
    }


@router.get("/")
async def list_tasks(contact_id: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    stmt = select(Task)
    if contact_id:
        stmt = stmt.where(Task.contact_id == contact_id)
    stmt = stmt.order_by(desc(Task.created_at))
    result = await db.execute(stmt)
    tasks = result.scalars().all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "task_type": t.task_type,
            "type": t.task_type,
            "priority": t.priority,
            "status": t.status,
            "due_date": t.due_date,
            "contact_id": t.contact_id,
            "deal_id": t.deal_id,
            "assigned_to": t.assigned_to,
            "created_by": t.created_by,
            "created_at": t.created_at,
        }
        for t in tasks
    ]


@router.get("/{task_id}")
async def get_task(task_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Task).where(Task.id == task_id)
    result = await db.execute(stmt)
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "task_type": task.task_type,
        "type": task.task_type,
        "priority": task.priority,
        "status": task.status,
        "due_date": task.due_date,
        "contact_id": task.contact_id,
        "deal_id": task.deal_id,
        "assigned_to": task.assigned_to,
        "created_by": task.created_by,
        "created_at": task.created_at,
    }


@router.put("/{task_id}")
async def update_task(task_id: str, payload: TaskUpdate, db: AsyncSession = Depends(get_db)):
    stmt = select(Task).where(Task.id == task_id)
    result = await db.execute(stmt)
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if payload.title is not None:
        task.title = payload.title
    if payload.status is not None:
        task.status = payload.status
    if payload.priority is not None:
        task.priority = payload.priority
    if payload.due_date is not None:
        task.due_date = payload.due_date
    if payload.description is not None:
        task.description = payload.description

    await db.commit()
    await db.refresh(task)
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "task_type": task.task_type,
        "type": task.task_type,
        "priority": task.priority,
        "status": task.status,
        "due_date": task.due_date,
        "contact_id": task.contact_id,
        "deal_id": task.deal_id,
        "assigned_to": task.assigned_to,
        "created_by": task.created_by,
        "created_at": task.created_at,
    }


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Task).where(Task.id == task_id)
    result = await db.execute(stmt)
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await db.delete(task)
    await db.commit()
