"""
Get transaction history
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
    Get transaction history for a user
    
    Query parameters:
    - type (optional): Filter by transaction type (disbursement/repayment)
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
        type_filter = params.get('type')
        limit = int(params.get('limit', 50))
        last_key = params.get('lastKey')
        
        # Query transactions by userId
        result = query_by_index(
            os.environ['TRANSACTIONS_TABLE'],
            'UserTransactionsIndex',
            'userId',
            user_id,
            limit=min(limit, 100),
            last_key=json.loads(last_key) if last_key else None
        )
        
        transactions = result.get('items', [])
        
        # Filter by type if provided
        if type_filter:
            transactions = [tx for tx in transactions if tx.get('type') == type_filter]
        
        # Sort by timestamp descending
        transactions.sort(key=lambda x: x.get('timestamp', 0), reverse=True)
        
        return create_response(200, {
            'transactions': transactions,
            'count': len(transactions),
            'lastKey': json.dumps(result.get('lastKey')) if result.get('lastKey') else None
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'message': 'Internal server error'})


# Apply authentication decorator
lambda_handler = require_auth(lambda_handler)
