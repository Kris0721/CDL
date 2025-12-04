# Frontend

React-based frontend for the DeFi lending platform.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Environment Variables

Create a `.env` file:

```
REACT_APP_API_URL=https://api.defi-lending.com
REACT_APP_CHAIN_ID=1
REACT_APP_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
REACT_APP_LENDING_POOL_ADDRESS=0x...
REACT_APP_LOAN_MANAGER_ADDRESS=0x...
```

## Structure

- `src/components/` - React components
- `src/services/` - API and Web3 services
- `src/utils/` - Utility functions
- `src/styles/` - CSS styles
- `src/config/` - Configuration files
