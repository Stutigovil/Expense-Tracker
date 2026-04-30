import sqlite3

conn = sqlite3.connect('expense_tracker.db')
cursor = conn.cursor()

print("\n" + "="*80)
print("👤 USER ACCOUNTS & THEIR DATA")
print("="*80 + "\n")

# Get all users
cursor.execute("SELECT id, email, created_at FROM users")
users = cursor.fetchall()

for user_id, email, created_at in users:
    print(f"🔐 USER ID: {user_id} | EMAIL: {email}")
    print(f"   Created: {created_at}")
    
    # Get expenses for this user
    cursor.execute("SELECT COUNT(*) FROM expenses WHERE user_id = ?", (user_id,))
    exp_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT SUM(amount) FROM expenses WHERE user_id = ?", (user_id,))
    exp_total = cursor.fetchone()[0] or 0
    
    print(f"\n   💸 EXPENSES: {exp_count} records, Total: ₹{exp_total}")
    
    if exp_count > 0:
        cursor.execute("SELECT title, amount, category, expense_date FROM expenses WHERE user_id = ? ORDER BY expense_date DESC LIMIT 5", (user_id,))
        for title, amount, category, date in cursor.fetchall():
            print(f"      - {title} | ₹{amount} | {category} | {date}")
    
    # Get budgets for this user
    cursor.execute("SELECT COUNT(*) FROM budgets WHERE user_id = ?", (user_id,))
    bud_count = cursor.fetchone()[0]
    print(f"\n   💰 BUDGETS: {bud_count} records")
    
    if bud_count > 0:
        cursor.execute("SELECT category, monthly_limit, month, year FROM budgets WHERE user_id = ? ORDER BY month DESC LIMIT 5", (user_id,))
        for category, limit, month, year in cursor.fetchall():
            print(f"      - {category} | Limit: ₹{limit} | {month}/{year}")
    
    # Get recurring for this user
    cursor.execute("SELECT COUNT(*) FROM recurring_expenses WHERE user_id = ?", (user_id,))
    rec_count = cursor.fetchone()[0]
    print(f"\n   🔄 RECURRING: {rec_count} records")
    
    if rec_count > 0:
        cursor.execute("SELECT title, amount, category, frequency, is_active FROM recurring_expenses WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        for title, amount, category, frequency, is_active in cursor.fetchall():
            status = "✓ Active" if is_active else "✗ Inactive"
            print(f"      - {title} | ₹{amount} | {frequency} | {status}")
    
    print("\n" + "-"*80 + "\n")

conn.close()
