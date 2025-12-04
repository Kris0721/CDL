import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Card from '../shared/Card';
import { login } from '../../services/auth';
import '../../styles/components/auth.css';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login(formData.email, formData.password);
            localStorage.setItem('token', response.token);
            localStorage.setItem('userRole', response.role);

            // Redirect based on role
            if (response.role === 'maintainer') {
                navigate('/maintainer');
            } else if (response.role === 'lender') {
                navigate('/lender');
            } else if (response.role === 'borrower') {
                navigate('/borrower');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <Card className="auth-card">
                <div className="auth-header">
                    <div className="back-to-home" onClick={() => navigate('/')} style={{ cursor: 'pointer', marginBottom: '1rem', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>←</span> Back to Home
                    </div>
                    <img src="/assets/logo.png" alt="DeFi Platform Logo" className="platform-logo-img" />
                    <h1>Welcome Back</h1>
                    <p>Sign in to your DeFi lending account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="error-message">{error}</div>}

                    <Input
                        type="email"
                        name="email"
                        label="Gmail Address"
                        placeholder="you@gmail.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        type="password"
                        name="password"
                        label="Password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <div className="auth-options">
                        <label className="checkbox-label">
                            <input type="checkbox" />
                            <span>Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="link">Forgot password?</Link>
                    </div>

                    <Button type="submit" fullWidth loading={loading}>
                        Sign In
                    </Button>
                </form>

                <div className="divider">
                    <span>New to the platform?</span>
                </div>

                <div className="account-types">
                    <h3>Choose Your Role</h3>
                    <div className="role-cards">
                        <div className="role-card">
                            <div className="role-icon">💰</div>
                            <h4>Lender</h4>
                            <p>Provide funds to borrowers and earn interest on your crypto</p>
                        </div>
                        <div className="role-card">
                            <div className="role-icon">📏</div>
                            <h4>Borrower</h4>
                            <p>Request loans and receive crypto tokens to your wallet</p>
                        </div>
                    </div>
                </div>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register" className="link">Create New Account</Link></p>
                </div>
            </Card>
        </div>
    );
};

export default Login;
