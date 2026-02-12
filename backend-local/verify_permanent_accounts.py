"""Verify permanent accounts"""
import sqlite3
import os

db_path = 'data/database.db'

if not os.path.exists(db_path):
    print(f"❌ Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

print("=" * 60)
print("PERMANENT DEFAULT ACCOUNTS")
print("=" * 60)

cursor.execute("""
    SELECT user_id, email, full_name, role, wallet_address, 
           is_verified, kyc_status, is_permanent
    FROM users 
    WHERE is_permanent = 1
    ORDER BY 
        CASE role 
            WHEN 'maintainer' THEN 1
            WHEN 'lender' THEN 2
            WHEN 'borrower' THEN 3
        END
""")

accounts = cursor.fetchall()

if not accounts:
    print("\n❌ No permanent accounts found!")
else:
    for i, account in enumerate(accounts, 1):
        print(f"\n{i}. {account['role'].upper()} ACCOUNT")
        print("-" * 60)
        print(f"   User ID:        {account['user_id']}")
        print(f"   Email:          {account['email']}")
        print(f"   Full Name:      {account['full_name']}")
        print(f"   Role:           {account['role']}")
        print(f"   Wallet:         {account['wallet_address']}")
        print(f"   Verified:       {'✅ Yes' if account['is_verified'] else '❌ No'}")
        print(f"   KYC Status:     {account['kyc_status']}")
        print(f"   Permanent:      {'🔒 Yes' if account['is_permanent'] else '❌ No'}")

print("\n" + "=" * 60)
print("CREDENTIALS")
print("=" * 60)
print("\n1. Maintainer: maintainer@cdl.com / admin123")
print("2. Lender:     lender@cdl.com     / lender123")
print("3. Borrower:   borrower@cdl.com   / borrower123")
print("\n" + "=" * 60)

# Check for sample data
print("\nSAMPLE DATA")
print("=" * 60)

# Check loans
cursor.execute("SELECT COUNT(*) as count FROM loans WHERE borrower_id = 'borrower-default-id'")
loan_count = cursor.fetchone()['count']
print(f"\nBorrower Loans: {loan_count}")

# Check deposits
cursor.execute("SELECT COUNT(*) as count FROM deposits WHERE lender_id = 'lender-default-id'")
deposit_count = cursor.fetchone()['count']
print(f"Lender Deposits: {deposit_count}")

print("\n✨ Verification complete!")

conn.close()
