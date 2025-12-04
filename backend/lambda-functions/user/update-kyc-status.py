"""
Update KYC status (Admin only)
"""
import json
import os
import sys

# Add layer to path
sys.path.insert(0, '/opt/python')

from auth_utils import require_role, create_response
from db_utils import get_item_by_id, update_item
from validation_utils import validate_kyc_status, sanitize_string
from email_utils import send_kyc_status_email


def lambda_handler(event, context):
    """
    Update KYC status for a user (Admin/Maintainer only)
    
    Request body:
    {
        "userId": "user_123",
        "documentId": "doc_123",
        "status": "approved|rejected",
        "reason": "Optional rejection reason"
    }
    """
    try:
        # Get authenticated user (already validated by decorator)
        user = event.get('user')
        
        body = json.loads(event.get('body', '{}'))
        
        target_user_id = body.get('userId')
        document_id = body.get('documentId')
        status = body.get('status')
        reason = sanitize_string(body.get('reason', ''), 500)
        
        if not target_user_id or not document_id or not status:
            return create_response(400, {'message': 'Missing required fields'})
        
        # Validate status
        is_valid, error_msg = validate_kyc_status(status)
        if not is_valid:
            return create_response(400, {'message': error_msg})
        
        # Get user data
        user_data = get_item_by_id(
            os.environ['USERS_TABLE'],
            'userId',
            target_user_id
        )
        
        if not user_data:
            return create_response(404, {'message': 'User not found'})
        
        # Update document status
        updated_doc = update_item(
            os.environ['KYC_DOCUMENTS_TABLE'],
            {'documentId': document_id},
            {
                'status': status,
                'reviewedBy': user['userId'],
                'reviewedAt': datetime.now().isoformat(),
                'reason': reason if status == 'rejected' else ''
            }
        )
        
        if not updated_doc:
            return create_response(500, {'message': 'Failed to update document status'})
        
        # Update user KYC status
        user_kyc_status = 'approved' if status == 'approved' else 'rejected'
        update_item(
            os.environ['USERS_TABLE'],
            {'userId': target_user_id},
            {'kycStatus': user_kyc_status}
        )
        
        # Send email notification
        send_kyc_status_email(
            user_data['email'],
            user_data['fullName'],
            status,
            reason if status == 'rejected' else None
        )
        
        return create_response(200, {
            'message': f'KYC status updated to {status}',
            'documentId': document_id
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'message': 'Internal server error'})


# Import datetime after sys.path modification
from datetime import datetime

# Apply role-based authentication decorator
lambda_handler = require_role(['admin', 'maintainer'])(lambda_handler)
