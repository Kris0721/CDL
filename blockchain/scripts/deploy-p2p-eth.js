const hre = require("hardhat");

async function main() {
    console.log("Deploying P2P Loan Manager (ETH) to Sepolia...");

    // Deploy P2PLoanManagerETH (no token address needed)
    const P2PLoanManagerETH = await hre.ethers.getContractFactory("P2PLoanManagerETH");
    const p2pLoanManagerETH = await P2PLoanManagerETH.deploy();
    await p2pLoanManagerETH.waitForDeployment();

    const p2pAddress = await p2pLoanManagerETH.getAddress();
    console.log(`P2PLoanManagerETH deployed to: ${p2pAddress}`);

    // Save deployment info
    const fs = require('fs');
    const deploymentInfo = {
        network: hre.network.name,
        timestamp: new Date().toISOString(),
        contracts: {
            P2PLoanManagerETH: p2pAddress
        }
    };

    fs.writeFileSync(
        './deployments-p2p-eth.json',
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n✅ P2P ETH Deployment complete!");
    console.log("Addresses saved to deployments-p2p-eth.json");
    console.log(`\nUpdate your frontend .env with:`);
    console.log(`VITE_P2P_ETH_LOAN_MANAGER_ADDRESS=${p2pAddress}`);
    console.log(`\nVerify on Sepolia Etherscan:`);
    console.log(`https://sepolia.etherscan.io/address/${p2pAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
