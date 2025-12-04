"""
Get all users (Admin only)
"""
import json
import os
import sys

# Add layer to path
sys.path.insert(0, '/opt/python')

from auth_utils import require_role, create_response
from db_utils import scan_table
from boto3.dynamodb.conditions import Attr


def lambda_handler(event, context):
    """
    Get all users with filtering (Admin/Maintainer only)
    
    Query parameters:
    - role (optional): Filter by user role
    - kycStatus (optional): Filter by KYC status
    - limit (optional): Number of results (default 50)
    - lastKey (optional): For pagination
    """
    try:
        # Get query parameters
        params = event.get('queryStringParameters') or {}
        role_filter = params.get('role')
        kyc_status_filter = params.get('kycStatus')
        limit = int(params.get('limit', 50))
        last_key = params.get('lastKey')
        
        # Build filter expression
        filter_expr = None
        if role_filter:
            filter_expr = Attr('role').eq(role_filter)
        if kyc_status_filter:
            kyc_expr = Attr('kycStatus').eq(kyc_status_filter)
            filter_expr = kyc_expr if not filter_expr else filter_expr & kyc_expr
        
        # Scan table with filter
        result = scan_table(
            os.environ['USERS_TABLE'],
            filter_expr=filter_expr,
            limit=min(limit, 100),
            last_key=json.loads(last_key) if last_key else None
        )
        
        users = result.get('items', [])
        
        # Remove sensitive data
        for user in users:
            user.pop('passwordHash', None)
            user.pop('otp', None)
        
        return create_response(200, {
            'users': users,
            'count': len(users),
            'lastKey': json.dumps(result.get('lastKey')) if result.get('lastKey') else None
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'message': 'Internal server error'})


# Apply role-based authentication decorator
lambda_handler = require_role(['admin', 'maintainer'])(lambda_handler)
