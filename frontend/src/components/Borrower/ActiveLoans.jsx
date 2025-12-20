import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';

const ActiveLoans = () => {
    const [loans, setLoans] = useState([]);

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/loans/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.loans) {
                setLoans(data.loans.map(loan => ({
                    id: loan.loanId.substring(0, 8),
                    amount: `${loan.amount} USDC`,
                    borrowed: `${loan.amount} USDC`,
                    interest: `${loan.interestRate}%`,
                    duration: `${loan.duration} days`,
                    remaining: 'Calculating...', // Simplified for demo
                    amountDue: `$${loan.totalRepayment.toFixed(2)}`,
                    status: loan.status
                })));
            }
        } catch (error) {
            console.error('Error fetching loans:', error);
        }
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
