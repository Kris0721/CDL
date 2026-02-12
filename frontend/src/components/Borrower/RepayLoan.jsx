import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../context/Web3Context';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Input from '../shared/Input';

// P2P Loan Manager ABI
const P2P_LOAN_MANAGER_ABI = [
    "function getBorrowerLoans(address borrower) external view returns (uint256[])",
    "function getLoan(uint256 loanId) external view returns (tuple(address borrower, address lender, uint256 amount, uint256 interestRate, uint256 duration, uint256 startTime, uint256 totalRepayment, uint256 amountRepaid, bool funded, bool completed))",
    "function repayLoan(uint256 loanId) external payable",
    "function getRemainingBalance(uint256 loanId) external view returns (uint256)"
];

const RepayLoan = () => {
    const { currentAccount, signer } = useWeb3();
    const [activeLoans, setActiveLoans] = useState([]);
    const [selectedLoan, setSelectedLoan] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [repaying, setRepaying] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [status, setStatus] = useState('');

    const P2P_CONTRACT_ADDRESS = import.meta.env.VITE_P2P_ETH_LOAN_MANAGER_ADDRESS;

    useEffect(() => {
        if (currentAccount && signer) {
            fetchActiveLoans();
        }
    }, [currentAccount, signer]);

    const fetchActiveLoans = async () => {
        setLoading(true);
        setError('');

        try {
            console.log('🔍 [RepayLoan] Fetching active loans for:', currentAccount);

            if (!P2P_CONTRACT_ADDRESS) {
                throw new Error("Contract address not configured");
            }

            const contract = new ethers.Contract(
                P2P_CONTRACT_ADDRESS,
                P2P_LOAN_MANAGER_ABI,
                signer
            );

            const loanIds = await contract.getBorrowerLoans(currentAccount);
            console.log('📊 [RepayLoan] Loan IDs:', loanIds.map(id => id.toString()));

            if (loanIds.length === 0) {
                setActiveLoans([]);
                setLoading(false);
                return;
            }

            const loanPromises = loanIds.map(async (id) => {
                const loan = await contract.getLoan(id);
                return {
                    loanId: id.toString(),
                    amount: ethers.formatEther(loan.amount),
                    totalRepayment: ethers.formatEther(loan.totalRepayment),
                    amountRepaid: ethers.formatEther(loan.amountRepaid),
                    funded: loan.funded,
                    completed: loan.completed,
                    lender: loan.lender,
                    lenderName: loan.lender !== ethers.ZeroAddress
                        ? `${loan.lender.slice(0, 6)}...${loan.lender.slice(-4)}`
                        : 'Not funded'
                };
            });

            const allLoans = await Promise.all(loanPromises);

            // Filter to only show ACTIVE loans (funded but not completed)
            const active = allLoans.filter(loan => loan.funded && !loan.completed);

            console.log('✅ [RepayLoan] Found', active.length, 'active loans');
            setActiveLoans(active);

        } catch (err) {
            console.error('❌ [RepayLoan] Error:', err);
            setError(err.message || 'Failed to fetch active loans');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setStatus('');
        setRepaying(true);

        try {
            if (!selectedLoan) {
                throw new Error("Please select a loan");
            }

            if (!amount || parseFloat(amount) <= 0) {
                throw new Error("Please enter a valid amount");
            }

            const contract = new ethers.Contract(
                P2P_CONTRACT_ADDRESS,
                P2P_LOAN_MANAGER_ABI,
                signer
            );

            // Get exact remaining balance from contract
            const remainingWei = await contract.getRemainingBalance(selectedLoan);
            const remainingEth = parseFloat(ethers.formatEther(remainingWei));
            const paymentEth = parseFloat(amount);

            let amountInWei;

            // If paying the full balance (within 0.000001 ETH), use the exact wei amount from contract
            if (Math.abs(paymentEth - remainingEth) < 0.000001) {
                amountInWei = remainingWei;
                console.log('💯 [RepayLoan] Paying exact remaining balance:', ethers.formatEther(remainingWei), 'ETH');
            } else {
                // For partial payments, validate and convert
                if (paymentEth > remainingEth + 0.000001) {
                    throw new Error(`Amount exceeds remaining balance of ${remainingEth.toFixed(6)} ETH`);
                }
                const roundedAmount = paymentEth.toFixed(12);
                amountInWei = ethers.parseEther(roundedAmount);
                console.log('💰 [RepayLoan] Partial payment:', roundedAmount, 'ETH');
            }

            console.log('💰 [RepayLoan] Repaying loan:', {
                loanId: selectedLoan,
                amountETH: ethers.formatEther(amountInWei),
                amountWei: amountInWei.toString()
            });

            setStatus("Sending ETH repayment...");
            const tx = await contract.repayLoan(selectedLoan, {
                value: amountInWei
            });

            setStatus("Waiting for confirmation...");
            const receipt = await tx.wait();

            setSuccess(`✅ Repayment successful! Tx: ${receipt.hash.slice(0, 10)}...`);
            setAmount('');
            setSelectedLoan('');

            // Refresh loans after 2 seconds
            setTimeout(() => {
                fetchActiveLoans();
                setSuccess('');
            }, 2000);

        } catch (err) {
            console.error('❌ [RepayLoan] Error:', err);
            if (err.code === 'ACTION_REJECTED') {
                setError("Transaction rejected by user");
            } else {
                setError(err.message || err.reason || "Repayment failed");
            }
        } finally {
            setRepaying(false);
            setStatus('');
        }
    };

    const selectedLoanData = activeLoans.find(l => l.loanId === selectedLoan);
    const remainingBalance = selectedLoanData
        ? (parseFloat(selectedLoanData.totalRepayment) - parseFloat(selectedLoanData.amountRepaid))
        : 0;

    return (
        <div className="dashboard-content">
            <div className="page-header">
                <h1>💰 Repay Loan</h1>
                <p className="subtitle">Make payments on your active loans</p>
            </div>

            {!currentAccount ? (
                <Card>
                    <p className="no-data">Connect your wallet to repay loans.</p>
                </Card>
            ) : loading ? (
                <div className="loading-spinner">Loading active loans...</div>
            ) : activeLoans.length === 0 ? (
                <Card>
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3>No Active Loans</h3>
                        <p>You don't have any active loans to repay.</p>
                    </div>
                </Card>
            ) : (
                <div className="repay-grid">
                    <Card>
                        <h2>Make Payment</h2>

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        {status && <div className="status-message">{status}</div>}

                        <form onSubmit={handleSubmit} className="repay-form">
                            <div className="form-group">
                                <label>Select Loan</label>
                                <select
                                    value={selectedLoan}
                                    onChange={(e) => setSelectedLoan(e.target.value)}
                                    className="select-input"
                                    required
                                    disabled={repaying}
                                >
                                    <option value="">Choose a loan...</option>
                                    {activeLoans.map(loan => {
                                        const remaining = parseFloat(loan.totalRepayment) - parseFloat(loan.amountRepaid);
                                        return (
                                            <option key={loan.loanId} value={loan.loanId}>
                                                Loan #{loan.loanId} - {remaining.toFixed(4)} ETH due
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {selectedLoan && (
                                <>
                                    <div className="loan-summary">
                                        <div className="summary-row">
                                            <span>Lender:</span>
                                            <strong>{selectedLoanData.lenderName}</strong>
                                        </div>
                                        <div className="summary-row">
                                            <span>Original Amount:</span>
                                            <strong>{parseFloat(selectedLoanData.amount).toFixed(4)} ETH</strong>
                                        </div>
                                        <div className="summary-row">
                                            <span>Total Due:</span>
                                            <strong>{parseFloat(selectedLoanData.totalRepayment).toFixed(4)} ETH</strong>
                                        </div>
                                        <div className="summary-row">
                                            <span>Already Paid:</span>
                                            <strong className="text-success">
                                                {parseFloat(selectedLoanData.amountRepaid).toFixed(4)} ETH
                                            </strong>
                                        </div>
                                        <div className="summary-row highlight">
                                            <span>Remaining Balance:</span>
                                            <strong className="text-warning">
                                                {remainingBalance.toFixed(6)} ETH
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="payment-actions">
                                        <Input
                                            type="number"
                                            label="Payment Amount (ETH)"
                                            placeholder="0.01"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            helperText={`Remaining: ${remainingBalance.toFixed(6)} ETH`}
                                            required
                                            disabled={repaying}
                                            step="0.000001"
                                        />

                                        <Button
                                            type="button"
                                            variant="secondary"
                                            fullWidth
                                            onClick={async () => {
                                                try {
                                                    const contract = new ethers.Contract(
                                                        P2P_CONTRACT_ADDRESS,
                                                        P2P_LOAN_MANAGER_ABI,
                                                        signer
                                                    );
                                                    // Get exact remaining balance from contract in wei
                                                    const remainingWei = await contract.getRemainingBalance(selectedLoan);
                                                    // Convert to ETH string
                                                    const exactRemaining = ethers.formatEther(remainingWei);
                                                    setAmount(exactRemaining);
                                                    console.log('💯 Exact remaining from contract:', exactRemaining, 'ETH');
                                                } catch (err) {
                                                    console.error('Error fetching exact balance:', err);
                                                    // Fallback to calculated value
                                                    setAmount(remainingBalance.toFixed(12));
                                                }
                                            }}
                                            disabled={repaying}
                                        >
                                            💯 Pay Full Balance ({remainingBalance.toFixed(6)} ETH)
                                        </Button>
                                    </div>

                                    {amount && parseFloat(amount) > 0 && (
                                        <div className="info-box">
                                            <p><strong>Remaining After Payment:</strong></p>
                                            <p className="highlight">
                                                {Math.max(0, remainingBalance - parseFloat(amount)).toFixed(6)} ETH
                                            </p>
                                            {(remainingBalance - parseFloat(amount)) <= 0.000001 && (
                                                <p className="success-text">✅ This will fully repay the loan!</p>
                                            )}
                                        </div>
                                    )}

                                    <Button type="submit" fullWidth disabled={repaying || !amount}>
                                        {repaying ? 'Processing...' : '💸 Send Repayment'}
                                    </Button>
                                </>
                            )}
                        </form>
                    </Card>

                    <Card>
                        <h2>Active Loans Summary</h2>
                        <div className="loans-summary">
                            {activeLoans.map(loan => {
                                const remaining = parseFloat(loan.totalRepayment) - parseFloat(loan.amountRepaid);
                                const progress = (parseFloat(loan.amountRepaid) / parseFloat(loan.totalRepayment)) * 100;

                                return (
                                    <div key={loan.loanId} className="summary-card">
                                        <div className="summary-header">
                                            <h3>Loan #{loan.loanId}</h3>
                                            <span className="status-badge status-active">Active</span>
                                        </div>
                                        <div className="summary-details">
                                            <div className="detail-item">
                                                <span>Lender:</span>
                                                <span>{loan.lenderName}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span>Total Due:</span>
                                                <span>{parseFloat(loan.totalRepayment).toFixed(6)} ETH</span>
                                            </div>
                                            <div className="detail-item">
                                                <span>Remaining:</span>
                                                <span className="text-warning">
                                                    {remaining.toFixed(6)} ETH
                                                </span>
                                            </div>
                                        </div>
                                        <div className="progress-section">
                                            <div className="progress-label">
                                                <span>Repayment Progress</span>
                                                <span>{progress.toFixed(1)}%</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            )}

            <style>{`
                .repay-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                }

                @media (max-width: 968px) {
                    .repay-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .repay-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .payment-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group label {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .select-input {
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: var(--text-primary);
                    font-size: 1rem;
                }

                .select-input:focus {
                    outline: none;
                    border-color: var(--accent-purple);
                }

                .loan-summary {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 8px;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.95rem;
                }

                .summary-row span {
                    color: var(--text-secondary);
                }

                .summary-row strong {
                    color: var(--text-primary);
                }

                .summary-row.highlight {
                    padding-top: 10px;
                    margin-top: 5px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .info-box {
                    background: rgba(139, 92, 246, 0.1);
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    border-radius: 8px;
                    padding: 15px;
                    text-align: center;
                }

                .info-box .highlight {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--accent-purple);
                    margin: 10px 0;
                }

                .success-text {
                    color: #4ade80;
                    margin-top: 10px;
                    font-weight: 500;
                }

                .text-success {
                    color: #4ade80 !important;
                }

                .text-warning {
                    color: #fbbf24 !important;
                }

                .loans-summary {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .summary-card {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 8px;
                    padding: 15px;
                }

                .summary-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .summary-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    color: var(--text-primary);
                }

                .summary-details {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 15px;
                }

                .detail-item {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.9rem;
                }

                .detail-item span:first-child {
                    color: var(--text-secondary);
                }

                .detail-item span:last-child {
                    color: var(--text-primary);
                    font-weight: 500;
                }

                .progress-section {
                    margin-top: 10px;
                }

                .progress-label {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                .progress-bar {
                    height: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--accent-purple), var(--accent-blue));
                    border-radius: 10px;
                    transition: width 0.3s ease;
                }

                .status-badge {
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    background: rgba(251, 191, 36, 0.1);
                    color: #fbbf24;
                }

                .error-message {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 15px;
                }

                .success-message {
                    background: rgba(74, 222, 128, 0.1);
                    border: 1px solid rgba(74, 222, 128, 0.3);
                    color: #4ade80;
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 15px;
                }

                .status-message {
                    background: rgba(139, 92, 246, 0.1);
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    color: var(--accent-purple);
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 15px;
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                }

                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                    opacity: 0.5;
                }

                .empty-state h3 {
                    margin-bottom: 10px;
                    color: var(--text-primary);
                }

                .empty-state p {
                    color: var(--text-secondary);
                }

                .no-data {
                    text-align: center;
                    padding: 40px;
                    color: var(--text-secondary);
                }
            `}</style>
        </div>
    );
};

export default RepayLoan;
