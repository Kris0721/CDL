"""
Refresh JWT token
"""
import json
import os
import sys

# Add layer to path
sys.path.insert(0, '/opt/python')

from auth_utils import verify_token, generate_token, create_response


def lambda_handler(event, context):
    """
    Refresh JWT token
    
    Request body:
    {
        "token": "current_jwt_token"
    }
    """
    try:
        body = json.loads(event.get('body', '{}'))
        
        token = body.get('token')
        if not token:
            return create_response(400, {'message': 'Token is required'})
        
        # Verify current token
        payload = verify_token(token)
        if not payload:
            return create_response(401, {'message': 'Invalid or expired token'})
        
        # Generate new token with same user data
        new_token = generate_token({
            'userId': payload['userId'],
            'email': payload['email'],
            'role': payload['role']
        })
        
        return create_response(200, {
            'message': 'Token refreshed successfully',
            'token': new_token
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'message': 'Internal server error'})
