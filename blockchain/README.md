# Blockchain

Smart contracts for the DeFi lending platform.

## Contracts

### LendingPool.sol
Manages the lending pool where lenders deposit funds.

**Features:**
- Deposit funds with lock duration
- Withdraw funds after lock period
- Interest calculation based on duration
- Pool liquidity management

### LoanManager.sol
Handles the complete loan lifecycle.

**Features:**
- Loan request creation
- Loan approval (admin)
- Loan disbursement
- Loan repayment
- Loan status tracking

### InterestCalculator.sol
Utility contract for interest calculations.

**Features:**
- Interest rate determination
- Interest amount calculation
- Total repayment calculation

## Setup

```bash
npm install
```

## Compile

```bash
npx hardhat compile
```

## Test

```bash
npx hardhat test
```

## Deploy

### Local
```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

### Testnet (Sepolia)
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Mainnet
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

## Verify

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

## Environment Variables

Create `.env` file:
```
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_key
```
