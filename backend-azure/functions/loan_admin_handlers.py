"""
Loan and Admin Functions for Azure Functions App
Part 2: Loan operations and admin endpoints
"""
import azure.functions as func
import logging
import json
from datetime import datetime
import uuid

# Import shared services
from shared.db_client import get_db_client
from shared.email_service import get_email_service
from shared.auth_service import get_auth_service

# This file contains additional route handlers to be added to function_app.py

# ============================================================================
# LOAN FUNCTIONS
# ============================================================================

def loan_request_handler(req: func.HttpRequest) -> func.HttpResponse:
    """Request loan endpoint"""
    logging.info('Request loan function triggered')
    
    try:
        auth = get_auth_service()
        
        # Extract and verify token
        auth_header = req.headers.get('Authorization')
        token = auth.extract_token_from_header(auth_header)
        
        if not token:
            return func.HttpResponse(
                json.dumps({'error': 'Missing authorization token'}),
                status_code=401,
                mimetype='application/json'
            )
        
        payload = auth.verify_token(token)
        if not payload:
            return func.HttpResponse(
                json.dumps({'error': 'Invalid or expired token'}),
                status_code=401,
                mimetype='application/json'
            )
        
        req_body = req.get_json()
        amount = req_body.get('amount')
        collateral_amount = req_body.get('collateralAmount')
        duration = req_body.get('duration')
        interest_rate = req_body.get('interestRate')
        
        if not all([amount, collateral_amount, duration]):
            return func.HttpResponse(
                json.dumps({'error': 'Missing required fields'}),
                status_code=400,
                mimetype='application/json'
            )
        
        db = get_db_client()
        
        # Create loan
        loan_id = str(uuid.uuid4())
        loan_data = {
            'id': loan_id,
            'loanId': loan_id,
            'borrowerId': payload['sub'],
            'amount': float(amount),
            'collateralAmount': float(collateral_amount),
            'duration': int(duration),
            'interestRate': float(interest_rate) if interest_rate else 5.0,
            'status': 'pending',
            'requestedAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat()
        }
        
        db.create_loan(loan_data)
        
        return func.HttpResponse(
            json.dumps({
                'message': 'Loan request submitted successfully',
                'loanId': loan_id
            }),
            status_code=201,
            mimetype='application/json'
        )
        
    except Exception as e:
        logging.error(f'Request loan error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': 'Internal server error'}),
            status_code=500,
            mimetype='application/json'
        )


def get_user_loans_handler(req: func.HttpRequest) -> func.HttpResponse:
    """Get user's loans endpoint"""
    logging.info('Get user loans function triggered')
    
    try:
        auth = get_auth_service()
        
        # Extract and verify token
        auth_header = req.headers.get('Authorization')
        token = auth.extract_token_from_header(auth_header)
        
        if not token:
            return func.HttpResponse(
                json.dumps({'error': 'Missing authorization token'}),
                status_code=401,
                mimetype='application/json'
            )
        
        payload = auth.verify_token(token)
        if not payload:
            return func.HttpResponse(
                json.dumps({'error': 'Invalid or expired token'}),
                status_code=401,
                mimetype='application/json'
            )
        
        db = get_db_client()
        loans = db.get_loans_by_borrower(payload['sub'])
        
        return func.HttpResponse(
            json.dumps({'loans': loans}),
            status_code=200,
            mimetype='application/json'
        )
        
    except Exception as e:
        logging.error(f'Get user loans error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': 'Internal server error'}),
            status_code=500,
            mimetype='application/json'
        )


def approve_loan_handler(req: func.HttpRequest) -> func.HttpResponse:
    """Approve loan endpoint (admin only)"""
    logging.info('Approve loan function triggered')
    
    try:
        auth = get_auth_service()
        
        # Extract and verify token
        auth_header = req.headers.get('Authorization')
        token = auth.extract_token_from_header(auth_header)
        
        if not token:
            return func.HttpResponse(
                json.dumps({'error': 'Missing authorization token'}),
                status_code=401,
                mimetype='application/json'
            )
        
        payload = auth.verify_token(token)
        if not payload or payload.get('role') not in ['admin', 'maintainer']:
            return func.HttpResponse(
                json.dumps({'error': 'Unauthorized'}),
                status_code=403,
                mimetype='application/json'
            )
        
        req_body = req.get_json()
        loan_id = req_body.get('loanId')
        
        if not loan_id:
            return func.HttpResponse(
                json.dumps({'error': 'Missing loan ID'}),
                status_code=400,
                mimetype='application/json'
            )
        
        db = get_db_client()
        email_service = get_email_service()
        
        # Get loan
        loan = db.get_loan_by_id(loan_id)
        if not loan:
            return func.HttpResponse(
                json.dumps({'error': 'Loan not found'}),
                status_code=404,
                mimetype='application/json'
            )
        
        # Update loan status
        loan['status'] = 'approved'
        loan['approvedAt'] = datetime.utcnow().isoformat()
        loan['approvedBy'] = payload['sub']
        loan['updatedAt'] = datetime.utcnow().isoformat()
        
        db.update_loan(loan)
        
        # Get borrower and send email
        borrower = db.get_user_by_id(loan['borrowerId'])
        if borrower:
            try:
                email_service.send_loan_approval_email(
                    borrower['email'],
                    loan_id,
                    loan['amount']
                )
            except Exception as e:
                logging.warning(f'Failed to send approval email: {str(e)}')
        
        return func.HttpResponse(
            json.dumps({'message': 'Loan approved successfully'}),
            status_code=200,
            mimetype='application/json'
        )
        
    except Exception as e:
        logging.error(f'Approve loan error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': 'Internal server error'}),
            status_code=500,
            mimetype='application/json'
        )


