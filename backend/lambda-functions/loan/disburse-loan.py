"""
Disburse loan
"""
import json
import os
import sys

# Add layer to path
sys.path.insert(0, '/opt/python')

from auth_utils import require_role, create_response
from db_utils import get_item_by_id, update_item, put_item
from email_utils import send_disbursement_email
from datetime import datetime, timedelta


def lambda_handler(event, context):
    """
    Disburse an approved loan (Admin/Maintainer only)
    This function updates the loan status and creates a transaction record.
    Actual blockchain transaction should be handled separately.
    
    Request body:
    {
        "loanId": "loan_123",
        "txHash": "0x..." (blockchain transaction hash)
    }
    """
    try:
        # Get authenticated user
        user = event.get('user')
        
        body = json.loads(event.get('body', '{}'))
        
        loan_id = body.get('loanId')
        tx_hash = body.get('txHash', '')
        
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
        
        # Check if loan is approved
        if loan.get('status') != 'approved':
            return create_response(400, {'message': f'Cannot disburse loan with status: {loan.get("status")}'})
        
        # Get borrower data
        borrower = get_item_by_id(
            os.environ['USERS_TABLE'],
            'userId',
            loan['borrowerId']
        )
        
        if not borrower:
            return create_response(404, {'message': 'Borrower not found'})
        
        # Check if borrower has wallet address
        if not borrower.get('walletAddress'):
            return create_response(400, {'message': 'Borrower wallet address not set'})
        
        # Calculate due date
        duration_days = int(loan['duration'])
        due_date = (datetime.now() + timedelta(days=duration_days)).isoformat()
        
        # Update loan status
        updated_loan = update_item(
            os.environ['LOANS_TABLE'],
            {'loanId': loan_id},
            {
                'status': 'disbursed',
                'disbursedBy': user['userId'],
                'disbursedAt': datetime.now().isoformat(),
                'dueDate': due_date,
                'txHash': tx_hash
            }
        )
        
        if not updated_loan:
            return create_response(500, {'message': 'Failed to disburse loan'})
        
        # Create transaction record
        transaction_id = f"tx_{int(datetime.now().timestamp())}_{loan_id}"
        transaction = {
            'transactionId': transaction_id,
            'userId': loan['borrowerId'],
            'loanId': loan_id,
            'type': 'disbursement',
            'amount': loan['amount'],
            'txHash': tx_hash,
            'status': 'completed',
            'timestamp': int(datetime.now().timestamp()),
            'createdAt': datetime.now().isoformat()
        }
        
        put_item(os.environ['TRANSACTIONS_TABLE'], transaction)
        
        # Send disbursement email
        send_disbursement_email(
            borrower['email'],
            borrower['fullName'],
            float(loan['amount']),
            tx_hash or 'Pending'
        )
        
        return create_response(200, {
            'message': 'Loan disbursed successfully',
            'loan': updated_loan,
            'transactionId': transaction_id
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'message': 'Internal server error'})


# Apply role-based authentication decorator
lambda_handler = require_role(['admin', 'maintainer'])(lambda_handler)
