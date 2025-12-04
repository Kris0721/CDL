const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Get contract addresses from environment
    const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
    const LENDING_POOL_ADDRESS = process.env.LENDING_POOL_ADDRESS;
    const LOAN_MANAGER_ADDRESS = process.env.LOAN_MANAGER_ADDRESS;

    if (!TOKEN_ADDRESS || !LENDING_POOL_ADDRESS || !LOAN_MANAGER_ADDRESS) {
        console.error("Contract addresses not found in environment");
        process.exit(1);
    }

    // Get contract instances
    const lendingPool = await hre.ethers.getContractAt("LendingPool", LENDING_POOL_ADDRESS);
    const loanManager = await hre.ethers.getContractAt("LoanManager", LOAN_MANAGER_ADDRESS);

    console.log("\nVerifying contracts on Etherscan...");

    // Verify LendingPool
    try {
        await hre.run("verify:verify", {
            address: LENDING_POOL_ADDRESS,
            constructorArguments: [TOKEN_ADDRESS],
        });
        console.log("✓ LendingPool verified");
    } catch (error) {
        console.log("LendingPool verification failed:", error.message);
    }

    // Verify LoanManager
    try {
        await hre.run("verify:verify", {
            address: LOAN_MANAGER_ADDRESS,
            constructorArguments: [TOKEN_ADDRESS, LENDING_POOL_ADDRESS],
        });
        console.log("✓ LoanManager verified");
    } catch (error) {
        console.log("LoanManager verification failed:", error.message);
    }

    console.log("\nVerification complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
