# CDL DeFi Platform - Permanent Default Accounts

## Overview

Three permanent default accounts have been created for the CDL DeFi Lending Platform. These accounts are marked as **permanent** and can only be deleted from the Maintainer Dashboard.

---

## Account Credentials

### 1. Maintainer Account (Admin)

**User ID:** `maintainer-default-id`

**Email:** `maintainer@cdl.com`

**Password:** `admin123`

**Role:** Maintainer

**Wallet Address:** `0xAdminWalletAddress123456789`

**Status:**
- ✅ Email Verified
- ✅ KYC Approved
- 🔒 Permanent Account

**Permissions:**
- Full platform access
- Approve/reject loans
- Approve/reject KYC documents
- View all users
- View platform statistics
- Manage all accounts (including delete permanent accounts)

---

### 2. Lender Account

**User ID:** `lender-default-id`

**Email:** `lender@cdl.com`

**Password:** `lender123`

**Role:** Lender

**Wallet Address:** `0x23e5c170066540dd241bf0a3505be482a1619e50`

**Status:**
- ✅ Email Verified
- ✅ KYC Approved
- 🔒 Permanent Account

**Permissions:**
- Deposit funds
- View lending pool statistics
- Make loan offers to borrowers
- Track profit history
- Withdraw deposits after lock period

**Sample Data:**
- Active Deposit: $50,000 (90-day lock, 8.5% APR)
- Started: 15 days ago
- Ends: 75 days from now

---

### 3. Borrower Account

**User ID:** `borrower-default-id`

**Email:** `borrower@cdl.com`

**Password:** `borrower123`

**Role:** Borrower

**Wallet Address:** `0x0c6024f0d49b897ee29ad85047602cfdf7d34fab`

**Status:**
- ✅ Email Verified
- ✅ KYC Approved
- 🔒 Permanent Account

**Permissions:**
- Request loans
- View loan offers from lenders
- Accept/reject loan offers
- Repay loans
- View transaction history

**Sample Data:**
- **Active Loan:** $5,000 (30 days, 5.5% APR)
  - Collateral: 2.5 ETH
  - Started: 10 days ago
  - Due: 20 days from now
  
- **Completed Loan:** $1,200 (15 days, 4.2% APR)
  - Collateral: 0.6 ETH
  - Fully repaid

---

## Account Protection

### Permanent Account Features

1. **Cannot be deleted by regular users**
   - Only maintainers can delete permanent accounts
   - Database field: `is_permanent = 1`

2. **Always available for testing**
   - Guaranteed to exist in the system
   - Can be used for demonstrations

3. **Can be reset**
   - Passwords can be reset
   - Data can be cleared while keeping the account

### Database Implementation

```sql
-- Users table includes is_permanent field
CREATE TABLE users (
    user_id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    wallet_address TEXT,
    kyc_status TEXT DEFAULT 'pending',
    is_verified INTEGER DEFAULT 0,
    is_permanent INTEGER DEFAULT 0,  -- 1 for permanent accounts
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
```

---

## Quick Login Guide

### For Testing

1. **Test Admin Functions:**
   - Login as: `maintainer@cdl.com` / `admin123`
   - Access maintainer dashboard
   - Approve/reject loans and KYC

2. **Test Lender Functions:**
   - Login as: `lender@cdl.com` / `lender123`
   - Access lender dashboard
   - View deposits and make loan offers

3. **Test Borrower Functions:**
   - Login as: `borrower@cdl.com` / `borrower123`
   - Access borrower dashboard
   - View loans and offers

---

## Resetting Accounts

To reset the default accounts to their initial state:

```bash
cd backend-local
python seed_defaults.py
```

This will:
- Update passwords to default values
- Reset user data
- Recreate sample loans and deposits
- Maintain permanent account status

---

## Security Notes

⚠️ **Important:**
- These are **development/testing accounts only**
- **DO NOT use these credentials in production**
- Change passwords before deploying to production
- Consider using environment variables for production credentials

---

## Maintenance

### Updating Credentials

To change default passwords, edit `backend-local/seed_defaults.py`:

```python
users = [
    {
        'email': 'maintainer@cdl.com',
        'password': 'your-new-password',  # Change here
        # ...
    },
    # ...
]
```

Then run:
```bash
python seed_defaults.py
```

### Removing Permanent Status

Only maintainers can remove permanent status via the dashboard, or manually via SQL:

```sql
UPDATE users SET is_permanent = 0 WHERE email = 'account@cdl.com';
```

---

## Summary

✅ **3 Permanent Accounts Created:**
- Maintainer: `maintainer@cdl.com` / `admin123`
- Lender: `lender@cdl.com` / `lender123`
- Borrower: `borrower@cdl.com` / `borrower123`

✅ **All accounts are:**
- Email verified
- KYC approved
- Marked as permanent
- Ready for immediate use

✅ **Protection:**
- Can only be deleted by maintainers
- Database flag prevents accidental deletion
- Always available for testing

---

**Last Updated:** 2026-01-22
