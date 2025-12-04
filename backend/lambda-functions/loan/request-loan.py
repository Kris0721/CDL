import json
import boto3
import os
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
loans_table = dynamodb.Table(os.environ['LOANS_TABLE'])

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        user_id = event['requestContext']['authorizer']['userId']
        
        amount = body.get('amount')
        duration = body.get('duration')
        purpose = body.get('purpose')
        collateral = body.get('collateral', '')
        
        if not amount or not duration or not purpose:
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'Missing required fields'})
            }
        
        # Calculate interest
        rates = {30: 6, 60: 7.5, 90: 8.5, 180: 10}
        rate = rates.get(int(duration), 6)
        interest = float(amount) * (rate / 100) * (int(duration) / 365)
        total_repayment = float(amount) + interest
        
        # Create loan request
        loan_id = f"loan_{int(datetime.now().timestamp())}"
        loans_table.put_item(
            Item={
                'loanId': loan_id,
                'borrowerId': user_id,
                'amount': str(amount),
                'duration': int(duration),
                'interestRate': rate,
                'interest': str(interest),
                'totalRepayment': str(total_repayment),
                'purpose': purpose,
                'collateral': collateral,
                'status': 'pending',
                'createdAt': datetime.now().isoformat(),
                'amountPaid': '0'
            }
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Loan request submitted successfully',
                'loanId': loan_id,
                'totalRepayment': str(total_repayment)
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal server error'})
        }
