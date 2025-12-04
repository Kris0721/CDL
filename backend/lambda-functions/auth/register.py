import json
import boto3
import hashlib
import os
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
cognito = boto3.client('cognito-idp')
ses = boto3.client('ses')

users_table = dynamodb.Table(os.environ['USERS_TABLE'])

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        
        email = body.get('email')
        password = body.get('password')
        full_name = body.get('fullName')
        role = body.get('role', 'borrower')
        wallet_address = body.get('walletAddress', '')
        
        # Validate input
        if not email or not password or not full_name:
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'Missing required fields'})
            }
        
        # Hash password
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        # Generate OTP
        import random
        otp = str(random.randint(100000, 999999))
        
        # Create user in DynamoDB
        user_id = f"user_{int(datetime.now().timestamp())}"
        users_table.put_item(
            Item={
                'userId': user_id,
                'email': email,
                'passwordHash': password_hash,
                'fullName': full_name,
                'role': role,
                'walletAddress': wallet_address,
                'otp': otp,
                'verified': False,
                'createdAt': datetime.now().isoformat(),
                'kycStatus': 'pending'
            }
        )
        
        # Send OTP email
        ses.send_email(
            Source='noreply@defi-lending.com',
            Destination={'ToAddresses': [email]},
            Message={
                'Subject': {'Data': 'Verify Your Email'},
                'Body': {
                    'Text': {'Data': f'Your verification code is: {otp}'}
                }
            }
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Registration successful. Please verify your email.',
                'userId': user_id
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal server error'})
        }
