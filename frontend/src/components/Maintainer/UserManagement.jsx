import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Modal from '../shared/Modal';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Fetch users from API
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        // TODO: Implement API call
        setUsers([
            { id: 1, name: 'John Doe', email: 'john@example.com', role: 'borrower', status: 'active', kycStatus: 'approved' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'lender', status: 'active', kycStatus: 'pending' },
        ]);
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    return (
        <div className="dashboard-content">
            <div className="page-header">
                <h1>User Management</h1>
                <Button variant="primary">Add User</Button>
            </div>

            <Card>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>KYC Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td><span className="badge">{user.role}</span></td>
                                <td><span className={`status-badge ${user.status}`}>{user.status}</span></td>
                                <td><span className={`kyc-badge ${user.kycStatus}`}>{user.kycStatus}</span></td>
                                <td>
                                    <Button size="small" onClick={() => handleViewUser(user)}>View</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="User Details"
            >
                {selectedUser && (
                    <div className="user-details">
                        <p><strong>Name:</strong> {selectedUser.name}</p>
                        <p><strong>Email:</strong> {selectedUser.email}</p>
                        <p><strong>Role:</strong> {selectedUser.role}</p>
                        <p><strong>Status:</strong> {selectedUser.status}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserManagement;
