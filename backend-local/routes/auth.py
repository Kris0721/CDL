"""Authentication routes"""
from flask import Blueprint, request, jsonify
from services.auth_service import AuthService
from functools import wraps
import jwt
from config import Config

auth_bp = Blueprint('auth', __name__)

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        payload = AuthService.verify_token(token)
        
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        request.user = payload
        return f(*args, **kwargs)
    
    return decorated_function

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('fullName')
    role = data.get('role', 'borrower')
    
    if not all([email, password, full_name]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    result, status = AuthService.register_user(email, password, full_name, role)
    return jsonify(result), status

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """Verify OTP"""
    data = request.get_json()
    
    email = data.get('email')
    otp = data.get('otp')
    
    if not all([email, otp]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    result, status = AuthService.verify_otp(email, otp)
    return jsonify(result), status

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()
    
    email = data.get('email')
    password = data.get('password')
    
    if not all([email, password]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    result, status = AuthService.login(email, password)
    return jsonify(result), status

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    """Refresh access token"""
    data = request.get_json()
    
    refresh_token = data.get('refreshToken')
    
    if not refresh_token:
        return jsonify({'error': 'Missing refresh token'}), 400
    
    result, status = AuthService.refresh_token(refresh_token)
    return jsonify(result), status

@auth_bp.route('/profile', methods=['GET'])
@require_auth
def get_profile():
    """Get current user profile"""
    from database.db import db
    from database.models import User
    
    user = db.execute_query(
        'SELECT * FROM users WHERE user_id = ?',
        (request.user['userId'],)
    )
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': User.to_dict(user[0])}), 200
