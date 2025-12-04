import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table(os.environ['USERS_TABLE'])

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        
        email = body.get('email')
        otp = body.get('otp')
        
        if not email or not otp:
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'Missing email or OTP'})
            }
        
        # Query user by email
        response = users_table.scan(
            FilterExpression='email = :email',
            ExpressionAttributeValues={':email': email}
        )
        
        if not response['Items']:
            return {
                'statusCode': 404,
                'body': json.dumps({'message': 'User not found'})
            }
        
        user = response['Items'][0]
        
        # Verify OTP
        if user.get('otp') != otp:
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'Invalid OTP'})
            }
        
        # Update user as verified
        users_table.update_item(
            Key={'userId': user['userId']},
            UpdateExpression='SET verified = :verified, otp = :otp',
            ExpressionAttributeValues={
                ':verified': True,
                ':otp': ''
            }
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Email verified successfully'})
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal server error'})
        }
