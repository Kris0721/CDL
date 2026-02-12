import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../context/Web3Context';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Input from '../shared/Input';

// P2P Loan Manager ABI
const P2P_LOAN_MANAGER_ABI = [
    "function requestLoan(uint256 amount, uint256 duration) external returns (uint256)",
    "function getLoan(uint256 loanId) external view returns (tuple(address borrower, address lender, uint256 amount, uint256 interestRate, uint256 duration, uint256 startTime, uint256 totalRepayment, uint256 amountRepaid, bool funded, bool completed))",
    "function getBorrowerLoans(address borrower) external view returns (uint256[])",
    "function loanCounter() external view returns (uint256)",
    "event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 duration, uint256 interestRate)"
];

const RequestLoan = () => {
    const { signer, currentAccount, connectWallet, isConnecting } = useWeb3();
    const [formData, setFormData] = useState({
        amount: '',
        duration: '30',
        purpose: ''
    });

    const [myRequests, setMyRequests] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const P2P_CONTRACT_ADDRESS = import.meta.env.VITE_P2P_ETH_LOAN_MANAGER_ADDRESS;

    useEffect(() => {
        if (currentAccount && signer) {
            fetchMyRequests();
        }
    }, [currentAccount, signer]);

    const fetchMyRequests = async () => {
        console.log('🔍 [RequestLoan] Fetching borrower loan requests...');
        console.log('📍 [RequestLoan] Contract Address:', P2P_CONTRACT_ADDRESS);
        console.log('👤 [RequestLoan] Borrower Account:', currentAccount);

        try {
            if (!P2P_CONTRACT_ADDRESS) return;

            const p2pContract = new ethers.Contract(
                P2P_CONTRACT_ADDRESS,
                P2P_LOAN_MANAGER_ABI,
                signer
            );

            // Get loan IDs for this borrower
            const loanIds = await p2pContract.getBorrowerLoans(currentAccount);
            console.log('📊 [RequestLoan] Loan IDs for borrower:', loanIds.map(id => id.toString()));

            // Fetch details for each loan
            const requests = await Promise.all(
                loanIds.map(async (id) => {
                    const loan = await p2pContract.getLoan(id);
                    console.log(`  📄 [RequestLoan] Loan #${id.toString()} details:`, {
                        amount: ethers.formatUnits(loan.amount, 6),
                        funded: loan.funded,
                        completed: loan.completed
                    });

                    return {
                        loanId: id.toString(),
                        amount: ethers.formatEther(loan.amount),
                        duration: parseInt(loan.duration.toString()) / (24 * 60 * 60),
                        interestRate: parseFloat(loan.interestRate.toString()) / 100,
                        totalRepayment: ethers.formatEther(loan.totalRepayment),
                        amountRepaid: ethers.formatEther(loan.amountRepaid),
                        funded: loan.funded,
                        completed: loan.completed,
                        lender: loan.lender,
                        lenderName: loan.lender !== ethers.ZeroAddress
                            ? `${loan.lender.slice(0, 6)}...${loan.lender.slice(-4)}`
                            : 'Waiting for lender'
                    };
                })
            );

            console.log(`✅ [RequestLoan] Found ${requests.length} loan(s) for this borrower`);
            setMyRequests(requests);
        } catch (err) {
            console.error('❌ [RequestLoan] Failed to fetch requests:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        setStatus('');

        console.log('🚀 [RequestLoan] Starting loan request submission...');
        console.log('📍 [RequestLoan] Contract Address:', P2P_CONTRACT_ADDRESS);
        console.log('👤 [RequestLoan] Borrower Account:', currentAccount);

        if (!currentAccount || !signer) {
            setError("Please connect your wallet first");
            setLoading(false);
            return;
        }

        try {
            if (!P2P_CONTRACT_ADDRESS) {
                throw new Error("P2P Contract address not configured");
            }

            const p2pContract = new ethers.Contract(
                P2P_CONTRACT_ADDRESS,
                P2P_LOAN_MANAGER_ABI,
                signer
            );

            // Parse amount (ETH has 18 decimals)
            const amountInWei = ethers.parseEther(formData.amount);
            const durationInSeconds = parseInt(formData.duration) * 24 * 60 * 60;

            console.log('📝 [RequestLoan] Loan Details:', {
                amount: formData.amount,
                amountInWei: amountInWei.toString(),
                duration: formData.duration,
                durationInSeconds: durationInSeconds,
                purpose: formData.purpose
            });

            setStatus("Please confirm transaction in your wallet...");
            console.log('⏳ [RequestLoan] Waiting for user to confirm transaction...');

            const tx = await p2pContract.requestLoan(amountInWei, durationInSeconds);
            console.log('✅ [RequestLoan] Transaction sent! Hash:', tx.hash);

            setStatus("Submitting loan request to Sepolia...");
            console.log('⏳ [RequestLoan] Waiting for transaction confirmation...');

            const receipt = await tx.wait();
            console.log('✅ [RequestLoan] Transaction confirmed! Receipt:', receipt);

            // Try to extract loan ID from events
            let loanId = null;
            if (receipt.logs && receipt.logs.length > 0) {
                try {
                    const loanRequestedEvent = receipt.logs.find(log => {
                        try {
                            const parsed = p2pContract.interface.parseLog(log);
                            return parsed && parsed.name === 'LoanRequested';
                        } catch {
                            return false;
                        }
                    });

                    if (loanRequestedEvent) {
                        const parsed = p2pContract.interface.parseLog(loanRequestedEvent);
                        loanId = parsed.args.loanId.toString();
                        console.log('🎉 [RequestLoan] Loan ID from event:', loanId);
                    }
                } catch (err) {
                    console.warn('⚠️ [RequestLoan] Could not parse loan ID from events:', err);
                }
            }

            const successMsg = loanId
                ? `✅ Loan request submitted! Loan ID: #${loanId} | Tx: ${receipt.hash.slice(0, 10)}...`
                : `✅ Loan request submitted! Tx: ${receipt.hash.slice(0, 10)}...`;

            setSuccess(successMsg);
            console.log('🎉 [RequestLoan] Success:', successMsg);

            setFormData({ amount: '', duration: '30', purpose: '' });

            // Refresh requests
            console.log('🔄 [RequestLoan] Refreshing loan list in 2 seconds...');
            setTimeout(() => fetchMyRequests(), 2000);
        } catch (err) {
            console.error('❌ [RequestLoan] Error:', err);
            if (err.code === 'ACTION_REJECTED') {
                setError("Transaction rejected by user");
            } else {
                setError(err.reason || err.message || "Transaction failed");
            }
        } finally {
            setLoading(false);
            setStatus('');
        }
    };

    const getStatusBadge = (request) => {
        if (request.completed) return { text: 'Completed', color: 'green' };
        if (request.funded) return { text: 'Funded', color: 'blue' };
        return { text: 'Open', color: 'orange' };
    };

    return (
        <div className="dashboard-content">
            <h1>Request Loan (P2P)</h1>

            <div className="request-loan-container">
                {/* Form Section */}
                <Card className="request-form-card">
                    <h2>Request New Loan</h2>
                    <p className="subtitle">Submit your loan request to the P2P marketplace on Sepolia.</p>

                    {!currentAccount ? (
                        <div className="connect-prompt">
                            <p>Connect your wallet to request a loan on Sepolia testnet.</p>
                            <Button onClick={connectWallet} disabled={isConnecting}>
                                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="loan-form">
                            {error && <div className="error-message">{error}</div>}
                            {success && <div className="success-message">{success}</div>}
                            {status && <div className="info-message">{status}</div>}

                            <Input
                                type="number"
                                name="amount"
                                label="Amount (ETH)"
                                placeholder="0.1"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />

                            <div className="form-group">
                                <label>Duration</label>
                                <select
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    className="select-input"
                                    disabled={loading}
                                >
                                    <option value="30">30 days (6% APR)</option>
                                    <option value="60">60 days (7.5% APR)</option>
                                    <option value="90">90 days (8.5% APR)</option>
                                    <option value="180">180 days (10% APR)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Purpose (Optional)</label>
                                <textarea
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleChange}
                                    placeholder="Why do you need this loan?"
                                    className="textarea-input"
                                    rows="3"
                                    disabled={loading}
                                />
                            </div>

                            <Button type="submit" fullWidth loading={loading} disabled={!formData.amount}>
                                {loading ? 'Submitting...' : '📝 Request Loan'}
                            </Button>
                        </form>
                    )}
                </Card>

                {/* My Requests Section */}
                <div className="open-requests-section">
                    <h2>Your Loan Requests ({myRequests.length})</h2>
                    {!currentAccount ? (
                        <p className="no-requests">Connect wallet to view your requests.</p>
                    ) : myRequests.length === 0 ? (
                        <p className="no-requests">You have no loan requests yet.</p>
                    ) : (
                        <div className="requests-list">
                            {myRequests.map(req => {
                                const status = getStatusBadge(req);
                                return (
                                    <Card key={req.loanId} className="request-item-card">
                                        <div className="request-summary">
                                            <div className="req-info">
                                                <span className="amount">{parseFloat(req.amount).toFixed(4)} ETH</span>
                                                <span className="duration">{req.duration} Days @ {req.interestRate}%</span>
                                                <span className="loan-id">Loan ID: #{req.loanId}</span>
                                                {req.funded && (
                                                    <span className="lender-info">Lender: {req.lenderName}</span>
                                                )}
                                            </div>
                                            <div className={`status-badge status-${status.color}`}>
                                                {status.text}
                                            </div>
                                        </div>
                                        {req.funded && !req.completed && (
                                            <div className="repayment-info">
                                                <div className="repay-detail">
                                                    <span>Total to Repay:</span>
                                                    <span className="value">{parseFloat(req.totalRepayment).toFixed(4)} ETH</span>
                                                </div>
                                                <div className="repay-detail">
                                                    <span>Amount Repaid:</span>
                                                    <span className="value">{parseFloat(req.amountRepaid).toFixed(4)} ETH</span>
                                                </div>
                                                <div className="repay-detail">
                                                    <span>Remaining:</span>
                                                    <span className="value highlight">{(parseFloat(req.totalRepayment) - parseFloat(req.amountRepaid)).toFixed(4)} ETH</span>
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .request-loan-container {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                }
                .subtitle {
                    color: var(--text-secondary);
                    margin-bottom: 20px;
                    font-size: 0.9rem;
                }
                .connect-prompt {
                    text-align: center;
                    padding: 40px 20px;
                }
                .connect-prompt p {
                    margin-bottom: 20px;
                    color: var(--text-secondary);
                }
                .requests-list {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                .request-summary {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .req-info {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .req-info .amount {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: var(--primary-light);
                }
                .req-info .duration {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }
                .req-info .loan-id {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                }
                .req-info .lender-info {
                    font-size: 0.85rem;
                    color: var(--success);
                    margin-top: 5px;
                }
                .status-badge {
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }
                .status-orange {
                    background: rgba(251, 146, 60, 0.2);
                    color: #fb923c;
                }
                .status-blue {
                    background: rgba(59, 130, 246, 0.2);
                    color: #3b82f6;
                }
                .status-green {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                }
                .repayment-info {
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .repay-detail {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.9rem;
                }
                .repay-detail .value {
                    font-weight: 600;
                }
                .repay-detail .highlight {
                    color: var(--primary-light);
                }
                .info-message {
                    padding: 10px;
                    background: rgba(99, 102, 241, 0.1);
                    border-radius: 8px;
                    margin: 10px 0;
                    color: #6366f1;
                }
                .error-message {
                    padding: 10px;
                    background: rgba(239, 68, 68, 0.1);
                    border-radius: 8px;
                    margin: 10px 0;
                    color: #ef4444;
                }
                .success-message {
                    padding: 10px;
                    background: rgba(34, 197, 94, 0.1);
                    border-radius: 8px;
                    margin: 10px 0;
                    color: #22c55e;
                }
                @media (max-width: 768px) {
                    .request-loan-container {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default RequestLoan;
