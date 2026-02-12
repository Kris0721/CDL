const hre = require("hardhat");

async function main() {
    console.log("Deploying P2P Loan Manager to Sepolia...");

    // Use the same token address from previous deployment
    const TOKEN_ADDRESS = "0x7B6E891e22075C446D4B9c78B9233be10653b8Dc";

    // Deploy P2PLoanManager
    const P2PLoanManager = await hre.ethers.getContractFactory("P2PLoanManager");
    const p2pLoanManager = await P2PLoanManager.deploy(TOKEN_ADDRESS);
    await p2pLoanManager.waitForDeployment();

    const p2pAddress = await p2pLoanManager.getAddress();
    console.log(`P2PLoanManager deployed to: ${p2pAddress}`);

    // Save deployment info
    const fs = require('fs');
    const deploymentInfo = {
        network: hre.network.name,
        timestamp: new Date().toISOString(),
        contracts: {
            Token: TOKEN_ADDRESS,
            P2PLoanManager: p2pAddress
        }
    };

    fs.writeFileSync(
        './deployments-p2p.json',
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n✅ P2P Deployment complete!");
    console.log("Addresses saved to deployments-p2p.json");
    console.log(`\nUpdate your frontend .env with:`);
    console.log(`VITE_P2P_LOAN_MANAGER_ADDRESS=${p2pAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
