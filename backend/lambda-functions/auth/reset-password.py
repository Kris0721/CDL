import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table(os.environ['USERS_TABLE'])

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        
        email = body.get('email')
        
        if not email:
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'Missing email'})
            }
        
        # Generate new OTP
        import random
        otp = str(random.randint(100000, 999999))
        
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
        
        # Update OTP
        users_table.update_item(
            Key={'userId': user['userId']},
            UpdateExpression='SET otp = :otp',
            ExpressionAttributeValues={':otp': otp}
        )
        
        # Send OTP email
        ses = boto3.client('ses')
        ses.send_email(
            Source='noreply@defi-lending.com',
            Destination={'ToAddresses': [email]},
            Message={
                'Subject': {'Data': 'Password Reset OTP'},
                'Body': {
                    'Text': {'Data': f'Your password reset code is: {otp}'}
                }
            }
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Password reset OTP sent'})
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal server error'})
        }
