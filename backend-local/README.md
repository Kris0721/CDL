# CDL Local Backend Server

Local Flask-based backend server for the CDL project, replacing AWS services for localhost development.

## Quick Start

### 1. Install Dependencies

```bash
cd backend-local
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy example env file
copy .env.example .env

# Edit .env if needed (optional for development)
```

### 3. Run the Server

```bash
python app.py
```

Server will start at: **http://localhost:5000**

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-otp` - Verify email OTP
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile (requires auth)

### Loans

- `POST /api/loans/request` - Request a loan (requires auth)
- `GET /api/loans/user` - Get user's loans (requires auth)
- `GET /api/loans/<loan_id>` - Get specific loan (requires auth)
- `POST /api/loans/approve` - Approve loan (admin only)
- `POST /api/loans/reject` - Reject loan (admin only)
- `POST /api/loans/disburse` - Disburse loan (admin only)
- `POST /api/loans/repay` - Repay loan (requires auth)

### Admin

- `GET /api/admin/loans` - Get all loans (admin only)
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/stats` - Platform statistics (admin only)

### Health

- `GET /api/health` - Health check
- `GET /` - API info

## Testing with cURL

### Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"fullName\":\"Test User\",\"role\":\"borrower\"}"
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

## Database

- **Type:** SQLite
- **Location:** `data/database.db`
- **Schema:** Auto-created on first run

## File Storage

- **KYC Documents:** `storage/kyc_documents/`

## Features

✅ JWT Authentication  
✅ User Registration & Login  
✅ OTP Email Verification (console logged)  
✅ Loan Management (Request, Approve, Disburse, Repay)  
✅ Admin Dashboard Data  
✅ Transaction Tracking  
✅ Role-Based Access Control  

## Frontend Integration

Update your frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Running Full Stack

**Terminal 1 - Backend:**
```bash
cd backend-local
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Blockchain (optional):**
```bash
cd blockchain
npx hardhat node
```

## Notes

- OTP codes are printed to console (check terminal output)
- Email notifications are logged to console
- Database is file-based (easy to reset by deleting `data/database.db`)
- No AWS account needed!

## Troubleshooting

**Port already in use:**
```bash
# Change PORT in .env file
PORT=5001
```

**Database errors:**
```bash
# Delete and recreate database
rm data/database.db
python app.py
```
