
import sqlite3
import os

db_path = 'data/database.db'

print(f"Checking database at: {db_path}")

if not os.path.exists(db_path):
    print("Database file not found!")
    exit(1)

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

print("\n=== USERS ===")
users = cursor.execute("SELECT user_id, email, full_name, role FROM users").fetchall()
for u in users:
    print(f"ID: {u['user_id']} | Email: {u['email']} | Role: {u['role']}")

print("\n=== LOANS ===")
loans = cursor.execute("SELECT loan_id, borrower_id, amount, status, created_at FROM loans").fetchall()
for l in loans:
    print(f"ID: {l['loan_id']} | Borrower: {l['borrower_id']} | Amount: {l['amount']} | Status: '{l['status']}'")

print("\n=== MARKETPLACE QUERY TEST ===")
try:
    # This matches the query in LenderService.get_open_requests
    query = """
        SELECT l.loan_id, l.amount, l.status, u.full_name as borrower_name
        FROM loans l
        JOIN users u ON l.borrower_id = u.user_id
        WHERE l.status = 'open'
    """
    results = cursor.execute(query).fetchall()
    print(f"Found {len(results)} open requests in marketplace query:")
    for r in results:
        print(f"  Loan: {r['loan_id']} | Borrower: {r['borrower_name']} | Status: {r['status']}")

    print("\n=== LOAN OFFERS ===")
    offers = cursor.execute("SELECT * FROM loan_offers").fetchall()
    for o in offers:
        print(f"Offer: {o['offer_id']} | Loan: {o['loan_id']} | Lender: {o['lender_id']} | Rate: {o['interest_rate']}")

    if len(loans) > 0 and len(offers) > 0:
        print("\n=== OFFERS QUERY TEST ===")
        loan_id = offers[0]['loan_id']
        offer_query = """
            SELECT o.*, u.full_name as lender_name 
            FROM loan_offers o
            JOIN users u ON o.lender_id = u.user_id
            WHERE o.loan_id = ?
        """
        offer_results = cursor.execute(offer_query, (loan_id,)).fetchall()
        print(f"Testing query for Loan {loan_id}: Found {len(offer_results)} offers")
        for res in offer_results:
            print(f"  - Offer from {res['lender_name']} at {res['interest_rate']}%")

except Exception as e:
    print(f"Query Error: {e}")

conn.close()
