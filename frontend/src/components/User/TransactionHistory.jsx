import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../../services/api';
import Card from '../shared/Card';
import './TransactionHistory.css';

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, [typeFilter]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params = typeFilter ? { type: typeFilter } : {};
            const response = await transactionAPI.getTransactions(params);
            setTransactions(response.data.transactions);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleString();
    };

    const getTransactionIcon = (type) => {
        return type === 'disbursement' ? '↓' : '↑';
    };

    return (
        <div className="transaction-history">
            <div className="header">
                <h1>Transaction History</h1>
                <div className="filters">
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                        <option value="">All Transactions</option>
                        <option value="disbursement">Disbursements</option>
                        <option value="repayment">Repayments</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading transactions...</div>
            ) : transactions.length === 0 ? (
                <Card>
                    <p className="no-transactions">No transactions found</p>
                </Card>
            ) : (
                <div className="transactions-list">
                    {transactions.map((tx) => (
                        <Card key={tx.transactionId} className="transaction-card">
                            <div className="transaction-header">
                                <div className="transaction-type">
                                    <span className={`icon ${tx.type}`}>
                                        {getTransactionIcon(tx.type)}
                                    </span>
                                    <span className="type-label">
                                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                                    </span>
                                </div>
                                <div className={`amount ${tx.type}`}>
                                    {tx.type === 'disbursement' ? '+' : '-'}
                                    ${parseFloat(tx.amount).toLocaleString()}
                                </div>
                            </div>

                            <div className="transaction-details">
                                <div className="detail-row">
                                    <span>Transaction ID:</span>
                                    <span className="mono">{tx.transactionId}</span>
                                </div>
                                <div className="detail-row">
                                    <span>Loan ID:</span>
                                    <span>{tx.loanId}</span>
                                </div>
                                <div className="detail-row">
                                    <span>Date:</span>
                                    <span>{formatDate(tx.createdAt)}</span>
                                </div>
                                {tx.txHash && (
                                    <div className="detail-row">
                                        <span>Blockchain TX:</span>
                                        <a
                                            href={`https://etherscan.io/tx/${tx.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="tx-hash"
                                        >
                                            {tx.txHash.substring(0, 10)}...{tx.txHash.substring(tx.txHash.length - 8)}
                                        </a>
                                    </div>
                                )}
                                <div className="detail-row">
                                    <span>Status:</span>
                                    <span className={`status status-${tx.status}`}>
                                        {tx.status}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;
