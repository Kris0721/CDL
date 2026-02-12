"""
Azure Functions App for CDL DeFi Lending Platform
Main entry point for all HTTP-triggered functions
"""
import azure.functions as func
import logging
import json
from datetime import datetime
import uuid

# Import shared services
from shared.db_client import get_db_client
from shared.storage_client import get_storage_client
from shared.email_service import get_email_service
from shared.auth_service import get_auth_service

# Create the function app
app = func.FunctionApp()

# ============================================================================
# AUTHENTICATION FUNCTIONS
# ============================================================================

@app.route(route="auth/register", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
def register(req: func.HttpRequest) -> func.HttpResponse:
    """User registration endpoint"""
    logging.info('Register function triggered')
    
    try:
        req_body = req.get_json()
        email = req_body.get('email')
        password = req_body.get('password')
        full_name = req_body.get('fullName')
        role = req_body.get('role', 'borrower')
        
        if not all([email, password, full_name]):
            return func.HttpResponse(
                json.dumps({'error': 'Missing required fields'}),
                status_code=400,
                mimetype='application/json'
            )
        
        db = get_db_client()
        auth = get_auth_service()
        email_service = get_email_service()
        
        # Check if user already exists
        existing_user = db.get_user_by_email(email)
        if existing_user:
            return func.HttpResponse(
                json.dumps({'error': 'User already exists'}),
                status_code=409,
                mimetype='application/json'
            )
        
        # Create user
        user_id = str(uuid.uuid4())
        verification_code = str(uuid.uuid4())[:6].upper()
        
        user_data = {
            'id': user_id,
            'userId': user_id,
            'email': email,
            'password': auth.hash_password(password),
            'fullName': full_name,
            'role': role,
            'verified': False,
            'verificationCode': verification_code,
            'kycStatus': 'pending',
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat()
        }
        
        db.create_user(user_data)
        
        # Send verification email
        try:
            email_service.send_verification_email(email, verification_code)
        except Exception as e:
            logging.warning(f'Failed to send verification email: {str(e)}')
        
        return func.HttpResponse(
            json.dumps({
                'message': 'User registered successfully',
                'userId': user_id,
                'email': email
            }),
            status_code=201,
            mimetype='application/json'
        )
        
    except Exception as e:
        logging.error(f'Registration error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': 'Internal server error'}),
            status_code=500,
            mimetype='application/json'
        )


@app.route(route="auth/login", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
def login(req: func.HttpRequest) -> func.HttpResponse:
    """User login endpoint"""
    logging.info('Login function triggered')
    
    try:
        req_body = req.get_json()
        email = req_body.get('email')
        password = req_body.get('password')
        
        if not all([email, password]):
            return func.HttpResponse(
                json.dumps({'error': 'Missing email or password'}),
                status_code=400,
                mimetype='application/json'
            )
        
        db = get_db_client()
        auth = get_auth_service()
        
        # Get user
        user = db.get_user_by_email(email)
        if not user:
            return func.HttpResponse(
                json.dumps({'error': 'Invalid credentials'}),
                status_code=401,
                mimetype='application/json'
            )
        
        # Verify password
        if not auth.verify_password(password, user['password']):
            return func.HttpResponse(
                json.dumps({'error': 'Invalid credentials'}),
                status_code=401,
                mimetype='application/json'
            )
        
        # Generate tokens
        access_token = auth.create_access_token(user['userId'], user['email'], user['role'])
        refresh_token = auth.create_refresh_token(user['userId'])
        
        return func.HttpResponse(
            json.dumps({
                'accessToken': access_token,
                'refreshToken': refresh_token,
                'user': {
                    'userId': user['userId'],
                    'email': user['email'],
                    'fullName': user['fullName'],
                    'role': user['role'],
                    'verified': user.get('verified', False),
                    'kycStatus': user.get('kycStatus', 'pending')
                }
            }),
            status_code=200,
            mimetype='application/json'
        )
        
    except Exception as e:
        logging.error(f'Login error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': 'Internal server error'}),
            status_code=500,
            mimetype='application/json'
        )


@app.route(route="auth/refresh", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
def refresh_token(req: func.HttpRequest) -> func.HttpResponse:
    """Refresh access token endpoint"""
    logging.info('Refresh token function triggered')
    
    try:
        req_body = req.get_json()
        refresh_token = req_body.get('refreshToken')
        
        if not refresh_token:
            return func.HttpResponse(
                json.dumps({'error': 'Missing refresh token'}),
                status_code=400,
                mimetype='application/json'
            )
        
        auth = get_auth_service()
        db = get_db_client()
        
        # Verify refresh token
        payload = auth.verify_token(refresh_token)
        if not payload or payload.get('type') != 'refresh':
            return func.HttpResponse(
                json.dumps({'error': 'Invalid refresh token'}),
                status_code=401,
                mimetype='application/json'
            )
        
        # Get user
        user = db.get_user_by_id(payload['sub'])
        if not user:
            return func.HttpResponse(
                json.dumps({'error': 'User not found'}),
                status_code=404,
                mimetype='application/json'
            )
        
        # Generate new access token
        new_access_token = auth.create_access_token(user['userId'], user['email'], user['role'])
        
        return func.HttpResponse(
            json.dumps({'accessToken': new_access_token}),
            status_code=200,
            mimetype='application/json'
        )
        
    except Exception as e:
        logging.error(f'Refresh token error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': 'Internal server error'}),
            status_code=500,
            mimetype='application/json'
        )


