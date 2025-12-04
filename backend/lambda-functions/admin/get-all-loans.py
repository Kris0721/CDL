"""
Get all loans (Admin only)
"""
import json
import os
import sys

# Add layer to path
sys.path.insert(0, '/opt/python')

from auth_utils import require_role, create_response
from db_utils import scan_table, query_by_index
from boto3.dynamodb.conditions import Attr


def lambda_handler(event, context):
    """
    Get all loans with filtering (Admin/Maintainer only)
    
    Query parameters:
    - status (optional): Filter by loan status
    - limit (optional): Number of results (default 50)
    - lastKey (optional): For pagination
    """
    try:
        # Get query parameters
        params = event.get('queryStringParameters') or {}
        status_filter = params.get('status')
        limit = int(params.get('limit', 50))
        last_key = params.get('lastKey')
        
        # If status filter provided, use StatusIndex
        if status_filter:
            result = query_by_index(
                os.environ['LOANS_TABLE'],
                'StatusIndex',
                'status',
                status_filter,
                limit=min(limit, 100),
                last_key=json.loads(last_key) if last_key else None
            )
        else:
            # Otherwise scan table
            result = scan_table(
                os.environ['LOANS_TABLE'],
                limit=min(limit, 100),
                last_key=json.loads(last_key) if last_key else None
            )
        
        loans = result.get('items', [])
        
        return create_response(200, {
            'loans': loans,
            'count': len(loans),
            'lastKey': json.dumps(result.get('lastKey')) if result.get('lastKey') else None
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'message': 'Internal server error'})


# Apply role-based authentication decorator
lambda_handler = require_role(['admin', 'maintainer'])(lambda_handler)
