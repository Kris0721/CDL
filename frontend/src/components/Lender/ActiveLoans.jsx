import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../context/Web3Context';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { useNavigate } from 'react-router-dom';

// P2P Loan Manager ABI
const P2P_LOAN_MANAGER_ABI = [
    "function getLenderLoans(address lender) external view returns (uint256[])",
    "function getLoan(uint256 loanId) external view returns (tuple(address borrower, address lender, uint256 amount, uint256 interestRate, uint256 duration, uint256 startTime, uint256 totalRepayment, uint256 amountRepaid, bool funded, bool completed))"
];

const ActiveLoans = () => {
    const { currentAccount, signer } = useWeb3();
    const navigate = useNavigate();
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const P2P_CONTRACT_ADDRESS = import.meta.env.VITE_P2P_ETH_LOAN_MANAGER_ADDRESS;

    // Initial fetch when component mounts or account changes
    useEffect(() => {
        if (currentAccount && signer) {
            fetchActiveLoans();
        }
    }, [currentAccount, signer]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!currentAccount || !signer) return;

        const interval = setInterval(() => {
            console.log('🔄 [ActiveLoans] Auto-refreshing loan data...');
            fetchActiveLoans(true); // true = background refresh
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [currentAccount, signer]);

    // Listen for blockchain events
    useEffect(() => {
        if (!currentAccount || !signer || !P2P_CONTRACT_ADDRESS) return;

        const contract = new ethers.Contract(
            P2P_CONTRACT_ADDRESS,
            [
                "event LoanRepaid(uint256 indexed loanId, uint256 amount, uint256 remaining)",
                "event LoanCompleted(uint256 indexed loanId)"
            ],
            signer
        );

        const handleLoanRepaid = (loanId, amount, remaining) => {
            console.log('📢 [ActiveLoans] LoanRepaid event detected:', loanId.toString());
            fetchActiveLoans(true);
        };

        const handleLoanCompleted = (loanId) => {
            console.log('📢 [ActiveLoans] LoanCompleted event detected:', loanId.toString());
            fetchActiveLoans(true);
        };

        contract.on('LoanRepaid', handleLoanRepaid);
        contract.on('LoanCompleted', handleLoanCompleted);

        return () => {
            contract.off('LoanRepaid', handleLoanRepaid);
            contract.off('LoanCompleted', handleLoanCompleted);
        };
    }, [currentAccount, signer, P2P_CONTRACT_ADDRESS]);

    const fetchActiveLoans = async (backgroundRefresh = false) => {
        if (backgroundRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError('');

        try {
            console.log('🔍 [Lender ActiveLoans] Fetching loans funded by:', currentAccount);

            if (!P2P_CONTRACT_ADDRESS) {
                throw new Error("Contract address not configured");
            }

            const contract = new ethers.Contract(
                P2P_CONTRACT_ADDRESS,
                P2P_LOAN_MANAGER_ABI,
                signer
            );

            // Get all loan IDs funded by this lender
            const loanIds = await contract.getLenderLoans(currentAccount);
            console.log('📊 [Lender ActiveLoans] Funded Loan IDs:', loanIds.map(id => id.toString()));

            if (loanIds.length === 0) {
                setLoans([]);
                setLoading(false);
                return;
            }

            // Fetch details for each loan
            const loanPromises = loanIds.map(async (id) => {
                const loan = await contract.getLoan(id);
                return {
                    loanId: id.toString(),
                    borrower: loan.borrower,
                    borrowerName: `${loan.borrower.slice(0, 6)}...${loan.borrower.slice(-4)}`,
                    amount: ethers.formatEther(loan.amount),
                    interestRate: parseFloat(loan.interestRate.toString()) / 100,
                    duration: parseInt(loan.duration.toString()) / (24 * 60 * 60),
                    startTime: parseInt(loan.startTime.toString()),
                    totalRepayment: ethers.formatEther(loan.totalRepayment),
                    amountRepaid: ethers.formatEther(loan.amountRepaid),
                    funded: loan.funded,
                    completed: loan.completed
                };
            });

            const allLoans = await Promise.all(loanPromises);

            // Filter to only show ACTIVE loans (funded but not completed)
            const activeLoans = allLoans.filter(loan => loan.funded && !loan.completed);

            console.log('✅ [Lender ActiveLoans] Found', activeLoans.length, 'active loans');
            setLoans(activeLoans);

        } catch (err) {
            console.error('❌ [Lender ActiveLoans] Error:', err);
            setError(err.message || 'Failed to fetch active loans');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleManualRefresh = () => {
        console.log('🔄 [ActiveLoans] Manual refresh triggered');
        fetchActiveLoans();
    };

    const calculateTimeRemaining = (startTime, duration) => {
        if (!startTime || startTime === 0) return 'Not started';

        const now = Math.floor(Date.now() / 1000);
        const endTime = startTime + (duration * 24 * 60 * 60);
        const remaining = endTime - now;

        if (remaining <= 0) return 'Overdue!';

        const days = Math.floor(remaining / (24 * 60 * 60));
        return `${days} days`;
    };

    const calculateProgress = (amountRepaid, totalRepayment) => {
        const repaid = parseFloat(amountRepaid);
        const total = parseFloat(totalRepayment);
        if (total === 0) return 0;
        return Math.min((repaid / total) * 100, 100);
    };

    const calculateExpectedReturn = (amount, totalRepayment) => {
        const principal = parseFloat(amount);
        const total = parseFloat(totalRepayment);
        return total - principal;
    };

    return (
        <div className="dashboard-content">
            <div className="page-header">
                <div className="header-content">
                    <div>
                        <h1>📊 Active Loans</h1>
                        <p className="subtitle">Loans you've funded that are currently active</p>
                    </div>
                    <div className="header-actions">
                        {refreshing && <span className="refreshing-indicator">🔄 Updating...</span>}
                        <Button onClick={handleManualRefresh} disabled={loading}>
                            🔄 Refresh
                        </Button>
                    </div>
                </div>
            </div>

            {!currentAccount ? (
                <Card>
                    <p className="no-data">Connect your wallet to view active loans.</p>
                </Card>
            ) : loading ? (
                <div className="loading-spinner">Loading active loans...</div>
            ) : error ? (
                <Card className="error-card">
                    <p className="error-message">❌ {error}</p>
                    <Button onClick={fetchActiveLoans}>Retry</Button>
                </Card>
            ) : loans.length === 0 ? (
                <Card>
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3>No Active Loans</h3>
                        <p>You haven't funded any loans yet. Visit the marketplace to fund loan requests.</p>
                        <Button onClick={() => navigate('/lender/marketplace')}>
                            Go to Marketplace
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="loans-grid">
                    {loans.map(loan => {
                        const remaining = parseFloat(loan.totalRepayment) - parseFloat(loan.amountRepaid);
                        const progress = calculateProgress(loan.amountRepaid, loan.totalRepayment);
                        const timeLeft = calculateTimeRemaining(loan.startTime, loan.duration);
                        const expectedReturn = calculateExpectedReturn(loan.amount, loan.totalRepayment);

                        return (
                            <Card key={loan.loanId} className="loan-card glass-card">
                                <div className="loan-header">
                                    <h3>Loan #{loan.loanId}</h3>
                                    <span className="status-badge status-active">Active</span>
                                </div>

                                <div className="loan-details">
                                    <div className="detail-row">
                                        <span>Borrower:</span>
                                        <strong>{loan.borrowerName}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Principal Lent:</span>
                                        <strong>{parseFloat(loan.amount).toFixed(4)} ETH</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Interest Rate:</span>
                                        <strong>{loan.interestRate}%</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Expected Return:</span>
                                        <strong className="text-success">
                                            +{expectedReturn.toFixed(4)} ETH
                                        </strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Duration:</span>
                                        <strong>{loan.duration} days</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Time Remaining:</span>
                                        <strong className={timeLeft === 'Overdue!' ? 'text-danger' : ''}>
                                            {timeLeft}
                                        </strong>
                                    </div>
                                    <div className="detail-row highlight-row">
                                        <span>Total Expected:</span>
                                        <strong className="amount-due">
                                            {parseFloat(loan.totalRepayment).toFixed(4)} ETH
                                        </strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Amount Received:</span>
                                        <strong className="text-success">
                                            {parseFloat(loan.amountRepaid).toFixed(4)} ETH
                                        </strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Still Owed:</span>
                                        <strong className="text-warning">
                                            {remaining.toFixed(4)} ETH
                                        </strong>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="repayment-progress">
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
                            </Card>
                        );
                    })}
                </div>
            )}

            <style>{`
                .page-header {
                    margin-bottom: 30px;
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 20px;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .refreshing-indicator {
                    color: var(--accent-purple);
                    font-size: 0.9rem;
                    animation: pulse 1.5s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .loans-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }

                .loan-card {
                    padding: 20px;
                }

                .loan-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .loan-header h3 {
                    margin: 0;
                    font-size: 1.2rem;
                    color: var(--text-primary);
                }

                .loan-details {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.95rem;
                }

                .detail-row span {
                    color: var(--text-secondary);
                }

                .detail-row strong {
                    color: var(--text-primary);
                    font-weight: 600;
                }

                .highlight-row {
                    padding-top: 12px;
                    margin-top: 8px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .amount-due {
                    color: var(--accent-purple);
                    font-size: 1.1rem;
                }

                .text-success {
                    color: #4ade80 !important;
                }

                .text-warning {
                    color: #fbbf24 !important;
                }

                .text-danger {
                    color: #ef4444 !important;
                }

                .repayment-progress {
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .progress-label {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }

                .progress-bar {
                    height: 8px;
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

                .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                }

                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                }

                .empty-state h3 {
                    margin-bottom: 10px;
                    color: var(--text-primary);
                }

                .empty-state p {
                    color: var(--text-secondary);
                    margin-bottom: 20px;
                }

                .no-data {
                    text-align: center;
                    padding: 40px;
                    color: var(--text-secondary);
                }

                .error-card {
                    text-align: center;
                    padding: 30px;
                }

                .error-message {
                    color: #ef4444;
                    margin-bottom: 15px;
                }
            `}</style>
        </div>
    );
};

export default ActiveLoans;
