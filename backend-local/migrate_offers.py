
import sqlite3
import os

DB_PATH = 'data/database.db'

def apply_migration():
    print(f"Connecting to database at {DB_PATH}...")
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        print("Creating loan_offers table...")
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS loan_offers (
            offer_id TEXT PRIMARY KEY,
            loan_id TEXT NOT NULL,
            lender_id TEXT NOT NULL,
            interest_rate REAL NOT NULL,
            status TEXT DEFAULT 'pending', -- pending, accepted, rejected
            created_at INTEGER NOT NULL,
            FOREIGN KEY (loan_id) REFERENCES loans(loan_id),
            FOREIGN KEY (lender_id) REFERENCES users(user_id)
        );
        ''')
        
        print("Creating indices...")
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_loan_offers_loan ON loan_offers(loan_id);')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_loan_offers_lender ON loan_offers(lender_id);')
        
        conn.commit()
        print("Migration successful! 'loan_offers' table created.")
        conn.close()
        
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    if not os.path.exists(DB_PATH):
        print(f"Database file not found at {DB_PATH}")
    else:
        apply_migration()
