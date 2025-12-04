"""
Get platform statistics (Admin only)
"""
import json
import os
import sys

# Add layer to path
sys.path.insert(0, '/opt/python')

from auth_utils import require_role, create_response
from db_utils import scan_table


def lambda_handler(event, context):
    """
    Get platform-wide statistics (Admin/Maintainer only)
    Returns total users, loans, amounts, default rates, etc.
    """
    try:
        # Get all users
        users_result = scan_table(os.environ['USERS_TABLE'], limit=1000)
        users = users_result.get('items', [])
        
        # Get all loans
        loans_result = scan_table(os.environ['LOANS_TABLE'], limit=1000)
        loans = loans_result.get('items', [])
        
        # Calculate user statistics
        total_users = len(users)
        kyc_approved_users = sum(1 for u in users if u.get('kycStatus') == 'approved')
        kyc_pending_users = sum(1 for u in users if u.get('kycStatus') == 'pending')
        
        users_by_role = {}
        for user in users:
            role = user.get('role', 'borrower')
            users_by_role[role] = users_by_role.get(role, 0) + 1
        
        # Calculate loan statistics
        total_loans = len(loans)
        pending_loans = sum(1 for l in loans if l.get('status') == 'pending')
        approved_loans = sum(1 for l in loans if l.get('status') == 'approved')
        active_loans = sum(1 for l in loans if l.get('status') in ['disbursed', 'active'])
        completed_loans = sum(1 for l in loans if l.get('status') == 'repaid')
        defaulted_loans = sum(1 for l in loans if l.get('status') == 'defaulted')
        
        # Calculate financial statistics
        total_disbursed = 0
        total_repaid = 0
        total_outstanding = 0
        
        for loan in loans:
            if loan.get('status') in ['disbursed', 'active', 'repaid']:
                amount = float(loan.get('amount', 0))
                amount_paid = float(loan.get('amountPaid', 0))
                total_repayment = float(loan.get('totalRepayment', 0))
                
                total_disbursed += amount
                total_repaid += amount_paid
                
                if loan.get('status') in ['disbursed', 'active']:
                    total_outstanding += (total_repayment - amount_paid)
        
        # Calculate default rate
        default_rate = 0
        if active_loans + completed_loans + defaulted_loans > 0:
            default_rate = (defaulted_loans / (active_loans + completed_loans + defaulted_loans)) * 100
        
        # Calculate average loan amount
        avg_loan_amount = 0
        if total_loans > 0:
            avg_loan_amount = total_disbursed / total_loans if total_disbursed > 0 else 0
        
        return create_response(200, {
            'users': {
                'total': total_users,
                'kycApproved': kyc_approved_users,
                'kycPending': kyc_pending_users,
                'byRole': users_by_role
            },
            'loans': {
                'total': total_loans,
                'pending': pending_loans,
                'approved': approved_loans,
                'active': active_loans,
                'completed': completed_loans,
                'defaulted': defaulted_loans
            },
            'financial': {
                'totalDisbursed': round(total_disbursed, 2),
                'totalRepaid': round(total_repaid, 2),
                'totalOutstanding': round(total_outstanding, 2),
                'averageLoanAmount': round(avg_loan_amount, 2),
                'defaultRate': round(default_rate, 2)
            }
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'message': 'Internal server error'})


# Apply role-based authentication decorator
lambda_handler = require_role(['admin', 'maintainer'])(lambda_handler)
