# DeFi Lending Platform - Backend

AWS Lambda-based serverless backend for the DeFi lending platform.

## 🏗️ Architecture

- **Runtime**: Python 3.11
- **Infrastructure**: AWS SAM (Serverless Application Model)
- **Database**: Amazon DynamoDB
- **Storage**: Amazon S3 (KYC documents)
- **Email**: Amazon SES
- **API**: Amazon API Gateway

## 📁 Project Structure

```
backend/
├── lambda-functions/          # Lambda function handlers
│   ├── auth/                 # Authentication functions
│   ├── user/                 # User management functions
│   ├── loan/                 # Loan operations
│   ├── transaction/          # Transaction handling
│   └── admin/                # Admin operations
├── layers/                   # Lambda layers
│   └── common/              # Shared utilities
│       └── python/
│           ├── auth_utils.py
│           ├── db_utils.py
│           ├── validation_utils.py
│           ├── blockchain_utils.py
│           ├── email_utils.py
│           └── requirements.txt
├── template.yaml             # SAM template
├── samconfig.toml           # SAM configuration
├── deploy.sh                # Deployment script
└── .env.example             # Environment variables example
```

## 🚀 Quick Start

### Prerequisites

- AWS CLI configured with appropriate credentials
- AWS SAM CLI installed
- Python 3.11+
- Bash shell (for deployment script)

### Installation

1. **Clone the repository and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Copy environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Install dependencies for Lambda layer**
   ```bash
   cd layers/common
   pip install -r python/requirements.txt -t python/
   cd ../..
   ```

### Deployment

#### Option 1: Using deployment script (Recommended)
```bash
chmod +x deploy.sh
./deploy.sh
```

#### Option 2: Manual deployment
```bash
# Validate template
sam validate

# Build application
sam build

# Deploy (guided mode for first deployment)
sam deploy --guided

# For subsequent deployments
sam deploy
```

### Configuration

During the guided deployment, you'll be prompted for:

- **Stack Name**: `defi-lending-backend` (or your choice)
- **AWS Region**: Your preferred region (e.g., `us-east-1`)
- **JWTSecretKey**: Your JWT secret key (keep this secure!)
- **SESFromEmail**: Email address for sending notifications

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/verify-otp` - Verify email OTP
- `POST /auth/reset-password` - Reset password

### User Management
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `POST /user/kyc/upload` - Upload KYC documents
- `GET /user/kyc/documents` - Get KYC documents
- `PUT /user/wallet` - Update wallet address

### Loan Operations
- `POST /loans/request` - Request a loan
- `GET /loans/user` - Get user's loans
- `GET /loans/{loanId}` - Get loan details
- `GET /loans/{loanId}/calculate` - Calculate interest
- `GET /loans/stats` - Get loan statistics
- `POST /loans/repay` - Repay loan

### Admin Operations (Admin/Maintainer only)
- `POST /loans/approve` - Approve loan
- `POST /loans/reject` - Reject loan
- `POST /loans/disburse` - Disburse loan
- `GET /admin/loans` - Get all loans
- `GET /admin/users` - Get all users
- `GET /admin/stats` - Get platform statistics
- `PUT /user/kyc/status` - Update KYC status

### Transactions
- `GET /transactions` - Get transaction history
- `GET /transactions/{transactionId}` - Get transaction details

## 🔐 Authentication

All endpoints (except `/auth/register` and `/auth/login`) require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🧪 Testing

### Local Testing with SAM

```bash
# Start API locally
sam build
sam local start-api

# Test specific function
sam local invoke RegisterFunction --event events/register.json
```

### Unit Tests

```bash
# Install dev dependencies
pip install -r requirements-dev.txt

# Run tests
pytest tests/
```

## 📊 DynamoDB Tables

### Users Table
- **Primary Key**: `userId`
- **GSI**: `EmailIndex` on `email`

### Loans Table
- **Primary Key**: `loanId`
- **GSI**: `BorrowerIndex` on `borrowerId`
- **GSI**: `StatusIndex` on `status`

### Transactions Table
- **Primary Key**: `transactionId`
- **GSI**: `UserTransactionsIndex` on `userId` + `timestamp`

### KYC Documents Table
- **Primary Key**: `documentId`
- **GSI**: `UserDocumentsIndex` on `userId`

## 🔧 Environment Variables

Each Lambda function has access to:

- `USERS_TABLE` - DynamoDB users table name
- `LOANS_TABLE` - DynamoDB loans table name
- `TRANSACTIONS_TABLE` - DynamoDB transactions table name
- `KYC_DOCUMENTS_TABLE` - DynamoDB KYC documents table name
- `JWT_SECRET_KEY` - JWT signing key
- `SES_FROM_EMAIL` - SES sender email
- `KYC_BUCKET` - S3 bucket for KYC documents

## 📝 Shared Utilities

The `common` Lambda layer provides:

- **auth_utils.py**: JWT token handling, password hashing (bcrypt), authentication decorators
- **db_utils.py**: DynamoDB CRUD operations, queries, pagination
- **validation_utils.py**: Input validation for emails, amounts, addresses, etc.
- **blockchain_utils.py**: Web3 integration for blockchain operations
- **email_utils.py**: SES email templates and sending

## 🚨 Important Notes

### Security
- Change the default JWT secret key in production
- Use AWS Secrets Manager for sensitive data in production
- Enable AWS WAF for API Gateway in production
- Implement rate limiting to prevent abuse

### SES Configuration
- Verify your sender email address in AWS SES console
- For production, request SES to move out of sandbox mode
- Configure SPF, DKIM, and DMARC records for your domain

### Costs
- DynamoDB uses on-demand billing
- Lambda charges per request and execution time
- S3 charges for storage and requests
- Monitor costs in AWS Cost Explorer

## 🔄 CI/CD

For automated deployments, integrate with:
- GitHub Actions
- AWS CodePipeline
- GitLab CI/CD

Example GitHub Actions workflow:
```yaml
name: Deploy Backend
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: aws-actions/setup-sam@v2
      - run: sam build
      - run: sam deploy --no-confirm-changeset
```

## 📖 Additional Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)

## 🐛 Troubleshooting

### Common Issues

1. **Lambda timeout errors**: Increase timeout in `template.yaml`
2. **DynamoDB throttling**: Switch to provisioned capacity or increase on-demand limits
3. **SES email not sending**: Verify email address and check SES sending limits
4. **CORS errors**: Ensure API Gateway CORS is properly configured

## 📞 Support

For issues or questions, please open an issue in the repository.
