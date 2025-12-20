"""Data models for the application"""

class User:
    """User model"""
    
    @staticmethod
    def to_dict(row):
        """Convert database row to dictionary"""
        if not row:
            return None
        return {
            'userId': row['user_id'],
            'email': row['email'],
            'fullName': row['full_name'],
            'role': row['role'],
            'walletAddress': row['wallet_address'],
            'kycStatus': row['kyc_status'],
            'isVerified': bool(row['is_verified']),
            'createdAt': row['created_at'],
            'updatedAt': row['updated_at']
        }

class Loan:
    """Loan model"""
    
    @staticmethod
    def to_dict(row):
        """Convert database row to dictionary"""
        if not row:
            return None
        return {
            'loanId': row['loan_id'],
            'borrowerId': row['borrower_id'],
            'amount': row['amount'],
            'interestRate': row['interest_rate'],
            'duration': row['duration'],
            'totalRepayment': row['total_repayment'],
            'amountRepaid': row['amount_repaid'],
            'collateralAmount': row['collateral_amount'],
            'collateralToken': row['collateral_token'],
            'status': row['status'],
            'blockchainLoanId': row['blockchain_loan_id'],
            'startTime': row['start_time'],
            'endTime': row['end_time'],
            'createdAt': row['created_at'],
            'updatedAt': row['updated_at']
        }

class Transaction:
    """Transaction model"""
    
    @staticmethod
    def to_dict(row):
        """Convert database row to dictionary"""
        if not row:
            return None
        return {
            'transactionId': row['transaction_id'],
            'userId': row['user_id'],
            'loanId': row['loan_id'],
            'transactionType': row['transaction_type'],
            'amount': row['amount'],
            'token': row['token'],
            'txHash': row['tx_hash'],
            'status': row['status'],
            'timestamp': row['timestamp']
        }

class KYCDocument:
    """KYC Document model"""
    
    @staticmethod
    def to_dict(row):
        """Convert database row to dictionary"""
        if not row:
            return None
        return {
            'documentId': row['document_id'],
            'userId': row['user_id'],
            'documentType': row['document_type'],
            'fileName': row['file_name'],
            'fileSize': row['file_size'],
            'status': row['status'],
            'rejectionReason': row['rejection_reason'],
            'uploadedAt': row['uploaded_at'],
            'reviewedAt': row['reviewed_at']
        }

class Deposit:
    """Deposit model"""
    
    @staticmethod
    def to_dict(row):
        """Convert database row to dictionary"""
        if not row:
            return None
        return {
            'depositId': row['deposit_id'],
            'lenderId': row['lender_id'],
            'amount': row['amount'],
            'lockDuration': row['lock_duration'],
            'interestRate': row['interest_rate'],
            'startTime': row['start_time'],
            'endTime': row['end_time'],
            'withdrawn': bool(row['withdrawn']),
            'blockchainDepositIndex': row['blockchain_deposit_index'],
            'createdAt': row['created_at']
        }
