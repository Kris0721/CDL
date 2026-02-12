import sys
import os
import argparse
import sqlite3
from database.db import db
from database.models import User
import uuid
import bcrypt
import time
from config import Config

def init_db():
    """Initialize the database schema"""
    print("Initializing database...")
    db.init_database()
    print("Database initialized.")

def reset_db():
    """Drop and recreate the database"""
    print("WARNING: This will delete all data!")
    confirm = input("Are you sure? (y/n): ")
    if confirm.lower() != 'y':
        print("Aborted.")
        return

    if os.path.exists(Config.DATABASE_PATH):
        os.remove(Config.DATABASE_PATH)
        print("Database file removed.")
    
    init_db()
    print("Database reset complete.")

def seed_db():
    """Seed the database with default users"""
    print("Seeding database...")
    
    users = [
        {
            'email': 'borrower@example.com',
            'password': 'password123',
            'full_name': 'Test Borrower',
            'role': 'borrower'
        },
        {
            'email': 'lender@example.com',
            'password': 'password123',
            'full_name': 'Test Lender',
            'role': 'lender'
        },
        {
            'email': 'admin@example.com',
            'password': 'password123',
            'full_name': 'Test Admin',
            'role': 'admin'
        }
    ]
    
    for user_data in users:
        # Check if user exists
        existing = db.execute_query('SELECT 1 FROM users WHERE email = ?', (user_data['email'],))
        if existing:
            print(f"User {user_data['email']} already exists.")
            continue
            
        user_id = str(uuid.uuid4())
        password_hash = bcrypt.hashpw(user_data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        now = int(time.time())
        
        db.execute_update(
            '''INSERT INTO users 
               (user_id, email, password_hash, full_name, role, kyc_status, is_verified, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, 'approved', 1, ?, ?)''',
            (user_id, user_data['email'], password_hash, user_data['full_name'], user_data['role'], now, now)
        )
        print(f"Created user: {user_data['email']}")
        
    print("Seeding complete.")

def check_db():
    """Check database status"""
    if not os.path.exists(Config.DATABASE_PATH):
        print("Database file not found.")
        return

    print(f"Database: {Config.DATABASE_PATH}")
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            
            # List tables
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [r['name'] for r in cursor.fetchall()]
            print(f"Tables: {', '.join(tables)}")
            
            # Count users
            if 'users' in tables:
                cursor.execute("SELECT count(*) as count FROM users")
                count = cursor.fetchone()['count']
                print(f"User count: {count}")
                
            # Count loans
            if 'loans' in tables:
                cursor.execute("SELECT count(*) as count FROM loans")
                count = cursor.fetchone()['count']
                print(f"Loan count: {count}")
                
    except Exception as e:
        print(f"Error connecting to database: {e}")

def main():
    parser = argparse.ArgumentParser(description='Manage CDL Local Database')
    parser.add_argument('action', choices=['init', 'reset', 'seed', 'check'], help='Action to perform')
    
    args = parser.parse_args()
    
    if args.action == 'init':
        init_db()
    elif args.action == 'reset':
        reset_db()
    elif args.action == 'seed':
        seed_db()
    elif args.action == 'check':
        check_db()

if __name__ == '__main__':
    main()
