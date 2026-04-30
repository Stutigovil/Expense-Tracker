"""
Dashboard analytics routes with SQL-backed insights.
"""
from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from auth import get_current_user
import crud
from schemas import (
    DashboardSummary, DashboardCategoryBreakdown, DashboardResponse,
    BudgetAlert, ExpenseResponse
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
    year: int = Query(None),
    month: int = Query(None),
):
    """
    Get dashboard summary statistics for a specific month/year.
    If not provided, uses current month/year.
    """
    now = datetime.utcnow()
    year = year or now.year
    month = month or now.month

    # Get totals
    total_month = crud.get_monthly_expense_total(db, user_id, year, month)
    total_year = crud.get_yearly_expense_total(db, user_id, year)
    avg_daily = crud.get_average_daily_spend(db, user_id, year, month)
    count_month = crud.get_monthly_transaction_count(db, user_id, year, month)
    count_year = crud.get_yearly_transaction_count(db, user_id, year)

    return DashboardSummary(
        total_expenses_month=total_month,
        total_expenses_year=total_year,
        average_daily_spend=avg_daily,
        transaction_count_month=count_month,
        transaction_count_year=count_year,
    )


@router.get("/category-breakdown", response_model=DashboardCategoryBreakdown)
def get_category_breakdown(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
    year: int = Query(None),
    month: int = Query(None),
):
    """
    Get expense breakdown by category for a specific month/year.
    """
    now = datetime.utcnow()
    year = year or now.year
    month = month or now.month

    breakdown = crud.get_category_breakdown(db, user_id, year, month)
    total_spent = sum(item.total for item in breakdown)

    return DashboardCategoryBreakdown(
        items=breakdown,
        total_spent=total_spent,
    )


@router.get("/budget-alerts", response_model=list)
def get_budget_alerts(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
    year: int = Query(None),
    month: int = Query(None),
):
    """
    Get budget alerts - compare spending vs monthly budget.
    """
    now = datetime.utcnow()
    year = year or now.year
    month = month or now.month

    alerts = crud.get_budget_alerts(db, user_id, year, month)
    return alerts


@router.get("/recent-transactions", response_model=list[ExpenseResponse])
def get_recent_transactions(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(5, ge=1, le=50),
):
    """Get recent transactions."""
    return crud.get_recent_expenses(db, user_id, limit)


@router.get("", response_model=DashboardResponse)
def get_complete_dashboard(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
    year: int = Query(None),
    month: int = Query(None),
):
    """
    Get complete dashboard with all metrics.
    This is the main dashboard endpoint.
    """
    now = datetime.utcnow()
    year = year or now.year
    month = month or now.month

    # Get all components
    summary = DashboardSummary(
        total_expenses_month=crud.get_monthly_expense_total(db, user_id, year, month),
        total_expenses_year=crud.get_yearly_expense_total(db, user_id, year),
        average_daily_spend=crud.get_average_daily_spend(db, user_id, year, month),
        transaction_count_month=crud.get_monthly_transaction_count(db, user_id, year, month),
        transaction_count_year=crud.get_yearly_transaction_count(db, user_id, year),
    )

    breakdown = crud.get_category_breakdown(db, user_id, year, month)
    total_spent = sum(item.total for item in breakdown)
    categories = DashboardCategoryBreakdown(items=breakdown, total_spent=total_spent)

    budget_alerts = crud.get_budget_alerts(db, user_id, year, month)
    budget_alerts_response = [BudgetAlert(**alert) for alert in budget_alerts]

    recent_transactions = crud.get_recent_expenses(db, user_id, 5)

    return DashboardResponse(
        summary=summary,
        categories=categories,
        budget_alerts=budget_alerts_response,
        recent_transactions=recent_transactions,
    )
