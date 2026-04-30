"""
CRUD operations and database queries.
Focuses on efficient queries, proper joins, aggregations, and user-based data isolation.
"""
from datetime import datetime, timedelta, date
from typing import List, Optional, Tuple
from sqlalchemy import func, and_, or_, desc
from sqlalchemy.orm import Session
from models import User, Expense, Budget, RecurringExpense, FrequencyEnum
from schemas import (
    UserCreate, ExpenseCreate, ExpenseUpdate, BudgetCreate, BudgetUpdate,
    RecurringExpenseCreate, RecurringExpenseUpdate, CategoryBreakdown
)
from auth import hash_password, verify_password


# ==================== USER CRUD ====================

def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user with hashed password."""
    db_user = User(
        email=user.email,
        hashed_password=hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID."""
    return db.query(User).filter(User.id == user_id).first()


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password."""
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


# ==================== EXPENSE CRUD ====================

def create_expense(db: Session, expense: ExpenseCreate, user_id: int) -> Expense:
    """Create a new expense for a user."""
    db_expense = Expense(
        user_id=user_id,
        title=expense.title,
        amount=expense.amount,
        category=expense.category,
        payment_method=expense.payment_method,
        notes=expense.notes,
        expense_date=expense.expense_date
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


def get_expense(db: Session, expense_id: int, user_id: int) -> Optional[Expense]:
    """Get a specific expense (user-specific access control)."""
    return db.query(Expense).filter(
        and_(Expense.id == expense_id, Expense.user_id == user_id)
    ).first()


def update_expense(
    db: Session, expense_id: int, user_id: int, expense_update: ExpenseUpdate
) -> Optional[Expense]:
    """Update an expense (user-specific)."""
    db_expense = get_expense(db, expense_id, user_id)
    if not db_expense:
        return None

    update_data = expense_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_expense, field, value)

    db.commit()
    db.refresh(db_expense)
    return db_expense


def delete_expense(db: Session, expense_id: int, user_id: int) -> bool:
    """Delete an expense (user-specific)."""
    db_expense = get_expense(db, expense_id, user_id)
    if not db_expense:
        return False
    db.delete(db_expense)
    db.commit()
    return True


def get_user_expenses(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    sort_by: str = "newest",
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    search: Optional[str] = None,
) -> Tuple[List[Expense], int]:
    """
    Get user's expenses with advanced filtering and sorting.
    
    Args:
        user_id: User ID for data isolation
        skip: Pagination offset
        limit: Pagination limit
        category: Filter by category
        sort_by: Sort order ("newest", "oldest", "highest", "lowest")
        from_date: Filter from date
        to_date: Filter to date
        min_amount: Minimum amount filter
        max_amount: Maximum amount filter
        search: Search in title and notes
    
    Returns:
        Tuple of (expenses list, total count)
    """
    query = db.query(Expense).filter(Expense.user_id == user_id)

    # Apply filters
    if category:
        query = query.filter(Expense.category == category)

    if from_date:
        query = query.filter(Expense.expense_date >= from_date)

    if to_date:
        query = query.filter(Expense.expense_date <= to_date)

    if min_amount is not None:
        query = query.filter(Expense.amount >= min_amount)

    if max_amount is not None:
        query = query.filter(Expense.amount <= max_amount)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Expense.title.ilike(search_pattern),
                Expense.notes.ilike(search_pattern)
            )
        )

    # Get total count before pagination
    total_count = query.count()

    # Apply sorting
    if sort_by == "highest":
        query = query.order_by(desc(Expense.amount))
    elif sort_by == "lowest":
        query = query.order_by(Expense.amount)
    elif sort_by == "oldest":
        query = query.order_by(Expense.expense_date)
    else:  # "newest" (default)
        query = query.order_by(desc(Expense.expense_date))

    # Apply pagination
    expenses = query.offset(skip).limit(limit).all()

    return expenses, total_count


# ==================== DASHBOARD QUERIES ====================

def get_monthly_expense_total(db: Session, user_id: int, year: int, month: int) -> float:
    """Get total expenses for a specific month."""
    result = db.query(func.sum(Expense.amount)).filter(
        and_(
            Expense.user_id == user_id,
            func.extract('year', Expense.expense_date) == year,
            func.extract('month', Expense.expense_date) == month,
        )
    ).scalar()
    return result or 0.0


def get_yearly_expense_total(db: Session, user_id: int, year: int) -> float:
    """Get total expenses for a specific year."""
    result = db.query(func.sum(Expense.amount)).filter(
        and_(
            Expense.user_id == user_id,
            func.extract('year', Expense.expense_date) == year,
        )
    ).scalar()
    return result or 0.0


def get_average_daily_spend(db: Session, user_id: int, year: int, month: int) -> float:
    """Calculate average daily spend for a month."""
    result = db.query(func.avg(Expense.amount)).filter(
        and_(
            Expense.user_id == user_id,
            func.extract('year', Expense.expense_date) == year,
            func.extract('month', Expense.expense_date) == month,
        )
    ).scalar()
    return result or 0.0


def get_category_breakdown(
    db: Session, user_id: int, year: int, month: int
) -> List[CategoryBreakdown]:
    """Get expense breakdown by category for a month."""
    # Query with aggregation
    results = db.query(
        Expense.category,
        func.sum(Expense.amount).label('total'),
        func.count(Expense.id).label('count')
    ).filter(
        and_(
            Expense.user_id == user_id,
            func.extract('year', Expense.expense_date) == year,
            func.extract('month', Expense.expense_date) == month,
        )
    ).group_by(Expense.category).all()

    # Calculate total spent
    total_spent = sum(r[1] for r in results)

    # Build response
    breakdown = []
    for category, total, count in results:
        percentage = (total / total_spent * 100) if total_spent > 0 else 0
        breakdown.append(CategoryBreakdown(
            category=category,
            total=total,
            count=count,
            percentage=round(percentage, 2)
        ))

    return breakdown


def get_top_spending_category(db: Session, user_id: int, year: int, month: int) -> Optional[Tuple[str, float]]:
    """Get the top spending category for a month."""
    result = db.query(
        Expense.category,
        func.sum(Expense.amount).label('total')
    ).filter(
        and_(
            Expense.user_id == user_id,
            func.extract('year', Expense.expense_date) == year,
            func.extract('month', Expense.expense_date) == month,
        )
    ).group_by(Expense.category).order_by(desc('total')).first()

    return result if result else None


def get_recent_expenses(db: Session, user_id: int, limit: int = 5) -> List[Expense]:
    """Get recent expenses for a user."""
    return db.query(Expense).filter(
        Expense.user_id == user_id
    ).order_by(desc(Expense.created_at)).limit(limit).all()


def get_monthly_transaction_count(db: Session, user_id: int, year: int, month: int) -> int:
    """Get transaction count for a specific month."""
    return db.query(Expense).filter(
        and_(
            Expense.user_id == user_id,
            func.extract('year', Expense.expense_date) == year,
            func.extract('month', Expense.expense_date) == month,
        )
    ).count()


def get_yearly_transaction_count(db: Session, user_id: int, year: int) -> int:
    """Get transaction count for a specific year."""
    return db.query(Expense).filter(
        and_(
            Expense.user_id == user_id,
            func.extract('year', Expense.expense_date) == year,
        )
    ).count()


# ==================== BUDGET CRUD ====================

def create_budget(db: Session, budget: BudgetCreate, user_id: int) -> Budget:
    """Create a new budget for a user."""
    db_budget = Budget(
        user_id=user_id,
        category=budget.category,
        monthly_limit=budget.monthly_limit,
        month=budget.month,
        year=budget.year
    )
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget


def get_budget(db: Session, budget_id: int, user_id: int) -> Optional[Budget]:
    """Get a specific budget (user-specific)."""
    return db.query(Budget).filter(
        and_(Budget.id == budget_id, Budget.user_id == user_id)
    ).first()


def get_user_budgets(db: Session, user_id: int, year: int, month: int) -> List[Budget]:
    """Get all budgets for a user for a specific month."""
    return db.query(Budget).filter(
        and_(
            Budget.user_id == user_id,
            Budget.year == year,
            Budget.month == month
        )
    ).all()


def update_budget(
    db: Session, budget_id: int, user_id: int, budget_update: BudgetUpdate
) -> Optional[Budget]:
    """Update a budget (user-specific)."""
    db_budget = get_budget(db, budget_id, user_id)
    if not db_budget:
        return None

    update_data = budget_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_budget, field, value)

    db.commit()
    db.refresh(db_budget)
    return db_budget


def delete_budget(db: Session, budget_id: int, user_id: int) -> bool:
    """Delete a budget (user-specific)."""
    db_budget = get_budget(db, budget_id, user_id)
    if not db_budget:
        return False
    db.delete(db_budget)
    db.commit()
    return True


def get_budget_alerts(db: Session, user_id: int, year: int, month: int) -> List[dict]:
    """
    Get budget alerts for all budgets.
    Returns list of alerts when spending exceeds budget.
    """
    budgets = get_user_budgets(db, user_id, year, month)
    alerts = []

    for budget in budgets:
        # Get spending for this category this month
        spent = db.query(func.sum(Expense.amount)).filter(
            and_(
                Expense.user_id == user_id,
                Expense.category == budget.category,
                func.extract('year', Expense.expense_date) == year,
                func.extract('month', Expense.expense_date) == month,
            )
        ).scalar() or 0.0

        percentage = (spent / budget.monthly_limit * 100) if budget.monthly_limit > 0 else 0
        is_exceeded = spent > budget.monthly_limit

        alerts.append({
            "category": budget.category,
            "monthly_limit": budget.monthly_limit,
            "spent": spent,
            "percentage": round(percentage, 2),
            "is_exceeded": is_exceeded
        })

    return alerts


# ==================== RECURRING EXPENSE CRUD ====================

def create_recurring_expense(
    db: Session, expense: RecurringExpenseCreate, user_id: int
) -> RecurringExpense:
    """Create a new recurring expense."""
    db_expense = RecurringExpense(
        user_id=user_id,
        title=expense.title,
        amount=expense.amount,
        category=expense.category,
        frequency=expense.frequency,
        next_due_date=expense.next_due_date,
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


def get_recurring_expense(
    db: Session, expense_id: int, user_id: int
) -> Optional[RecurringExpense]:
    """Get a specific recurring expense (user-specific)."""
    return db.query(RecurringExpense).filter(
        and_(RecurringExpense.id == expense_id, RecurringExpense.user_id == user_id)
    ).first()


def get_user_recurring_expenses(
    db: Session, user_id: int, active_only: bool = True
) -> List[RecurringExpense]:
    """Get all recurring expenses for a user."""
    query = db.query(RecurringExpense).filter(RecurringExpense.user_id == user_id)
    if active_only:
        query = query.filter(RecurringExpense.is_active == 1)
    return query.all()


def get_due_recurring_expenses(db: Session, user_id: int) -> List[RecurringExpense]:
    """Get recurring expenses that are due today or overdue."""
    today = datetime.utcnow().date()
    return db.query(RecurringExpense).filter(
        and_(
            RecurringExpense.user_id == user_id,
            RecurringExpense.is_active == 1,
            func.date(RecurringExpense.next_due_date) <= today
        )
    ).all()


def update_recurring_expense(
    db: Session, expense_id: int, user_id: int, expense_update: RecurringExpenseUpdate
) -> Optional[RecurringExpense]:
    """Update a recurring expense (user-specific)."""
    db_expense = get_recurring_expense(db, expense_id, user_id)
    if not db_expense:
        return None

    update_data = expense_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_expense, field, value)

    db.commit()
    db.refresh(db_expense)
    return db_expense


def deactivate_recurring_expense(db: Session, expense_id: int, user_id: int) -> bool:
    """Deactivate a recurring expense."""
    db_expense = get_recurring_expense(db, expense_id, user_id)
    if not db_expense:
        return False
    db_expense.is_active = 0
    db.commit()
    return True


def process_due_recurring_expenses(db: Session, user_id: int):
    """
    Process due recurring expenses: create actual expense entries.
    Update next_due_date based on frequency.
    """
    due_expenses = get_due_recurring_expenses(db, user_id)
    today = datetime.utcnow()

    for recurring in due_expenses:
        # Create an actual expense
        expense = Expense(
            user_id=user_id,
            title=recurring.title,
            amount=recurring.amount,
            category=recurring.category,
            payment_method="recurring",
            notes=f"Auto-generated from recurring expense: {recurring.title}",
            expense_date=today
        )
        db.add(expense)

        # Update next_due_date
        if recurring.frequency == FrequencyEnum.WEEKLY:
            recurring.next_due_date += timedelta(weeks=1)
        elif recurring.frequency == FrequencyEnum.MONTHLY:
            # Add a month (naive implementation, good enough for most cases)
            month = recurring.next_due_date.month + 1
            year = recurring.next_due_date.year
            if month > 12:
                month = 1
                year += 1
            recurring.next_due_date = recurring.next_due_date.replace(
                year=year, month=month
            )
        elif recurring.frequency == FrequencyEnum.YEARLY:
            recurring.next_due_date = recurring.next_due_date.replace(
                year=recurring.next_due_date.year + 1
            )

    db.commit()
