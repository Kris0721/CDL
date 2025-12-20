-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'borrower', -- borrower, lender, maintainer
    wallet_address TEXT,
    kyc_status TEXT DEFAULT 'pending', -- pending, approved, rejected
    is_verified INTEGER DEFAULT 0,
    otp_code TEXT,
    otp_expires_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Loans Table
CREATE TABLE IF NOT EXISTS loans (
    loan_id TEXT PRIMARY KEY,
    borrower_id TEXT NOT NULL,
    amount REAL NOT NULL,
    interest_rate REAL NOT NULL,
    duration INTEGER NOT NULL, -- in days
    total_repayment REAL NOT NULL,
    amount_repaid REAL DEFAULT 0,
    collateral_amount REAL,
    collateral_token TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, active, completed, rejected
    blockchain_loan_id INTEGER,
    start_time INTEGER,
    end_time INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (borrower_id) REFERENCES users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_loans_borrower ON loans(borrower_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    loan_id TEXT,
    transaction_type TEXT NOT NULL, -- deposit, withdrawal, loan_disbursement, loan_repayment
    amount REAL NOT NULL,
    token TEXT,
    tx_hash TEXT,
    status TEXT DEFAULT 'pending', -- pending, completed, failed
    timestamp INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (loan_id) REFERENCES loans(loan_id)
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_loan ON transactions(loan_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);

-- KYC Documents Table
CREATE TABLE IF NOT EXISTS kyc_documents (
    document_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    document_type TEXT NOT NULL, -- id_proof, address_proof, selfie
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    rejection_reason TEXT,
    uploaded_at INTEGER NOT NULL,
    reviewed_at INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_documents(user_id);

-- Deposits Table (for lenders)
CREATE TABLE IF NOT EXISTS deposits (
    deposit_id TEXT PRIMARY KEY,
    lender_id TEXT NOT NULL,
    amount REAL NOT NULL,
    lock_duration INTEGER NOT NULL, -- in days
    interest_rate REAL NOT NULL,
    start_time INTEGER NOT NULL,
    end_time INTEGER NOT NULL,
    withdrawn INTEGER DEFAULT 0,
    blockchain_deposit_index INTEGER,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (lender_id) REFERENCES users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_deposits_lender ON deposits(lender_id);
