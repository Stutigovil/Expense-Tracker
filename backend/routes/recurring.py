"""
Recurring expense management routes.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import crud
from schemas import RecurringExpenseCreate, RecurringExpenseUpdate, RecurringExpenseResponse

router = APIRouter(prefix="/recurring-expenses", tags=["recurring"])


@router.post("", response_model=RecurringExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_recurring_expense(
    expense: RecurringExpenseCreate,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new recurring expense."""
    return crud.create_recurring_expense(db, expense, user_id)


@router.get("", response_model=list[RecurringExpenseResponse])
def get_recurring_expenses(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all recurring expenses for the user."""
    return crud.get_user_recurring_expenses(db, user_id, active_only=True)


@router.get("/{expense_id}", response_model=RecurringExpenseResponse)
def get_recurring_expense(
    expense_id: int,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific recurring expense."""
    expense = crud.get_recurring_expense(db, expense_id, user_id)
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurring expense not found"
        )
    return expense


@router.put("/{expense_id}", response_model=RecurringExpenseResponse)
def update_recurring_expense(
    expense_id: int,
    expense_update: RecurringExpenseUpdate,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a recurring expense."""
    expense = crud.update_recurring_expense(db, expense_id, user_id, expense_update)
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurring expense not found"
        )
    return expense


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recurring_expense(
    expense_id: int,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deactivate a recurring expense."""
    success = crud.deactivate_recurring_expense(db, expense_id, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurring expense not found"
        )
    return None
