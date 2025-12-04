"""
Get transaction details
"""
import json
import os
import sys

# Add layer to path
sys.path.insert(0, '/opt/python')

from auth_utils import require_auth, create_response
from db_utils import get_item_by_id


def lambda_handler(event, context):
    """
    Get details of a specific transaction
    
    Path parameters:
    - transactionId: Transaction ID
    """
    try:
        # Get authenticated user
        user = event.get('user')
        if not user:
            return create_response(401, {'message': 'Unauthorized'})
        
        # Get transaction ID from path parameters
        path_params = event.get('pathParameters') or {}
        transaction_id = path_params.get('transactionId')
        
        if not transaction_id:
            return create_response(400, {'message': 'Transaction ID is required'})
        
        # Get transaction data
        transaction = get_item_by_id(
            os.environ['TRANSACTIONS_TABLE'],
            'transactionId',
            transaction_id
        )
        
        if not transaction:
            return create_response(404, {'message': 'Transaction not found'})
        
        # Check authorization
        if transaction['userId'] != user['userId'] and user.get('role') not in ['admin', 'maintainer']:
            return create_response(403, {'message': 'Forbidden'})
        
        return create_response(200, {
            'transaction': transaction
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'message': 'Internal server error'})


# Apply authentication decorator
lambda_handler = require_auth(lambda_handler)
