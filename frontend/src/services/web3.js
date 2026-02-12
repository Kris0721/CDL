import { ethers } from 'ethers';
import { getSigner } from './wallet';
import LendingPoolABI from '../contracts/LendingPool.json';
import LoanManagerABI from '../contracts/LoanManager.json';

export const CONTRACT_ADDRESSES = {
    LendingPool: import.meta.env.VITE_LENDING_POOL_ADDRESS,
    LoanManager: import.meta.env.VITE_LOAN_MANAGER_ADDRESS,
    Token: import.meta.env.VITE_TOKEN_ADDRESS
};

export const getLendingPoolContract = async () => {
    const signer = await getSigner();
    if (!signer) {
        throw new Error('Wallet not connected');
    }

    if (!CONTRACT_ADDRESSES.LendingPool) {
        console.error("Lending Pool Address not found in env vars");
        throw new Error("Contract address missing");
    }

    return new ethers.Contract(CONTRACT_ADDRESSES.LendingPool, LendingPoolABI.abi, signer);
};

export const getLoanManagerContract = async () => {
    const signer = await getSigner();
    if (!signer) {
        throw new Error('Wallet not connected');
    }

    if (!CONTRACT_ADDRESSES.LoanManager) {
        console.error("Loan Manager Address not found in env vars");
        throw new Error("Contract address missing");
    }

    return new ethers.Contract(CONTRACT_ADDRESSES.LoanManager, LoanManagerABI.abi, signer);
};

export const depositToPool = async (amount) => {
    const contract = await getLendingPoolContract();
    const tx = await contract.deposit(ethers.parseUnits(amount, 18), 0); // 0 is lockDuration placeholder
    await tx.wait();
    return tx;
};

export const requestLoan = async (amount, duration) => {
    const contract = await getLoanManagerContract();
    const tx = await contract.requestLoan(
        ethers.parseUnits(amount, 18),
        duration
    );
    await tx.wait();
    return tx;
};

export const repayLoan = async (loanId, amount) => {
    const contract = await getLoanManagerContract();
    const tx = await contract.repayLoan(loanId, ethers.parseUnits(amount, 18));
    await tx.wait();
    return tx;
};
