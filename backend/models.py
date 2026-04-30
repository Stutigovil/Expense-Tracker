"""
SQLAlchemy ORM models with proper relationships and indexes.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Index
from sqlalchemy.orm import relationship
from database import Base
import enum


class User(Base):
    """User model for authentication."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")
    recurring_expenses = relationship(
        "RecurringExpense", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"


class Expense(Base):
    """Expense model for tracking individual transactions."""
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    payment_method = Column(String(100), nullable=False)
    notes = Column(String(500), nullable=True)
    expense_date = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationship
    user = relationship("User", back_populates="expenses")

    # Composite indexes for efficient filtering
    __table_args__ = (
        Index("idx_user_expense_date", "user_id", "expense_date"),
        Index("idx_user_category", "user_id", "category"),
        Index("idx_user_amount", "user_id", "amount"),
    )

    def __repr__(self):
        return f"<Expense(id={self.id}, user_id={self.user_id}, title={self.title}, amount={self.amount})>"


class Budget(Base):
    """Budget model for tracking monthly budget limits per category."""
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), nullable=False)
    monthly_limit = Column(Float, nullable=False)
    month = Column(Integer, nullable=False)  # 1-12
    year = Column(Integer, nullable=False)

    # Relationship
    user = relationship("User", back_populates="budgets")

    # Unique constraint per user per category per month
    __table_args__ = (
        Index("idx_user_budget_month", "user_id", "month", "year"),
    )

    def __repr__(self):
        return f"<Budget(id={self.id}, user_id={self.user_id}, category={self.category})>"


class FrequencyEnum(str, enum.Enum):
    """Enum for recurring expense frequency."""
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class RecurringExpense(Base):
    """Recurring expense model for subscriptions and regular payments."""
    __tablename__ = "recurring_expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    frequency = Column(Enum(FrequencyEnum), nullable=False)
    next_due_date = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_active = Column(Integer, default=1, nullable=False)

    # Relationship
    user = relationship("User", back_populates="recurring_expenses")

    # Index for efficient recurring payment queries
    __table_args__ = (
        Index("idx_user_active_recurring", "user_id", "is_active"),
    )

    def __repr__(self):
        return f"<RecurringExpense(id={self.id}, user_id={self.user_id}, title={self.title})>"
