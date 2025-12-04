"""
Email notification utilities
"""
import boto3
import os
from typing import Dict, Optional
from datetime import datetime

ses = boto3.client('ses')
FROM_EMAIL = os.environ.get('SES_FROM_EMAIL', 'noreply@defi-lending.com')


def send_email(to_email: str, subject: str, body_html: str, body_text: Optional[str] = None) -> bool:
    """
    Send an email using AWS SES
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        body_html: HTML email body
        body_text: Plain text email body (optional)
        
    Returns:
        True if successful, False otherwise
    """
    try:
        message = {
            'Subject': {'Data': subject},
            'Body': {'Html': {'Data': body_html}}
        }
        
        if body_text:
            message['Body']['Text'] = {'Data': body_text}
        
        ses.send_email(
            Source=FROM_EMAIL,
            Destination={'ToAddresses': [to_email]},
            Message=message
        )
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False


def send_verification_email(email: str, otp: str, full_name: str) -> bool:
    """
    Send email verification OTP
    
    Args:
        email: User's email address
        otp: One-time password
        full_name: User's full name
        
    Returns:
        True if successful, False otherwise
    """
    subject = "Verify Your Email - DeFi Lending Platform"
    
    body_html = f"""
    <html>
    <head></head>
    <body>
        <h2>Welcome to DeFi Lending Platform!</h2>
        <p>Hi {full_name},</p>
        <p>Thank you for registering. Please use the following code to verify your email address:</p>
        <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">{otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <br>
        <p>Best regards,<br>DeFi Lending Team</p>
    </body>
    </html>
    """
    
    body_text = f"""
    Welcome to DeFi Lending Platform!
    
    Hi {full_name},
    
    Thank you for registering. Please use the following code to verify your email address:
    
    {otp}
    
    This code will expire in 10 minutes.
    
    If you didn't create an account, please ignore this email.
    
    Best regards,
    DeFi Lending Team
    """
    
    return send_email(email, subject, body_html, body_text)


def send_loan_approval_email(email: str, full_name: str, loan_amount: float, loan_id: str) -> bool:
    """
    Send loan approval notification
    
    Args:
        email: User's email address
        full_name: User's full name
        loan_amount: Approved loan amount
        loan_id: Loan ID
        
    Returns:
        True if successful, False otherwise
    """
    subject = "Loan Approved - DeFi Lending Platform"
    
    body_html = f"""
    <html>
    <head></head>
    <body>
        <h2>Loan Approved!</h2>
        <p>Hi {full_name},</p>
        <p>Great news! Your loan request has been approved.</p>
        <div style="background-color: #f0f0f0; padding: 20px; margin: 20px 0;">
            <p><strong>Loan ID:</strong> {loan_id}</p>
            <p><strong>Amount:</strong> ${loan_amount:,.2f}</p>
        </div>
        <p>The funds will be disbursed to your wallet shortly.</p>
        <p>You can track your loan status in your dashboard.</p>
        <br>
        <p>Best regards,<br>DeFi Lending Team</p>
    </body>
    </html>
    """
    
    body_text = f"""
    Loan Approved!
    
    Hi {full_name},
    
    Great news! Your loan request has been approved.
    
    Loan ID: {loan_id}
    Amount: ${loan_amount:,.2f}
    
    The funds will be disbursed to your wallet shortly.
    You can track your loan status in your dashboard.
    
    Best regards,
    DeFi Lending Team
    """
    
    return send_email(email, subject, body_html, body_text)


def send_loan_rejection_email(email: str, full_name: str, loan_id: str, reason: str) -> bool:
    """
    Send loan rejection notification
    
    Args:
        email: User's email address
        full_name: User's full name
        loan_id: Loan ID
        reason: Rejection reason
        
    Returns:
        True if successful, False otherwise
    """
    subject = "Loan Application Update - DeFi Lending Platform"
    
    body_html = f"""
    <html>
    <head></head>
    <body>
        <h2>Loan Application Update</h2>
        <p>Hi {full_name},</p>
        <p>Thank you for your loan application. After careful review, we are unable to approve your request at this time.</p>
        <div style="background-color: #f0f0f0; padding: 20px; margin: 20px 0;">
            <p><strong>Loan ID:</strong> {loan_id}</p>
            <p><strong>Reason:</strong> {reason}</p>
        </div>
        <p>You may reapply after addressing the issues mentioned above.</p>
        <br>
        <p>Best regards,<br>DeFi Lending Team</p>
    </body>
    </html>
    """
    
    body_text = f"""
    Loan Application Update
    
    Hi {full_name},
    
    Thank you for your loan application. After careful review, we are unable to approve your request at this time.
    
    Loan ID: {loan_id}
    Reason: {reason}
    
    You may reapply after addressing the issues mentioned above.
    
    Best regards,
    DeFi Lending Team
    """
    
    return send_email(email, subject, body_html, body_text)


