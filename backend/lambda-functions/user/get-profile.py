"""
Get user profile
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
    Get user profile information
    
    Query parameters:
    - userId (optional): Get specific user profile (admin only)
    """
    try:
        # Get authenticated user
        user = event.get('user')
        if not user:
            return create_response(401, {'message': 'Unauthorized'})
        
        # Check if requesting another user's profile
        params = event.get('queryStringParameters') or {}
        target_user_id = params.get('userId', user['userId'])
        
        # Only admin can view other users' profiles
        if target_user_id != user['userId'] and user.get('role') not in ['admin', 'maintainer']:
            return create_response(403, {'message': 'Forbidden'})
        
        # Get user data
        user_data = get_item_by_id(
            os.environ['USERS_TABLE'],
            'userId',
            target_user_id
        )
        
        if not user_data:
            return create_response(404, {'message': 'User not found'})
        
        # Remove sensitive data
        user_data.pop('passwordHash', None)
        user_data.pop('otp', None)
        
        return create_response(200, {
            'user': user_data
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'message': 'Internal server error'})


# Apply authentication decorator
lambda_handler = require_auth(lambda_handler)
