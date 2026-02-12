"""Seed default accounts and sample data"""
import sqlite3
import os
import time
import uuid
import bcrypt

# Database path
db_path = 'data/database.db'

if not os.path.exists(db_path):
    print(f"❌ Database not found at {db_path}. Please run the app first to create it.")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

now = int(time.time())

# 1. Define Default Users
users = [
    {
        'user_id': 'maintainer-default-id',
        'email': 'maintainer@cdl.com',
        'password': 'admin123',
        'full_name': 'System Maintainer',
        'role': 'maintainer',
        'wallet_address': '0xAdminWalletAddress123456789',
        'is_verified': 1,
        'kyc_status': 'approved'
    },
    {
        'user_id': 'lender-default-id',
        'email': 'lender@cdl.com',
        'password': 'lender123',
        'full_name': 'Crypto Whale',
        'role': 'lender',
        'wallet_address': '0x23e5c170066540dd241bf0a3505be482a1619e50',
        'is_verified': 1,
        'kyc_status': 'approved'
    },
    {
        'user_id': 'borrower-default-id',
        'email': 'borrower@cdl.com',
        'password': 'borrower123',
        'full_name': 'Active Trader',
        'role': 'borrower',
        'wallet_address': '0x0c6024f0d49b897ee29ad85047602cfdf7d34fab',
        'is_verified': 1,
        'kyc_status': 'approved'
    }
]

print("🌱 Seeding Users...")
for user in users:
    try:
        # Check if user exists
        cursor.execute("SELECT user_id FROM users WHERE email = ?", (user['email'],))
        existing = cursor.fetchone()
        
        if existing:
            # Update existing user
            print(f"  Updating {user['role']}: {user['email']}")
            cursor.execute("""
                UPDATE users SET 
                    password_hash = ?,
                    full_name = ?,
                    role = ?,
                    wallet_address = ?,
                    is_verified = ?,
                    kyc_status = ?,
                    is_permanent = 1
                WHERE email = ?
            """, (
                hash_password(user['password']),
                user['full_name'],
                user['role'],
                user['wallet_address'],
                user['is_verified'],
                user['kyc_status'],
                user['email']
            ))
        else:
            # Insert new user
            print(f"  Creating {user['role']}: {user['email']}")
            cursor.execute("""
                INSERT INTO users (user_id, email, password_hash, full_name, role, wallet_address, is_verified, kyc_status, is_permanent, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
            """, (
                user['user_id'],
                user['email'],
                hash_password(user['password']),
                user['full_name'],
                user['role'],
                user['wallet_address'],
                user['is_verified'],
                user['kyc_status'],
                now,
                now
            ))
    except Exception as e:
        print(f"  ❌ Error processing {user['email']}: {e}")

# 2. Seed Sample Loans for Borrower
print("\n🌱 Seeding Loans...")
# Clear existing loans for this borrower to avoid duplicates
cursor.execute("DELETE FROM loans WHERE borrower_id = 'borrower-default-id'")

loans = [
    {
        'loan_id': str(uuid.uuid4()),
        'borrower_id': 'borrower-default-id',
        'amount': 5000,
        'interest_rate': 5.5,
        'duration': 30,
        'total_repayment': 5000 + (5000 * 0.055 * 30 / 365),
        'status': 'active',
        'start_time': now - (86400 * 10), # Started 10 days ago
        'end_time': now + (86400 * 20),
        'collateral_amount': 2.5,
        'collateral_token': 'ETH'
    },
    {
        'loan_id': str(uuid.uuid4()),
        'borrower_id': 'borrower-default-id',
        'amount': 1200,
        'interest_rate': 4.2,
        'duration': 15,
        'total_repayment': 1200 + (1200 * 0.042 * 15 / 365),
        'status': 'completed', # Already repaid
        'start_time': now - (86400 * 40),
        'end_time': now - (86400 * 25),
        'collateral_amount': 0.6,
        'collateral_token': 'ETH'
    }
]

for loan in loans:
    cursor.execute("""
        INSERT INTO loans (loan_id, borrower_id, amount, interest_rate, duration, total_repayment, status, start_time, end_time, collateral_amount, collateral_token, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        loan['loan_id'], loan['borrower_id'], loan['amount'], loan['interest_rate'],
        loan['duration'], loan['total_repayment'], loan['status'],
        loan['start_time'], loan['end_time'], loan['collateral_amount'],
        loan['collateral_token'], now, now
    ))
    print(f"  Created {loan['status']} loan: ${loan['amount']}")

# 3. Seed Sample Deposits for Lender
print("\n🌱 Seeding Deposits...")
cursor.execute("DELETE FROM deposits WHERE lender_id = 'lender-default-id'")

deposits = [
    {
        'deposit_id': str(uuid.uuid4()),
        'lender_id': 'lender-default-id',
        'amount': 50000,
        'lock_duration': 90,
        'interest_rate': 8.5,
        'start_time': now - (86400 * 15),
        'end_time': now + (86400 * 75)
    }
]

for deposit in deposits:
    cursor.execute("""
        INSERT INTO deposits (deposit_id, lender_id, amount, lock_duration, interest_rate, start_time, end_time, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        deposit['deposit_id'], deposit['lender_id'], deposit['amount'],
        deposit['lock_duration'], deposit['interest_rate'],
        deposit['start_time'], deposit['end_time'], now
    ))
    print(f"  Created deposit: ${deposit['amount']}")

conn.commit()
conn.close()
print("\n✨ Database seeded successfully!")
print("Credentials:")
print("  Maintainer: maintainer@cdl.com / admin123")
print("  Lender:     lender@cdl.com     / lender123")
print("  Borrower:   borrower@cdl.com   / borrower123")