def send_disbursement_email(email: str, full_name: str, loan_amount: float, tx_hash: str) -> bool:
    """
    Send loan disbursement notification
    
    Args:
        email: User's email address
        full_name: User's full name
        loan_amount: Disbursed amount
        tx_hash: Blockchain transaction hash
        
    Returns:
        True if successful, False otherwise
    """
    subject = "Loan Disbursed - DeFi Lending Platform"
    
    body_html = f"""
    <html>
    <head></head>
    <body>
        <h2>Loan Disbursed!</h2>
        <p>Hi {full_name},</p>
        <p>Your loan has been successfully disbursed to your wallet.</p>
        <div style="background-color: #f0f0f0; padding: 20px; margin: 20px 0;">
            <p><strong>Amount:</strong> ${loan_amount:,.2f}</p>
            <p><strong>Transaction Hash:</strong> {tx_hash}</p>
        </div>
        <p>Please check your wallet to confirm receipt of funds.</p>
        <p>Remember to make timely repayments to maintain a good credit history.</p>
        <br>
        <p>Best regards,<br>DeFi Lending Team</p>
    </body>
    </html>
    """
    
    body_text = f"""
    Loan Disbursed!
    
    Hi {full_name},
    
    Your loan has been successfully disbursed to your wallet.
    
    Amount: ${loan_amount:,.2f}
    Transaction Hash: {tx_hash}
    
    Please check your wallet to confirm receipt of funds.
    Remember to make timely repayments to maintain a good credit history.
    
    Best regards,
    DeFi Lending Team
    """
    
    return send_email(email, subject, body_html, body_text)


def send_repayment_reminder_email(email: str, full_name: str, loan_id: str, amount_due: float, due_date: str) -> bool:
    """
    Send repayment reminder
    
    Args:
        email: User's email address
        full_name: User's full name
        loan_id: Loan ID
        amount_due: Amount due
        due_date: Due date
        
    Returns:
        True if successful, False otherwise
    """
    subject = "Loan Repayment Reminder - DeFi Lending Platform"
    
    body_html = f"""
    <html>
    <head></head>
    <body>
        <h2>Repayment Reminder</h2>
        <p>Hi {full_name},</p>
        <p>This is a friendly reminder about your upcoming loan repayment.</p>
        <div style="background-color: #fff3cd; padding: 20px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p><strong>Loan ID:</strong> {loan_id}</p>
            <p><strong>Amount Due:</strong> ${amount_due:,.2f}</p>
            <p><strong>Due Date:</strong> {due_date}</p>
        </div>
        <p>Please ensure you have sufficient funds in your wallet for the repayment.</p>
        <p>You can make a payment through your dashboard.</p>
        <br>
        <p>Best regards,<br>DeFi Lending Team</p>
    </body>
    </html>
    """
    
    body_text = f"""
    Repayment Reminder
    
    Hi {full_name},
    
    This is a friendly reminder about your upcoming loan repayment.
    
    Loan ID: {loan_id}
    Amount Due: ${amount_due:,.2f}
    Due Date: {due_date}
    
    Please ensure you have sufficient funds in your wallet for the repayment.
    You can make a payment through your dashboard.
    
    Best regards,
    DeFi Lending Team
    """
    
    return send_email(email, subject, body_html, body_text)


def send_kyc_status_email(email: str, full_name: str, status: str, reason: Optional[str] = None) -> bool:
    """
    Send KYC status update notification
    
    Args:
        email: User's email address
        full_name: User's full name
        status: KYC status (approved/rejected)
        reason: Rejection reason (if applicable)
        
    Returns:
        True if successful, False otherwise
    """
    if status == 'approved':
        subject = "KYC Approved - DeFi Lending Platform"
        body_html = f"""
        <html>
        <head></head>
        <body>
            <h2>KYC Approved!</h2>
            <p>Hi {full_name},</p>
            <p>Your KYC verification has been approved. You can now access all platform features.</p>
            <p>You can start applying for loans and participating in lending activities.</p>
            <br>
            <p>Best regards,<br>DeFi Lending Team</p>
        </body>
        </html>
        """
        body_text = f"Hi {full_name},\n\nYour KYC verification has been approved. You can now access all platform features.\n\nBest regards,\nDeFi Lending Team"
    else:
        subject = "KYC Update - DeFi Lending Platform"
        body_html = f"""
        <html>
        <head></head>
        <body>
            <h2>KYC Update</h2>
            <p>Hi {full_name},</p>
            <p>We were unable to verify your KYC documents.</p>
            <p><strong>Reason:</strong> {reason or 'Please resubmit valid documents'}</p>
            <p>Please upload new documents through your dashboard.</p>
            <br>
            <p>Best regards,<br>DeFi Lending Team</p>
        </body>
        </html>
        """
        body_text = f"Hi {full_name},\n\nWe were unable to verify your KYC documents.\nReason: {reason or 'Please resubmit valid documents'}\n\nBest regards,\nDeFi Lending Team"
    
    return send_email(email, subject, body_html, body_text)
