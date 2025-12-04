import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Card from '../shared/Card';
import { register } from '../../services/auth';
import { connectWallet } from '../../services/wallet';
import '../../styles/components/auth.css';

const Register = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'borrower',
        walletAddress: '',
        walletName: '',
        kycDocument: null,
        kycDocumentType: 'pan'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                setError('Only JPG, PNG, and PDF files are allowed');
                return;
            }
            setFormData({
                ...formData,
                kycDocument: file
            });
            setError('');
        }
    };

    const handleConnectWallet = async () => {
        try {
            const address = await connectWallet();
            setFormData({
                ...formData,
                walletAddress: address
            });
            setWalletConnected(true);
            setError('');
        } catch (err) {
            setError('Failed to connect wallet. Please install MetaMask.');
        }
    };

    const validateStep1 = () => {
        if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Please fill in all required fields');
            return false;
        }

        // Validate Gmail
        if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
            setError('Please use a valid Gmail address');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return false;
        }

        return true;
    };

    const validateStep2 = () => {
        if (!formData.kycDocument) {
            setError('Please upload your KYC document');
            return false;
        }
        return true;
    };

    const validateStep3 = () => {
        if (!formData.walletAddress) {
            setError('Please connect your MetaMask wallet');
            return false;
        }
        if (!formData.walletName) {
            setError('Please enter your wallet account name');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        setError('');

        if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2);
        } else if (currentStep === 2 && validateStep2()) {
            setCurrentStep(3);
        }
    };

    const handleBack = () => {
        setError('');
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateStep3()) {
            return;
        }

        setLoading(true);

        try {
            // Create FormData for file upload
            const registrationData = new FormData();
            registrationData.append('fullName', formData.fullName);
            registrationData.append('email', formData.email);
            registrationData.append('password', formData.password);
            registrationData.append('role', formData.role);
            registrationData.append('walletAddress', formData.walletAddress);
            registrationData.append('walletName', formData.walletName);
            registrationData.append('kycDocumentType', formData.kycDocumentType);
            registrationData.append('kycDocument', formData.kycDocument);

            await register(registrationData);
            navigate('/verify-otp', { state: { email: formData.email } });
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <Card className="auth-card registration-card">
                <div className="auth-header">
                    <div className="back-to-home" onClick={() => navigate('/')} style={{ cursor: 'pointer', marginBottom: '1rem', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>←</span> Back to Home
                    </div>
                    <img src="/assets/logo.png" alt="DeFi Platform Logo" className="platform-logo-img" />
                    <h1>Create Account</h1>
                    <p>Join the decentralized lending revolution</p>
                    <div className="step-indicator">
                        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                            <span className="step-number">1</span>
                            <span className="step-label">Basic Info</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                            <span className="step-number">2</span>
                            <span className="step-label">KYC</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                            <span className="step-number">3</span>
                            <span className="step-label">Wallet</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="error-message">{error}</div>}

                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <div className="form-step">
                            <h3 className="step-title">Basic Information</h3>

                            <Input
                                type="text"
                                name="fullName"
                                label="Full Name"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                type="email"
                                name="email"
                                label="Gmail Address"
                                placeholder="you@gmail.com"
                                value={formData.email}
                                onChange={handleChange}
                                helperText="Must be a valid Gmail address for OTP verification"
                                required
                            />

                            <Input
                                type="password"
                                name="password"
                                label="Password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                helperText="Minimum 8 characters"
                                required
                            />

                            <Input
                                type="password"
                                name="confirmPassword"
                                label="Confirm Password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />

                            <div className="form-group">
                                <label>Account Type <span className="required">*</span></label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="select-input"
                                >
                                    <option value="borrower">Borrower - Request and repay loans</option>
                                    <option value="lender">Lender - Provide funds and earn interest</option>
                                </select>
                            </div>

                            <Button type="button" fullWidth onClick={handleNext}>
                                Next: KYC Verification
                            </Button>
                        </div>
                    )}

                    {/* Step 2: KYC Document Upload */}
                    {currentStep === 2 && (
                        <div className="form-step">
                            <h3 className="step-title">KYC Verification</h3>
                            <p className="step-description">
                                Upload a valid government-issued ID to verify your identity and prevent duplicate accounts.
                            </p>

                            <div className="form-group">
                                <label>Document Type <span className="required">*</span></label>
                                <select
                                    name="kycDocumentType"
                                    value={formData.kycDocumentType}
                                    onChange={handleChange}
                                    className="select-input"
                                >
                                    <option value="pan">PAN Card</option>
                                    <option value="aadhaar">Aadhaar Card</option>
                                    <option value="passport">Passport</option>
                                    <option value="driving_license">Driving License</option>
                                    <option value="voter_id">Voter ID</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Upload Document <span className="required">*</span></label>
                                <div className="file-upload-container">
                                    <input
                                        type="file"
                                        id="kycDocument"
                                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                                        onChange={handleFileChange}
                                        className="file-input"
                                    />
                                    <label htmlFor="kycDocument" className="file-upload-label">
                                        <span className="upload-icon">📄</span>
                                        <span className="upload-text">
                                            {formData.kycDocument ? formData.kycDocument.name : 'Choose file or drag here'}
                                        </span>
                                        <span className="upload-hint">JPG, PNG, or PDF (Max 5MB)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="info-box kyc-info">
                                <p><strong>🔒 Your data is secure</strong></p>
                                <p>• Documents are encrypted and stored securely in cloud storage</p>
                                <p>• Only used for verification purposes</p>
                                <p>• Helps prevent fraud and ensures accountability</p>
                            </div>

                            <div className="button-group">
                                <Button type="button" variant="secondary" onClick={handleBack}>
                                    Back
                                </Button>
                                <Button type="button" onClick={handleNext}>
                                    Next: Connect Wallet
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: MetaMask Wallet Connection */}
                    {currentStep === 3 && (
                        <div className="form-step">
                            <h3 className="step-title">Connect MetaMask Wallet</h3>
                            <p className="step-description">
                                Link your MetaMask wallet to receive and send cryptocurrency.
                            </p>

                            <div className="wallet-connection">
                                {!walletConnected ? (
                                    <div className="wallet-connect-box">
                                        <div className="metamask-logo">🦊</div>
                                        <h4>Connect Your Wallet</h4>
                                        <p>Click below to connect your MetaMask wallet</p>
                                        <Button type="button" onClick={handleConnectWallet} variant="primary">
                                            Connect MetaMask
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="wallet-connected-box">
                                        <div className="success-icon">✓</div>
                                        <h4>Wallet Connected</h4>
                                        <p className="wallet-address-display">{formData.walletAddress}</p>
                                    </div>
                                )}
                            </div>

                            <Input
                                type="text"
                                name="walletName"
                                label="Wallet Account Name"
                                placeholder="My Main Wallet"
                                value={formData.walletName}
                                onChange={handleChange}
                                helperText="A friendly name to identify this wallet"
                                required
                            />

                            <div className="info-box security-info">
                                <p><strong>🔐 Security Notice</strong></p>
                                <p>• Only your public wallet address is stored</p>
                                <p>• Private keys are NEVER requested or stored</p>
                                <p>• You maintain full control of your funds</p>
                            </div>

                            <div className="button-group">
                                <Button type="button" variant="secondary" onClick={handleBack}>
                                    Back
                                </Button>
                                <Button type="submit" loading={loading}>
                                    Complete Registration
                                </Button>
                            </div>
                        </div>
                    )}
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login" className="link">Sign in</Link></p>
                </div>
            </Card>
        </div>
    );
};

export default Register;
