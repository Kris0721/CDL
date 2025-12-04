"""
Get loan details
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
    Get details of a specific loan
    
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
        
        # Check authorization - user can only view their own loans unless admin
        if loan['borrowerId'] != user['userId'] and user.get('role') not in ['admin', 'maintainer', 'lender']:
            return create_response(403, {'message': 'Forbidden'})
        
        return create_response(200, {
            'loan': loan
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'message': 'Internal server error'})


# Apply authentication decorator
lambda_handler = require_auth(lambda_handler)
