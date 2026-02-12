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
@lender_bp.route('/marketplace', methods=['GET'])
@require_auth
def get_marketplace():
    """Get open loan requests"""
    if request.user.get('role') != 'lender':
        return jsonify({'error': 'Unauthorized'}), 403
    result, status = LenderService.get_open_requests()
    return jsonify(result), status

@lender_bp.route('/offer', methods=['POST'])
@require_auth
def make_offer():
    """Make an offer"""
    if request.user.get('role') != 'lender':
        return jsonify({'error': 'Unauthorized'}), 403
        
    data = request.get_json()
    loan_id = data.get('loanId')
    interest_rate = data.get('interestRate')
    
    if not all([loan_id, interest_rate]):
        return jsonify({'error': 'Missing required fields'}), 400
        
    result, status = LenderService.make_offer(
        request.user['userId'],
        loan_id,
        interest_rate
    )
    return jsonify(result), status

@lender_bp.route('/my-offers', methods=['GET'])
@require_auth
def get_lender_offers():
    """Get offers made by current lender"""
    if request.user.get('role') != 'lender':
        return jsonify({'error': 'Unauthorized'}), 403
        
    result, status = LenderService.get_lender_offers(request.user['userId'])
    return jsonify(result), status
