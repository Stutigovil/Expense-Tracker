import sqlite3

conn = sqlite3.connect('expense_tracker.db')
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("📊 DATABASE TABLES:")
for table in tables:
    print(f"  - {table[0]}")

# Check users
print("\n👤 USERS:")
cursor.execute("SELECT id, email, created_at FROM users")
users = cursor.fetchall()
if users:
    for user in users:
        print(f"  - ID: {user[0]}, Email: {user[1]}, Created: {user[2]}")
else:
    print("  (No users yet)")

# Check expenses
print("\n💸 EXPENSES:")
cursor.execute("SELECT id, user_id, title, amount, category, expense_date FROM expenses")
expenses = cursor.fetchall()
if expenses:
    for exp in expenses:
        print(f"  - ID: {exp[0]}, User: {exp[1]}, Title: {exp[2]}, Amount: {exp[3]}, Category: {exp[4]}, Date: {exp[5]}")
else:
    print("  (No expenses yet)")

# Check budgets
print("\n💰 BUDGETS:")
cursor.execute("SELECT id, user_id, category, monthly_limit, month, year FROM budgets")
budgets = cursor.fetchall()
if budgets:
    for bud in budgets:
        print(f"  - ID: {bud[0]}, User: {bud[1]}, Category: {bud[2]}, Limit: {bud[3]}, Month: {bud[4]}/{bud[5]}")
else:
    print("  (No budgets yet)")

# Check recurring
print("\n🔄 RECURRING EXPENSES:")
cursor.execute("SELECT id, user_id, title, amount, category, frequency, is_active FROM recurring_expenses")
recurring = cursor.fetchall()
if recurring:
    for rec in recurring:
        print(f"  - ID: {rec[0]}, User: {rec[1]}, Title: {rec[2]}, Amount: {rec[3]}, Frequency: {rec[5]}, Active: {rec[6]}")
else:
    print("  (No recurring expenses yet)")

conn.close()
print("\n✅ Database check complete!")
