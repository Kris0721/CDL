"""
Get KYC documents
"""
import json
import os
import sys
import boto3

# Add layer to path
sys.path.insert(0, '/opt/python')

from auth_utils import require_auth, create_response
from db_utils import query_by_index

s3 = boto3.client('s3')


def lambda_handler(event, context):
    """
    Get user's KYC documents with presigned URLs
    
    Query parameters:
    - userId (optional): Get documents for specific user (admin only)
    """
    try:
        # Get authenticated user
        user = event.get('user')
        if not user:
            return create_response(401, {'message': 'Unauthorized'})
        
        # Check if requesting another user's documents
        params = event.get('queryStringParameters') or {}
        target_user_id = params.get('userId', user['userId'])
        
        # Only admin can view other users' documents
        if target_user_id != user['userId'] and user.get('role') not in ['admin', 'maintainer']:
            return create_response(403, {'message': 'Forbidden'})
        
        # Query documents by userId
        result = query_by_index(
            os.environ['KYC_DOCUMENTS_TABLE'],
            'UserDocumentsIndex',
            'userId',
            target_user_id,
            limit=50
        )
        
        documents = result.get('items', [])
        
        # Generate presigned URLs for documents
        for doc in documents:
            try:
                presigned_url = s3.generate_presigned_url(
                    'get_object',
                    Params={
                        'Bucket': doc['s3Bucket'],
                        'Key': doc['s3Key']
                    },
                    ExpiresIn=3600  # 1 hour
                )
                doc['downloadUrl'] = presigned_url
            except Exception as e:
                print(f"Error generating presigned URL: {str(e)}")
                doc['downloadUrl'] = None
        
        return create_response(200, {
            'documents': documents,
            'count': len(documents)
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'message': 'Internal server error'})


# Apply authentication decorator
lambda_handler = require_auth(lambda_handler)
