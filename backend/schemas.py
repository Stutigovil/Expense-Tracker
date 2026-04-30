"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional, List
from models import FrequencyEnum


# ==================== USER SCHEMAS ====================

class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== EXPENSE SCHEMAS ====================

class ExpenseBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    amount: float = Field(..., gt=0)
    category: str = Field(..., min_length=1, max_length=100)
    payment_method: str = Field(..., min_length=1, max_length=100)
    notes: Optional[str] = Field(None, max_length=500)
    expense_date: datetime


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    payment_method: Optional[str] = Field(None, min_length=1, max_length=100)
    notes: Optional[str] = Field(None, max_length=500)
    expense_date: Optional[datetime] = None


class ExpenseResponse(ExpenseBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ExpenseListResponse(BaseModel):
    """Response for expense list with pagination."""
    items: List[ExpenseResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ==================== BUDGET SCHEMAS ====================

class BudgetBase(BaseModel):
    category: str = Field(..., min_length=1, max_length=100)
    monthly_limit: float = Field(..., gt=0)
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2020)


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    monthly_limit: Optional[float] = Field(None, gt=0)


class BudgetResponse(BudgetBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class BudgetAlert(BaseModel):
    """Alert when spending exceeds budget."""
    category: str
    monthly_limit: float
    spent: float
    percentage: float
    is_exceeded: bool


# ==================== RECURRING EXPENSE SCHEMAS ====================

class RecurringExpenseBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    amount: float = Field(..., gt=0)
    category: str = Field(..., min_length=1, max_length=100)
    frequency: FrequencyEnum
    next_due_date: datetime


class RecurringExpenseCreate(RecurringExpenseBase):
    pass


class RecurringExpenseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    frequency: Optional[FrequencyEnum] = None
    next_due_date: Optional[datetime] = None


class RecurringExpenseResponse(RecurringExpenseBase):
    id: int
    user_id: int
    is_active: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== DASHBOARD SCHEMAS ====================

class DashboardSummary(BaseModel):
    """Dashboard summary statistics."""
    total_expenses_month: float
    total_expenses_year: float
    average_daily_spend: float
    transaction_count_month: int
    transaction_count_year: int


class CategoryBreakdown(BaseModel):
    """Expense breakdown by category."""
    category: str
    total: float
    count: int
    percentage: float


class DashboardCategoryBreakdown(BaseModel):
    """Category breakdown response."""
    items: List[CategoryBreakdown]
    total_spent: float


class DashboardResponse(BaseModel):
    """Complete dashboard response."""
    summary: DashboardSummary
    categories: DashboardCategoryBreakdown
    budget_alerts: List[BudgetAlert]
    recent_transactions: List[ExpenseResponse]


# ==================== AUTHENTICATION RESPONSE ====================

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class TokenPayload(BaseModel):
    sub: int  # user_id
    exp: int  # expiration time
