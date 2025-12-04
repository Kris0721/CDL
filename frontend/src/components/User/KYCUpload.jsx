import React, { useState } from 'react';
import { userAPI } from '../../services/api';
import Card from '../shared/Card';
import Button from '../shared/Button';
import './KYCUpload.css';

const KYCUpload = () => {
    const [documentType, setDocumentType] = useState('passport');
    const [documentNumber, setDocumentNumber] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file size (max 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setMessage('File size must be less than 5MB');
                return;
            }
            setFile(selectedFile);
            setMessage('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file || !documentNumber) {
            setMessage('Please fill all fields');
            return;
        }

        try {
            setUploading(true);
            setMessage('');

            // Convert file to base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Data = reader.result.split(',')[1];

                const data = {
                    documentType,
                    documentNumber,
                    fileData: base64Data,
                    fileName: file.name,
                    fileType: file.type
                };

                await userAPI.uploadKYC(data);
                setMessage('KYC document uploaded successfully! Awaiting review.');

                // Reset form
                setDocumentNumber('');
                setFile(null);
                document.getElementById('file-input').value = '';
            };

            reader.onerror = () => {
                setMessage('Failed to read file');
                setUploading(false);
            };
        } catch (error) {
            setMessage('Upload failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="kyc-upload">
            <Card title="Upload KYC Documents">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Document Type:</label>
                        <select
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                            required
                        >
                            <option value="passport">Passport</option>
                            <option value="drivers_license">Driver's License</option>
                            <option value="national_id">National ID</option>
                            <option value="proof_of_address">Proof of Address</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Document Number:</label>
                        <input
                            type="text"
                            value={documentNumber}
                            onChange={(e) => setDocumentNumber(e.target.value)}
                            placeholder="Enter document number"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Upload Document:</label>
                        <input
                            id="file-input"
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                            required
                        />
                        {file && (
                            <div className="file-info">
                                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                            </div>
                        )}
                    </div>

                    {message && (
                        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}

                    <Button type="submit" disabled={uploading} variant="primary">
                        {uploading ? 'Uploading...' : 'Upload Document'}
                    </Button>
                </form>

                <div className="kyc-info">
                    <h3>Important Information:</h3>
                    <ul>
                        <li>Accepted formats: JPG, PNG, PDF</li>
                        <li>Maximum file size: 5MB</li>
                        <li>Document must be clear and readable</li>
                        <li>All information must be visible</li>
                        <li>Documents will be reviewed within 24-48 hours</li>
                    </ul>
                </div>
            </Card>
        </div>
    );
};

export default KYCUpload;
