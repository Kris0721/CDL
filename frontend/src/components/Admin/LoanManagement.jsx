import React, { useState, useEffect } from 'react';
import { adminAPI, userAPI } from '../../services/api';
import Card from '../shared/Card';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import './LoanManagement.css';

const AdminLoanManagement = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState(''); // 'approve', 'reject', 'disburse'
    const [reason, setReason] = useState('');
    const [txHash, setTxHash] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchLoans();
    }, [statusFilter]);

    const fetchLoans = async () => {
        try {
            setLoading(true);
            const params = statusFilter ? { status: statusFilter } : {};
            const response = await adminAPI.getAllLoans(params);
            setLoans(response.data.loans);
        } catch (error) {
            console.error('Failed to fetch loans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (loan, action) => {
        setSelectedLoan(loan);
        setActionType(action);
        setShowModal(true);
        setReason('');
        setTxHash('');
    };

    const executeAction = async () => {
        try {
            if (actionType === 'approve') {
                await loanAPI.approveLoan({ loanId: selectedLoan.loanId });
            } else if (actionType === 'reject') {
                if (!reason) {
                    alert('Please provide a rejection reason');
                    return;
                }
                await loanAPI.rejectLoan({ loanId: selectedLoan.loanId, reason });
            } else if (actionType === 'disburse') {
                await loanAPI.disburseLoan({ loanId: selectedLoan.loanId, txHash });
            }

            setShowModal(false);
            fetchLoans();
        } catch (error) {
            console.error('Action failed:', error);
            alert('Action failed: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="admin-loan-management">
            <div className="header">
                <h1>Loan Management</h1>
                <div className="filters">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Loans</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="disbursed">Disbursed</option>
                        <option value="active">Active</option>
                        <option value="repaid">Repaid</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading loans...</div>
            ) : (
                <div className="loans-grid">
                    {loans.map((loan) => (
                        <Card key={loan.loanId} title={`Loan #${loan.loanId}`}>
                            <div className="loan-details">
                                <div className="detail-row">
                                    <span>Borrower:</span>
                                    <span>{loan.borrowerId}</span>
                                </div>
                                <div className="detail-row">
                                    <span>Amount:</span>
                                    <span>${parseFloat(loan.amount).toLocaleString()}</span>
                                </div>
                                <div className="detail-row">
                                    <span>Duration:</span>
                                    <span>{loan.duration} days</span>
                                </div>
                                <div className="detail-row">
                                    <span>Interest Rate:</span>
                                    <span>{loan.interestRate}%</span>
                                </div>
                                <div className="detail-row">
                                    <span>Total Repayment:</span>
                                    <span>${parseFloat(loan.totalRepayment).toLocaleString()}</span>
                                </div>
                                <div className="detail-row">
                                    <span>Status:</span>
                                    <span className={`status status-${loan.status}`}>{loan.status}</span>
                                </div>
                            </div>

                            <div className="loan-actions">
                                {loan.status === 'pending' && (
                                    <>
                                        <Button onClick={() => handleAction(loan, 'approve')} variant="success">
                                            Approve
                                        </Button>
                                        <Button onClick={() => handleAction(loan, 'reject')} variant="danger">
                                            Reject
                                        </Button>
                                    </>
                                )}
                                {loan.status === 'approved' && (
                                    <Button onClick={() => handleAction(loan, 'disburse')} variant="primary">
                                        Disburse
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {showModal && (
                <Modal
                    title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Loan`}
                    onClose={() => setShowModal(false)}
                >
                    <div className="modal-content">
                        <p>Loan ID: {selectedLoan?.loanId}</p>
                        <p>Amount: ${parseFloat(selectedLoan?.amount).toLocaleString()}</p>

                        {actionType === 'reject' && (
                            <div className="form-group">
                                <label>Rejection Reason:</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Enter reason for rejection"
                                    rows="4"
                                />
                            </div>
                        )}

                        {actionType === 'disburse' && (
                            <div className="form-group">
                                <label>Transaction Hash (optional):</label>
                                <input
                                    type="text"
                                    value={txHash}
                                    onChange={(e) => setTxHash(e.target.value)}
                                    placeholder="0x..."
                                />
                            </div>
                        )}

                        <div className="modal-actions">
                            <Button onClick={executeAction} variant="primary">
                                Confirm
                            </Button>
                            <Button onClick={() => setShowModal(false)} variant="secondary">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminLoanManagement;
