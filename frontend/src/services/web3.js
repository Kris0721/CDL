import { ethers } from 'ethers';
import { getSigner } from './wallet';

const CONTRACT_ADDRESSES = {
    LendingPool: import.meta.env.REACT_APP_LENDING_POOL_ADDRESS,
    LoanManager: import.meta.env.REACT_APP_LOAN_MANAGER_ADDRESS
};

// ABI imports would go here
// import LendingPoolABI from '../contracts/LendingPool.json';
// import LoanManagerABI from '../contracts/LoanManager.json';

export const getLendingPoolContract = async () => {
    const signer = getSigner();
    if (!signer) {
        throw new Error('Wallet not connected');
    }

    // TODO: Import actual ABI
    const abi = []; // LendingPoolABI.abi
    return new ethers.Contract(CONTRACT_ADDRESSES.LendingPool, abi, signer);
};

export const getLoanManagerContract = async () => {
    const signer = getSigner();
    if (!signer) {
        throw new Error('Wallet not connected');
    }

    // TODO: Import actual ABI
    const abi = []; // LoanManagerABI.abi
    return new ethers.Contract(CONTRACT_ADDRESSES.LoanManager, abi, signer);
};

export const depositToPool = async (amount) => {
    const contract = await getLendingPoolContract();
    const tx = await contract.deposit(ethers.parseUnits(amount, 18));
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
