import json
import boto3
import hashlib
import os
import jwt
from datetime import datetime, timedelta

dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table(os.environ['USERS_TABLE'])

SECRET_KEY = os.environ['JWT_SECRET_KEY']

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        
        email = body.get('email')
        password = body.get('password')
        
        if not email or not password:
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'Missing email or password'})
            }
        
        # Hash password
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        # Query user by email
        response = users_table.scan(
            FilterExpression='email = :email',
            ExpressionAttributeValues={':email': email}
        )
        
        if not response['Items']:
            return {
                'statusCode': 401,
                'body': json.dumps({'message': 'Invalid credentials'})
            }
        
        user = response['Items'][0]
        
        # Verify password
        if user['passwordHash'] != password_hash:
            return {
                'statusCode': 401,
                'body': json.dumps({'message': 'Invalid credentials'})
            }
        
        # Check if verified
        if not user.get('verified', False):
            return {
                'statusCode': 403,
                'body': json.dumps({'message': 'Email not verified'})
            }
        
        # Generate JWT token
        token = jwt.encode(
            {
                'userId': user['userId'],
                'email': user['email'],
                'role': user['role'],
                'exp': datetime.utcnow() + timedelta(days=7)
            },
            SECRET_KEY,
            algorithm='HS256'
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Login successful',
                'token': token,
                'role': user['role'],
                'user': {
                    'userId': user['userId'],
                    'email': user['email'],
                    'fullName': user['fullName'],
                    'role': user['role']
                }
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal server error'})
        }
