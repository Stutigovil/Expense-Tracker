# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python -m uvicorn main:app --reload --port 8000
```

**Backend running at:** `http://localhost:8000`  
**API Docs at:** `http://localhost:8000/docs`

---

### Step 2: Frontend Setup (in another terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

**Frontend running at:** `http://localhost:3000`

---

## 🧪 Test the Application

### 1. Sign Up
Visit `http://localhost:3000`
- Click "Sign Up"
- Enter email and password
- Click "Sign Up"

### 2. Add an Expense
- Navigate to "Expenses"
- Click "Add Expense"
- Fill in the form:
  - Title: "Grocery Shopping"
  - Amount: 500
  - Category: "Food"
  - Payment Method: "Cash"
  - Date: Today
- Click "Add Expense"

### 3. View Dashboard
- Click "Dashboard"
- See your spending statistics
- View category breakdown
- Check recent transactions

### 4. Try Filtering
- Go to "Expenses"
- Filter by category, sort by highest, search by title
- See pagination work

### 5. Add Budget
- Navigate to "Budgets"
- Click "Add Budget"
- Set a monthly limit for Food category
- Go to Dashboard to see budget alerts

---

## 📊 Test API Directly

### Using Swagger UI
1. Open `http://localhost:8000/docs`
2. Click "Try it out" on any endpoint
3. Enter values and execute

### Using cURL

#### Sign Up
```bash
curl -X POST "http://localhost:8000/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "created_at": "2026-01-15T10:30:00"
  }
}
```

#### Add Expense (use token from above)
```bash
curl -X POST "http://localhost:8000/expenses" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Grocery Shopping",
    "amount": 500,
    "category": "Food",
    "payment_method": "Card",
    "notes": "Weekly groceries",
    "expense_date": "2026-01-15T10:30:00"
  }'
```

#### Get Expenses with Filtering
```bash
curl -X GET "http://localhost:8000/expenses?category=Food&sort_by=highest&skip=0&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### View Dashboard
```bash
curl -X GET "http://localhost:8000/dashboard?year=2026&month=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📚 API Endpoints Summary

### Authentication
```
POST   /auth/signup         - Register
POST   /auth/login          - Login
```

### Expenses
```
POST   /expenses                         - Create
GET    /expenses                         - List (with filters)
GET    /expenses/{id}                    - Get one
PUT    /expenses/{id}                    - Update
DELETE /expenses/{id}                    - Delete

Query params:
  ?category=Food
  ?sort_by=newest|oldest|highest|lowest
  ?from_date=2026-01-01
  ?to_date=2026-01-31
  ?min_amount=100
  ?max_amount=1000
  ?search=keyword
  ?skip=0&limit=20
```

### Dashboard
```
GET    /dashboard                        - All data
GET    /dashboard/summary                - Stats
GET    /dashboard/category-breakdown    - By category
GET    /dashboard/budget-alerts         - Budget status
GET    /dashboard/recent-transactions   - Last 5
```

### Budgets
```
POST   /budgets            - Create
GET    /budgets?year=2026&month=1  - List
PUT    /budgets/{id}       - Update
DELETE /budgets/{id}       - Delete
```

### Recurring
```
POST   /recurring-expenses  - Create
GET    /recurring-expenses  - List
PUT    /recurring-expenses/{id} - Update
DELETE /recurring-expenses/{id} - Delete
```

---

## 🔍 View Database

### Using SQLite CLI
```bash
# Connect to database
sqlite3 backend/expense_tracker.db

# View all tables
.tables

# View schema
.schema expenses

# Query data
SELECT * FROM users;
SELECT * FROM expenses WHERE user_id = 1;

# Exit
.quit
```

### Using VS Code
1. Install "SQLite" extension by alexcvzz
2. Open SQLite Explorer
3. Navigate to `backend/expense_tracker.db`
4. Browse and query tables

---

## 🛠️ Troubleshooting

### Backend won't start
```bash
# Make sure port 8000 is free
# On Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# On macOS/Linux:
lsof -i :8000
kill -9 <PID>
```

### Frontend can't connect to API
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Should be `http://localhost:8000`
- Restart frontend dev server after changing

### Database errors
- Delete `backend/expense_tracker.db`
- Restart backend (will recreate tables)

### Import errors in backend
```bash
# Ensure virtual environment is activated
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Verify dependencies
pip list

# Reinstall if needed
pip install -r requirements.txt
```

---

## 📂 Project Structure

```
ET/
├── backend/
│   ├── main.py             ← Start here
│   ├── models.py           ← Database schema
│   ├── crud.py             ← Complex queries
│   ├── routes/             ← API endpoints
│   ├── requirements.txt
│   └── expense_tracker.db  ← SQLite database
│
├── frontend/
│   ├── src/
│   │   ├── app/            ← Pages
│   │   ├── components/     ← React components
│   │   ├── api/            ← API client
│   │   └── types/          ← TypeScript types
│   ├── package.json
│   └── .env.local
│
├── README.md               ← Full documentation
├── DATABASE_ARCHITECTURE.md ← Database design
└── QUICK_START.md          ← This file
```

---

## 💡 Key Features to Test

- ✅ User signup/login
- ✅ Add/edit/delete expenses
- ✅ Filter by category, date, amount
- ✅ Search expenses
- ✅ Sort by newest/oldest/highest/lowest
- ✅ Pagination
- ✅ Dashboard with analytics
- ✅ Category breakdown pie chart
- ✅ Budget tracking
- ✅ Over-budget alerts
- ✅ Recurring expenses

---

## 📖 Learn More

- **Database Design**: See `DATABASE_ARCHITECTURE.md`
- **API Docs**: Visit `http://localhost:8000/docs` (auto-generated)
- **Frontend Code**: Check `frontend/src/` for React components
- **Backend Code**: Check `backend/` for FastAPI routes

---

**Ready to go! Happy tracking! 🎯**
