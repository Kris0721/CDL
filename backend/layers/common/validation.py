# Validation helper functions

def validate_email(email):
    """Validate email format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    return len(password) >= 8

def validate_amount(amount):
    """Validate loan/deposit amount"""
    try:
        amount_float = float(amount)
        return amount_float > 0
    except (ValueError, TypeError):
        return False

def validate_duration(duration):
    """Validate loan duration"""
    valid_durations = [30, 60, 90, 180]
    try:
        return int(duration) in valid_durations
    except (ValueError, TypeError):
        return False
