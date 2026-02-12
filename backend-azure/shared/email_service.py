"""
Email utilities using Azure Communication Services
"""
import os
from azure.communication.email import EmailClient
from typing import List, Optional

class EmailService:
    """Azure Communication Services email client wrapper"""
    
    def __init__(self):
        connection_string = os.environ.get('COMMUNICATION_SERVICE_CONNECTION_STRING')
        self.email_client = EmailClient.from_connection_string(connection_string)
        self.from_address = os.environ.get('EMAIL_FROM_ADDRESS', 'noreply@cdl-defi.com')
    
    def send_email(
        self,
        to_addresses: List[str],
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> dict:
        """
        Send an email using Azure Communication Services
        """
        message = {
            "senderAddress": self.from_address,
            "recipients": {
                "to": [{"address": addr} for addr in to_addresses]
            },
            "content": {
                "subject": subject,
                "html": html_content
            }
        }
        
        if text_content:
            message["content"]["plainText"] = text_content
        
        poller = self.email_client.begin_send(message)
        result = poller.result()
        return result
    
    def send_verification_email(self, to_email: str, verification_code: str) -> dict:
        """Send email verification code"""
        subject = "Verify Your CDL Account"
        html_content = f"""
        <html>
            <body>
                <h2>Welcome to CDL DeFi Lending Platform!</h2>
                <p>Your verification code is: <strong>{verification_code}</strong></p>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </body>
        </html>
        """
        return self.send_email([to_email], subject, html_content)
    
    def send_loan_approval_email(self, to_email: str, loan_id: str, amount: float) -> dict:
        """Send loan approval notification"""
        subject = "Loan Approved - CDL DeFi"
        html_content = f"""
        <html>
            <body>
                <h2>Your Loan Has Been Approved!</h2>
                <p>Loan ID: {loan_id}</p>
                <p>Amount: ${amount:,.2f}</p>
                <p>Your loan has been approved and will be disbursed shortly.</p>
                <p>Thank you for using CDL DeFi Lending Platform.</p>
            </body>
        </html>
        """
        return self.send_email([to_email], subject, html_content)
    
    def send_loan_disbursement_email(self, to_email: str, loan_id: str, amount: float) -> dict:
        """Send loan disbursement notification"""
        subject = "Loan Disbursed - CDL DeFi"
        html_content = f"""
        <html>
            <body>
                <h2>Your Loan Has Been Disbursed!</h2>
                <p>Loan ID: {loan_id}</p>
                <p>Amount: ${amount:,.2f}</p>
                <p>The funds have been transferred to your wallet.</p>
                <p>Thank you for using CDL DeFi Lending Platform.</p>
            </body>
        </html>
        """
        return self.send_email([to_email], subject, html_content)

# Singleton instance
_email_service = None

def get_email_service() -> EmailService:
    """Get or create the email service singleton"""
    global _email_service
    if _email_service is None:
        _email_service = EmailService()
    return _email_service
