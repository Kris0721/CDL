const hre = require("hardhat");

/**
 * Helper script to mint test USDC tokens on Sepolia
 * Usage: npx hardhat run scripts/mint-usdc.js --network sepolia
 */

async function main() {
    const [signer] = await hre.ethers.getSigners();
    console.log("Minting USDC with account:", signer.address);

    // Token contract address from deployments.json
    const TOKEN_ADDRESS = "0x7B6E891e22075C446D4B9c78B9233be10653b8Dc";

    // Get the token contract
    const Token = await hre.ethers.getContractAt("MockERC20", TOKEN_ADDRESS);

    // Amount to mint (10,000 USDC with 6 decimals)
    const amount = hre.ethers.parseUnits("10000", 6);

    console.log(`Minting ${hre.ethers.formatUnits(amount, 6)} USDC to ${signer.address}...`);

    const tx = await Token.mint(signer.address, amount);
    await tx.wait();

    console.log("✅ Minted successfully!");
    console.log(`Transaction hash: ${tx.hash}`);

    // Check balance
    const balance = await Token.balanceOf(signer.address);
    console.log(`\nYour USDC balance: ${hre.ethers.formatUnits(balance, 6)} USDC`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
