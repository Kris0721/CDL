# CDL Project - Sepolia Testnet Setup Guide

This guide will help you configure the CDL project to perform transactions on the Sepolia testnet.

## Prerequisites

Before you begin, you'll need:
- MetaMask browser extension installed
- A test wallet (create a new one, never use your main wallet!)
- Node.js and npm installed

## Step 1: Get a Free RPC Provider

You need an RPC URL to connect to Sepolia testnet. Choose one:

### Option A: Infura (Recommended)
1. Go to [https://infura.io](https://infura.io)
2. Sign up for a free account
3. Create a new project
4. Copy your Sepolia endpoint URL (looks like: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`)

### Option B: Alchemy
1. Go to [https://alchemy.com](https://alchemy.com)
2. Sign up for a free account
3. Create a new app, select "Ethereum" → "Sepolia"
4. Copy your HTTPS endpoint URL

### Option C: Public RPC (No signup, but less reliable)
- Use: `https://rpc.sepolia.org`
- Note: May be slower or rate-limited

## Step 2: Get Test ETH

You'll need Sepolia ETH to deploy contracts and perform transactions:

1. **Alchemy Faucet** (Recommended): [https://sepoliafaucet.com](https://sepoliafaucet.com)
2. **Infura Faucet**: [https://www.infura.io/faucet/sepolia](https://www.infura.io/faucet/sepolia)
3. **Google Cloud Faucet**: [https://cloud.google.com/application/web3/faucet/ethereum/sepolia](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)

Send test ETH to your test wallet address.

## Step 3: Export Your Private Key

⚠️ **SECURITY WARNING**: Only use a TEST wallet! Never export your main wallet's private key!

1. Open MetaMask
2. Click the three dots → Account Details
3. Click "Show Private Key"
4. Enter your password
5. Copy the private key (remove the `0x` prefix)

## Step 4: Configure Blockchain Environment

Create a file named `.env` in the `blockchain` folder with this content:

```env
# Your wallet private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Your RPC URL from Step 1
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Optional: Mainnet RPC (for future use)
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# Optional: Etherscan API key for contract verification
# Get from: https://etherscan.io/myapikey
ETHERSCAN_API_KEY=
```

Replace:
- `your_private_key_here` with your private key from Step 3
- `YOUR_PROJECT_ID` with your Infura/Alchemy project ID

## Step 5: Deploy Smart Contracts to Sepolia

Open a terminal in the `blockchain` folder and run:

```bash
# Install dependencies (if not already done)
npm install

# Compile contracts
npx hardhat compile

# Run tests (optional but recommended)
npx hardhat test

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

The deployment will output contract addresses. **Save these addresses!** They'll also be saved in `blockchain/deployments.json`.

Example output:
```
InterestCalculator deployed to: 0x1234...
Mock USDC deployed to: 0x5678...
LendingPool deployed to: 0x9abc...
LoanManager deployed to: 0xdef0...
```

## Step 6: Configure Frontend Environment

Create a file named `.env` in the `frontend` folder with this content:

```env
# API URL (update with your backend URL when available)
VITE_API_URL=http://localhost:3001

# Sepolia Testnet Configuration
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Contract Addresses (from Step 5 deployment)
VITE_LENDING_POOL_ADDRESS=0x_your_lending_pool_address
VITE_LOAN_MANAGER_ADDRESS=0x_your_loan_manager_address
VITE_INTEREST_CALCULATOR_ADDRESS=0x_your_interest_calculator_address
VITE_TOKEN_ADDRESS=0x_your_mock_usdc_address

# AWS Configuration (if using AWS backend)
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
VITE_S3_BUCKET=
```

Replace the contract addresses with the ones from your deployment in Step 5.

## Step 7: Configure MetaMask for Sepolia

1. Open MetaMask
2. Click the network dropdown (top left)
3. Click "Add Network" or "Show/hide test networks"
4. Enable "Show test networks"
5. Select "Sepolia test network"

Your MetaMask should now show:
- Network: Sepolia test network
- Your test ETH balance

## Step 8: Start the Frontend

Open a terminal in the `frontend` folder and run:

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

The frontend will open at `http://localhost:5173`

## Step 9: Test Transactions

1. Open the frontend in your browser
2. Connect MetaMask (it should prompt you)
3. Make sure MetaMask is on Sepolia network
4. Try performing a transaction (e.g., request a loan)
5. MetaMask will pop up asking you to confirm the transaction
6. Confirm and wait for the transaction to complete

## Verify Transactions on Etherscan

You can view all your transactions on Sepolia Etherscan:
- Go to [https://sepolia.etherscan.io](https://sepolia.etherscan.io)
- Search for your wallet address or transaction hash
- View transaction details, contract interactions, etc.

## Troubleshooting

### "Insufficient funds" error
- Get more test ETH from the faucets in Step 2

### "Invalid RPC URL" error
- Double-check your RPC URL in the `.env` files
- Make sure you've replaced `YOUR_PROJECT_ID` with your actual project ID

### MetaMask not connecting
- Make sure MetaMask is on Sepolia network
- Try refreshing the page
- Check browser console for errors

### Contract deployment fails
- Ensure you have enough Sepolia ETH (at least 0.1 ETH recommended)
- Check that your private key is correct (without `0x` prefix)
- Verify your RPC URL is working

## Next Steps

Once everything is working:
1. Test all features (lending, borrowing, repayment)
2. Monitor transactions on Sepolia Etherscan
3. When ready for production, deploy to Ethereum mainnet (requires real ETH!)

## Security Reminders

- ✅ Never commit `.env` files to git (they're in `.gitignore`)
- ✅ Only use test wallets for development
- ✅ Never share your private keys
- ✅ Keep your RPC API keys private
- ✅ Use environment variables for sensitive data

---

**Need Help?** Check the project README or create an issue on GitHub.
