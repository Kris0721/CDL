"""Loan routes"""
from flask import Blueprint, request, jsonify
from services.loan_service import LoanService
from routes.auth import require_auth

loans_bp = Blueprint('loans', __name__)

@loans_bp.route('/request', methods=['POST'])
@require_auth
def request_loan():
    """Request a new loan"""
    data = request.get_json()
    
    amount = data.get('amount')
    duration = data.get('duration')
    collateral_amount = data.get('collateralAmount')
    collateral_token = data.get('collateralToken')
    
    if not all([amount, duration]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    result, status = LoanService.request_loan(
        request.user['userId'],
        float(amount),
        int(duration),
        collateral_amount,
        collateral_token
    )
    
    return jsonify(result), status

@loans_bp.route('/user', methods=['GET'])
@require_auth
def get_user_loans():
    """Get user's loans"""
    result, status = LoanService.get_user_loans(request.user['userId'])
    return jsonify(result), status

@loans_bp.route('/<loan_id>', methods=['GET'])
@require_auth
def get_loan(loan_id):
    """Get a specific loan"""
    result, status = LoanService.get_loan(loan_id)
    return jsonify(result), status

@loans_bp.route('/approve', methods=['POST'])
@require_auth
def approve_loan():
    """Approve a loan (admin only)"""
    if request.user.get('role') != 'maintainer':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    loan_id = data.get('loanId')
    
    if not loan_id:
        return jsonify({'error': 'Missing loan ID'}), 400
    
    result, status = LoanService.approve_loan(loan_id, request.user['userId'])
    return jsonify(result), status

@loans_bp.route('/reject', methods=['POST'])
@require_auth
def reject_loan():
    """Reject a loan (admin only)"""
    if request.user.get('role') != 'maintainer':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    loan_id = data.get('loanId')
    reason = data.get('reason')
    
    if not loan_id:
        return jsonify({'error': 'Missing loan ID'}), 400
    
    result, status = LoanService.reject_loan(loan_id, request.user['userId'], reason)
    return jsonify(result), status

@loans_bp.route('/disburse', methods=['POST'])
@require_auth
def disburse_loan():
    """Disburse a loan (admin only)"""
    if request.user.get('role') != 'maintainer':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    loan_id = data.get('loanId')
    blockchain_loan_id = data.get('blockchainLoanId')
    
    if not loan_id:
        return jsonify({'error': 'Missing loan ID'}), 400
    
    result, status = LoanService.disburse_loan(loan_id, request.user['userId'], blockchain_loan_id)
    return jsonify(result), status

@loans_bp.route('/repay', methods=['POST'])
@require_auth
def repay_loan():
    """Repay a loan"""
    data = request.get_json()
    
    loan_id = data.get('loanId')
    amount = data.get('amount')
    tx_hash = data.get('txHash')
    
    if not all([loan_id, amount]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    result, status = LoanService.repay_loan(
        loan_id,
        request.user['userId'],
        float(amount),
        tx_hash
    )
    
    return jsonify(result), status
@loans_bp.route('/<loan_id>/offers', methods=['GET'])
@require_auth
def get_loan_offers(loan_id):
    """Get offers for a loan"""
    print(f"DEBUG: Fetching offers for loan {loan_id} by user {request.user['userId']}")
    result, status = LoanService.get_loan_offers(loan_id, request.user['userId'])
    print(f"DEBUG: Found {len(result.get('offers', []))} offers")
    return jsonify(result), status

@loans_bp.route('/accept-offer', methods=['POST'])
@require_auth
def accept_offer():
    """Accept an offer"""
    data = request.get_json()
    loan_id = data.get('loanId')
    offer_id = data.get('offerId')
    
    if not all([loan_id, offer_id]):
        return jsonify({'error': 'Missing required fields'}), 400
        
    result, status = LoanService.accept_offer(loan_id, offer_id, request.user['userId'])
    return jsonify(result), status
