from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Task, BudgetLine

router = APIRouter(tags=["tasks_and_budgets"])

@router.get("/tasks")
def list_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).all()
    return [
        {
            "id": t.id,
            "event_id": t.event_id,
            "title": t.title,
            "description": t.description,
            "owner": t.owner,
            "department": t.department,
            "deadline": t.deadline,
            "status": t.status,
            "priority": t.priority,
            "related_entity_type": t.related_entity_type,
            "related_entity_id": t.related_entity_id
        } for t in tasks
    ]

@router.get("/budgets")
def list_budgets(db: Session = Depends(get_db)):
    budgets = db.query(BudgetLine).all()
    return [
        {
            "id": b.id,
            "event_id": b.event_id,
            "category": b.category,
            "subcategory": b.subcategory,
            "allocated_amount": b.allocated_amount,
            "committed_amount": b.committed_amount,
            "spent_amount": b.spent_amount,
            "funding_source": b.funding_source,
            "status": b.status,
            "notes": b.notes
        } for b in budgets
    ]
