"""
Calculate loan interest and amounts
"""
import json
import os
import sys
from datetime import datetime

# Add layer to path
sys.path.insert(0, '/opt/python')

from auth_utils import require_auth, create_response
from db_utils import get_item_by_id


def lambda_handler(event, context):
    """
    Calculate current interest and total amount due for a loan
    
    Path parameters:
    - loanId: Loan ID
    """
    try:
        # Get authenticated user
        user = event.get('user')
        if not user:
            return create_response(401, {'message': 'Unauthorized'})
        
        # Get loan ID from path parameters
        path_params = event.get('pathParameters') or {}
        loan_id = path_params.get('loanId')
        
        if not loan_id:
            return create_response(400, {'message': 'Loan ID is required'})
        
        # Get loan data
        loan = get_item_by_id(
            os.environ['LOANS_TABLE'],
            'loanId',
            loan_id
        )
        
        if not loan:
            return create_response(404, {'message': 'Loan not found'})
        
        # Check authorization
        if loan['borrowerId'] != user['userId'] and user.get('role') not in ['admin', 'maintainer']:
            return create_response(403, {'message': 'Forbidden'})
        
        # Extract loan details
        principal = float(loan['amount'])
        interest_rate = float(loan['interestRate'])
        duration_days = int(loan['duration'])
        amount_paid = float(loan.get('amountPaid', 0))
        total_repayment = float(loan['totalRepayment'])
        
        # Calculate interest
        interest = principal * (interest_rate / 100) * (duration_days / 365)
        
        # Calculate remaining balance
        remaining_balance = total_repayment - amount_paid
        
        # Calculate days elapsed if disbursed
        days_elapsed = 0
        if loan.get('disbursedAt'):
            disbursed_date = datetime.fromisoformat(loan['disbursedAt'].replace('Z', '+00:00'))
            days_elapsed = (datetime.now() - disbursed_date.replace(tzinfo=None)).days
        
        # Calculate progress percentage
        progress_percentage = (amount_paid / total_repayment * 100) if total_repayment > 0 else 0
        
        return create_response(200, {
            'loanId': loan_id,
            'principal': principal,
            'interestRate': interest_rate,
            'interest': interest,
            'totalRepayment': total_repayment,
            'amountPaid': amount_paid,
            'remainingBalance': remaining_balance,
            'durationDays': duration_days,
            'daysElapsed': days_elapsed,
            'progressPercentage': round(progress_percentage, 2),
            'status': loan.get('status')
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'message': 'Internal server error'})


# Apply authentication decorator
lambda_handler = require_auth(lambda_handler)
