"""
Approve loan (Admin only)
"""
import json
import os
import sys

# Add layer to path
sys.path.insert(0, '/opt/python')

from auth_utils import require_role, create_response
from db_utils import get_item_by_id, update_item
from email_utils import send_loan_approval_email
from datetime import datetime


def lambda_handler(event, context):
    """
    Approve a loan request (Admin/Maintainer only)
    
    Request body:
    {
        "loanId": "loan_123",
        "notes": "Optional approval notes"
    }
    """
    try:
        # Get authenticated user
        user = event.get('user')
        
        body = json.loads(event.get('body', '{}'))
        
        loan_id = body.get('loanId')
        notes = body.get('notes', '')
        
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
        
        # Check if loan is in pending status
        if loan.get('status') != 'pending':
            return create_response(400, {'message': f'Cannot approve loan with status: {loan.get("status")}'})
        
        # Get borrower data
        borrower = get_item_by_id(
            os.environ['USERS_TABLE'],
            'userId',
            loan['borrowerId']
        )
        
        if not borrower:
            return create_response(404, {'message': 'Borrower not found'})
        
        # Check KYC status
        if borrower.get('kycStatus') != 'approved':
            return create_response(400, {'message': 'Borrower KYC not approved'})
        
        # Update loan status
        updated_loan = update_item(
            os.environ['LOANS_TABLE'],
            {'loanId': loan_id},
            {
                'status': 'approved',
                'approvedBy': user['userId'],
                'approvedAt': datetime.now().isoformat(),
                'approvalNotes': notes
            }
        )
        
        if not updated_loan:
            return create_response(500, {'message': 'Failed to approve loan'})
        
        # Send approval email
        send_loan_approval_email(
            borrower['email'],
            borrower['fullName'],
            float(loan['amount']),
            loan_id
        )
        
        return create_response(200, {
            'message': 'Loan approved successfully',
            'loan': updated_loan
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'message': 'Internal server error'})


# Apply role-based authentication decorator
lambda_handler = require_role(['admin', 'maintainer'])(lambda_handler)
