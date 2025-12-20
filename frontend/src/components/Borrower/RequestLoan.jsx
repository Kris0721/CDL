import React, { useState } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Input from '../shared/Input';

const RequestLoan = () => {
    const [formData, setFormData] = useState({
        amount: '',
        duration: '30',
        purpose: '',
        collateral: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/loans/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: parseFloat(formData.amount),
                    duration: parseInt(formData.duration),
                    collateralAmount: parseFloat(formData.amount) * 1.5, // Mock collateral
                    collateralToken: 'ETH'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit loan request');
            }

            setSuccess('Loan request submitted successfully!');
            setFormData({
                amount: '',
                duration: '30',
                purpose: '',
                collateral: ''
            }); // Reset form
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateInterest = () => {
        const rates = { 30: 6, 60: 7.5, 90: 8.5, 180: 10 };
        const rate = rates[formData.duration] || 6;
        return (formData.amount * (rate / 100) * (formData.duration / 365)).toFixed(2);
    };

    return (
        <div className="dashboard-content">
            <h1>Request Loan</h1>

            <div className="loan-request-grid">
                <Card>
                    <h2>Loan Application</h2>
                    <form onSubmit={handleSubmit} className="loan-form">
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        <Input
                            type="number"
                            name="amount"
                            label="Loan Amount (USDC)"
                            placeholder="5000"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                        />

                        <div className="form-group">
                            <label>Loan Duration</label>
                            <select
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                className="select-input"
                            >
                                <option value="30">30 days - 6% APR</option>
                                <option value="60">60 days - 7.5% APR</option>
                                <option value="90">90 days - 8.5% APR</option>
                                <option value="180">180 days - 10% APR</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Loan Purpose</label>
                            <textarea
                                name="purpose"
                                value={formData.purpose}
                                onChange={handleChange}
                                placeholder="Describe the purpose of this loan..."
                                className="textarea-input"
                                rows="3"
                                required
                            />
                        </div>

                        <Input
                            type="text"
                            name="collateral"
                            label="Collateral Address (Optional)"
                            placeholder="0x..."
                            value={formData.collateral}
                            onChange={handleChange}
                        />

                        {formData.amount && (
                            <div className="info-box">
                                <p><strong>Estimated Interest:</strong></p>
                                <p className="highlight">${calculateInterest()} USDC</p>
                                <p><strong>Total Repayment:</strong></p>
                                <p className="highlight">${(parseFloat(formData.amount) + parseFloat(calculateInterest())).toFixed(2)} USDC</p>
                            </div>
                        )}

                        <Button type="submit" fullWidth>Submit Loan Request</Button>
                    </form>
                </Card>

                <Card>
                    <h2>Eligibility Requirements</h2>
                    <div className="requirements-list">
                        <div className="requirement-item">
                            <span className="check-icon">✓</span>
                            <span>Verified KYC</span>
                        </div>
                        <div className="requirement-item">
                            <span className="check-icon">✓</span>
                            <span>Minimum Credit Score: 600</span>
                        </div>
                        <div className="requirement-item">
                            <span className="check-icon">✓</span>
                            <span>Connected Wallet</span>
                        </div>
                        <div className="requirement-item">
                            <span className="check-icon">✓</span>
                            <span>No Active Defaults</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default RequestLoan;
