const hre = require("hardhat");

async function main() {
    console.log("Deploying DeFi Lending Platform contracts...");

    // Deploy InterestCalculator
    const InterestCalculator = await hre.ethers.getContractFactory("InterestCalculator");
    const interestCalculator = await InterestCalculator.deploy();
    await interestCalculator.waitForDeployment();
    console.log(`InterestCalculator deployed to: ${await interestCalculator.getAddress()}`);

    // Deploy mock USDC token for testing (replace with actual USDC address in production)
    const MockToken = await hre.ethers.getContractFactory("MockERC20");
    const token = await MockToken.deploy("USD Coin", "USDC", 6);
    await token.waitForDeployment();
    console.log(`Mock USDC deployed to: ${await token.getAddress()}`);

    // Deploy LendingPool
    const LendingPool = await hre.ethers.getContractFactory("LendingPool");
    const lendingPool = await LendingPool.deploy(await token.getAddress());
    await lendingPool.waitForDeployment();
    console.log(`LendingPool deployed to: ${await lendingPool.getAddress()}`);

    // Deploy LoanManager
    const LoanManager = await hre.ethers.getContractFactory("LoanManager");
    const loanManager = await LoanManager.deploy(
        await token.getAddress(),
        await lendingPool.getAddress()
    );
    await loanManager.waitForDeployment();
    console.log(`LoanManager deployed to: ${await loanManager.getAddress()}`);

    // Save deployment addresses
    const fs = require('fs');
    const deploymentInfo = {
        network: hre.network.name,
        timestamp: new Date().toISOString(),
        contracts: {
            InterestCalculator: await interestCalculator.getAddress(),
            Token: await token.getAddress(),
            LendingPool: await lendingPool.getAddress(),
            LoanManager: await loanManager.getAddress()
        }
    };

    fs.writeFileSync(
        './deployments.json',
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\nDeployment complete! Addresses saved to deployments.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
