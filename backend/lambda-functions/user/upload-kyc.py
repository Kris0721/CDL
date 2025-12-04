"""
Upload KYC documents
"""
import json
import os
import sys
import base64
import boto3
from datetime import datetime

# Add layer to path
sys.path.insert(0, '/opt/python')

from auth_utils import require_auth, create_response
from db_utils import put_item, update_item
from validation_utils import sanitize_string

s3 = boto3.client('s3')
S3_BUCKET = os.environ.get('KYC_BUCKET', 'defi-lending-kyc-documents')


def lambda_handler(event, context):
    """
    Upload KYC documents
    
    Request body:
    {
        "documentType": "passport|drivers_license|national_id",
        "documentNumber": "ABC123456",
        "fileData": "base64_encoded_file_data",
        "fileName": "passport.jpg",
        "fileType": "image/jpeg"
    }
    """
    try:
        # Get authenticated user
        user = event.get('user')
        if not user:
            return create_response(401, {'message': 'Unauthorized'})
        
        body = json.loads(event.get('body', '{}'))
        user_id = user['userId']
        
        # Validate required fields
        document_type = body.get('documentType')
        document_number = sanitize_string(body.get('documentNumber', ''), 50)
        file_data = body.get('fileData')
        file_name = sanitize_string(body.get('fileName', ''), 100)
        file_type = body.get('fileType', 'application/octet-stream')
        
        if not document_type or not document_number or not file_data or not file_name:
            return create_response(400, {'message': 'Missing required fields'})
        
        valid_types = ['passport', 'drivers_license', 'national_id', 'proof_of_address']
        if document_type not in valid_types:
            return create_response(400, {'message': f'Invalid document type. Must be one of: {", ".join(valid_types)}'})
        
        # Decode base64 file data
        try:
            file_bytes = base64.b64decode(file_data)
        except Exception as e:
            return create_response(400, {'message': 'Invalid file data encoding'})
        
        # Generate S3 key
        timestamp = int(datetime.now().timestamp())
        s3_key = f"kyc/{user_id}/{document_type}_{timestamp}_{file_name}"
        
        # Upload to S3
        try:
            s3.put_object(
                Bucket=S3_BUCKET,
                Key=s3_key,
                Body=file_bytes,
                ContentType=file_type,
                Metadata={
                    'userId': user_id,
                    'documentType': document_type,
                    'documentNumber': document_number
                }
            )
        except Exception as e:
            print(f"S3 upload error: {str(e)}")
            return create_response(500, {'message': 'Failed to upload document'})
        
        # Create KYC document record
        document_id = f"doc_{timestamp}_{user_id}"
        kyc_record = {
            'documentId': document_id,
            'userId': user_id,
            'documentType': document_type,
            'documentNumber': document_number,
            's3Key': s3_key,
            's3Bucket': S3_BUCKET,
            'fileName': file_name,
            'fileType': file_type,
            'status': 'pending',
            'uploadedAt': datetime.now().isoformat()
        }
        
        success = put_item(os.environ['KYC_DOCUMENTS_TABLE'], kyc_record)
        
        if not success:
            return create_response(500, {'message': 'Failed to create document record'})
        
        # Update user KYC status to under_review
        update_item(
            os.environ['USERS_TABLE'],
            {'userId': user_id},
            {'kycStatus': 'under_review'}
        )
        
        return create_response(200, {
            'message': 'Document uploaded successfully',
            'documentId': document_id
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return create_response(500, {'message': 'Internal server error'})


# Apply authentication decorator
lambda_handler = require_auth(lambda_handler)
