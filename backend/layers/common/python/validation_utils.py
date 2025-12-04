"""
Input validation utilities
"""
import re
from typing import Optional, Dict, Any
from email_validator import validate_email, EmailNotValidError
from decimal import Decimal


def validate_email_address(email: str) -> tuple[bool, Optional[str]]:
    """
    Validate email address format
    
    Args:
        email: Email address to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        validate_email(email)
        return True, None
    except EmailNotValidError as e:
        return False, str(e)


def validate_password(password: str) -> tuple[bool, Optional[str]]:
    """
    Validate password strength
    Requirements: At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    
    Args:
        password: Password to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    
    return True, None


def validate_amount(amount: Any, min_value: float = 0.01, max_value: float = 1000000) -> tuple[bool, Optional[str]]:
    """
    Validate monetary amount
    
    Args:
        amount: Amount to validate
        min_value: Minimum allowed value
        max_value: Maximum allowed value
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        amount_float = float(amount)
        
        if amount_float < min_value:
            return False, f"Amount must be at least {min_value}"
        
        if amount_float > max_value:
            return False, f"Amount cannot exceed {max_value}"
        
        return True, None
    except (ValueError, TypeError):
        return False, "Invalid amount format"


def validate_wallet_address(address: str) -> tuple[bool, Optional[str]]:
    """
    Validate Ethereum wallet address
    
    Args:
        address: Wallet address to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not address:
        return True, None  # Wallet address is optional
    
    # Basic Ethereum address validation (0x followed by 40 hex characters)
    if not re.match(r'^0x[a-fA-F0-9]{40}$', address):
        return False, "Invalid Ethereum wallet address format"
    
    return True, None


def validate_loan_duration(duration: Any) -> tuple[bool, Optional[str]]:
    """
    Validate loan duration
    
    Args:
        duration: Duration in days
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        duration_int = int(duration)
        
        valid_durations = [30, 60, 90, 180, 365]
        if duration_int not in valid_durations:
            return False, f"Duration must be one of: {', '.join(map(str, valid_durations))} days"
        
        return True, None
    except (ValueError, TypeError):
        return False, "Invalid duration format"


def validate_required_fields(data: Dict, required_fields: list) -> tuple[bool, Optional[str]]:
    """
    Validate that required fields are present in data
    
    Args:
        data: Data dictionary to validate
        required_fields: List of required field names
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    missing_fields = [field for field in required_fields if not data.get(field)]
    
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"
    
    return True, None


def validate_role(role: str) -> tuple[bool, Optional[str]]:
    """
    Validate user role
    
    Args:
        role: Role to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    valid_roles = ['borrower', 'lender', 'admin', 'maintainer']
    
    if role not in valid_roles:
        return False, f"Invalid role. Must be one of: {', '.join(valid_roles)}"
    
    return True, None


def validate_kyc_status(status: str) -> tuple[bool, Optional[str]]:
    """
    Validate KYC status
    
    Args:
        status: KYC status to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    valid_statuses = ['pending', 'approved', 'rejected', 'under_review']
    
    if status not in valid_statuses:
        return False, f"Invalid KYC status. Must be one of: {', '.join(valid_statuses)}"
    
    return True, None


def validate_loan_status(status: str) -> tuple[bool, Optional[str]]:
    """
    Validate loan status
    
    Args:
        status: Loan status to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    valid_statuses = ['pending', 'approved', 'rejected', 'disbursed', 'active', 'repaid', 'defaulted']
    
    if status not in valid_statuses:
        return False, f"Invalid loan status. Must be one of: {', '.join(valid_statuses)}"
    
    return True, None


def sanitize_string(value: str, max_length: int = 500) -> str:
    """
    Sanitize string input
    
    Args:
        value: String to sanitize
        max_length: Maximum allowed length
        
    Returns:
        Sanitized string
    """
    if not value:
        return ""
    
    # Remove leading/trailing whitespace
    sanitized = value.strip()
    
    # Truncate to max length
    sanitized = sanitized[:max_length]
    
    return sanitized
