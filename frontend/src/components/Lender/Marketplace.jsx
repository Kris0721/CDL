import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../context/Web3Context';
import Button from '../shared/Button';
import Card from '../shared/Card';

// P2P Loan Manager ABI
const P2P_LOAN_MANAGER_ABI = [
    "function requestLoan(uint256 amount, uint256 duration) external returns (uint256)",
    "function fundLoan(uint256 loanId) external",
    "function repayLoan(uint256 loanId, uint256 amount) external",
    "function getLoan(uint256 loanId) external view returns (tuple(address borrower, address lender, uint256 amount, uint256 interestRate, uint256 duration, uint256 startTime, uint256 totalRepayment, uint256 amountRepaid, bool funded, bool completed))",
    "function getBorrowerLoans(address borrower) external view returns (uint256[])",
    "function getLenderLoans(address lender) external view returns (uint256[])",
    "function getRemainingBalance(uint256 loanId) external view returns (uint256)",
    "function loanCounter() external view returns (uint256)",
    "event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 duration, uint256 interestRate)",
    "event LoanFunded(uint256 indexed loanId, address indexed lender, address indexed borrower, uint256 amount)"
];

const Marketplace = () => {
    const { signer, currentAccount, connectWallet, isConnecting } = useWeb3();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [fundLoading, setFundLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [status, setStatus] = useState('');

    const P2P_CONTRACT_ADDRESS = import.meta.env.VITE_P2P_ETH_LOAN_MANAGER_ADDRESS;

    useEffect(() => {
        if (currentAccount && signer) {
            fetchLoanRequests();
        }
    }, [currentAccount, signer]);

    const fetchLoanRequests = async () => {
        console.log('🔍 [Marketplace] Starting to fetch loan requests...');
        console.log('📍 [Marketplace] Contract Address:', P2P_CONTRACT_ADDRESS);

        try {
            if (!P2P_CONTRACT_ADDRESS) {
                const errorMsg = "P2P Contract address not configured in .env";
                console.error("❌ [Marketplace]", errorMsg);
                setError(errorMsg);
                setLoading(false);
                return;
            }

            if (!signer) {
                const errorMsg = "Wallet not connected";
                console.error("❌ [Marketplace]", errorMsg);
                setError(errorMsg);
                setLoading(false);
                return;
            }

            const p2pContract = new ethers.Contract(
                P2P_CONTRACT_ADDRESS,
                P2P_LOAN_MANAGER_ABI,
                signer
            );

            // Get total number of loans
            console.log('📊 [Marketplace] Fetching loan counter...');
            const loanCounter = await p2pContract.loanCounter();
            const loanCountNum = Number(loanCounter);
            console.log('📊 [Marketplace] Total loans in contract:', loanCountNum);

            if (loanCountNum === 0) {
                console.log('ℹ️ [Marketplace] No loans have been created yet');
                setRequests([]);
                setLoading(false);
                return;
            }

            // Fetch all loans and filter for unfunded requests
            const allRequests = [];
            console.log(`🔄 [Marketplace] Fetching ${loanCountNum} loan(s)...`);

            for (let i = 0; i < loanCountNum; i++) {
                try {
                    console.log(`  📄 [Marketplace] Fetching loan ID ${i}...`);
                    const loan = await p2pContract.getLoan(i);

                    console.log(`  📄 [Marketplace] Loan ${i} details:`, {
                        borrower: loan.borrower,
                        amount: ethers.formatUnits(loan.amount, 6),
                        funded: loan.funded,
                        completed: loan.completed
                    });

                    // Only show loans that are not funded yet
                    if (!loan.funded && !loan.completed) {
                        const loanData = {
                            loanId: i,
                            borrower: loan.borrower,
                            borrowerName: `${loan.borrower.slice(0, 6)}...${loan.borrower.slice(-4)}`,
                            amount: parseFloat(ethers.formatEther(loan.amount)),
                            duration: parseInt(loan.duration.toString()) / (24 * 60 * 60), // Convert to days
                            interestRate: parseFloat(loan.interestRate.toString()) / 100, // Convert basis points to percentage
                            totalRepayment: parseFloat(ethers.formatEther(loan.totalRepayment))
                        };
                        allRequests.push(loanData);
                        console.log(`  ✅ [Marketplace] Added unfunded loan ${i} to marketplace`);
                    } else {
                        console.log(`  ⏭️ [Marketplace] Skipping loan ${i} (funded: ${loan.funded}, completed: ${loan.completed})`);
                    }
                } catch (err) {
                    console.error(`❌ [Marketplace] Error fetching loan ${i}:`, err);
                    setError(`Error fetching loan ${i}: ${err.message}`);
                }
            }

            console.log(`✅ [Marketplace] Found ${allRequests.length} unfunded loan(s) out of ${loanCountNum} total`);
            setRequests(allRequests);
            setError(''); // Clear any previous errors
        } catch (err) {
            console.error('❌ [Marketplace] Failed to fetch loan requests:', err);
            setError(`Failed to load marketplace: ${err.message || err.reason || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFundLoan = async (loan) => {
        setSelectedLoan(loan);
        setError('');
        setSuccess('');
        setStatus('');
        setFundLoading(true);

        try {
            if (!P2P_CONTRACT_ADDRESS) {
                throw new Error("Contract address not configured");
            }

            const p2pContract = new ethers.Contract(
                P2P_CONTRACT_ADDRESS,
                P2P_LOAN_MANAGER_ABI,
                signer
            );

            const amountInWei = ethers.parseEther(loan.amount.toString());

            console.log('💰 [Marketplace] Funding loan with ETH:', {
                loanId: loan.loanId,
                amount: loan.amount,
                amountInWei: amountInWei.toString()
            });

            // Fund the loan with ETH (no approval needed!)
            setStatus("Sending ETH to fund loan...");
            const fundTx = await p2pContract.fundLoan(loan.loanId, {
                value: amountInWei
            });
            const receipt = await fundTx.wait();

            setSuccess(`✅ Loan funded successfully! Tx: ${receipt.hash.slice(0, 10)}...`);

            // Refresh marketplace
            setTimeout(() => {
                fetchLoanRequests();
                setSelectedLoan(null);
                setSuccess('');
            }, 3000);

        } catch (err) {
            console.error(err);
            if (err.code === 'ACTION_REJECTED') {
                setError("Transaction rejected by user");
            } else if (err.message?.includes('Borrower cannot fund own loan')) {
                setError("You cannot fund your own loan request");
            } else if (err.message?.includes('already funded')) {
                setError("This loan has already been funded");
            } else {
                setError(err.reason || err.message || "Transaction failed");
            }
        } finally {
            setFundLoading(false);
            setStatus('');
        }
    };

    return (
        <div className="marketplace-container">
            <div className="header-section">
                <div>
                    <h2 className="page-title">Loan Marketplace (P2P)</h2>
                    <p className="page-subtitle">Browse and fund open loan requests directly on Sepolia testnet.</p>
                </div>
                {currentAccount && (
                    <Button onClick={fetchLoanRequests} disabled={loading} variant="secondary">
                        {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
                    </Button>
                )}
            </div>

            {/* Debug Info Panel */}
            {currentAccount && (
                <div className="debug-panel">
                    <div className="debug-title">🔧 Debug Info</div>
                    <div className="debug-content">
                        <div className="debug-item">
                            <span className="debug-label">Contract:</span>
                            <span className="debug-value">{P2P_CONTRACT_ADDRESS || 'Not configured'}</span>
                        </div>
                        <div className="debug-item">
                            <span className="debug-label">Total Loans:</span>
                            <span className="debug-value">{requests.length} unfunded</span>
                        </div>
                        <div className="debug-item">
                            <span className="debug-label">Wallet:</span>
                            <span className="debug-value">{currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}</span>
                        </div>
                    </div>
                </div>
            )}

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            {status && <div className="info-message">{status}</div>}

            {!currentAccount ? (
                <div className="connect-prompt">
                    <p>Connect your wallet to view and fund loan requests.</p>
                    <Button onClick={connectWallet} disabled={isConnecting}>
                        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </Button>
                </div>
            ) : loading ? (
                <div className="loading-spinner">Loading marketplace...</div>
            ) : requests.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No Open Requests</h3>
                    <p>There are currently no borrowers looking for loans.</p>
                    <p className="hint">Borrowers can request loans in the Borrower Dashboard.</p>
                </div>
            ) : (
                <>
                    <div className="requests-grid">
                        {requests.map(request => (
                            <div key={request.loanId} className="loan-request-card glass-card">
                                <div className="request-header">
                                    <span className="borrower-name">{request.borrowerName}</span>
                                    <span className="request-amount">{request.amount.toFixed(4)} ETH</span>
                                </div>

                                <div className="request-details">
                                    <div className="detail-item">
                                        <span className="label">Duration</span>
                                        <span className="value">{request.duration} Days</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Interest Rate</span>
                                        <span className="value">{request.interestRate}%</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Total Repayment</span>
                                        <span className="value credit-good">{request.totalRepayment.toFixed(4)} ETH</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Loan ID</span>
                                        <span className="value">#{request.loanId}</span>
                                    </div>
                                </div>

                                <Button
                                    className="btn-fund"
                                    onClick={() => handleFundLoan(request)}
                                    disabled={fundLoading && selectedLoan?.loanId === request.loanId}
                                    variant="primary"
                                    fullWidth
                                >
                                    {fundLoading && selectedLoan?.loanId === request.loanId
                                        ? 'Funding...'
                                        : '💰 Fund This Loan'}
                                </Button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <style>{`
                .marketplace-container {
                    padding: 20px;
                }
                .header-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                }
                .page-subtitle {
                    color: var(--text-secondary);
                    margin-bottom: 10px;
                }
                .debug-panel {
                    background: rgba(99, 102, 241, 0.1);
                    border: 1px solid rgba(99, 102, 241, 0.3);
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                }
                .debug-title {
                    font-weight: 600;
                    color: #6366f1;
                    margin-bottom: 12px;
                    font-size: 0.9rem;
                }
                .debug-content {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .debug-item {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.85rem;
                }
                .debug-label {
                    color: var(--text-secondary);
                    font-weight: 500;
                }
                .debug-value {
                    color: var(--text-primary);
                    font-family: monospace;
                    font-size: 0.8rem;
                }
                .connect-prompt {
                    text-align: center;
                    padding: 60px 20px;
                }
                .connect-prompt p {
                    margin-bottom: 20px;
                    color: var(--text-secondary);
                }
                .requests-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }
                .loan-request-card {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    transition: transform 0.2s, box-shadow 0.2s;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                }
                .loan-request-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
                }
                .request-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    padding-bottom: 12px;
                }
                .borrower-name {
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: 0.9rem;
                }
                .request-amount {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--primary-light);
                }
                .request-details {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                .detail-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .detail-item .label {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .detail-item .value {
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: 0.95rem;
                }
                .credit-good {
                    color: var(--success);
                }
                .btn-fund {
                    margin-top: 8px;
                }
                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                }
                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                }
                .hint {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    margin-top: 10px;
                }
                .loading-spinner {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--text-secondary);
                }
                .error-message {
                    padding: 16px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 8px;
                    color: #ef4444;
                    margin-bottom: 20px;
                }
                .success-message {
                    padding: 16px;
                    background: rgba(34, 197, 94, 0.1);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    border-radius: 8px;
                    color: #22c55e;
                    margin-bottom: 20px;
                }
                .info-message {
                    padding: 16px;
                    background: rgba(99, 102, 241, 0.1);
                    border: 1px solid rgba(99, 102, 241, 0.3);
                    border-radius: 8px;
                    color: #6366f1;
                    margin-bottom: 20px;
                }
            `}</style>
        </div>
    );
};

export default Marketplace;