def disburse_loan_handler(req: func.HttpRequest) -> func.HttpResponse:
    """Disburse loan endpoint (admin only)"""
    logging.info('Disburse loan function triggered')
    
    try:
        auth = get_auth_service()
        
        # Extract and verify token
        auth_header = req.headers.get('Authorization')
        token = auth.extract_token_from_header(auth_header)
        
        if not token:
            return func.HttpResponse(
                json.dumps({'error': 'Missing authorization token'}),
                status_code=401,
                mimetype='application/json'
            )
        
        payload = auth.verify_token(token)
        if not payload or payload.get('role') not in ['admin', 'maintainer']:
            return func.HttpResponse(
                json.dumps({'error': 'Unauthorized'}),
                status_code=403,
                mimetype='application/json'
            )
        
        req_body = req.get_json()
        loan_id = req_body.get('loanId')
        transaction_hash = req_body.get('transactionHash')
        
        if not all([loan_id, transaction_hash]):
            return func.HttpResponse(
                json.dumps({'error': 'Missing required fields'}),
                status_code=400,
                mimetype='application/json'
            )
        
        db = get_db_client()
        email_service = get_email_service()
        
        # Get loan
        loan = db.get_loan_by_id(loan_id)
        if not loan:
            return func.HttpResponse(
                json.dumps({'error': 'Loan not found'}),
                status_code=404,
                mimetype='application/json'
            )
        
        if loan['status'] != 'approved':
            return func.HttpResponse(
                json.dumps({'error': 'Loan must be approved first'}),
                status_code=400,
                mimetype='application/json'
            )
        
        # Update loan status
        loan['status'] = 'disbursed'
        loan['disbursedAt'] = datetime.utcnow().isoformat()
        loan['transactionHash'] = transaction_hash
        loan['updatedAt'] = datetime.utcnow().isoformat()
        
        db.update_loan(loan)
        
        # Create transaction record
        transaction_id = str(uuid.uuid4())
        transaction_data = {
            'id': transaction_id,
            'transactionId': transaction_id,
            'userId': loan['borrowerId'],
            'loanId': loan_id,
            'type': 'disbursement',
            'amount': loan['amount'],
            'transactionHash': transaction_hash,
            'timestamp': int(datetime.utcnow().timestamp()),
            'createdAt': datetime.utcnow().isoformat()
        }
        
        db.create_transaction(transaction_data)
        
        # Send email
        borrower = db.get_user_by_id(loan['borrowerId'])
        if borrower:
            try:
                email_service.send_loan_disbursement_email(
                    borrower['email'],
                    loan_id,
                    loan['amount']
                )
            except Exception as e:
                logging.warning(f'Failed to send disbursement email: {str(e)}')
        
        return func.HttpResponse(
            json.dumps({'message': 'Loan disbursed successfully'}),
            status_code=200,
            mimetype='application/json'
        )
        
    except Exception as e:
        logging.error(f'Disburse loan error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': 'Internal server error'}),
            status_code=500,
            mimetype='application/json'
        )


