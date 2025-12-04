"""
Get loan statistics for a user
"""
import json
import os
import sys

# Add layer to path
sys.path.insert(0, '/opt/python')

from auth_utils import require_auth, create_response
from db_utils import query_by_index


def lambda_handler(event, context):
    """
    Get loan statistics for a user
    Returns total borrowed, total repaid, active loans, etc.
    """
    try:
        # Get authenticated user
        user = event.get('user')
        if not user:
            return create_response(401, {'message': 'Unauthorized'})
        
        user_id = user['userId']
        
        # Query all loans for user
        result = query_by_index(
            os.environ['LOANS_TABLE'],
            'BorrowerIndex',
            'borrowerId',
            user_id,
            limit=100
        )
        
        loans = result.get('items', [])
        
        # Calculate statistics
        total_borrowed = 0
        total_repaid = 0
        total_interest_paid = 0
        active_loans_count = 0
        completed_loans_count = 0
        pending_loans_count = 0
        defaulted_loans_count = 0
        
        for loan in loans:
            amount = float(loan.get('amount', 0))
            amount_paid = float(loan.get('amountPaid', 0))
            status = loan.get('status', '')
            
            if status in ['disbursed', 'active', 'repaid']:
                total_borrowed += amount
                total_repaid += amount_paid
            
            if status in ['disbursed', 'active']:
                active_loans_count += 1
            elif status == 'repaid':
                completed_loans_count += 1
                # Calculate interest paid
                principal = float(loan.get('amount', 0))
                total_repayment = float(loan.get('totalRepayment', 0))
                total_interest_paid += (total_repayment - principal)
            elif status == 'pending':
                pending_loans_count += 1
            elif status == 'defaulted':
                defaulted_loans_count += 1
        
        # Calculate average interest rate
        avg_interest_rate = 0
        if loans:
            total_rate = sum(float(loan.get('interestRate', 0)) for loan in loans)
            avg_interest_rate = total_rate / len(loans)
        
        return create_response(200, {
            'userId': user_id,
            'totalLoans': len(loans),
            'activeLoans': active_loans_count,
            'completedLoans': completed_loans_count,
            'pendingLoans': pending_loans_count,
            'defaultedLoans': defaulted_loans_count,
            'totalBorrowed': round(total_borrowed, 2),
            'totalRepaid': round(total_repaid, 2),
            'totalInterestPaid': round(total_interest_paid, 2),
            'outstandingBalance': round(total_borrowed - total_repaid, 2),
            'averageInterestRate': round(avg_interest_rate, 2)
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'message': 'Internal server error'})


# Apply authentication decorator
lambda_handler = require_auth(lambda_handler)
