import sqlite3

conn = sqlite3.connect('expense_tracker.db')
cursor = conn.cursor()

print("\n" + "="*80)
print("📊 EXPENSE TRACKER DATABASE SCHEMA")
print("="*80 + "\n")

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

for table_name in tables:
    table = table_name[0]
    print(f"\n📋 TABLE: {table.upper()}")
    print("-" * 80)
    
    # Get columns info
    cursor.execute(f"PRAGMA table_info({table})")
    columns = cursor.fetchall()
    
    print(f"{'Column Name':<25} {'Type':<15} {'Not Null':<10} {'Primary Key':<15}")
    print("-" * 80)
    
    for col in columns:
        col_id, col_name, col_type, not_null, default, pk = col
        pk_str = "🔑 YES" if pk else ""
        not_null_str = "✓" if not_null else ""
        print(f"{col_name:<25} {col_type:<15} {not_null_str:<10} {pk_str:<15}")
    
    # Get foreign keys
    cursor.execute(f"PRAGMA foreign_key_list({table})")
    fks = cursor.fetchall()
    if fks:
        print(f"\n  🔗 FOREIGN KEYS:")
        for fk in fks:
            ref_table = fk[2]
            from_col = fk[3]
            to_col = fk[4]
            on_delete = fk[5]
            print(f"     {from_col} → {ref_table}({to_col}) [ON DELETE: {on_delete}]")
    
    # Get indexes
    cursor.execute(f"PRAGMA index_list({table})")
    indexes = cursor.fetchall()
    if indexes:
        print(f"\n  📑 INDEXES:")
        for idx in indexes:
            idx_seq, idx_name, unique, origin, partial = idx
            if not idx_name.startswith('sqlite_'):
                print(f"     {idx_name}")

# Show data summary
print("\n" + "="*80)
print("📈 DATA SUMMARY")
print("="*80 + "\n")

for table_name in tables:
    table = table_name[0]
    cursor.execute(f"SELECT COUNT(*) FROM {table}")
    count = cursor.fetchone()[0]
    print(f"  {table:<25} : {count:>5} records")

conn.close()
print("\n" + "="*80 + "\n")
