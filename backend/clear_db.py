import sqlite3

conn = sqlite3.connect('expense_tracker.db')
cursor = conn.cursor()

# Disable foreign key checks temporarily
cursor.execute('PRAGMA foreign_keys = OFF;')

# Truncate all user data tables
for table in ['expenses', 'budgets', 'recurring_expenses', 'users']:
    cursor.execute(f'DELETE FROM {table};')

# Re-enable foreign key checks
cursor.execute('PRAGMA foreign_keys = ON;')
conn.commit()
conn.close()
print('✅ All data cleared. Database is now empty (structure only).')