# ============================================================================
# USER FUNCTIONS
# ============================================================================

@app.route(route="user/profile", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
def get_profile(req: func.HttpRequest) -> func.HttpResponse:
    """Get user profile endpoint"""
    logging.info('Get profile function triggered')
    
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
        user = db.get_user_by_id(payload['sub'])
        
        if not user:
            return func.HttpResponse(
                json.dumps({'error': 'User not found'}),
                status_code=404,
                mimetype='application/json'
            )
        
        # Remove sensitive data
        user.pop('password', None)
        user.pop('verificationCode', None)
        
        return func.HttpResponse(
            json.dumps(user),
            status_code=200,
            mimetype='application/json'
        )
        
    except Exception as e:
        logging.error(f'Get profile error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': 'Internal server error'}),
            status_code=500,
            mimetype='application/json'
        )


@app.route(route="user/kyc/upload", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
def upload_kyc(req: func.HttpRequest) -> func.HttpResponse:
    """Upload KYC document endpoint"""
    logging.info('Upload KYC function triggered')
    
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
        
        # Get file from request
        files = req.files
        if not files or 'document' not in files:
            return func.HttpResponse(
                json.dumps({'error': 'No document provided'}),
                status_code=400,
                mimetype='application/json'
            )
        
        document = files['document']
        document_type = req.form.get('documentType', 'id')
        
        db = get_db_client()
        storage = get_storage_client()
        
        # Generate unique filename
        user_id = payload['sub']
        document_id = str(uuid.uuid4())
        file_extension = document.filename.split('.')[-1]
        blob_name = f"{user_id}/{document_id}.{file_extension}"
        
        # Upload to blob storage
        file_data = document.read()
        blob_url = storage.upload_file(blob_name, file_data, document.content_type)
        
        # Create KYC document record
        kyc_data = {
            'id': document_id,
            'documentId': document_id,
            'userId': user_id,
            'documentType': document_type,
            'fileName': document.filename,
            'blobName': blob_name,
            'blobUrl': blob_url,
            'status': 'pending',
            'uploadedAt': datetime.utcnow().isoformat()
        }
        
        db.create_kyc_document(kyc_data)
        
        # Update user KYC status
        user = db.get_user_by_id(user_id)
        user['kycStatus'] = 'submitted'
        user['updatedAt'] = datetime.utcnow().isoformat()
        db.update_user(user)
        
        return func.HttpResponse(
            json.dumps({
                'message': 'KYC document uploaded successfully',
                'documentId': document_id
            }),
            status_code=201,
            mimetype='application/json'
        )
        
    except Exception as e:
        logging.error(f'Upload KYC error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': 'Internal server error'}),
            status_code=500,
            mimetype='application/json'
        )


# ============================================================================
# LOAN FUNCTIONS
# ============================================================================

@app.route(route="loans/request", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
def request_loan(req: func.HttpRequest) -> func.HttpResponse:
    """Request loan endpoint"""
    from functions.loan_admin_handlers import loan_request_handler
    return loan_request_handler(req)


@app.route(route="loans/user", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
def get_user_loans(req: func.HttpRequest) -> func.HttpResponse:
    """Get user's loans endpoint"""
    from functions.loan_admin_handlers import get_user_loans_handler
    return get_user_loans_handler(req)


@app.route(route="loans/approve", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
def approve_loan(req: func.HttpRequest) -> func.HttpResponse:
    """Approve loan endpoint (admin only)"""
    from functions.loan_admin_handlers import approve_loan_handler
    return approve_loan_handler(req)


@app.route(route="loans/disburse", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
def disburse_loan(req: func.HttpRequest) -> func.HttpResponse:
    """Disburse loan endpoint (admin only)"""
    from functions.loan_admin_handlers import disburse_loan_handler
    return disburse_loan_handler(req)


@app.route(route="loans/repay", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
def repay_loan(req: func.HttpRequest) -> func.HttpResponse:
    """Repay loan endpoint"""
    from functions.loan_admin_handlers import repay_loan_handler
    return repay_loan_handler(req)


# ============================================================================
# ADMIN FUNCTIONS
# ============================================================================

@app.route(route="admin/loans", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
def get_all_loans(req: func.HttpRequest) -> func.HttpResponse:
    """Get all loans endpoint (admin only)"""
    from functions.loan_admin_handlers import get_all_loans_handler
    return get_all_loans_handler(req)


@app.route(route="admin/stats", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
def get_platform_stats(req: func.HttpRequest) -> func.HttpResponse:
    """Get platform statistics endpoint (admin only)"""
    from functions.loan_admin_handlers import get_platform_stats_handler
    return get_platform_stats_handler(req)

