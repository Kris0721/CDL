"""Loan service"""
import uuid
import time
from database.db import db
from database.models import Loan

class LoanService:
    """Handle loan operations"""
    
    @staticmethod
    def calculate_interest_rate(duration_days):
        """Calculate interest rate based on duration"""
        if duration_days >= 180:
            return 10.0  # 10%
        elif duration_days >= 90:
            return 8.5   # 8.5%
        elif duration_days >= 60:
            return 7.5   # 7.5%
        else:
            return 6.0   # 6%
    
    @staticmethod
    def calculate_total_repayment(amount, interest_rate, duration_days):
        """Calculate total repayment amount"""
        interest = (amount * interest_rate * duration_days) / (100 * 365)
        return amount + interest
    
    @staticmethod
    def request_loan(borrower_id, amount, duration_days, collateral_amount=None, collateral_token=None):
        """Request a new loan"""
        # Validate duration
        if duration_days < 30 or duration_days > 180:
            return {'error': 'Duration must be between 30 and 180 days'}, 400
        
        # Calculate interest
        interest_rate = LoanService.calculate_interest_rate(duration_days)
        total_repayment = LoanService.calculate_total_repayment(amount, interest_rate, duration_days)
        
        # Create loan
        loan_id = str(uuid.uuid4())
        now = int(time.time())
        
        db.execute_update(
            '''INSERT INTO loans 
               (loan_id, borrower_id, amount, interest_rate, duration, total_repayment, 
                collateral_amount, collateral_token, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (loan_id, borrower_id, amount, interest_rate, duration_days, total_repayment,
             collateral_amount, collateral_token, 'pending', now, now)
        )
        
        return {
            'message': 'Loan request submitted successfully',
            'loanId': loan_id,
            'amount': amount,
            'interestRate': interest_rate,
            'duration': duration_days,
            'totalRepayment': total_repayment
        }, 201
    
    @staticmethod
    def get_user_loans(user_id):
        """Get all loans for a user"""
        loans = db.execute_query(
            'SELECT * FROM loans WHERE borrower_id = ? ORDER BY created_at DESC',
            (user_id,)
        )
        
        return {
            'loans': [Loan.to_dict(loan) for loan in loans]
        }, 200
    
    @staticmethod
    def get_loan(loan_id):
        """Get a specific loan"""
        loan = db.execute_query(
            'SELECT * FROM loans WHERE loan_id = ?',
            (loan_id,)
        )
        
        if not loan:
            return {'error': 'Loan not found'}, 404
        
        return {'loan': Loan.to_dict(loan[0])}, 200
    
    @staticmethod
    def approve_loan(loan_id, admin_id):
        """Approve a loan (admin only)"""
        loan = db.execute_query(
            'SELECT * FROM loans WHERE loan_id = ?',
            (loan_id,)
        )
        
        if not loan:
            return {'error': 'Loan not found'}, 404
        
        loan = loan[0]
        
        if loan['status'] != 'pending':
            return {'error': 'Loan is not pending'}, 400
        
        now = int(time.time())
        db.execute_update(
            'UPDATE loans SET status = ?, updated_at = ? WHERE loan_id = ?',
            ('approved', now, loan_id)
        )
        
        print(f"[EMAIL] Loan {loan_id} approved for borrower {loan['borrower_id']}")
        
        return {'message': 'Loan approved successfully'}, 200
    
    @staticmethod
    def reject_loan(loan_id, admin_id, reason=None):
        """Reject a loan (admin only)"""
        loan = db.execute_query(
            'SELECT * FROM loans WHERE loan_id = ?',
            (loan_id,)
        )
        
        if not loan:
            return {'error': 'Loan not found'}, 404
        
        loan = loan[0]
        
        if loan['status'] != 'pending':
            return {'error': 'Loan is not pending'}, 400
        
        now = int(time.time())
        db.execute_update(
            'UPDATE loans SET status = ?, updated_at = ? WHERE loan_id = ?',
            ('rejected', now, loan_id)
        )
        
        print(f"[EMAIL] Loan {loan_id} rejected. Reason: {reason}")
        
        return {'message': 'Loan rejected'}, 200
    
    @staticmethod
    def disburse_loan(loan_id, admin_id, blockchain_loan_id=None):
        """Disburse an approved loan (admin only)"""
        loan = db.execute_query(
            'SELECT * FROM loans WHERE loan_id = ?',
            (loan_id,)
        )
        
        if not loan:
            return {'error': 'Loan not found'}, 404
        
        loan = loan[0]
        
        if loan['status'] != 'approved':
            return {'error': 'Loan is not approved'}, 400
        
        now = int(time.time())
        end_time = now + (loan['duration'] * 24 * 60 * 60)
        
        db.execute_update(
            '''UPDATE loans 
               SET status = ?, start_time = ?, end_time = ?, blockchain_loan_id = ?, updated_at = ?
               WHERE loan_id = ?''',
            ('active', now, end_time, blockchain_loan_id, now, loan_id)
        )
        
        # Create transaction record
        tx_id = str(uuid.uuid4())
        db.execute_update(
            '''INSERT INTO transactions 
               (transaction_id, user_id, loan_id, transaction_type, amount, status, timestamp)
               VALUES (?, ?, ?, ?, ?, ?, ?)''',
            (tx_id, loan['borrower_id'], loan_id, 'loan_disbursement', loan['amount'], 'completed', now)
        )
        
        print(f"[EMAIL] Loan {loan_id} disbursed to borrower {loan['borrower_id']}")
        
        return {'message': 'Loan disbursed successfully', 'transactionId': tx_id}, 200
    
    @staticmethod
    def repay_loan(loan_id, borrower_id, amount, tx_hash=None):
        """Repay a loan"""
        loan = db.execute_query(
            'SELECT * FROM loans WHERE loan_id = ? AND borrower_id = ?',
            (loan_id, borrower_id)
        )
        
        if not loan:
            return {'error': 'Loan not found'}, 404
        
        loan = loan[0]
        
        if loan['status'] != 'active':
            return {'error': 'Loan is not active'}, 400
        
        remaining = loan['total_repayment'] - loan['amount_repaid']
        
        if amount > remaining:
            return {'error': f'Amount exceeds remaining balance of {remaining}'}, 400
        
        new_amount_repaid = loan['amount_repaid'] + amount
        new_status = 'completed' if new_amount_repaid >= loan['total_repayment'] else 'active'
        now = int(time.time())
        
        db.execute_update(
            'UPDATE loans SET amount_repaid = ?, status = ?, updated_at = ? WHERE loan_id = ?',
            (new_amount_repaid, new_status, now, loan_id)
        )
        
        # Create transaction record
        tx_id = str(uuid.uuid4())
        db.execute_update(
            '''INSERT INTO transactions 
               (transaction_id, user_id, loan_id, transaction_type, amount, tx_hash, status, timestamp)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
            (tx_id, borrower_id, loan_id, 'loan_repayment', amount, tx_hash, 'completed', now)
        )
        
        if new_status == 'completed':
            print(f"[EMAIL] Loan {loan_id} fully repaid by borrower {borrower_id}")
        
        return {
            'message': 'Repayment successful',
            'transactionId': tx_id,
            'amountRepaid': new_amount_repaid,
            'remainingBalance': loan['total_repayment'] - new_amount_repaid,
            'loanCompleted': new_status == 'completed'
        }, 200
    
    @staticmethod
    def get_all_loans(status=None):
        """Get all loans (admin only)"""
        if status:
            loans = db.execute_query(
                'SELECT * FROM loans WHERE status = ? ORDER BY created_at DESC',
                (status,)
            )
        else:
            loans = db.execute_query(
                'SELECT * FROM loans ORDER BY created_at DESC'
            )
        
        return {
            'loans': [Loan.to_dict(loan) for loan in loans],
            'count': len(loans)
        }, 200
