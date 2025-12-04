import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';

const ProfitHistory = () => {
    const [profits, setProfits] = useState([]);

    useEffect(() => {
        fetchProfits();
    }, []);

    const fetchProfits = async () => {
        // TODO: Implement API call
        setProfits([
            { id: 1, date: '2025-11-01', amount: '250 USDC', source: 'Interest Payment', loanId: 123 },
            { id: 2, date: '2025-11-15', amount: '180 USDC', source: 'Interest Payment', loanId: 456 },
            { id: 3, date: '2025-11-30', amount: '320 USDC', source: 'Interest Payment', loanId: 789 },
        ]);
    };

    const totalProfit = profits.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    return (
        <div className="dashboard-content">
            <h1>Profit History</h1>

            <Card className="summary-card">
                <h2>Total Earnings</h2>
                <p className="total-amount">{totalProfit.toFixed(2)} USDC</p>
            </Card>

            <Card>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Source</th>
                            <th>Loan ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profits.map(profit => (
                            <tr key={profit.id}>
                                <td>{profit.date}</td>
                                <td className="amount-cell">{profit.amount}</td>
                                <td>{profit.source}</td>
                                <td>#{profit.loanId}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default ProfitHistory;
