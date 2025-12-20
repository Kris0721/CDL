"""Authentication service"""
import bcrypt
import jwt
import time
import uuid
import random
from datetime import datetime, timedelta
from database.db import db
from database.models import User
from config import Config

class AuthService:
    """Handle authentication operations"""
    
    @staticmethod
    def hash_password(password):
        """Hash a password"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    @staticmethod
    def verify_password(password, password_hash):
        """Verify a password against its hash"""
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    
    @staticmethod
    def generate_otp():
        """Generate a 6-digit OTP"""
        return str(random.randint(100000, 999999))
    
    @staticmethod
    def generate_tokens(user_id, email, role):
        """Generate access and refresh tokens"""
        now = int(time.time())
        
        # Access token
        access_payload = {
            'userId': user_id,
            'email': email,
            'role': role,
            'type': 'access',
            'iat': now,
            'exp': now + Config.JWT_ACCESS_TOKEN_EXPIRES
        }
        access_token = jwt.encode(access_payload, Config.JWT_SECRET_KEY, algorithm='HS256')
        
        # Refresh token
        refresh_payload = {
            'userId': user_id,
            'type': 'refresh',
            'iat': now,
            'exp': now + Config.JWT_REFRESH_TOKEN_EXPIRES
        }
        refresh_token = jwt.encode(refresh_payload, Config.JWT_SECRET_KEY, algorithm='HS256')
        
        return {
            'accessToken': access_token,
            'refreshToken': refresh_token,
            'expiresIn': Config.JWT_ACCESS_TOKEN_EXPIRES
        }
    
    @staticmethod
    def verify_token(token):
        """Verify and decode a JWT token"""
        try:
            payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    @staticmethod
    def register_user(email, password, full_name, role='borrower'):
        """Register a new user"""
        # Check if user exists
        existing = db.execute_query(
            'SELECT user_id FROM users WHERE email = ?',
            (email,)
        )
        
        if existing:
            return {'error': 'Email already registered'}, 400
        
        # Create user
        user_id = str(uuid.uuid4())
        password_hash = AuthService.hash_password(password)
        otp_code = AuthService.generate_otp()
        otp_expires = int(time.time()) + 600  # 10 minutes
        now = int(time.time())
        
        db.execute_update(
            '''INSERT INTO users 
               (user_id, email, password_hash, full_name, role, otp_code, otp_expires_at, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (user_id, email, password_hash, full_name, role, otp_code, otp_expires, now, now)
        )
        
        # In production, send email with OTP
        print(f"[EMAIL] OTP for {email}: {otp_code}")
        
        return {
            'message': 'Registration successful. Please verify your email.',
            'userId': user_id,
            'otp': otp_code  # Remove in production
        }, 201
    
    @staticmethod
    def verify_otp(email, otp_code):
        """Verify OTP and activate user"""
        user = db.execute_query(
            'SELECT * FROM users WHERE email = ?',
            (email,)
        )
        
        if not user:
            return {'error': 'User not found'}, 404
        
        user = user[0]
        
        if user['is_verified']:
            return {'error': 'User already verified'}, 400
        
        if user['otp_code'] != otp_code:
            return {'error': 'Invalid OTP'}, 400
        
        if int(time.time()) > user['otp_expires_at']:
            return {'error': 'OTP expired'}, 400
        
        # Verify user
        db.execute_update(
            'UPDATE users SET is_verified = 1, otp_code = NULL, otp_expires_at = NULL WHERE email = ?',
            (email,)
        )
        
        return {'message': 'Email verified successfully'}, 200
    
    @staticmethod
    def login(email, password):
        """Login user"""
        user = db.execute_query(
            'SELECT * FROM users WHERE email = ?',
            (email,)
        )
        
        if not user:
            return {'error': 'Invalid credentials'}, 401
        
        user = user[0]
        
        if not AuthService.verify_password(password, user['password_hash']):
            return {'error': 'Invalid credentials'}, 401
        
        if not user['is_verified']:
            return {'error': 'Please verify your email first'}, 403
        
        # Generate tokens
        tokens = AuthService.generate_tokens(user['user_id'], user['email'], user['role'])
        user_data = User.to_dict(user)
        
        return {
            'message': 'Login successful',
            'user': user_data,
            'token': tokens['accessToken'],  # Match frontend expectation
            'role': user['role'],            # Match frontend expectation
            'tokens': tokens
        }, 200
    
    @staticmethod
    def refresh_token(refresh_token):
        """Refresh access token"""
        payload = AuthService.verify_token(refresh_token)
        
        if not payload or payload.get('type') != 'refresh':
            return {'error': 'Invalid refresh token'}, 401
        
        # Get user
        user = db.execute_query(
            'SELECT * FROM users WHERE user_id = ?',
            (payload['userId'],)
        )
        
        if not user:
            return {'error': 'User not found'}, 404
        
        user = user[0]
        
        # Generate new tokens
        tokens = AuthService.generate_tokens(user['user_id'], user['email'], user['role'])
        
        return {'tokens': tokens}, 200
