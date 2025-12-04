"""
Update user profile
"""
import json
import os
import sys

# Add layer to path
sys.path.insert(0, '/opt/python')

from auth_utils import require_auth, create_response
from db_utils import get_item_by_id, update_item
from validation_utils import sanitize_string


def lambda_handler(event, context):
    """
    Update user profile information
    
    Request body:
    {
        "fullName": "John Doe",
        "phone": "+1234567890"
    }
    """
    try:
        # Get authenticated user
        user = event.get('user')
        if not user:
            return create_response(401, {'message': 'Unauthorized'})
        
        body = json.loads(event.get('body', '{}'))
        user_id = user['userId']
        
        # Get current user data
        current_user = get_item_by_id(
            os.environ['USERS_TABLE'],
            'userId',
            user_id
        )
        
        if not current_user:
            return create_response(404, {'message': 'User not found'})
        
        # Prepare updates
        updates = {}
        
        if 'fullName' in body:
            updates['fullName'] = sanitize_string(body['fullName'], 100)
        
        if 'phone' in body:
            updates['phone'] = sanitize_string(body['phone'], 20)
        
        if not updates:
            return create_response(400, {'message': 'No fields to update'})
        
        # Update user
        updated_user = update_item(
            os.environ['USERS_TABLE'],
            {'userId': user_id},
            updates
        )
        
        if not updated_user:
            return create_response(500, {'message': 'Failed to update profile'})
        
        # Remove sensitive data
        updated_user.pop('passwordHash', None)
        updated_user.pop('otp', None)
        
        return create_response(200, {
            'message': 'Profile updated successfully',
            'user': updated_user
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'message': 'Internal server error'})


# Apply authentication decorator
lambda_handler = require_auth(lambda_handler)
