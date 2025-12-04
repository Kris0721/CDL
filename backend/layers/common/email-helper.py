# Email helper functions
import boto3
import os

ses = boto3.client('ses')
FROM_EMAIL = os.environ.get('SES_FROM_EMAIL', 'noreply@defi-lending.com')

def send_email(to_email, subject, body_text, body_html=None):
    """Send email via AWS SES"""
    message = {
        'Subject': {'Data': subject},
        'Body': {'Text': {'Data': body_text}}
    }
    
    if body_html:
        message['Body']['Html'] = {'Data': body_html}
    
    response = ses.send_email(
        Source=FROM_EMAIL,
        Destination={'ToAddresses': [to_email]},
        Message=message
    )
    
    return response

def send_welcome_email(to_email, name):
    """Send welcome email to new user"""
    subject = 'Welcome to DeFi Lending Platform'
    body = f'Hello {name},\n\nWelcome to our DeFi lending platform!'
    return send_email(to_email, subject, body)

def send_otp_email(to_email, otp):
    """Send OTP verification email"""
    subject = 'Verify Your Email'
    body = f'Your verification code is: {otp}'
    return send_email(to_email, subject, body)
