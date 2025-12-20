"""Admin routes"""
from flask import Blueprint, request, jsonify
from routes.auth import require_auth
from services.loan_service import LoanService
from database.db import db
from database.models import User

admin_bp = Blueprint('admin', __name__)

def require_admin(f):
    """Decorator to require admin role"""
    from functools import wraps
    
    @wraps(f)
    @require_auth
    def decorated_function(*args, **kwargs):
        if request.user.get('role') != 'maintainer':
            return jsonify({'error': 'Unauthorized - Admin access required'}), 403
        return f(*args, **kwargs)
    
    return decorated_function

@admin_bp.route('/loans', methods=['GET'])
@require_admin
def get_all_loans():
    """Get all loans"""
    status = request.args.get('status')
    result, status_code = LoanService.get_all_loans(status)
    return jsonify(result), status_code

@admin_bp.route('/users', methods=['GET'])
@require_admin
def get_all_users():
    """Get all users"""
    users = db.execute_query('SELECT * FROM users ORDER BY created_at DESC')
    
    return jsonify({
        'users': [User.to_dict(user) for user in users],
        'count': len(users)
    }), 200

@admin_bp.route('/stats', methods=['GET'])
@require_admin
def get_platform_stats():
    """Get platform statistics"""
    # Total users
    total_users = db.execute_query('SELECT COUNT(*) as count FROM users')[0]['count']
    
    # Total loans
    total_loans = db.execute_query('SELECT COUNT(*) as count FROM loans')[0]['count']
    
    # Active loans
    active_loans = db.execute_query(
        "SELECT COUNT(*) as count FROM loans WHERE status = 'active'"
    )[0]['count']
    
    # Total loan amount
    total_amount = db.execute_query(
        'SELECT COALESCE(SUM(amount), 0) as total FROM loans'
    )[0]['total']
    
    # Total repaid
    total_repaid = db.execute_query(
        'SELECT COALESCE(SUM(amount_repaid), 0) as total FROM loans'
    )[0]['total']
    
    # Pending loans
    pending_loans = db.execute_query(
        "SELECT COUNT(*) as count FROM loans WHERE status = 'pending'"
    )[0]['count']
    
    # Completed loans
    completed_loans = db.execute_query(
        "SELECT COUNT(*) as count FROM loans WHERE status = 'completed'"
    )[0]['count']
    
    return jsonify({
        'stats': {
            'totalUsers': total_users,
            'totalLoans': total_loans,
            'activeLoans': active_loans,
            'pendingLoans': pending_loans,
            'completedLoans': completed_loans,
            'totalLoanAmount': total_amount,
            'totalRepaid': total_repaid,
            'platformRevenue': total_repaid - total_amount if total_repaid > total_amount else 0
        }
    }), 200
