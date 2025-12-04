"""
Update wallet address
"""
import json
import os
import sys

# Add layer to path
sys.path.insert(0, '/opt/python')

from auth_utils import require_auth, create_response
from db_utils import update_item
from validation_utils import validate_wallet_address


def lambda_handler(event, context):
    """
    Update user's wallet address
    
    Request body:
    {
        "walletAddress": "0x..."
    }
    """
    try:
        # Get authenticated user
        user = event.get('user')
        if not user:
            return create_response(401, {'message': 'Unauthorized'})
        
        body = json.loads(event.get('body', '{}'))
        user_id = user['userId']
        
        wallet_address = body.get('walletAddress', '').strip()
        
        # Validate wallet address
        is_valid, error_msg = validate_wallet_address(wallet_address)
        if not is_valid:
            return create_response(400, {'message': error_msg})
        
        # Update wallet address
        updated_user = update_item(
            os.environ['USERS_TABLE'],
            {'userId': user_id},
            {'walletAddress': wallet_address}
        )
        
        if not updated_user:
            return create_response(500, {'message': 'Failed to update wallet address'})
        
        return create_response(200, {
            'message': 'Wallet address updated successfully',
            'walletAddress': wallet_address
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'message': 'Internal server error'})


# Apply authentication decorator
lambda_handler = require_auth(lambda_handler)
