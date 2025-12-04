# DeFi Lending Platform - Deployment Guide

## Prerequisites

- Node.js 18+
- AWS CLI configured
- Hardhat
- MetaMask or similar Web3 wallet

## Frontend Deployment

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
Create `.env` file:
```
REACT_APP_API_URL=https://your-api-gateway-url
REACT_APP_CHAIN_ID=1
REACT_APP_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
REACT_APP_LENDING_POOL_ADDRESS=0x...
REACT_APP_LOAN_MANAGER_ADDRESS=0x...
```

### 3. Build
```bash
npm run build
```

### 4. Deploy to S3
```bash
aws s3 sync build/ s3://your-bucket-name --delete
```

### 5. Configure CloudFront
- Create CloudFront distribution
- Point to S3 bucket
- Configure SSL certificate

## Backend Deployment

### 1. Install AWS SAM CLI
```bash
pip install aws-sam-cli
```

### 2. Package Lambda Functions
```bash
cd backend
sam package --template-file template.yaml --output-template-file packaged.yaml --s3-bucket your-deployment-bucket
```

### 3. Deploy
```bash
sam deploy --template-file packaged.yaml --stack-name defi-lending-backend --capabilities CAPABILITY_IAM
```

### 4. Create DynamoDB Tables
```bash
aws dynamodb create-table --cli-input-json file://database/schemas/users-table.json
aws dynamodb create-table --cli-input-json file://database/schemas/loans-table.json
aws dynamodb create-table --cli-input-json file://database/schemas/transactions-table.json
aws dynamodb create-table --cli-input-json file://database/schemas/kyc-documents-table.json
```

## Blockchain Deployment

### 1. Install Dependencies
```bash
cd blockchain
npm install
```

### 2. Configure Environment
Create `.env` file:
```
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_key
```

### 3. Compile Contracts
```bash
npx hardhat compile
```

### 4. Deploy to Testnet
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 5. Verify Contracts
```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

### 6. Deploy to Mainnet
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

## Post-Deployment

### 1. Update Frontend Environment
Update contract addresses in frontend `.env`

### 2. Configure API Gateway
- Set up CORS
- Configure rate limiting
- Set up custom domain

### 3. Set up Monitoring
- CloudWatch for Lambda functions
- CloudWatch for API Gateway
- Etherscan for contract monitoring

### 4. Security
- Enable AWS WAF
- Configure API keys
- Set up VPC for Lambda functions
- Enable encryption at rest for DynamoDB

## Testing

### Frontend
```bash
cd frontend
npm test
```

### Backend
```bash
cd backend
python -m pytest
```

### Smart Contracts
```bash
cd blockchain
npx hardhat test
```

## Rollback

### Frontend
```bash
aws s3 sync s3://your-backup-bucket s3://your-bucket-name --delete
```

### Backend
```bash
aws cloudformation delete-stack --stack-name defi-lending-backend
```

## Monitoring

- CloudWatch Logs for Lambda functions
- CloudWatch Metrics for API Gateway
- DynamoDB metrics
- Blockchain transaction monitoring
