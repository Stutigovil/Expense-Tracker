"""
Expense CRUD routes with advanced filtering and sorting.
"""
from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from database import get_db
from auth import get_current_user
import crud
from schemas import ExpenseCreate, ExpenseUpdate, ExpenseResponse, ExpenseListResponse

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense: ExpenseCreate,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new expense."""
    return crud.create_expense(db, expense, user_id)


@router.get("", response_model=ExpenseListResponse)
def get_expenses(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None),
    sort_by: str = Query(
        "newest",
        pattern="^(newest|oldest|highest|lowest)$",
    ),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    min_amount: Optional[float] = Query(None, ge=0),
    max_amount: Optional[float] = Query(None, ge=0),
    search: Optional[str] = Query(None),
):
    """
    Get expenses with advanced filtering and sorting.
    
    Query parameters:
    - category: Filter by category
    - sort_by: Sort order (newest, oldest, highest, lowest)
    - from_date: Filter from date (ISO format)
    - to_date: Filter to date (ISO format)
    - min_amount: Minimum amount
    - max_amount: Maximum amount
    - search: Search in title and notes
    """
    # Parse dates
    from_datetime = None
    to_datetime = None
    if from_date:
        try:
            from_datetime = datetime.fromisoformat(from_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid from_date format (use ISO format)"
            )

    if to_date:
        try:
            to_datetime = datetime.fromisoformat(to_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid to_date format (use ISO format)"
            )

    expenses, total = crud.get_user_expenses(
        db=db,
        user_id=user_id,
        skip=skip,
        limit=limit,
        category=category,
        sort_by=sort_by,
        from_date=from_datetime,
        to_date=to_datetime,
        min_amount=min_amount,
        max_amount=max_amount,
        search=search,
    )

    total_pages = (total + limit - 1) // limit

    return ExpenseListResponse(
        items=expenses,
        total=total,
        page=skip // limit + 1,
        page_size=limit,
        total_pages=total_pages
    )


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: int,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific expense."""
    expense = crud.get_expense(db, expense_id, user_id)
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    return expense


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense_update: ExpenseUpdate,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an expense."""
    expense = crud.update_expense(db, expense_id, user_id, expense_update)
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    return expense


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an expense."""
    success = crud.delete_expense(db, expense_id, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    return None
