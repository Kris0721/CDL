import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';

const TransactionMonitor = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        // TODO: Implement API call
        setTransactions([
            { id: 1, type: 'loan', amount: '1000 USDC', from: '0x123...', to: '0x456...', status: 'completed', timestamp: '2025-11-30 10:30' },
            { id: 2, type: 'repayment', amount: '500 USDC', from: '0x789...', to: '0xabc...', status: 'pending', timestamp: '2025-11-30 11:15' },
        ]);
    };

    return (
        <div className="dashboard-content">
            <h1>Transaction Monitor</h1>

            <Card>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Status</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(tx => (
                            <tr key={tx.id}>
                                <td>#{tx.id}</td>
                                <td><span className="badge">{tx.type}</span></td>
                                <td>{tx.amount}</td>
                                <td><code>{tx.from}</code></td>
                                <td><code>{tx.to}</code></td>
                                <td><span className={`status-badge ${tx.status}`}>{tx.status}</span></td>
                                <td>{tx.timestamp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default TransactionMonitor;
