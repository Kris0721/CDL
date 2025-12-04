import boto3
import os
import bcrypt
import uuid
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
USERS_TABLE = os.getenv('USERS_TABLE', 'defi-lending-users')
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')

def create_maintainer():
    dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
    table = dynamodb.Table(USERS_TABLE)
    
    email = "kris7ind@gmail.com"
    password = "Latur@2012"  # Maintainer password - CHANGE AFTER FIRST LOGIN
    
    # Check if user exists
    response = table.get_item(Key={'email': email})
    if 'Item' in response:
        print(f"User {email} already exists. Updating role to maintainer...")
        table.update_item(
            Key={'email': email},
            UpdateExpression="set #r = :r, #s = :s",
            ExpressionAttributeNames={'#r': 'role', '#s': 'status'},
            ExpressionAttributeValues={':r': 'maintainer', ':s': 'active'}
        )
        print("Role updated successfully.")
        return

    # Create new user
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    user_item = {
        'email': email,
        'id': str(uuid.uuid4()),
        'fullName': 'Kris',
        'password': hashed_password,
        'role': 'maintainer',
        'status': 'active',
        'kycStatus': 'verified',
        'createdAt': datetime.utcnow().isoformat(),
        'updatedAt': datetime.utcnow().isoformat(),
        'walletAddress': '0x0000000000000000000000000000000000000000', # Placeholder
        'walletName': 'Admin Wallet'
    }
    
    table.put_item(Item=user_item)
    print(f"Successfully created maintainer account: {email}")
    print(f"Default password: {password}")

if __name__ == "__main__":
    create_maintainer()
