import React, { useState } from 'react';
import './LoanCalculator.css';

const LoanCalculator = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        cryptoType: 'BTC',
        collateralAmount: '',
        loanAmount: '',
        loanTerm: '12'
    });

    const [results, setResults] = useState(null);

    const cryptoOptions = [
        { value: 'BTC', label: 'Bitcoin (BTC)', baseRate: 4.9 },
        { value: 'ETH', label: 'Ethereum (ETH)', baseRate: 5.2 },
        { value: 'USDT', label: 'Tether (USDT)', baseRate: 6.5 },
        { value: 'BNB', label: 'Binance Coin (BNB)', baseRate: 5.5 },
        { value: 'SOL', label: 'Solana (SOL)', baseRate: 5.8 }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const calculateLoan = () => {
        const collateral = parseFloat(formData.collateralAmount);
        const loan = parseFloat(formData.loanAmount);
        const term = parseInt(formData.loanTerm);

        if (!collateral || !loan || collateral <= 0 || loan <= 0) {
            alert('Please enter valid amounts');
            return;
        }

        // Calculate LTV
        const ltv = (loan / collateral) * 100;

        // Get base rate for selected crypto
        const selectedCrypto = cryptoOptions.find(c => c.value === formData.cryptoType);
        let interestRate = selectedCrypto.baseRate;

        // Adjust rate based on LTV
        if (ltv > 70) {
            interestRate += 2;
        } else if (ltv > 50) {
            interestRate += 1;
        }

        // Calculate monthly payment
        const monthlyRate = interestRate / 100 / 12;
        const monthlyPayment = loan * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
        const totalRepayment = monthlyPayment * term;

        setResults({
            ltv: ltv.toFixed(2),
            interestRate: interestRate.toFixed(2),
            monthlyPayment: monthlyPayment.toFixed(2),
            totalRepayment: totalRepayment.toFixed(2)
        });
    };

    if (!isOpen) return null;

    return (
        <div className="calculator-overlay" onClick={onClose}>
            <div className="calculator-modal" onClick={(e) => e.stopPropagation()}>
                <div className="calculator-header">
                    <h2>💰 Loan Calculator</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="calculator-body">
                    <div className="form-group">
                        <label>Crypto Asset Type</label>
                        <select
                            name="cryptoType"
                            value={formData.cryptoType}
                            onChange={handleChange}
                        >
                            {cryptoOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Collateral Amount (INR)</label>
                        <input
                            type="number"
                            name="collateralAmount"
                            value={formData.collateralAmount}
                            onChange={handleChange}
                            placeholder="Enter collateral value"
                            min="0"
                            step="100"
                        />
                    </div>

                    <div className="form-group">
                        <label>Desired Loan Amount (INR)</label>
                        <input
                            type="number"
                            name="loanAmount"
                            value={formData.loanAmount}
                            onChange={handleChange}
                            placeholder="Enter loan amount"
                            min="0"
                            step="100"
                        />
                    </div>

                    <div className="form-group">
                        <label>Loan Term (Months)</label>
                        <select
                            name="loanTerm"
                            value={formData.loanTerm}
                            onChange={handleChange}
                        >
                            <option value="6">6 Months</option>
                            <option value="12">12 Months</option>
                            <option value="18">18 Months</option>
                            <option value="24">24 Months</option>
                            <option value="36">36 Months</option>
                        </select>
                    </div>

                    <button className="calculate-btn" onClick={calculateLoan}>
                        Calculate
                    </button>

                    {results && (
                        <div className="results-section">
                            <h3>Loan Summary</h3>
                            <div className="results-grid">
                                <div className="result-item">
                                    <div className="result-label">LTV Ratio</div>
                                    <div className="result-value">{results.ltv}%</div>
                                </div>
                                <div className="result-item">
                                    <div className="result-label">Interest Rate</div>
                                    <div className="result-value">{results.interestRate}% APR</div>
                                </div>
                                <div className="result-item">
                                    <div className="result-label">Monthly Payment</div>
                                    <div className="result-value">₹{results.monthlyPayment}</div>
                                </div>
                                <div className="result-item">
                                    <div className="result-label">Total Repayment</div>
                                    <div className="result-value">₹{results.totalRepayment}</div>
                                </div>
                            </div>
                            <div className="results-note">
                                <p>💡 Note: These are estimated values. Actual rates may vary based on market conditions and your profile.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoanCalculator;
