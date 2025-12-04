# DeFi Lending Platform - API Documentation

## Base URL
```
https://api.defi-lending.com/v1
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "fullName": "John Doe",
  "role": "borrower",
  "walletAddress": "0x..."
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "userId": "user_123456"
}
```

#### POST /auth/login
Login to the platform.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "borrower",
  "user": {
    "userId": "user_123456",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "borrower"
  }
}
```

#### POST /auth/verify-otp
Verify email with OTP.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Email verified successfully"
}
```

### Loans

#### POST /loan/request
Request a new loan (Borrower only).

**Request Body:**
```json
{
  "amount": "5000",
  "duration": 90,
  "purpose": "Business expansion",
  "collateral": "0x..."
}
```

**Response:**
```json
{
  "message": "Loan request submitted successfully",
  "loanId": "loan_123456",
  "totalRepayment": "5350"
}
```

#### GET /loan/:loanId
Get loan details.

**Response:**
```json
{
  "loanId": "loan_123456",
  "borrowerId": "user_123456",
  "amount": "5000",
  "interestRate": 8.5,
  "duration": 90,
  "totalRepayment": "5350",
  "amountPaid": "1000",
  "status": "active"
}
```

#### POST /loan/:loanId/repay
Repay a loan.

**Request Body:**
```json
{
  "amount": "1000"
}
```

**Response:**
```json
{
  "message": "Payment successful",
  "remainingBalance": "4350"
}
```

### User Management

#### GET /user/profile
Get user profile.

**Response:**
```json
{
  "userId": "user_123456",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "borrower",
  "walletAddress": "0x...",
  "kycStatus": "approved",
  "createdAt": "2025-11-30T10:00:00Z"
}
```

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description"
}
```

### Status Codes
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
