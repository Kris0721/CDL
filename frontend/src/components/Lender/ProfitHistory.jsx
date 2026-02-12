import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../context/Web3Context';
import Card from '../shared/Card';
import Button from '../shared/Button';

// P2P Loan Manager ABI
const P2P_LOAN_MANAGER_ABI = [
    "function getLenderLoans(address lender) external view returns (uint256[])",
    "function getLoan(uint256 loanId) external view returns (tuple(address borrower, address lender, uint256 amount, uint256 interestRate, uint256 duration, uint256 startTime, uint256 totalRepayment, uint256 amountRepaid, bool funded, bool completed))"
];

const ProfitHistory = () => {
    const { currentAccount, signer } = useWeb3();
    const [profits, setProfits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [totalEarned, setTotalEarned] = useState(0);

    const P2P_CONTRACT_ADDRESS = import.meta.env.VITE_P2P_ETH_LOAN_MANAGER_ADDRESS;

    // Initial fetch when component mounts or account changes
    useEffect(() => {
        if (currentAccount && signer) {
            fetchProfits();
        }
    }, [currentAccount, signer]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!currentAccount || !signer) return;

        const interval = setInterval(() => {
            console.log('🔄 [ProfitHistory] Auto-refreshing profit data...');
            fetchProfits(true); // true = background refresh
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
            console.log('📢 [ProfitHistory] LoanRepaid event detected:', loanId.toString());
            fetchProfits(true);
        };

        const handleLoanCompleted = (loanId) => {
            console.log('📢 [ProfitHistory] LoanCompleted event detected:', loanId.toString());
            fetchProfits(true);
        };

        contract.on('LoanRepaid', handleLoanRepaid);
        contract.on('LoanCompleted', handleLoanCompleted);

        return () => {
            contract.off('LoanRepaid', handleLoanRepaid);
            contract.off('LoanCompleted', handleLoanCompleted);
        };
    }, [currentAccount, signer, P2P_CONTRACT_ADDRESS]);

    const fetchProfits = async (backgroundRefresh = false) => {
        if (backgroundRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            console.log('💰 [ProfitHistory] Fetching profit data for:', currentAccount);

            if (!P2P_CONTRACT_ADDRESS) {
                throw new Error("Contract address not configured");
            }

            const contract = new ethers.Contract(
                P2P_CONTRACT_ADDRESS,
                P2P_LOAN_MANAGER_ABI,
                signer
            );

            // Get all loans funded by this lender
            const loanIds = await contract.getLenderLoans(currentAccount);
            console.log('📊 [ProfitHistory] Funded Loans:', loanIds.map(id => id.toString()));

            if (loanIds.length === 0) {
                setProfits([]);
                setTotalEarned(0);
                setLoading(false);
                return;
            }

            // Fetch details for each loan
            const loanPromises = loanIds.map(async (id) => {
                const loan = await contract.getLoan(id);
                const principal = parseFloat(ethers.formatEther(loan.amount));
                const totalRepayment = parseFloat(ethers.formatEther(loan.totalRepayment));
                const amountRepaid = parseFloat(ethers.formatEther(loan.amountRepaid));
                const expectedInterest = totalRepayment - principal;
                const earnedInterest = amountRepaid - principal;

                return {
                    loanId: id.toString(),
                    principal,
                    expectedInterest,
                    earnedInterest: earnedInterest > 0 ? earnedInterest : 0,
                    amountRepaid,
                    totalRepayment,
                    completed: loan.completed,
                    funded: loan.funded,
                    startTime: parseInt(loan.startTime.toString())
                };
            });

            const allLoans = await Promise.all(loanPromises);

            // Calculate total earned interest
            const total = allLoans.reduce((sum, loan) => sum + loan.earnedInterest, 0);
            setTotalEarned(total);

            // Filter to only show loans that have some repayment
            const profitableLoans = allLoans.filter(loan => loan.amountRepaid > 0);
            setProfits(profitableLoans);

            console.log('✅ [ProfitHistory] Total earned:', total, 'ETH');

        } catch (err) {
            console.error('❌ [ProfitHistory] Error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleManualRefresh = () => {
        console.log('🔄 [ProfitHistory] Manual refresh triggered');
        fetchProfits();
    };

    const formatDate = (timestamp) => {
        if (!timestamp || timestamp === 0) return 'N/A';
        return new Date(timestamp * 1000).toLocaleDateString();
    };

    return (
        <div className="dashboard-content">
            <div className="page-header">
                <div className="header-content">
                    <h1>💰 Profit History</h1>
                    <div className="header-actions">
                        {refreshing && <span className="refreshing-indicator">🔄 Updating...</span>}
                        <Button onClick={handleManualRefresh} disabled={loading}>
                            🔄 Refresh
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="summary-card">
                <div className="total-earnings">
                    <h2>Total Interest Earned</h2>
                    <p className="total-amount">{totalEarned.toFixed(4)} ETH</p>
                    <p className="subtitle">From {profits.length} loan(s)</p>
                </div>
            </Card>

            {loading ? (
                <div className="loading-spinner">Loading profit history...</div>
            ) : profits.length === 0 ? (
                <Card>
                    <div className="empty-state">
                        <div className="empty-icon">📊</div>
                        <h3>No Profit History Yet</h3>
                        <p>You haven't earned any interest yet. Fund loans in the marketplace to start earning!</p>
                    </div>
                </Card>
            ) : (
                <Card>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Loan ID</th>
                                <th>Principal</th>
                                <th>Expected Interest</th>
                                <th>Earned Interest</th>
                                <th>Total Received</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profits.map(profit => (
                                <tr key={profit.loanId}>
                                    <td className="loan-id">#{profit.loanId}</td>
                                    <td>{profit.principal.toFixed(4)} ETH</td>
                                    <td className="text-muted">{profit.expectedInterest.toFixed(4)} ETH</td>
                                    <td className="amount-cell text-success">
                                        +{profit.earnedInterest.toFixed(4)} ETH
                                    </td>
                                    <td>{profit.amountRepaid.toFixed(4)} ETH</td>
                                    <td>
                                        <span className={`status-badge ${profit.completed ? 'status-completed' : 'status-active'}`}>
                                            {profit.completed ? 'Completed' : 'Active'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            <style>{`
                .page-header {
                    margin-bottom: 20px;
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
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

                .summary-card {
                    margin-bottom: 30px;
                }

                .total-earnings {
                    text-align: center;
                    padding: 20px;
                }

                .total-earnings h2 {
                    color: var(--text-secondary);
                    font-size: 1rem;
                    margin-bottom: 15px;
                    font-weight: 500;
                }

                .total-amount {
                    font-size: 3rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin: 10px 0;
                }

                .subtitle {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }

                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .data-table thead {
                    background: rgba(255, 255, 255, 0.05);
                }

                .data-table th {
                    padding: 15px;
                    text-align: left;
                    font-weight: 600;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .data-table td {
                    padding: 15px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    color: var(--text-primary);
                }

                .data-table tbody tr:hover {
                    background: rgba(255, 255, 255, 0.02);
                }

                .loan-id {
                    font-family: monospace;
                    color: var(--accent-purple);
                }

                .amount-cell {
                    font-weight: 600;
                }

                .text-success {
                    color: #4ade80 !important;
                }

                .text-muted {
                    color: var(--text-secondary);
                }

                .status-badge {
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .status-completed {
                    background: rgba(74, 222, 128, 0.1);
                    color: #4ade80;
                }

                .status-active {
                    background: rgba(251, 191, 36, 0.1);
                    color: #fbbf24;
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
            `}</style>
        </div>
    );
};

export default ProfitHistory;
