"""Lender routes"""
from flask import Blueprint, request, jsonify
from services.lender_service import LenderService
from routes.auth import require_auth

lender_bp = Blueprint('lender', __name__)

@lender_bp.route('/deposit', methods=['POST'])
@require_auth
def deposit_funds():
    """Deposit funds"""
    if request.user.get('role') != 'lender':
        return jsonify({'error': 'Unauthorized - Lender access required'}), 403

    data = request.get_json()
    
    amount = data.get('amount')
    duration = data.get('duration')
    interest_rate = data.get('interestRate')
    
    if not all([amount, duration, interest_rate]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    result, status = LenderService.deposit_funds(
        request.user['userId'],
        float(amount),
        int(duration),
        float(interest_rate)
    )
    
    return jsonify(result), status

@lender_bp.route('/deposits', methods=['GET'])
@require_auth
def get_deposits():
    """Get lender's deposits"""
    if request.user.get('role') != 'lender':
        return jsonify({'error': 'Unauthorized - Lender access required'}), 403
        
    result, status = LenderService.get_deposits(request.user['userId'])
    return jsonify(result), status
