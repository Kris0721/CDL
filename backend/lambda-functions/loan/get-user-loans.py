"""
Get user loans
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
    Get all loans for a user
    
    Query parameters:
    - status (optional): Filter by loan status
    - limit (optional): Number of results (default 50)
    - lastKey (optional): For pagination
    """
    try:
        # Get authenticated user
        user = event.get('user')
        if not user:
            return create_response(401, {'message': 'Unauthorized'})
        
        user_id = user['userId']
        
        # Get query parameters
        params = event.get('queryStringParameters') or {}
        status_filter = params.get('status')
        limit = int(params.get('limit', 50))
        last_key = params.get('lastKey')
        
        # Query loans by borrowerId
        result = query_by_index(
            os.environ['LOANS_TABLE'],
            'BorrowerIndex',
            'borrowerId',
            user_id,
            limit=min(limit, 100),  # Cap at 100
            last_key=json.loads(last_key) if last_key else None
        )
        
        loans = result.get('items', [])
        
        # Filter by status if provided
        if status_filter:
            loans = [loan for loan in loans if loan.get('status') == status_filter]
        
        return create_response(200, {
            'loans': loans,
            'count': len(loans),
            'lastKey': json.dumps(result.get('lastKey')) if result.get('lastKey') else None
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'message': 'Internal server error'})


# Apply authentication decorator
lambda_handler = require_auth(lambda_handler)
