import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';

const ActiveLoans = () => {
    const [loans, setLoans] = useState([]);

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        // TODO: Implement API call
        setLoans([
            {
                id: 1,
                amount: '5000 USDC',
                borrowed: '5000 USDC',
                interest: '8%',
                duration: '90 days',
                remaining: '45 days',
                amountDue: '5350 USDC',
                status: 'active'
            },
            {
                id: 2,
                amount: '10000 USDC',
                borrowed: '10000 USDC',
                interest: '7.5%',
                duration: '60 days',
                remaining: '30 days',
                amountDue: '10625 USDC',
                status: 'active'
            },
        ]);
    };

    return (
        <div className="dashboard-content">
            <h1>Active Loans</h1>

            <div className="loans-grid">
                {loans.map(loan => (
                    <Card key={loan.id} className="loan-card">
                        <div className="loan-header">
                            <h3>Loan #{loan.id}</h3>
                            <span className={`status-badge ${loan.status}`}>{loan.status}</span>
                        </div>

                        <div className="loan-details">
                            <div className="detail-row">
                                <span>Borrowed:</span>
                                <strong>{loan.borrowed}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Interest Rate:</span>
                                <strong>{loan.interest}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Duration:</span>
                                <strong>{loan.duration}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Time Remaining:</span>
                                <strong>{loan.remaining}</strong>
                            </div>
                            <div className="detail-row highlight-row">
                                <span>Amount Due:</span>
                                <strong className="amount-due">{loan.amountDue}</strong>
                            </div>
                        </div>

                        <Button variant="primary" fullWidth>Repay Now</Button>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ActiveLoans;
