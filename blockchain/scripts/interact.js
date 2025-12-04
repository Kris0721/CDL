const hre = require("hardhat");

async function main() {
    console.log("Starting interaction with deployed contracts...");

    // Get contract addresses (replace with your deployed addresses)
    const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || "";
    const LENDING_POOL_ADDRESS = process.env.LENDING_POOL_ADDRESS || "";
    const LOAN_MANAGER_ADDRESS = process.env.LOAN_MANAGER_ADDRESS || "";

    if (!TOKEN_ADDRESS || !LENDING_POOL_ADDRESS || !LOAN_MANAGER_ADDRESS) {
        console.error("Please set contract addresses in .env file");
        process.exit(1);
    }

    const [signer] = await hre.ethers.getSigners();
    console.log("Using account:", signer.address);

    // Get contract instances
    const token = await hre.ethers.getContractAt("IERC20", TOKEN_ADDRESS);
    const lendingPool = await hre.ethers.getContractAt("LendingPool", LENDING_POOL_ADDRESS);
    const loanManager = await hre.ethers.getContractAt("LoanManager", LOAN_MANAGER_ADDRESS);

    // Check balances
    const balance = await token.balanceOf(signer.address);
    console.log(`Token balance: ${hre.ethers.formatEther(balance)} tokens`);

    // Get pool statistics
    const totalPoolSize = await lendingPool.totalPoolSize();
    const availableLiquidity = await lendingPool.availableLiquidity();
    console.log(`\nPool Statistics:`);
    console.log(`Total Pool Size: ${hre.ethers.formatEther(totalPoolSize)} tokens`);
    console.log(`Available Liquidity: ${hre.ethers.formatEther(availableLiquidity)} tokens`);

    // Get user deposits
    const deposits = await lendingPool.getUserDeposits(signer.address);
    console.log(`\nYour Deposits: ${deposits.length}`);
    deposits.forEach((deposit, index) => {
        console.log(`  Deposit ${index}:`);
        console.log(`    Amount: ${hre.ethers.formatEther(deposit.amount)} tokens`);
        console.log(`    Interest Rate: ${deposit.interestRate / 100}%`);
        console.log(`    Lock Duration: ${deposit.lockDuration / (24 * 60 * 60)} days`);
    });

    // Get user loans
    const loanIds = await loanManager.getBorrowerLoans(signer.address);
    console.log(`\nYour Loans: ${loanIds.length}`);
    for (const loanId of loanIds) {
        const loan = await loanManager.getLoan(loanId);
        const remaining = await loanManager.getRemainingBalance(loanId);
        console.log(`  Loan ${loanId}:`);
        console.log(`    Amount: ${hre.ethers.formatEther(loan.amount)} tokens`);
        console.log(`    Total Repayment: ${hre.ethers.formatEther(loan.totalRepayment)} tokens`);
        console.log(`    Amount Repaid: ${hre.ethers.formatEther(loan.amountRepaid)} tokens`);
        console.log(`    Remaining: ${hre.ethers.formatEther(remaining)} tokens`);
        console.log(`    Status: ${loan.active ? 'Active' : 'Inactive'}`);
        console.log(`    Approved: ${loan.approved ? 'Yes' : 'No'}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
