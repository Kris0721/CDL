import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';

const ActiveLoans = () => {
    const [loans, setLoans] = useState([]);

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        // TODO: Implement API call
        setLoans([
            { id: 1, borrower: '0x123...', amount: '5000 USDC', interest: '8%', duration: '90 days', remaining: '45 days', status: 'active' },
            { id: 2, borrower: '0x456...', amount: '10000 USDC', interest: '7.5%', duration: '60 days', remaining: '30 days', status: 'active' },
        ]);
    };

    return (
        <div className="dashboard-content">
            <h1>Active Loans</h1>

            <Card>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Loan ID</th>
                            <th>Borrower</th>
                            <th>Amount</th>
                            <th>Interest</th>
                            <th>Duration</th>
                            <th>Remaining</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loans.map(loan => (
                            <tr key={loan.id}>
                                <td>#{loan.id}</td>
                                <td><code>{loan.borrower}</code></td>
                                <td>{loan.amount}</td>
                                <td>{loan.interest}</td>
                                <td>{loan.duration}</td>
                                <td>{loan.remaining}</td>
                                <td><span className={`status-badge ${loan.status}`}>{loan.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default ActiveLoans;
