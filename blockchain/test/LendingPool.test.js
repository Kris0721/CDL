const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LendingPool", function () {
    let lendingPool;
    let token;
    let owner;
    let lender1;
    let lender2;

    beforeEach(async function () {
        [owner, lender1, lender2] = await ethers.getSigners();

        // Deploy mock ERC20 token
        const Token = await ethers.getContractFactory("MockERC20");
        token = await Token.deploy("USD Coin", "USDC", ethers.parseEther("1000000"));
        await token.waitForDeployment();

        // Deploy LendingPool
        const LendingPool = await ethers.getContractFactory("LendingPool");
        lendingPool = await LendingPool.deploy(await token.getAddress());
        await lendingPool.waitForDeployment();

        // Distribute tokens to lenders
        await token.transfer(lender1.address, ethers.parseEther("10000"));
        await token.transfer(lender2.address, ethers.parseEther("10000"));
    });

    describe("Deployment", function () {
        it("Should set the correct token address", async function () {
            expect(await lendingPool.token()).to.equal(await token.getAddress());
        });

        it("Should initialize with zero pool size", async function () {
            expect(await lendingPool.totalPoolSize()).to.equal(0);
            expect(await lendingPool.availableLiquidity()).to.equal(0);
        });
    });

    describe("Deposits", function () {
        it("Should allow lenders to deposit funds", async function () {
            const depositAmount = ethers.parseEther("1000");
            const lockDuration = 30 * 24 * 60 * 60; // 30 days

            await token.connect(lender1).approve(await lendingPool.getAddress(), depositAmount);

            await expect(lendingPool.connect(lender1).deposit(depositAmount, lockDuration))
                .to.emit(lendingPool, "Deposited")
                .withArgs(lender1.address, depositAmount, lockDuration, 600); // 6% rate

            expect(await lendingPool.totalPoolSize()).to.equal(depositAmount);
            expect(await lendingPool.availableLiquidity()).to.equal(depositAmount);
            expect(await lendingPool.totalDeposited(lender1.address)).to.equal(depositAmount);
        });

        it("Should reject deposits with invalid lock duration", async function () {
            const depositAmount = ethers.parseEther("1000");
            const invalidDuration = 20 * 24 * 60 * 60; // 20 days (too short)

            await token.connect(lender1).approve(await lendingPool.getAddress(), depositAmount);

            await expect(
                lendingPool.connect(lender1).deposit(depositAmount, invalidDuration)
            ).to.be.revertedWith("Invalid lock duration");
        });

        it("Should calculate correct interest rates based on lock duration", async function () {
            expect(await lendingPool.calculateInterestRate(30 * 24 * 60 * 60)).to.equal(600);   // 6%
            expect(await lendingPool.calculateInterestRate(60 * 24 * 60 * 60)).to.equal(750);   // 7.5%
            expect(await lendingPool.calculateInterestRate(90 * 24 * 60 * 60)).to.equal(850);   // 8.5%
            expect(await lendingPool.calculateInterestRate(180 * 24 * 60 * 60)).to.equal(1000); // 10%
        });
    });

    describe("Withdrawals", function () {
        beforeEach(async function () {
            const depositAmount = ethers.parseEther("1000");
            const lockDuration = 30 * 24 * 60 * 60;

            await token.connect(lender1).approve(await lendingPool.getAddress(), depositAmount);
            await lendingPool.connect(lender1).deposit(depositAmount, lockDuration);
        });

        it("Should allow withdrawal after lock period", async function () {
            // Fast forward time by 31 days
            await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
            await ethers.provider.send("evm_mine");

            const initialBalance = await token.balanceOf(lender1.address);

            await expect(lendingPool.connect(lender1).withdraw(0))
                .to.emit(lendingPool, "Withdrawn");

            const finalBalance = await token.balanceOf(lender1.address);
            expect(finalBalance).to.be.gt(initialBalance);
        });

        it("Should reject withdrawal before lock period ends", async function () {
            await expect(
                lendingPool.connect(lender1).withdraw(0)
            ).to.be.revertedWith("Lock period not over");
        });
    });

    describe("Loan Allocation", function () {
        beforeEach(async function () {
            const depositAmount = ethers.parseEther("10000");
            const lockDuration = 30 * 24 * 60 * 60;

            await token.connect(lender1).approve(await lendingPool.getAddress(), depositAmount);
            await lendingPool.connect(lender1).deposit(depositAmount, lockDuration);
        });

        it("Should allow owner to allocate loans", async function () {
            const loanAmount = ethers.parseEther("5000");

            await lendingPool.allocateLoan(loanAmount);

            expect(await lendingPool.availableLiquidity()).to.equal(ethers.parseEther("5000"));
        });

        it("Should reject loan allocation exceeding liquidity", async function () {
            const loanAmount = ethers.parseEther("15000");

            await expect(
                lendingPool.allocateLoan(loanAmount)
            ).to.be.revertedWith("Insufficient liquidity");
        });

        it("Should only allow owner to allocate loans", async function () {
            const loanAmount = ethers.parseEther("5000");

            await expect(
                lendingPool.connect(lender1).allocateLoan(loanAmount)
            ).to.be.reverted;
        });
    });

    describe("Interest Calculations", function () {
        it("Should calculate interest correctly", async function () {
            const principal = ethers.parseEther("1000");
            const rate = 600; // 6%
            const duration = 30 * 24 * 60 * 60; // 30 days

            const interest = await lendingPool.calculateInterest(principal, rate, duration);

            // Expected: (1000 * 600 * 30 days) / (10000 * 365 days)
            // Approximately 4.93 tokens
            expect(interest).to.be.closeTo(ethers.parseEther("4.93"), ethers.parseEther("0.1"));
        });
    });
});
