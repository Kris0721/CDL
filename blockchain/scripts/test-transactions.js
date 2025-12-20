const { ethers } = require('ethers');
require('dotenv').config();

// Contract addresses from deployment
const ADDRESSES = {
    token: '0xD41396Ec75e3Da4D610017C05B37Cff9dcC9D41D',
    lendingPool: '0xedcA46346a688dC40464A735D1De2FCbbc452795',
    loanManager: '0xfE667bb8A1fC0371822935a2Ea5940Ef986aB369',
    interestCalculator: '0xEA193D770281aB70421f7B1bB9AB997e5dd5faC1'
};

// Contract ABIs (simplified - only functions we need)
const TOKEN_ABI = [
    "function mint(address to, uint256 amount) public",
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function balanceOf(address account) public view returns (uint256)",
    "function decimals() public view returns (uint8)"
];

const LENDING_POOL_ABI = [
    "function deposit(uint256 amount, uint256 lockDuration) external",
    "function getUserDeposits(address user) external view returns (tuple(uint256 amount, uint256 timestamp, uint256 lockDuration, uint256 interestRate)[])",
    "function totalPoolSize() public view returns (uint256)",
    "function availableLiquidity() public view returns (uint256)"
];

const LOAN_MANAGER_ABI = [
    "function requestLoan(uint256 amount, uint256 duration) external returns (uint256)",
    "function approveLoan(uint256 loanId) external",
    "function disburseLoan(uint256 loanId) external",
    "function repayLoan(uint256 loanId, uint256 amount) external",
    "function getLoan(uint256 loanId) external view returns (tuple(address borrower, uint256 amount, uint256 interestRate, uint256 duration, uint256 startTime, uint256 totalRepayment, uint256 amountRepaid, bool active, bool approved))",
    "function getBorrowerLoans(address borrower) external view returns (uint256[])"
];

async function main() {
    console.log('🚀 CDL Blockchain Transaction Test\n');
    console.log('Testing on Sepolia Testnet...\n');

    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log(`📍 Wallet Address: ${wallet.address}`);

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Sepolia ETH Balance: ${ethers.formatEther(balance)} ETH\n`);

    // Connect to contracts
    const token = new ethers.Contract(ADDRESSES.token, TOKEN_ABI, wallet);
    const lendingPool = new ethers.Contract(ADDRESSES.lendingPool, LENDING_POOL_ABI, wallet);
    const loanManager = new ethers.Contract(ADDRESSES.loanManager, LOAN_MANAGER_ABI, wallet);

    console.log('📝 Contract Addresses:');
    console.log(`   Token (Mock USDC): ${ADDRESSES.token}`);
    console.log(`   LendingPool: ${ADDRESSES.lendingPool}`);
    console.log(`   LoanManager: ${ADDRESSES.loanManager}\n`);

    try {
        // Step 1: Mint test USDC tokens
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('STEP 1: Minting Test USDC Tokens');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const mintAmount = ethers.parseUnits('10000', 6); // 10,000 USDC (6 decimals)
        console.log(`Minting ${ethers.formatUnits(mintAmount, 6)} USDC to ${wallet.address}...`);

        const mintTx = await token.mint(wallet.address, mintAmount);
        console.log(`Transaction hash: ${mintTx.hash}`);
        await mintTx.wait();
        console.log('✅ Tokens minted successfully!\n');

        // Check balance
        const tokenBalance = await token.balanceOf(wallet.address);
        console.log(`Current USDC Balance: ${ethers.formatUnits(tokenBalance, 6)} USDC\n`);

        // Step 2: Lender deposits funds
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('STEP 2: Lender Deposits Funds');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const depositAmount = ethers.parseUnits('5000', 6); // 5,000 USDC
        const lockDuration = 90 * 24 * 60 * 60; // 90 days in seconds

        console.log(`Depositing ${ethers.formatUnits(depositAmount, 6)} USDC for 90 days...`);

        // Approve LendingPool to spend tokens
        console.log('Approving LendingPool to spend tokens...');
        const approveTx = await token.approve(ADDRESSES.lendingPool, depositAmount);
        await approveTx.wait();
        console.log('✅ Approval successful!');

        // Deposit into pool
        const depositTx = await lendingPool.deposit(depositAmount, lockDuration);
        console.log(`Transaction hash: ${depositTx.hash}`);
        await depositTx.wait();
        console.log('✅ Deposit successful!\n');

        // Check pool stats
        const totalPool = await lendingPool.totalPoolSize();
        const availableLiquidity = await lendingPool.availableLiquidity();
        console.log(`Pool Statistics:`);
        console.log(`   Total Pool Size: ${ethers.formatUnits(totalPool, 6)} USDC`);
        console.log(`   Available Liquidity: ${ethers.formatUnits(availableLiquidity, 6)} USDC\n`);

        // Step 3: Borrower requests loan
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('STEP 3: Borrower Requests Loan');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const loanAmount = ethers.parseUnits('1000', 6); // 1,000 USDC
        const loanDuration = 60 * 24 * 60 * 60; // 60 days

        console.log(`Requesting loan of ${ethers.formatUnits(loanAmount, 6)} USDC for 60 days...`);

        const requestTx = await loanManager.requestLoan(loanAmount, loanDuration);
        console.log(`Transaction hash: ${requestTx.hash}`);
        const receipt = await requestTx.wait();

        // Get loan ID from event
        const loanId = 0; // First loan
        console.log(`✅ Loan requested successfully! Loan ID: ${loanId}\n`);

        // Get loan details
        const loan = await loanManager.getLoan(loanId);
        console.log(`Loan Details:`);
        console.log(`   Borrower: ${loan.borrower}`);
        console.log(`   Amount: ${ethers.formatUnits(loan.amount, 6)} USDC`);
        console.log(`   Total Repayment: ${ethers.formatUnits(loan.totalRepayment, 6)} USDC`);
        console.log(`   Interest Rate: ${Number(loan.interestRate) / 100}%`);
        console.log(`   Duration: ${Number(loan.duration) / (24 * 60 * 60)} days`);
        console.log(`   Status: ${loan.approved ? 'Approved' : 'Pending'}\n`);

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ ALL TRANSACTIONS COMPLETED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('📊 Summary:');
        console.log(`   ✅ Minted 10,000 USDC tokens`);
        console.log(`   ✅ Deposited 5,000 USDC as Lender (90 days)`);
        console.log(`   ✅ Requested 1,000 USDC loan as Borrower (60 days)`);
        console.log(`   ⏳ Loan pending admin approval\n`);

        console.log('🔗 View transactions on Sepolia Etherscan:');
        console.log(`   Mint: https://sepolia.etherscan.io/tx/${mintTx.hash}`);
        console.log(`   Deposit: https://sepolia.etherscan.io/tx/${depositTx.hash}`);
        console.log(`   Loan Request: https://sepolia.etherscan.io/tx/${requestTx.hash}\n`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.reason) console.error('Reason:', error.reason);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
