import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../context/Web3Context';
import { CONTRACT_ADDRESSES as WEB3_ADDRESSES } from '../../services/web3';
import { LENDING_POOL_ABI, ERC20_ABI } from '../../utils/constants';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Input from '../shared/Input';

const LendFunds = () => {
    const { signer, currentAccount, connectWallet, isConnecting } = useWeb3();
    const [amount, setAmount] = useState('');
    const [duration, setDuration] = useState('30');
    const [interestRate, setInterestRate] = useState('8.5');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(''); // Status message during transaction

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setStatus('');
        setLoading(true);

        if (!currentAccount || !signer) {
            setError("Please connect your wallet first");
            setLoading(false);
            return;
        }

        try {
            // Use addresses from environment variables via web3 service
            const addresses = WEB3_ADDRESSES;

            if (!addresses.LendingPool || !addresses.Token) {
                throw new Error("Contract addresses not configured. Check environment variables.");
            }

            const tokenContract = new ethers.Contract(addresses.Token, ERC20_ABI, signer);
            const lendingPoolContract = new ethers.Contract(addresses.LendingPool, LENDING_POOL_ABI, signer);

            // Parse amount (USDC has 6 decimals)
            const amountInWei = ethers.parseUnits(amount, 6);
            const durationInSeconds = parseInt(duration) * 24 * 60 * 60;

            // 1. Approve Token
            setStatus("Please approve transaction in your wallet...");
            const approveTx = await tokenContract.approve(addresses.LendingPool, amountInWei);
            setStatus("Approving token...");
            await approveTx.wait();

            // 2. Deposit to Pool
            setStatus("Please confirm deposit transaction...");
            const depositTx = await lendingPoolContract.deposit(amountInWei, durationInSeconds);
            setStatus("Depositing funds to Sepolia Blockchain...");
            const receipt = await depositTx.wait();

            setSuccess(`Funds deposited successfully! Tx: ${receipt.hash.slice(0, 10)}...`);
            setAmount('');
        } catch (err) {
            console.error(err);
            if (err.code === 'ACTION_REJECTED') {
                setError("Transaction rejected by user");
            } else if (err.code === 'INSUFFICIENT_FUNDS') {
                setError("Insufficient funds for transaction");
            } else {
                setError(err.reason || err.message || "Transaction failed");
            }
        } finally {
            setLoading(false);
            setStatus('');
        }
    };

    return (
        <div className="dashboard-content">
            <h1>Lend Funds</h1>

            <div className="lend-grid">
                <Card>
                    <h2>Lend to Pool (Web3)</h2>
                    {!currentAccount ? (
                        <div className="connect-prompt">
                            <p>Connect your wallet to lend funds directly to the smart contract.</p>
                            <Button onClick={connectWallet} disabled={isConnecting}>
                                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="lend-form">
                            {error && <div className="error-message">{error}</div>}
                            {success && <div className="success-message">{success}</div>}
                            {status && <div className="status-messageinfo-message" style={{ color: '#aaa', margin: '10px 0' }}>{status}</div>}

                            <Input
                                type="number"
                                label="Amount (ETH)"
                                placeholder="0.1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                disabled={loading}
                            />

                            <div className="form-group">
                                <label>Lock Duration (days)</label>
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="select-input"
                                    disabled={loading}
                                >
                                    <option value="30">30 days - 6% APY</option>
                                    <option value="60">60 days - 7.5% APY</option>
                                    <option value="90">90 days - 8.5% APY</option>
                                    <option value="180">180 days - 10% APY</option>
                                </select>
                            </div>

                            <div className="info-box">
                                <p><strong>Estimated Returns:</strong></p>
                                <p className="highlight">${(amount * (parseFloat(interestRate) / 100) * (duration / 365)).toFixed(2)}</p>
                            </div>

                            <Button type="submit" fullWidth disabled={loading || !amount}>
                                {loading ? 'Processing...' : 'Lend Funds on Blockchain'}
                            </Button>
                        </form>
                    )}
                </Card>

                <Card>
                    <h2>Pool Statistics</h2>
                    <div className="pool-stats">
                        <div className="stat-item">
                            <span>Total Pool Size</span>
                            <strong>$1,250,000</strong>
                        </div>
                        <div className="stat-item">
                            <span>Available Liquidity</span>
                            <strong>$450,000</strong>
                        </div>
                        <div className="stat-item">
                            <span>Average APY</span>
                            <strong>8.2%</strong>
                        </div>
                        <div className="stat-item">
                            <span>Total Lenders</span>
                            <strong>342</strong>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LendFunds;
