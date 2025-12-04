import React, { useState } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Input from '../shared/Input';

const RepayLoan = () => {
    const [selectedLoan, setSelectedLoan] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('wallet');

    const loans = [
        { id: 1, amountDue: '5350', minPayment: '535' },
        { id: 2, amountDue: '10625', minPayment: '1062.5' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        // TODO: Implement repayment logic
        console.log('Repayment:', { selectedLoan, amount, paymentMethod });
    };

    return (
        <div className="dashboard-content">
            <h1>Repay Loan</h1>

            <div className="repay-grid">
                <Card>
                    <h2>Make Payment</h2>
                    <form onSubmit={handleSubmit} className="repay-form">
                        <div className="form-group">
                            <label>Select Loan</label>
                            <select
                                value={selectedLoan}
                                onChange={(e) => setSelectedLoan(e.target.value)}
                                className="select-input"
                                required
                            >
                                <option value="">Choose a loan...</option>
                                {loans.map(loan => (
                                    <option key={loan.id} value={loan.id}>
                                        Loan #{loan.id} - {loan.amountDue} USDC due
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedLoan && (
                            <>
                                <Input
                                    type="number"
                                    label="Payment Amount (USDC)"
                                    placeholder={loans.find(l => l.id === parseInt(selectedLoan))?.minPayment}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    helperText={`Minimum payment: ${loans.find(l => l.id === parseInt(selectedLoan))?.minPayment} USDC`}
                                    required
                                />

                                <div className="form-group">
                                    <label>Payment Method</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="select-input"
                                    >
                                        <option value="wallet">Connected Wallet</option>
                                        <option value="bank">Bank Transfer</option>
                                    </select>
                                </div>

                                <div className="info-box">
                                    <p><strong>Total Due:</strong> {loans.find(l => l.id === parseInt(selectedLoan))?.amountDue} USDC</p>
                                    <p><strong>Remaining After Payment:</strong> {(parseFloat(loans.find(l => l.id === parseInt(selectedLoan))?.amountDue) - parseFloat(amount || 0)).toFixed(2)} USDC</p>
                                </div>

                                <Button type="submit" fullWidth>Process Payment</Button>
                            </>
                        )}
                    </form>
                </Card>

                <Card>
                    <h2>Payment History</h2>
                    <div className="payment-history">
                        <div className="payment-item">
                            <div>
                                <strong>Loan #1</strong>
                                <p>500 USDC</p>
                            </div>
                            <span className="payment-date">2025-11-15</span>
                        </div>
                        <div className="payment-item">
                            <div>
                                <strong>Loan #2</strong>
                                <p>1000 USDC</p>
                            </div>
                            <span className="payment-date">2025-11-10</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default RepayLoan;
