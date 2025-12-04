# DeFi Lending Platform - Complete Project

A comprehensive decentralized finance (DeFi) lending platform built with React, AWS Lambda, and Ethereum smart contracts.

## 🏗️ Project Structure

```
defi/
├── backend/                 # AWS Lambda serverless backend
│   ├── lambda-functions/   # 30+ Lambda functions
│   ├── layers/            # Shared utilities
│   └── template.yaml      # AWS SAM infrastructure
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   └── vite.config.js
├── blockchain/            # Smart contracts & scripts
│   ├── contracts/        # Solidity contracts
│   ├── scripts/          # Deployment scripts
│   └── test/             # Contract tests
├── database/             # DynamoDB schemas
└── docs/                 # Documentation
```

## 🚀 Features

### For Borrowers
- ✅ User registration with email verification
- ✅ KYC document upload and verification
- ✅ Loan request with customizable terms
- ✅ Real-time loan status tracking
- ✅ Flexible repayment options
- ✅ Transaction history

### For Lenders
- ✅ Deposit funds with lock periods
- ✅ Earn interest based on duration
- ✅ View lending pool statistics
- ✅ Track profit history

### For Admins
- ✅ Comprehensive platform dashboard
- ✅ Loan approval/rejection workflow
- ✅ KYC verification management
- ✅ User management
- ✅ Platform-wide statistics
- ✅ Financial metrics tracking

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.11+ (for backend)
- AWS CLI configured
- AWS SAM CLI
- Hardhat (for blockchain)
- MetaMask or similar Web3 wallet

## 🛠️ Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd defi
```

### 2. Backend Setup
```bash
cd backend
pip install -r layers/common/python/requirements.txt -t layers/common/python/
sam build
sam deploy --guided
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API endpoint
npm run dev
```

### 4. Blockchain Setup
```bash
cd blockchain
npm install
cp .env.example .env
# Edit .env with your RPC URLs and private key
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network sepolia
```

## 🔑 Environment Variables

### Backend (.env)
```
JWT_SECRET_KEY=your-secret-key
SES_FROM_EMAIL=noreply@yourdomain.com
```

### Frontend (.env)
```
VITE_API_URL=https://your-api-gateway-url
VITE_CONTRACT_ADDRESS=0x...
VITE_CHAIN_ID=11155111
```

### Blockchain (.env)
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_key
```

## 📚 API Documentation

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/verify-otp` - Verify email
- `POST /auth/refresh` - Refresh JWT token

### Loans
- `POST /loans/request` - Request a loan
- `GET /loans/user` - Get user's loans
- `POST /loans/repay` - Repay loan
- `POST /loans/approve` - Approve loan (admin)
- `POST /loans/disburse` - Disburse loan (admin)

### Admin
- `GET /admin/stats` - Platform statistics
- `GET /admin/loans` - All loans
- `GET /admin/users` - All users

[Full API documentation](./docs/api-documentation.md)

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Smart Contract Tests
```bash
cd blockchain
npx hardhat test
npx hardhat coverage
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚢 Deployment

### Backend (AWS)
```bash
cd backend
./deploy.sh
```

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting service
```

### Smart Contracts
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network mainnet
npx hardhat run scripts/verify.js --network mainnet
```

## 📊 Architecture

### Backend Architecture
- **Serverless**: AWS Lambda functions
- **Database**: DynamoDB with GSIs
- **Storage**: S3 for KYC documents
- **Email**: AWS SES
- **API**: API Gateway with JWT auth

### Frontend Architecture
- **Framework**: React 18 with Vite
- **State Management**: React hooks
- **Styling**: CSS modules
- **Web3**: ethers.js for blockchain interaction

### Blockchain Architecture
- **Smart Contracts**: Solidity 0.8.20
- **Security**: OpenZeppelin contracts
- **Testing**: Hardhat with Chai
- **Network**: Ethereum (Sepolia testnet)

## 🔒 Security Features

- ✅ Bcrypt password hashing
- ✅ JWT authentication with expiration
- ✅ Role-based access control
- ✅ Input validation and sanitization
- ✅ ReentrancyGuard on contracts
- ✅ CORS configuration
- ✅ Rate limiting (recommended)

## 📈 Performance

- **Backend**: ~200ms average response time
- **Frontend**: Lighthouse score 90+
- **Smart Contracts**: Gas optimized
- **Database**: On-demand scaling

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 👥 Team

- Backend Development
- Frontend Development
- Smart Contract Development
- DevOps & Infrastructure

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](../../issues)
- Documentation: [docs/](./docs/)
- Email: support@yourdomain.com

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Multi-chain support
- [ ] Governance token
- [ ] Staking rewards
- [ ] Insurance pool
- [ ] Credit scoring system

## ⚠️ Disclaimer

This is a demonstration project. Use at your own risk. Always conduct thorough security audits before deploying to production.

---

**Built with ❤️ using React, AWS, and Ethereum**
