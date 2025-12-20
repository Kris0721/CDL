import React, { useState } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Input from '../shared/Input';

const LendFunds = () => {
    const [amount, setAmount] = useState('');
    const [duration, setDuration] = useState('30');
    const [interestRate, setInterestRate] = useState('8.5');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/lender/deposit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    duration: parseInt(duration),
                    interestRate: parseFloat(interestRate)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to deposit funds');
            }

            setSuccess('Funds deposited successfully!');
            setAmount('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-content">
            <h1>Lend Funds</h1>

            <div className="lend-grid">
                <Card>
                    <h2>Lend to Pool</h2>
                    <form onSubmit={handleSubmit} className="lend-form">
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        <Input
                            type="number"
                            label="Amount (USDC)"
                            placeholder="1000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />

                        <div className="form-group">
                            <label>Lock Duration (days)</label>
                            <select
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="select-input"
                            >
                                <option value="30">30 days - 6% APY</option>
                                <option value="60">60 days - 7.5% APY</option>
                                <option value="90">90 days - 8.5% APY</option>
                                <option value="180">180 days - 10% APY</option>
                            </select>
                        </div>

                        <div className="info-box">
                            <p><strong>Estimated Returns:</strong></p>
                            <p className="highlight">${(amount * (parseFloat(interestRate) / 100) * (duration / 365)).toFixed(2)}</p>
                        </div>

                        <Button type="submit" fullWidth>Lend Funds</Button>
                    </form>
                </Card>

                <Card>
                    <h2>Pool Statistics</h2>
                    <div className="pool-stats">
                        <div className="stat-item">
                            <span>Total Pool Size</span>
                            <strong>$1,250,000</strong>
                        </div>
                        <div className="stat-item">
                            <span>Available Liquidity</span>
                            <strong>$450,000</strong>
                        </div>
                        <div className="stat-item">
                            <span>Average APY</span>
                            <strong>8.2%</strong>
                        </div>
                        <div className="stat-item">
                            <span>Total Lenders</span>
                            <strong>342</strong>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LendFunds;
