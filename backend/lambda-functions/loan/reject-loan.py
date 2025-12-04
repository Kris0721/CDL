"""
Reject loan (Admin only)
"""
import json
import os
import sys

# Add layer to path
sys.path.insert(0, '/opt/python')

from auth_utils import require_role, create_response
from db_utils import get_item_by_id, update_item
from validation_utils import sanitize_string
from email_utils import send_loan_rejection_email
from datetime import datetime


def lambda_handler(event, context):
    """
    Reject a loan request (Admin/Maintainer only)
    
    Request body:
    {
        "loanId": "loan_123",
        "reason": "Rejection reason"
    }
    """
    try:
        # Get authenticated user
        user = event.get('user')
        
        body = json.loads(event.get('body', '{}'))
        
        loan_id = body.get('loanId')
        reason = sanitize_string(body.get('reason', 'Not specified'), 500)
        
        if not loan_id:
            return create_response(400, {'message': 'Loan ID is required'})
        
        if not reason or reason == 'Not specified':
            return create_response(400, {'message': 'Rejection reason is required'})
        
        # Get loan data
        loan = get_item_by_id(
            os.environ['LOANS_TABLE'],
            'loanId',
            loan_id
        )
        
        if not loan:
            return create_response(404, {'message': 'Loan not found'})
        
        # Check if loan is in pending status
        if loan.get('status') != 'pending':
            return create_response(400, {'message': f'Cannot reject loan with status: {loan.get("status")}'})
        
        # Get borrower data
        borrower = get_item_by_id(
            os.environ['USERS_TABLE'],
            'userId',
            loan['borrowerId']
        )
        
        if not borrower:
            return create_response(404, {'message': 'Borrower not found'})
        
        # Update loan status
        updated_loan = update_item(
            os.environ['LOANS_TABLE'],
            {'loanId': loan_id},
            {
                'status': 'rejected',
                'rejectedBy': user['userId'],
                'rejectedAt': datetime.now().isoformat(),
                'rejectionReason': reason
            }
        )
        
        if not updated_loan:
            return create_response(500, {'message': 'Failed to reject loan'})
        
        # Send rejection email
        send_loan_rejection_email(
            borrower['email'],
            borrower['fullName'],
            loan_id,
            reason
        )
        
        return create_response(200, {
            'message': 'Loan rejected',
            'loan': updated_loan
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'message': 'Internal server error'})


# Apply role-based authentication decorator
lambda_handler = require_role(['admin', 'maintainer'])(lambda_handler)
