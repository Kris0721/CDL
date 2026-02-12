"""Fix existing users - Auto-verify all users in database"""
import sqlite3
import os

# Database path
db_path = 'data/database.db'

if not os.path.exists(db_path):
    print(f"❌ Database not found at {db_path}")
    exit(1)

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get count of unverified users
cursor.execute("SELECT COUNT(*) FROM users WHERE is_verified = 0")
unverified_count = cursor.fetchone()[0]

print(f"Found {unverified_count} unverified users")

if unverified_count > 0:
    # Update all users to be verified with approved KYC
    cursor.execute("""
        UPDATE users 
        SET is_verified = 1, 
            kyc_status = 'approved',
            otp_code = NULL,
            otp_expires_at = NULL
        WHERE is_verified = 0
    """)
    
    conn.commit()
    print(f"✅ Updated {unverified_count} users to verified status")
    
    # Show updated users
    cursor.execute("SELECT email, role, is_verified, kyc_status FROM users")
    users = cursor.fetchall()
    
    print("\n📋 All users in database:")
    print("-" * 60)
    for user in users:
        email, role, is_verified, kyc_status = user
        verified_status = "✅ Verified" if is_verified else "❌ Not Verified"
        print(f"{email:30} | {role:10} | {verified_status} | KYC: {kyc_status}")
    print("-" * 60)
else:
    print("✅ All users are already verified")

conn.close()
print("\n✨ Done! You can now login with any existing account.")
