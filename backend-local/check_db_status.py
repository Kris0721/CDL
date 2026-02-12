import sqlite3
import os

db_path = 'data/database.db'

if not os.path.exists(db_path):
    print("Database file does not exist.")
else:
    print(f"Database file exists: {db_path}")
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print("Tables:", [t[0] for t in tables])
        
        # Check users count
        if 'users' in [t[0] for t in tables]:
            cursor.execute("SELECT count(*) FROM users")
            count = cursor.fetchone()[0]
            print(f"Users count: {count}")
            
            if count > 0:
                cursor.execute("SELECT email, role, is_verified FROM users LIMIT 5")
                users = cursor.fetchall()
                print("Sample users:")
                for u in users:
                    print(u)
        else:
            print("Users table not found!")

        conn.close()
    except Exception as e:
        print(f"Error: {e}")
