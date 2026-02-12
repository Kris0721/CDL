"""Add is_permanent field to users table"""
import sqlite3
import os

db_path = 'data/database.db'

if not os.path.exists(db_path):
    print(f"❌ Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if column already exists
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'is_permanent' not in columns:
        print("Adding is_permanent column to users table...")
        cursor.execute("ALTER TABLE users ADD COLUMN is_permanent INTEGER DEFAULT 0")
        print("✅ Column added successfully")
    else:
        print("✅ Column already exists")
    
    # Mark the default accounts as permanent
    print("\nMarking default accounts as permanent...")
    default_emails = ['maintainer@cdl.com', 'lender@cdl.com', 'borrower@cdl.com']
    
    for email in default_emails:
        cursor.execute("UPDATE users SET is_permanent = 1 WHERE email = ?", (email,))
        print(f"  ✅ Marked {email} as permanent")
    
    conn.commit()
    print("\n✨ Migration completed successfully!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    conn.rollback()
finally:
    conn.close()
