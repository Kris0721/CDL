"""
Authentication and authorization utilities
"""
import jwt
import bcrypt
import os
from datetime import datetime, timedelta
from typing import Dict, Optional, Callable
from functools import wraps
import json

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'default-secret-key-change-in-production')


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password
    """
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """
    Verify a password against a hash
    
    Args:
        password: Plain text password
        hashed: Hashed password
        
    Returns:
        True if password matches, False otherwise
    """
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception as e:
        print(f"Error verifying password: {str(e)}")
        return False


def generate_token(user_data: Dict, expires_in_days: int = 7) -> str:
    """
    Generate a JWT token
    
    Args:
        user_data: User data to encode in token (userId, email, role)
        expires_in_days: Token expiration in days
        
    Returns:
        JWT token string
    """
    payload = {
        **user_data,
        'exp': datetime.utcnow() + timedelta(days=expires_in_days),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


def verify_token(token: str) -> Optional[Dict]:
    """
    Verify and decode a JWT token
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        print("Token has expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"Invalid token: {str(e)}")
        return None


def get_user_from_event(event: Dict) -> Optional[Dict]:
    """
    Extract user information from Lambda event
    Supports both API Gateway authorizer context and Authorization header
    
    Args:
        event: Lambda event object
        
    Returns:
        User data dict if authenticated, None otherwise
    """
    # Try to get from authorizer context first
    try:
        authorizer = event.get('requestContext', {}).get('authorizer', {})
        if authorizer and 'userId' in authorizer:
            return {
                'userId': authorizer['userId'],
                'email': authorizer.get('email'),
                'role': authorizer.get('role')
            }
    except Exception:
        pass
    
    # Try to get from Authorization header
    try:
        headers = event.get('headers', {})
        auth_header = headers.get('Authorization') or headers.get('authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            return verify_token(token)
    except Exception as e:
        print(f"Error extracting user from event: {str(e)}")
    
    return None


def require_auth(handler: Callable) -> Callable:
    """
    Decorator to require authentication for Lambda handlers
    
    Usage:
        @require_auth
        def lambda_handler(event, context):
            user = event['user']  # User data injected by decorator
            ...
    """
    @wraps(handler)
    def wrapper(event, context):
        user = get_user_from_event(event)
        
        if not user:
            return {
                'statusCode': 401,
                'headers': get_cors_headers(),
                'body': json.dumps({'message': 'Unauthorized'})
            }
        
        # Inject user data into event
        event['user'] = user
        return handler(event, context)
    
    return wrapper


def require_role(allowed_roles: list) -> Callable:
    """
    Decorator to require specific roles for Lambda handlers
    
    Usage:
        @require_role(['admin', 'maintainer'])
        def lambda_handler(event, context):
            ...
    """
    def decorator(handler: Callable) -> Callable:
        @wraps(handler)
        def wrapper(event, context):
            user = get_user_from_event(event)
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': get_cors_headers(),
                    'body': json.dumps({'message': 'Unauthorized'})
                }
            
            if user.get('role') not in allowed_roles:
                return {
                    'statusCode': 403,
                    'headers': get_cors_headers(),
                    'body': json.dumps({'message': 'Forbidden: Insufficient permissions'})
                }
            
            # Inject user data into event
            event['user'] = user
            return handler(event, context)
        
        return wrapper
    return decorator


def get_cors_headers() -> Dict[str, str]:
    """
    Get CORS headers for API responses
    
    Returns:
        Dict of CORS headers
    """
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }


def create_response(status_code: int, body: Dict, headers: Optional[Dict] = None) -> Dict:
    """
    Create a standardized Lambda response
    
    Args:
        status_code: HTTP status code
        body: Response body dict
        headers: Additional headers
        
    Returns:
        Lambda response dict
    """
    response_headers = get_cors_headers()
    if headers:
        response_headers.update(headers)
    
    return {
        'statusCode': status_code,
        'headers': response_headers,
        'body': json.dumps(body)
    }
