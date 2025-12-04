"""
Repay loan
"""
import json
import os
import sys

# Add layer to path
sys.path.insert(0, '/opt/python')

from auth_utils import require_auth, create_response
from db_utils import get_item_by_id, update_item, put_item
from validation_utils import validate_amount
from datetime import datetime


def lambda_handler(event, context):
    """
    Process loan repayment
    
    Request body:
    {
        "loanId": "loan_123",
        "amount": 1000.00,
        "txHash": "0x..." (blockchain transaction hash)
    }
    """
    try:
        # Get authenticated user
        user = event.get('user')
        if not user:
            return create_response(401, {'message': 'Unauthorized'})
        
        body = json.loads(event.get('body', '{}'))
        
        loan_id = body.get('loanId')
        amount = body.get('amount')
        tx_hash = body.get('txHash', '')
        
        if not loan_id or not amount:
            return create_response(400, {'message': 'Loan ID and amount are required'})
        
        # Validate amount
        is_valid, error_msg = validate_amount(amount)
        if not is_valid:
            return create_response(400, {'message': error_msg})
        
        amount_float = float(amount)
        
        # Get loan data
        loan = get_item_by_id(
            os.environ['LOANS_TABLE'],
            'loanId',
            loan_id
        )
        
        if not loan:
            return create_response(404, {'message': 'Loan not found'})
        
        # Check authorization
        if loan['borrowerId'] != user['userId']:
            return create_response(403, {'message': 'Forbidden'})
        
        # Check if loan can be repaid
        if loan.get('status') not in ['disbursed', 'active']:
            return create_response(400, {'message': f'Cannot repay loan with status: {loan.get("status")}'})
        
        # Calculate new amount paid
        current_paid = float(loan.get('amountPaid', 0))
        new_paid = current_paid + amount_float
        total_repayment = float(loan['totalRepayment'])
        
        # Check if overpayment
        if new_paid > total_repayment:
            return create_response(400, {'message': f'Payment amount exceeds remaining balance. Remaining: ${total_repayment - current_paid:.2f}'})
        
        # Determine new status
        new_status = 'repaid' if new_paid >= total_repayment else 'active'
        
        # Update loan
        updates = {
            'amountPaid': str(new_paid),
            'status': new_status,
            'lastPaymentAt': datetime.now().isoformat()
        }
        
        if new_status == 'repaid':
            updates['repaidAt'] = datetime.now().isoformat()
        
        updated_loan = update_item(
            os.environ['LOANS_TABLE'],
            {'loanId': loan_id},
            updates
        )
        
        if not updated_loan:
            return create_response(500, {'message': 'Failed to update loan'})
        
        # Create transaction record
        transaction_id = f"tx_{int(datetime.now().timestamp())}_{loan_id}"
        transaction = {
            'transactionId': transaction_id,
            'userId': user['userId'],
            'loanId': loan_id,
            'type': 'repayment',
            'amount': str(amount_float),
            'txHash': tx_hash,
            'status': 'completed',
            'timestamp': int(datetime.now().timestamp()),
            'createdAt': datetime.now().isoformat()
        }
        
        put_item(os.environ['TRANSACTIONS_TABLE'], transaction)
        
        return create_response(200, {
            'message': 'Payment processed successfully',
            'loan': updated_loan,
            'transactionId': transaction_id,
            'remainingBalance': total_repayment - new_paid
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'message': 'Internal server error'})


# Apply authentication decorator
lambda_handler = require_auth(lambda_handler)