def repay_loan_handler(req: func.HttpRequest) -> func.HttpResponse:
    """Repay loan endpoint"""
    logging.info('Repay loan function triggered')
    
    try:
        auth = get_auth_service()
        
        # Extract and verify token
        auth_header = req.headers.get('Authorization')
        token = auth.extract_token_from_header(auth_header)
        
        if not token:
            return func.HttpResponse(
                json.dumps({'error': 'Missing authorization token'}),
                status_code=401,
                mimetype='application/json'
            )
        
        payload = auth.verify_token(token)
        if not payload:
            return func.HttpResponse(
                json.dumps({'error': 'Invalid or expired token'}),
                status_code=401,
                mimetype='application/json'
            )
        
        req_body = req.get_json()
        loan_id = req_body.get('loanId')
        amount = req_body.get('amount')
        transaction_hash = req_body.get('transactionHash')
        
        if not all([loan_id, amount, transaction_hash]):
            return func.HttpResponse(
                json.dumps({'error': 'Missing required fields'}),
                status_code=400,
                mimetype='application/json'
            )
        
        db = get_db_client()
        
        # Get loan
        loan = db.get_loan_by_id(loan_id)
        if not loan:
            return func.HttpResponse(
                json.dumps({'error': 'Loan not found'}),
                status_code=404,
                mimetype='application/json'
            )
        
        # Verify borrower
        if loan['borrowerId'] != payload['sub']:
            return func.HttpResponse(
                json.dumps({'error': 'Unauthorized'}),
                status_code=403,
                mimetype='application/json'
            )
        
        # Update loan
        loan['repaidAmount'] = loan.get('repaidAmount', 0) + float(amount)
        loan['status'] = 'repaid' if loan['repaidAmount'] >= loan['amount'] else 'active'
        loan['updatedAt'] = datetime.utcnow().isoformat()
        
        if loan['status'] == 'repaid':
            loan['repaidAt'] = datetime.utcnow().isoformat()
        
        db.update_loan(loan)
        
        # Create transaction record
        transaction_id = str(uuid.uuid4())
        transaction_data = {
            'id': transaction_id,
            'transactionId': transaction_id,
            'userId': payload['sub'],
            'loanId': loan_id,
            'type': 'repayment',
            'amount': float(amount),
            'transactionHash': transaction_hash,
            'timestamp': int(datetime.utcnow().timestamp()),
            'createdAt': datetime.utcnow().isoformat()
        }
        
        db.create_transaction(transaction_data)
        
        return func.HttpResponse(
            json.dumps({
                'message': 'Repayment recorded successfully',
                'loanStatus': loan['status']
            }),
            status_code=200,
            mimetype='application/json'
        )
        
    except Exception as e:
        logging.error(f'Repay loan error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': 'Internal server error'}),
            status_code=500,
            mimetype='application/json'
        )


# ============================================================================
# ADMIN FUNCTIONS
# ============================================================================

def get_all_loans_handler(req: func.HttpRequest) -> func.HttpResponse:
    """Get all loans endpoint (admin only)"""
    logging.info('Get all loans function triggered')
    
    try:
        auth = get_auth_service()
        
        # Extract and verify token
        auth_header = req.headers.get('Authorization')
        token = auth.extract_token_from_header(auth_header)
        
        if not token:
            return func.HttpResponse(
                json.dumps({'error': 'Missing authorization token'}),
                status_code=401,
                mimetype='application/json'
            )
        
        payload = auth.verify_token(token)
        if not payload or payload.get('role') not in ['admin', 'maintainer']:
            return func.HttpResponse(
                json.dumps({'error': 'Unauthorized'}),
                status_code=403,
                mimetype='application/json'
            )
        
        db = get_db_client()
        loans = db.get_all_loans()
        
        return func.HttpResponse(
            json.dumps({'loans': loans}),
            status_code=200,
            mimetype='application/json'
        )
        
    except Exception as e:
        logging.error(f'Get all loans error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': 'Internal server error'}),
            status_code=500,
            mimetype='application/json'
        )


def get_platform_stats_handler(req: func.HttpRequest) -> func.HttpResponse:
    """Get platform statistics endpoint (admin only)"""
    logging.info('Get platform stats function triggered')
    
    try:
        auth = get_auth_service()
        
        # Extract and verify token
        auth_header = req.headers.get('Authorization')
        token = auth.extract_token_from_header(auth_header)
        
        if not token:
            return func.HttpResponse(
                json.dumps({'error': 'Missing authorization token'}),
                status_code=401,
                mimetype='application/json'
            )
        
        payload = auth.verify_token(token)
        if not payload or payload.get('role') not in ['admin', 'maintainer']:
            return func.HttpResponse(
                json.dumps({'error': 'Unauthorized'}),
                status_code=403,
                mimetype='application/json'
            )
        
        db = get_db_client()
        
        # Get all loans
        all_loans = db.get_all_loans()
        
        # Calculate statistics
        total_loans = len(all_loans)
        active_loans = len([l for l in all_loans if l['status'] == 'active'])
        total_disbursed = sum(l.get('amount', 0) for l in all_loans if l['status'] in ['disbursed', 'active', 'repaid'])
        
        # Get all users
        all_users_query = "SELECT * FROM c"
        all_users = db.query_items('users', all_users_query)
        total_users = len(all_users)
        
        stats = {
            'totalLoans': total_loans,
            'activeLoans': active_loans,
            'totalDisbursed': total_disbursed,
            'totalUsers': total_users,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        return func.HttpResponse(
            json.dumps(stats),
            status_code=200,
            mimetype='application/json'
        )
        
    except Exception as e:
        logging.error(f'Get platform stats error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': 'Internal server error'}),
            status_code=500,
            mimetype='application/json'
        )
